const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const DATA_DIR = path.join(__dirname, 'medusa-ready');
const MEDUSA_DIR = path.join(__dirname, '..', 'medusa-backend', 'purelinen');

console.log('🚀 Starting Medusa CLI import...');
console.log(`📁 Reading from: ${DATA_DIR}`);
console.log(`📁 Medusa directory: ${MEDUSA_DIR}`);

// Check if Medusa directory exists
if (!fs.existsSync(MEDUSA_DIR)) {
  console.error('❌ Medusa backend directory not found!');
  console.log('💡 Make sure your Medusa backend is set up correctly');
  process.exit(1);
}

// Change to Medusa directory
process.chdir(MEDUSA_DIR);

try {
  console.log('📂 Importing categories...');
  
  const categoriesFile = path.join(DATA_DIR, 'medusa-categories.json');
  if (fs.existsSync(categoriesFile)) {
    const categories = JSON.parse(fs.readFileSync(categoriesFile, 'utf8'));
    console.log(`✅ Found ${categories.length} categories`);
    
    // Create a simple import script for categories
    const categoryImportScript = `
      import { ProductCategoryService } from '@medusajs/medusa';
      import { Container } from '@medusajs/medusa/dist/types/global';
      
      export default async function seedCategories(container: Container) {
        const categoryService = container.resolve<ProductCategoryService>('productCategoryService');
        
        const categories = ${JSON.stringify(categories, null, 2)};
        
        for (const category of categories) {
          if (category.name === 'Root Catalog' || category.name === 'Root') {
            continue;
          }
          
          try {
            await categoryService.create({
              name: category.name,
              handle: category.handle,
              description: category.description || '',
              parent_category_id: category.parent_category_id === '0' ? null : category.parent_category_id,
              is_active: category.is_active
            });
            console.log(\`✅ Created category: \${category.name}\`);
          } catch (error) {
            if (error.message.includes('already exists')) {
              console.log(\`⚠️  Category already exists: \${category.name}\`);
            } else {
              console.error(\`❌ Failed to create category \${category.name}:\`, error.message);
            }
          }
        }
      }
    `;
    
    const scriptPath = path.join(MEDUSA_DIR, 'src', 'scripts', 'import-categories.ts');
    fs.writeFileSync(scriptPath, categoryImportScript);
    
    console.log('📝 Created category import script');
  }
  
  console.log('📦 Importing products...');
  
  const productsFile = path.join(DATA_DIR, 'medusa-products.json');
  if (fs.existsSync(productsFile)) {
    const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
    console.log(`✅ Found ${products.length} products`);
    
    // Create a simple import script for products
    const productImportScript = `
      import { ProductService } from '@medusajs/medusa';
      import { Container } from '@medusajs/medusa/dist/types/global';
      
      export default async function seedProducts(container: Container) {
        const productService = container.resolve<ProductService>('productService');
        
        const products = ${JSON.stringify(products, null, 2)};
        
        for (const product of products) {
          if (!product.title || product.title.startsWith('Product ')) {
            continue;
          }
          
          try {
            await productService.create({
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
            });
            console.log(\`✅ Created product: \${product.title}\`);
          } catch (error) {
            if (error.message.includes('already exists')) {
              console.log(\`⚠️  Product already exists: \${product.title}\`);
            } else {
              console.error(\`❌ Failed to create product \${product.title}:\`, error.message);
            }
          }
        }
      }
    `;
    
    const scriptPath = path.join(MEDUSA_DIR, 'src', 'scripts', 'import-products.ts');
    fs.writeFileSync(scriptPath, productImportScript);
    
    console.log('📝 Created product import script');
  }
  
  console.log('\n🎉 Import scripts created!');
  console.log('\n📋 Next steps:');
  console.log('1. Run category import: npx medusa exec ./src/scripts/import-categories.ts');
  console.log('2. Run product import: npx medusa exec ./src/scripts/import-products.ts');
  console.log('3. Check your Medusa admin panel');
  
} catch (error) {
  console.error('❌ Error creating import scripts:', error.message);
} 