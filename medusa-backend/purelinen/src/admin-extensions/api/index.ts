import { Router } from "express"
import { attachProductTypeRoutes } from "./product-types.api"
import { attachStockManagementRoutes } from "./stock-management.api"
import { attachDiscountManagementRoutes } from "./discount-management.api"
import { attachSwatchDatabaseRoutes } from "./swatch-database.api"

export function attachEnhancedAdminRoutes(router: Router, container: any) {
  // Product Type System routes
  attachProductTypeRoutes(router, container)
  
  // Stock Management routes
  attachStockManagementRoutes(router, container)
  
  // Discount Management routes
  attachDiscountManagementRoutes(router, container)

  // Swatch Database routes
  attachSwatchDatabaseRoutes(router, container)

  // Health check for enhanced admin
  router.get("/enhanced-admin/health", (req, res) => {
    res.json({ 
      status: "healthy",
      features: [
        "product-types",
        "stock-management", 
        "discount-management",
        "swatch-database"
      ],
      version: "1.0.0"
    })
  })

  return router
} 