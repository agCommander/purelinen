import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createProductCategoriesWorkflow, createProductsWorkflow } from "@medusajs/medusa/core-flows"
import * as fs from 'fs'
import * as path from 'path'

export default async function importAllProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  logger.info("🚀 Starting full product import...")
  
  // Read the converted data
  const dataDir = path.join(__dirname, '..', '..', '..', '..', 'migration-tools', 'medusa-ready')
  const productsFile = path.join(dataDir, 'medusa-products.json')
  const categoriesFile = path.join(dataDir, 'medusa-categories.json')
  
  if (!fs.existsSync(productsFile)) {
    logger.error("❌ Products file not found!")
    return
  }
  
  const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'))
  logger.info(`📦 Found ${products.length} products to import`)
  
  // Import products in batches to avoid memory issues
  const batchSize = 50
  let importedCount = 0
  let skippedCount = 0
  
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize)
    const validProducts = batch.filter(product => 
      product.title && 
      !product.title.startsWith('Product ') &&
      product.variants && 
      product.variants.length > 0
    )
    
    if (validProducts.length === 0) {
      skippedCount += batch.length
      continue
    }
    
    try {
      await createProductsWorkflow(container).run({
        input: {
          products: validProducts.map(product => ({
            title: product.title,
            handle: product.handle,
            description: product.description || '',
            subtitle: product.subtitle || '',
            status: product.status || 'published',
            external_id: product.external_id,
            weight: product.variants[0]?.weight || 0,
            options: [
              {
                title: "Size",
                values: ["Default"]
              }
            ],
            variants: product.variants.map(variant => ({
              title: variant.title,
              sku: variant.sku,
              inventory_quantity: variant.inventory_quantity || 0,
              manage_inventory: variant.manage_inventory !== false,
              allow_backorder: variant.allow_backorder || false,
              weight: variant.weight || 0,
              weight_unit: variant.weight_unit || 'g',
              options: {
                Size: "Default"
              },
              prices: variant.prices || []
            }))
          }))
        }
      })
      
      importedCount += validProducts.length
      skippedCount += (batch.length - validProducts.length)
      
      logger.info(`✅ Imported batch ${Math.floor(i/batchSize) + 1}: ${validProducts.length} products`)
      
    } catch (error) {
      if (error.message.includes('already exists')) {
        logger.info(`⚠️  Batch ${Math.floor(i/batchSize) + 1}: Some products already exist, skipping`)
        skippedCount += batch.length
      } else {
        logger.error(`❌ Error importing batch ${Math.floor(i/batchSize) + 1}:`, error.message)
        skippedCount += batch.length
      }
    }
  }
  
  logger.info(`🎉 Import completed!`)
  logger.info(`✅ Imported: ${importedCount} products`)
  logger.info(`⚠️  Skipped: ${skippedCount} products`)
} 