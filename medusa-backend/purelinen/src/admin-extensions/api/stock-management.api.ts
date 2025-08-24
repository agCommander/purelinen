import { Router } from "express"
import { StockManagementService } from "../stock-management/stock-management.service"

export function attachStockManagementRoutes(router: Router, container: any) {
  const stockService = new StockManagementService(container)

  // Get product stock information
  router.get("/products/:id/stock", async (req, res) => {
    try {
      const { id } = req.params
      const stockInfo = await stockService.getProductStock(id)
      res.json({ stock_info: stockInfo })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  // Update store stock
  router.put("/products/:id/stores/:storeId/stock", async (req, res) => {
    try {
      const { id, storeId } = req.params
      const stockData = req.body
      await stockService.updateStoreStock(id, storeId, stockData)
      res.json({ success: true })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  // Bulk update stock
  router.post("/stock/bulk-update", async (req, res) => {
    try {
      const { updates } = req.body
      await stockService.bulkUpdateStock(updates)
      res.json({ success: true })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  // Get low stock products
  router.get("/stock/low-stock", async (req, res) => {
    try {
      const { limit } = req.query
      const lowStockProducts = await stockService.getLowStockProducts(
        limit ? parseInt(limit as string) : 50
      )
      res.json({ products: lowStockProducts })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  // Get stock summary
  router.get("/stock/summary", async (req, res) => {
    try {
      const summary = await stockService.getStockSummary()
      res.json({ summary })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  // Set store status
  router.put("/products/:id/stores/:storeId/status", async (req, res) => {
    try {
      const { id, storeId } = req.params
      const { enabled } = req.body
      await stockService.setStoreStatus(id, storeId, enabled)
      res.json({ success: true })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  // Get products by store status
  router.get("/stores/:storeId/products", async (req, res) => {
    try {
      const { storeId } = req.params
      const { enabled } = req.query
      const products = await stockService.getProductsByStoreStatus(
        storeId,
        enabled === 'true'
      )
      res.json({ products })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  // Export stock report
  router.get("/stock/export", async (req, res) => {
    try {
      const report = await stockService.exportStockReport()
      res.json({ report })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  return router
} 