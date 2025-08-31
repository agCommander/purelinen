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
  retailPrice: number
  b2bPrice: number
  stockQty: number
  inStock: boolean
}

export default async function smartMagentoImport() {
  try {
    console.log("🚀 Starting Smart Magento Import with Dual Pricing...")
    
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
    
    // Read product names (attribute_id 73 is typically name)
    const attributes: MagentoAttribute[] = await readCSVSimple(path.join(csvDir, 'catalog_product_entity_varchar.csv'))
    const nameData = attributes.filter(a => a.attribute_id === '73')
    console.log(`✅ Found ${nameData.length} name records`)
    
    // Create maps
    const inventoryMap = new Map<string, MagentoInventory>()
    inventory.forEach(inv => inventoryMap.set(inv.product_id, inv))
    
    const nameMap = new Map<string, MagentoAttribute>()
    nameData.forEach(name => nameMap.set(name.entity_id, name))
    
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
        
        const name = nameMap.get(product.entity_id)
        const productName = name ? name.value : `Product ${product.sku}`
        
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
    
    console.log(`\n📦 Found ${productGroups.size} product groups with variants:`)
    
    // Process each product group
    let totalVariants = 0
    let processedGroups = 0
    
    for (const [productKey, group] of productGroups) {
      try {
        console.log(`\n🏷️ Product Group: ${productKey}`)
        console.log(`   Base Name: ${group.baseName}`)
        console.log(`   Variants: ${group.variants.length}`)
        
        // Log variant details
        group.variants.forEach(variant => {
          console.log(`   • ${variant.variantCode}: Retail $${variant.retailPrice} | B2B $${variant.b2bPrice} | Stock: ${variant.stockQty}`)
        })
        
        totalVariants += group.variants.length
        processedGroups++
        
        if (processedGroups % 50 === 0) {
          console.log(`✅ Processed ${processedGroups} product groups...`)
        }
        
      } catch (error) {
        console.log(`⚠️ Error processing group ${productKey}:`, error.message)
      }
    }
    
    console.log(`\n🎉 Import Analysis Complete:`)
    console.log(`   • Product Groups: ${productGroups.size}`)
    console.log(`   • Total Variants: ${totalVariants}`)
    console.log(`   • Average variants per product: ${(totalVariants / productGroups.size).toFixed(1)}`)
    
    // Show some examples
    console.log(`\n📋 Example Product Groups:`)
    let count = 0
    for (const [productKey, group] of productGroups) {
      if (count >= 5) break
      console.log(`   • ${productKey}: ${group.variants.length} variants`)
      count++
    }
    
    console.log(`\n🚀 Ready to create:`)
    console.log(`1. ${productGroups.size} products with variants`)
    console.log(`2. Inventory levels for each variant`)
    console.log(`3. Retail pricing for Linen Things`)
    console.log(`4. B2B pricing for Pure Linen`)
    console.log(`5. Sales channel assignments`)
    
    console.log(`\n📋 Next Steps:`)
    console.log(`1. Use the admin panel to create products manually`)
    console.log(`2. Or create a separate script with proper container access`)
    console.log(`3. Assign price lists to sales channels`)
    console.log(`4. Test your storefronts`)
    
  } catch (error) {
    console.error("❌ Error during import:", error)
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
