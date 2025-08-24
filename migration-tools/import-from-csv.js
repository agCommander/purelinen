const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');
require('dotenv').config();

// Configuration
const CSV_DIR = path.join(__dirname, 'magento-csv-files');
const OUTPUT_DIR = path.join(__dirname, 'medusa-ready');

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

// Helper function to read CSV file
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

// Helper function to write CSV file
function writeCSV(filePath, data, headers) {
  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: headers.map(h => ({ id: h, title: h }))
  });
  return csvWriter.writeRecords(data);
}

async function processProducts() {
  console.log('📦 Processing products...');
  
  try {
    // Read the main product table
    const productsFile = path.join(CSV_DIR, 'catalog_product_entity.csv');
    if (!fs.existsSync(productsFile)) {
      console.log('⚠️  catalog_product_entity.csv not found, skipping products');
      return;
    }
    
    const products = await readCSV(productsFile);
    console.log(`✅ Found ${products.length} products`);
    
    // Read product attributes
    const varcharFile = path.join(CSV_DIR, 'catalog_product_entity_varchar.csv');
    const textFile = path.join(CSV_DIR, 'catalog_product_entity_text.csv');
    const decimalFile = path.join(CSV_DIR, 'catalog_product_entity_decimal.csv');
    const intFile = path.join(CSV_DIR, 'catalog_product_entity_int.csv');
    
    let varcharData = [];
    let textData = [];
    let decimalData = [];
    let intData = [];
    
    if (fs.existsSync(varcharFile)) {
      varcharData = await readCSV(varcharFile);
      console.log(`✅ Found ${varcharData.length} varchar attributes`);
    }
    
    if (fs.existsSync(textFile)) {
      textData = await readCSV(textFile);
      console.log(`✅ Found ${textData.length} text attributes`);
    }
    
    if (fs.existsSync(decimalFile)) {
      decimalData = await readCSV(decimalFile);
      console.log(`✅ Found ${decimalData.length} decimal attributes`);
    }
    
    if (fs.existsSync(intFile)) {
      intData = await readCSV(intFile);
      console.log(`✅ Found ${intData.length} int attributes`);
    }
    
    // Process products for Medusa format
    const medusaProducts = products.map(product => {
      const productId = product.entity_id;
      
      // Find product name
      const nameAttr = varcharData.find(v => 
        v.entity_id === productId && v.attribute_id === '71' // Magento name attribute ID
      );
      
      // Find description
      const descAttr = textData.find(t => 
        t.entity_id === productId && t.attribute_id === '75' // Magento description attribute ID
      );
      
      // Find short description
      const shortDescAttr = textData.find(t => 
        t.entity_id === productId && t.attribute_id === '76' // Magento short description attribute ID
      );
      
      // Find price
      const priceAttr = decimalData.find(d => 
        d.entity_id === productId && d.attribute_id === '75' // Magento price attribute ID
      );
      
      // Find weight
      const weightAttr = decimalData.find(d => 
        d.entity_id === productId && d.attribute_id === '82' // Magento weight attribute ID
      );
      
      return {
        id: productId,
        title: nameAttr ? nameAttr.value : `Product ${productId}`,
        handle: nameAttr ? nameAttr.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : `product-${productId}`,
        description: descAttr ? descAttr.value : '',
        subtitle: shortDescAttr ? shortDescAttr.value : '',
        thumbnail: '',
        images: [],
        status: 'published',
        external_id: product.sku,
        variants: [{
          id: `variant-${productId}`,
          title: 'Default Variant',
          sku: product.sku,
          inventory_quantity: 0,
          manage_inventory: true,
          allow_backorder: false,
          weight: weightAttr ? parseFloat(weightAttr.value) : 0,
          weight_unit: 'g',
          prices: [{
            amount: priceAttr ? parseInt(parseFloat(priceAttr.value) * 100) : 0, // Convert to cents
            currency_code: 'aud'
          }]
        }]
      };
    });
    
    // Write Medusa-ready products
    const outputFile = path.join(OUTPUT_DIR, 'medusa-products.json');
    fs.writeFileSync(outputFile, JSON.stringify(medusaProducts, null, 2));
    console.log(`💾 Medusa products written to: ${outputFile}`);
    
  } catch (error) {
    console.error('❌ Error processing products:', error.message);
  }
}

async function processCategories() {
  console.log('📂 Processing categories...');
  
  try {
    const categoriesFile = path.join(CSV_DIR, 'catalog_category_entity.csv');
    if (!fs.existsSync(categoriesFile)) {
      console.log('⚠️  catalog_category_entity.csv not found, skipping categories');
      return;
    }
    
    const categories = await readCSV(categoriesFile);
    console.log(`✅ Found ${categories.length} categories`);
    
    // Read category attributes
    const varcharFile = path.join(CSV_DIR, 'catalog_category_entity_varchar.csv');
    const textFile = path.join(CSV_DIR, 'catalog_category_entity_text.csv');
    
    let varcharData = [];
    let textData = [];
    
    if (fs.existsSync(varcharFile)) {
      varcharData = await readCSV(varcharFile);
    }
    
    if (fs.existsSync(textFile)) {
      textData = await readCSV(textFile);
    }
    
    // Process categories for Medusa format
    const medusaCategories = categories.map(category => {
      const categoryId = category.entity_id;
      
      // Find category name
      const nameAttr = varcharData.find(v => 
        v.entity_id === categoryId && v.attribute_id === '41' // Magento category name attribute ID
      );
      
      // Find description
      const descAttr = textData.find(t => 
        t.entity_id === categoryId && t.attribute_id === '42' // Magento category description attribute ID
      );
      
      return {
        id: categoryId,
        name: nameAttr ? nameAttr.value : `Category ${categoryId}`,
        handle: nameAttr ? nameAttr.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `category-${categoryId}`,
        description: descAttr ? descAttr.value : '',
        parent_category_id: category.parent_id === '1' ? null : category.parent_id,
        is_active: true
      };
    });
    
    // Write Medusa-ready categories
    const outputFile = path.join(OUTPUT_DIR, 'medusa-categories.json');
    fs.writeFileSync(outputFile, JSON.stringify(medusaCategories, null, 2));
    console.log(`💾 Medusa categories written to: ${outputFile}`);
    
  } catch (error) {
    console.error('❌ Error processing categories:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting CSV to Medusa conversion...');
  console.log(`📁 Reading from: ${CSV_DIR}`);
  console.log(`📁 Writing to: ${OUTPUT_DIR}`);
  
  // Check if CSV directory exists and has files
  if (!fs.existsSync(CSV_DIR)) {
    console.error('❌ magento-csv-files directory not found!');
    console.log('💡 Please create the directory and add your CSV files from phpMyAdmin');
    return;
  }
  
  const files = fs.readdirSync(CSV_DIR);
  if (files.length === 0) {
    console.error('❌ No CSV files found in magento-csv-files directory!');
    console.log('💡 Please export your Magento data from phpMyAdmin and add the CSV files');
    return;
  }
  
  console.log(`📄 Found ${files.length} files: ${files.join(', ')}`);
  
  await processCategories();
  await processProducts();
  
  console.log('\n🎉 Conversion completed!');
  console.log(`📁 Check the '${OUTPUT_DIR}' folder for Medusa-ready files`);
  console.log('\n📋 Next steps:');
  console.log('1. Review the generated JSON files');
  console.log('2. Import them into your Medusa backend');
  console.log('3. Test with your storefronts');
}

main().catch(console.error); 