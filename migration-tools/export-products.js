const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database connection configuration
const dbConfig = {
  host: process.env.MAGENTO_DB_HOST || 'localhost',
  port: process.env.MAGENTO_DB_PORT || 3306,
  user: process.env.MAGENTO_DB_USER,
  password: process.env.MAGENTO_DB_PASSWORD,
  database: process.env.MAGENTO_DB_NAME,
};

// Create exports directory
const exportsDir = path.join(__dirname, 'exports');
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir);
}

async function exportProducts() {
  let connection;
  
  try {
    console.log('🔌 Connecting to Magento database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('📦 Exporting products...');
    
    // Query to get products with their essential information
    const productQuery = `
      SELECT 
        p.entity_id as product_id,
        p.sku,
        p.type_id as product_type,
        p.attribute_set_id,
        p.created_at,
        p.updated_at,
        pv.value as name,
        pd.value as description,
        ps.value as short_description,
        pprice.value as price,
        pweight.value as weight,
        pstatus.value as status,
        pvisibility.value as visibility,
        pstock.value as stock_status,
        pqty.value as qty
      FROM catalog_product_entity p
      LEFT JOIN catalog_product_entity_varchar pv ON p.entity_id = pv.entity_id 
        AND pv.attribute_id = (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 4)
      LEFT JOIN catalog_product_entity_text pd ON p.entity_id = pd.entity_id 
        AND pd.attribute_id = (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'description' AND entity_type_id = 4)
      LEFT JOIN catalog_product_entity_text ps ON p.entity_id = ps.entity_id 
        AND ps.attribute_id = (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'short_description' AND entity_type_id = 4)
      LEFT JOIN catalog_product_entity_decimal pprice ON p.entity_id = pprice.entity_id 
        AND pprice.attribute_id = (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'price' AND entity_type_id = 4)
      LEFT JOIN catalog_product_entity_decimal pweight ON p.entity_id = pweight.entity_id 
        AND pweight.attribute_id = (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'weight' AND entity_type_id = 4)
      LEFT JOIN catalog_product_entity_int pstatus ON p.entity_id = pstatus.entity_id 
        AND pstatus.attribute_id = (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'status' AND entity_type_id = 4)
      LEFT JOIN catalog_product_entity_int pvisibility ON p.entity_id = pvisibility.entity_id 
        AND pvisibility.attribute_id = (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'visibility' AND entity_type_id = 4)
      LEFT JOIN cataloginventory_stock_item pstock ON p.entity_id = pstock.product_id
      LEFT JOIN cataloginventory_stock_item pqty ON p.entity_id = pqty.product_id
      WHERE p.type_id = 'simple'
      ORDER BY p.entity_id
    `;
    
    const [products] = await connection.execute(productQuery);
    
    console.log(`✅ Found ${products.length} products`);
    
    // Export to CSV
    const csvPath = path.join(exportsDir, 'products.csv');
    const csvHeader = 'product_id,sku,name,description,short_description,price,weight,status,visibility,stock_status,qty,created_at,updated_at\n';
    
    let csvContent = csvHeader;
    
    products.forEach(product => {
      const row = [
        product.product_id,
        product.sku,
        `"${(product.name || '').replace(/"/g, '""')}"`,
        `"${(product.description || '').replace(/"/g, '""')}"`,
        `"${(product.short_description || '').replace(/"/g, '""')}"`,
        product.price || 0,
        product.weight || 0,
        product.status || 1,
        product.visibility || 4,
        product.stock_status || 1,
        product.qty || 0,
        product.created_at,
        product.updated_at
      ].join(',');
      
      csvContent += row + '\n';
    });
    
    fs.writeFileSync(csvPath, csvContent);
    console.log(`💾 Products exported to: ${csvPath}`);
    
    // Export categories
    console.log('📂 Exporting categories...');
    const categoryQuery = `
      SELECT 
        c.entity_id as category_id,
        c.parent_id,
        c.path,
        c.position,
        c.level,
        cv.value as name,
        cd.value as description
      FROM catalog_category_entity c
      LEFT JOIN catalog_category_entity_varchar cv ON c.entity_id = cv.entity_id 
        AND cv.attribute_id = (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'name' AND entity_type_id = 3)
      LEFT JOIN catalog_category_entity_text cd ON c.entity_id = cd.entity_id 
        AND cd.attribute_id = (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'description' AND entity_type_id = 3)
      ORDER BY c.path
    `;
    
    const [categories] = await connection.execute(categoryQuery);
    console.log(`✅ Found ${categories.length} categories`);
    
    const categoryCsvPath = path.join(exportsDir, 'categories.csv');
    const categoryCsvHeader = 'category_id,parent_id,path,position,level,name,description\n';
    
    let categoryCsvContent = categoryCsvHeader;
    
    categories.forEach(category => {
      const row = [
        category.category_id,
        category.parent_id,
        category.path,
        category.position,
        category.level,
        `"${(category.name || '').replace(/"/g, '""')}"`,
        `"${(category.description || '').replace(/"/g, '""')}"`
      ].join(',');
      
      categoryCsvContent += row + '\n';
    });
    
    fs.writeFileSync(categoryCsvPath, categoryCsvContent);
    console.log(`💾 Categories exported to: ${categoryCsvPath}`);
    
    // Export product-category relationships
    console.log('🔗 Exporting product-category relationships...');
    const productCategoryQuery = `
      SELECT 
        product_id,
        category_id,
        position
      FROM catalog_category_product
      ORDER BY product_id, position
    `;
    
    const [productCategories] = await connection.execute(productCategoryQuery);
    console.log(`✅ Found ${productCategories.length} product-category relationships`);
    
    const productCategoryCsvPath = path.join(exportsDir, 'product_categories.csv');
    const productCategoryCsvHeader = 'product_id,category_id,position\n';
    
    let productCategoryCsvContent = productCategoryCsvHeader;
    
    productCategories.forEach(rel => {
      const row = [
        rel.product_id,
        rel.category_id,
        rel.position
      ].join(',');
      
      productCategoryCsvContent += row + '\n';
    });
    
    fs.writeFileSync(productCategoryCsvPath, productCategoryCsvContent);
    console.log(`💾 Product-category relationships exported to: ${productCategoryCsvPath}`);
    
    console.log('\n🎉 Export completed successfully!');
    console.log(`📁 Check the 'exports' folder for your CSV files`);
    
  } catch (error) {
    console.error('❌ Error during export:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Make sure your Magento database is running and accessible');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the export
exportProducts(); 