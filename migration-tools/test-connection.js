const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.MAGENTO_DB_HOST,
  port: process.env.MAGENTO_DB_PORT,
  user: process.env.MAGENTO_DB_USER,
  password: process.env.MAGENTO_DB_PASSWORD,
  database: process.env.MAGENTO_DB_NAME,
};

console.log('🔍 Testing database connection...');
console.log('Host:', dbConfig.host);
console.log('Port:', dbConfig.port);
console.log('Database:', dbConfig.database);
console.log('User:', dbConfig.user);
console.log('Password:', dbConfig.password ? '***' : 'Not set');

async function testConnection() {
  let connection;
  
  try {
    console.log('\n🔌 Attempting to connect...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ Connection successful!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT COUNT(*) as product_count FROM catalog_product_entity');
    console.log(`📦 Found ${rows[0].product_count} products in database`);
    
    // Test if we can access the main tables
    const tables = [
      'catalog_product_entity',
      'catalog_category_entity', 
      'catalog_category_product'
    ];
    
    for (const table of tables) {
      try {
        const [result] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`✅ Table ${table}: ${result[0].count} records`);
      } catch (error) {
        console.log(`❌ Table ${table}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Possible solutions:');
      console.error('1. Database server is not running');
      console.error('2. Wrong host/port in .env file');
      console.error('3. Firewall blocking connection');
      console.error('4. Database is on remote server but you\'re connecting to localhost');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Authentication failed:');
      console.error('1. Check username/password in .env file');
      console.error('2. User may not have access to this database');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 Database not found:');
      console.error('1. Check database name in .env file');
      console.error('2. Database may not exist');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testConnection(); 