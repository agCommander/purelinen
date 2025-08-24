const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const MEDUSA_BASE_URL = 'http://localhost:9000';
const DATA_DIR = path.join(__dirname, 'medusa-ready');

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', data = null) {
  try {
    const config = {
      method,
      url: `${MEDUSA_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ API Error (${endpoint}):`, error.response?.data || error.message);
    throw error;
  }
}

async function importCategories() {
  console.log('📂 Importing categories...');
  
  try {
    const categoriesFile = path.join(DATA_DIR, 'medusa-categories.json');
    if (!fs.existsSync(categoriesFile)) {
      console.log('⚠️  Categories file not found, skipping');
      return;
    }
    
    const categories = JSON.parse(fs.readFileSync(categoriesFile, 'utf8'));
    console.log(`✅ Found ${categories.length} categories to import`);
    
    let importedCount = 0;
    let skippedCount = 0;
    
    for (const category of categories) {
      try {
        // Skip root categories
        if (category.name === 'Root Catalog' || category.name === 'Root') {
          skippedCount++;
          continue;
        }
        
        const categoryData = {
          name: category.name,
          handle: category.handle,
          description: category.description || '',
          parent_category_id: category.parent_category_id === '0' ? null : category.parent_category_id,
          is_active: category.is_active
        };
        
        await apiCall('/admin/product-categories', 'POST', categoryData);
        importedCount++;
        
        if (importedCount % 10 === 0) {
          console.log(`   Imported ${importedCount} categories...`);
        }
        
      } catch (error) {
        if (error.response?.status === 409) {
          // Category already exists
          skippedCount++;
        } else {
          console.error(`   Failed to import category "${category.name}":`, error.message);
        }
      }
    }
    
    console.log(`✅ Categories import completed: ${importedCount} imported, ${skippedCount} skipped`);
    
  } catch (error) {
    console.error('❌ Error importing categories:', error.message);
  }
}

async function importProducts() {
  console.log('📦 Importing products...');
  
  try {
    const productsFile = path.join(DATA_DIR, 'medusa-products.json');
    if (!fs.existsSync(productsFile)) {
      console.log('⚠️  Products file not found, skipping');
      return;
    }
    
    const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
    console.log(`✅ Found ${products.length} products to import`);
    
    let importedCount = 0;
    let skippedCount = 0;
    
    for (const product of products) {
      try {
        // Skip products without proper titles
        if (!product.title || product.title.startsWith('Product ')) {
          skippedCount++;
          continue;
        }
        
        const productData = {
          title: product.title,
          handle: product.handle,
          description: product.description || '',
          subtitle: product.subtitle || '',
          status: product.status,
          external_id: product.external_id,
          variants: product.variants.map(variant => ({
            title: variant.title,
            sku: variant.sku,
            inventory_quantity: variant.inventory_quantity,
            manage_inventory: variant.manage_inventory,
            allow_backorder: variant.allow_backorder,
            weight: variant.weight,
            weight_unit: variant.weight_unit,
            prices: variant.prices
          }))
        };
        
        await apiCall('/admin/products', 'POST', productData);
        importedCount++;
        
        if (importedCount % 50 === 0) {
          console.log(`   Imported ${importedCount} products...`);
        }
        
      } catch (error) {
        if (error.response?.status === 409) {
          // Product already exists
          skippedCount++;
        } else {
          console.error(`   Failed to import product "${product.title}":`, error.message);
        }
      }
    }
    
    console.log(`✅ Products import completed: ${importedCount} imported, ${skippedCount} skipped`);
    
  } catch (error) {
    console.error('❌ Error importing products:', error.message);
  }
}

async function checkMedusaConnection() {
  console.log('🔌 Checking Medusa connection...');
  
  try {
    const health = await apiCall('/health');
    console.log('✅ Medusa backend is running');
    return true;
  } catch (error) {
    console.error('❌ Cannot connect to Medusa backend');
    console.error('💡 Make sure your Medusa backend is running on http://localhost:9000');
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Medusa import...');
  console.log(`📁 Reading from: ${DATA_DIR}`);
  console.log(`🌐 Medusa URL: ${MEDUSA_BASE_URL}`);
  
  // Check connection first
  const isConnected = await checkMedusaConnection();
  if (!isConnected) {
    return;
  }
  
  // Import data
  await importCategories();
  await importProducts();
  
  console.log('\n🎉 Import completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Check your Medusa admin panel');
  console.log('2. Verify products and categories are imported correctly');
  console.log('3. Start building your storefronts');
}

main().catch(console.error); 