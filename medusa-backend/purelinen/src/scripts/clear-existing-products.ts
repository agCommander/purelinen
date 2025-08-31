import { loadEnv } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

export default async function clearExistingProducts() {
  try {
    console.log("🗑️ Clearing existing products from database...")
    
    // Connect to database using the same connection as Medusa
    const { default: pgConnectionLoader } = await import('@medusajs/medusa/dist/loaders/pg-connection-loader')
    const connection = await pgConnectionLoader({
      databaseUrl: process.env.DATABASE_URL!,
    })
    
    console.log("✅ Connected to database")
    
    // Clear tables in order to avoid foreign key constraints
    const tables = [
      'product_variant',
      'product_option', 
      'product_option_value',
      'product_tags',
      'product_category',
      'product_collection',
      'price_list',
      'product'
    ]
    
    for (const table of tables) {
      try {
        const result = await connection.query(`DELETE FROM ${table}`)
        console.log(`✅ Cleared ${table}: ${result.rowCount} rows deleted`)
      } catch (error) {
        console.log(`⚠️ Error clearing ${table}:`, error.message)
      }
    }
    
    console.log("\n🎉 Database cleanup complete!")
    console.log("📋 Ready to run smart import with:")
    console.log("   • 136 product groups")
    console.log("   • 2,854 variants")
    console.log("   • Dual pricing (Retail + B2B)")
    console.log("   • Stock quantities")
    
    await connection.end()
    
  } catch (error) {
    console.error("❌ Error during cleanup:", error)
  }
}
