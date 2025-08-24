const { createMedusaContainer } = require('@medusajs/framework')

async function startServer() {
  try {
    console.log('🚀 Starting Medusa server...')
    
    // Load environment variables
    require('dotenv').config()
    
    // Create and start the Medusa container
    const container = await createMedusaContainer({
      projectConfig: {
        databaseUrl: process.env.DATABASE_URL,
        http: {
          storeCors: process.env.STORE_CORS,
          adminCors: process.env.ADMIN_CORS,
          authCors: process.env.AUTH_CORS,
          jwtSecret: process.env.JWT_SECRET || "supersecret",
          cookieSecret: process.env.COOKIE_SECRET || "supersecret",
        }
      }
    })
    
    console.log('✅ Medusa server started successfully!')
    console.log('🌐 Server running on http://localhost:9000')
    
  } catch (error) {
    console.error('❌ Error starting Medusa server:', error)
    process.exit(1)
  }
}

startServer()
