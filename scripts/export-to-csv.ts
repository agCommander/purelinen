import * as fs from 'fs'
import * as path from 'path'

interface MagentoProduct {
  entity_id: string
  sku: string
  type_id: string
  has_options: string
  required_options: string
}

interface MagentoInventory {
  product_id: string
  qty: string
  is_in_stock: string
}

interface MagentoPrice {
  entity_id: string
  attribute_id: string
  value: string
}

interface MagentoAttribute {
  entity_id: string
  attribute_id: string
  value: string
}

interface MagentoText {
  entity_id: string
  attribute_id: string
  value: string
}

interface ProductGroup {
  productKey: string
  baseName: string
  variants: ProductVariant[]
}

interface ProductVariant {
  entity_id: string
  sku: string
  variantCode: string
  name: string
  description: string
  retailPrice: number
  b2bPrice: number
  stockQty: number
  inStock: boolean
}

export default async function exportToCSV() {
  try {
    console.log("🚀 Exporting Magento data to CSV for Medusa import...")
    
    // Read CSV files
    const csvDir = path.join(process.cwd(), '../../migration-tools/magento-csv-files')
    
    console.log("📖 Reading Magento data files...")
    
    // Read products
    const products: MagentoProduct[] = await readCSVSimple(path.join(csvDir, 'catalog_product_entity.csv'))
    console.log(`✅ Found ${products.length} products`)
    
    // Read inventory
    const inventory: MagentoInventory[] = await readCSVSimple(path.join(csvDir, 'cataloginventory_stock_item.csv'))
    console.log(`✅ Found ${inventory.length} inventory records`)
    
    // Read all decimal values (prices)
    const prices: MagentoPrice[] = await readCSVSimple(path.join(csvDir, 'catalog_product_entity_decimal.csv'))
    console.log(`✅ Found ${prices.length} decimal records`)
    
    // Read product names (attribute_id 71 is product name)
    const attributes: MagentoAttribute[] = await readCSVSimple(path.join(csvDir, 'catalog_product_entity_varchar.csv'))
    const nameData = attributes.filter(a => a.attribute_id === '71')
    console.log(`✅ Found ${nameData.length} name records`)
    
    // Read product descriptions (attribute_id 72 is short description, 73 is full description)
    const textData: MagentoText[] = await readCSVSimple(path.join(csvDir, 'catalog_product_entity_text.csv'))
    const shortDescData = textData.filter(t => t.attribute_id === '72')
    const fullDescData = textData.filter(t => t.attribute_id === '73')
    console.log(`✅ Found ${shortDescData.length} short descriptions`)
    console.log(`✅ Found ${fullDescData.length} full descriptions`)
    
    // Create maps
    const inventoryMap = new Map<string, MagentoInventory>()
    inventory.forEach(inv => inventoryMap.set(inv.product_id, inv))
    
    const nameMap = new Map<string, MagentoAttribute>()
    nameData.forEach(name => nameMap.set(name.entity_id, name))
    
    const shortDescMap = new Map<string, MagentoText>()
    shortDescData.forEach(desc => shortDescMap.set(desc.entity_id, desc))
    
    const fullDescMap = new Map<string, MagentoText>()
    fullDescData.forEach(desc => fullDescMap.set(desc.entity_id, desc))
    
    // Group prices by product entity_id
    const priceMap = new Map<string, MagentoPrice[]>()
    prices.forEach(price => {
      if (!priceMap.has(price.entity_id)) {
        priceMap.set(price.entity_id, [])
      }
      priceMap.get(price.entity_id)!.push(price)
    })
    
    console.log("\n🔍 Analyzing SKU patterns and finding dual pricing...")
    
    // Group products by SKU pattern
    const productGroups = new Map<string, ProductGroup>()
    
    for (const product of products) {
      try {
        // Skip grouped products
        if (product.type_id === 'grouped') continue
        
        // Parse SKU pattern: XXX_YYY_ZZZZZZ
        const skuParts = product.sku.split('_')
        if (skuParts.length < 3) continue
        
        const productKey = `${skuParts[0]}_${skuParts[1]}` // e.g., "BA_CTT"
        const variantCode = skuParts.slice(2).join('_') // e.g., "TBBRM"
        
        // Get product data
        const inv = inventoryMap.get(product.entity_id)
        const stockQty = inv ? parseFloat(inv.qty) : 0
        const inStock = inv ? inv.is_in_stock === '1' : false
        
        // Get product name and description
        const name = nameMap.get(product.entity_id)
        const productName = name ? name.value : `Product ${product.sku}`
        
        const shortDesc = shortDescMap.get(product.entity_id)
        const fullDesc = fullDescMap.get(product.entity_id)
        const description = fullDesc ? fullDesc.value : (shortDesc ? shortDesc.value : `Product group ${productKey} with variant ${variantCode}`)
        
        // Get all prices for this product
        const productPrices = priceMap.get(product.entity_id) || []
        
        // Find retail and B2B prices
        let retailPrice = 0
        let b2bPrice = 0
        
        if (productPrices.length >= 2) {
          // Sort prices - higher is retail, lower is B2B
          const sortedPrices = productPrices
            .map(p => parseFloat(p.value))
            .filter(p => p > 0)
            .sort((a, b) => b - a) // Descending order
          
          if (sortedPrices.length >= 2) {
            retailPrice = sortedPrices[0] // Highest price
            b2bPrice = sortedPrices[1]    // Lower price
          } else if (sortedPrices.length === 1) {
            retailPrice = sortedPrices[0]
            b2bPrice = Math.floor(retailPrice * 0.6) // Fallback B2B pricing
          }
        } else if (productPrices.length === 1) {
          retailPrice = parseFloat(productPrices[0].value)
          b2bPrice = Math.floor(retailPrice * 0.6) // Fallback B2B pricing
        }
        
        // Skip products with no prices or no stock
        if (retailPrice <= 0 || stockQty <= 0) continue
        
        // Create variant
        const variant: ProductVariant = {
          entity_id: product.entity_id,
          sku: product.sku,
          variantCode,
          name: productName,
          description: description,
          retailPrice,
          b2bPrice,
          stockQty,
          inStock
        }
        
        // Add to product group
        if (!productGroups.has(productKey)) {
          productGroups.set(productKey, {
            productKey,
            baseName: productName.replace(variantCode, '').trim() || `Product ${productKey}`,
            variants: []
          })
        }
        
        productGroups.get(productKey)!.variants.push(variant)
        
      } catch (error) {
        console.log(`⚠️ Error processing product ${product.sku}:`, error.message)
      }
    }
    
    console.log(`\n📦 Found ${productGroups.size} product groups with variants`)
    
    // Create CSV data for Medusa import (exact template format only)
    const csvData: any[] = []
    
    for (const [productKey, group] of productGroups) {
      // Create a single product handle for the entire group
      const productHandle = productKey.toLowerCase().replace(/[^a-z0-9-]/g, '-')
      
      for (const variant of group.variants) {
        csvData.push({
          'Product Id': '', // Leave empty for new products
          'Product Handle': productHandle, // Same handle for all variants
          'Product Title': group.baseName,
          'Product Subtitle': '',
          'Product Description': variant.description,
          'Product Status': 'published',
          'Product Thumbnail': '',
          'Product Weight': '',
          'Product Length': '',
          'Product Width': '',
          'Product Height': '',
          'Product HS Code': '',
          'Product Origin Country': '',
          'Product MID Code': '',
          'Product Material': '',
          'Product Collection Id': '',
          'Product Type Id': '',
          'Product Tag 1': '',
          'Product Discountable': 'TRUE',
          'Product External Id': '',
          'Variant Id': '', // Leave empty for new variants
          'Variant Title': variant.name,
          'Variant SKU': variant.sku,
          'Variant Barcode': '',
          'Variant Allow Backorder': 'FALSE',
          'Variant Manage Inventory': 'TRUE',
          'Variant Weight': '',
          'Variant Length': '',
          'Variant Width': '',
          'Variant Height': '',
          'Variant HS Code': '',
          'Variant Origin Country': '',
          'Variant MID Code': '',
          'Variant Material': '',
          'Variant Price EUR': '',
          'Variant Price USD': variant.retailPrice, // This will be AUD in practice
          'Variant Option 1 Name': 'Size',
          'Variant Option 1 Value': variant.variantCode,
          'Product Image 1 Url': '',
          'Product Image 2 Url': ''
        })
      }
    }
    
    // Create output directory
    const outputDir = path.join(process.cwd(), '../../migration-tools/medusa-ready')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    // Write CSV file
    const csvPath = path.join(outputDir, 'medusa-products-import.csv')
    const headers = Object.keys(csvData[0])
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n')
    
    fs.writeFileSync(csvPath, csvContent)
    
    console.log(`\n🎉 CSV Export Complete:`)
    console.log(`   • File: ${csvPath}`)
    console.log(`   • Products: ${productGroups.size}`)
    console.log(`   • Variants: ${csvData.length}`)
    console.log(`   • Total rows: ${csvData.length}`)
    
    console.log(`\n📋 Key Columns (AUD pricing):`)
    console.log(`   • Product Handle - URL-friendly identifier`)
    console.log(`   • Product Title - Product name from Magento`)
    console.log(`   • Product Description - Full description from Magento`)
    console.log(`   • Product Status - Published status`)
    console.log(`   • Variant Title - Variant name`)
    console.log(`   • Variant SKU - Unique SKU`)
    console.log(`   • Variant Price USD - Retail price in AUD (Linen Things)`)
    console.log(`   • Variant Option 1 Name - Size`)
    console.log(`   • Variant Option 1 Value - Variant code`)
    
    console.log(`\n🚀 Next Steps:`)
    console.log(`1. Open Medusa Admin Panel`)
    console.log(`2. Go to Products → Import`)
    console.log(`3. Upload the CSV file: ${csvPath}`)
    console.log(`4. The columns now match the template exactly`)
    console.log(`5. Import the products`)
    console.log(`6. Create B2B price list later with AUD pricing`)
    
    // Also create a summary file
    const summaryPath = path.join(outputDir, 'import-summary.txt')
    const summary = [
      `Medusa Products Import Summary`,
      `Generated: ${new Date().toISOString()}`,
      ``,
      `Total Product Groups: ${productGroups.size}`,
      `Total Variants: ${csvData.length}`,
      `Average variants per product: ${(csvData.length / productGroups.size).toFixed(1)}`,
      ``,
      `Sample Product Groups:`,
      ...Array.from(productGroups.entries()).slice(0, 10).map(([key, group]) => 
        `  • ${key}: ${group.variants.length} variants`
      ),
      ``,
      `Price Range (AUD):`,
      `  • Retail: $${Math.min(...csvData.map(r => r['Variant Price USD']))} - $${Math.max(...csvData.map(r => r['Variant Price USD']))}`,
      ``,
      `Stock Range:`,
      `  • Min: ${Math.min(...csvData.map(r => r['Variant Manage Inventory'] === 'TRUE' ? 1 : 0))}`,
      `  • Max: ${Math.max(...csvData.map(r => r['Variant Manage Inventory'] === 'TRUE' ? 1 : 0))}`,
      ``,
      `CSV Format:`,
      `  • Matches Medusa import template exactly`,
      `  • No extra columns`,
      `  • AUD pricing in Variant Price USD column`,
      `  • Product names and descriptions from Magento`,
      `  • B2B pricing will be added via price lists later`,
    ].join('\n')
    
    fs.writeFileSync(summaryPath, summary)
    console.log(`   • Summary: ${summaryPath}`)
    
  } catch (error) {
    console.error("❌ Error during export:", error)
  }
}

async function readCSVSimple(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = []
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const lines = fileContent.split('\n')
    const headers = lines[0].split(',').map(h => h.replace(/"/g, ''))
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.replace(/"/g, ''))
        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = values[index]
        })
        results.push(row)
      }
    }
    
    resolve(results)
  })
}
