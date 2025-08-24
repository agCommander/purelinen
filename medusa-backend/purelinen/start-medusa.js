const { MedusaAppLoader, configLoader, pgConnectionLoader } = require('@medusajs/framework')

async function startMedusa() {
  try {
    console.log('🚀 Starting Medusa server...')
    
    // Load configuration first
    const config = await configLoader(process.cwd(), 'medusa-config.js')
    
    console.log('✅ Configuration loaded successfully')
    console.log(`📊 Database: ${config.projectConfig.databaseUrl}`)
    console.log(`🌐 Port: ${config.projectConfig.http.port}`)
    
    // Set up database connection
    console.log('🔌 Setting up database connection...')
    await pgConnectionLoader()
    console.log('✅ Database connection established')
    
    const loader = new MedusaAppLoader({
      directory: process.cwd(),
      configModule: config
    })
    
    const app = await loader.load()
    
    const port = config.projectConfig.http.port
    app.listen(port, () => {
      console.log(`✅ Medusa server running on http://localhost:${port}`)
      console.log(`✅ Health check: http://localhost:${port}/health`)
      console.log(`✅ Store API: http://localhost:${port}/store`)
      console.log(`✅ Admin API: http://localhost:${port}/admin`)
    })
    
  } catch (error) {
    console.error('❌ Error starting Medusa:', error)
    process.exit(1)
  }
}

startMedusa()
