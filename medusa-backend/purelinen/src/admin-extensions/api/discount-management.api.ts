import { Router } from "express"
import { DiscountManagementService } from "../discount-management/discount-management.service"

export function attachDiscountManagementRoutes(router: Router, container: any) {
  const discountService = new DiscountManagementService(container)

  // Create discount
  router.post("/discounts", async (req, res) => {
    try {
      const discountData = req.body
      const discountId = await discountService.createDiscount(discountData)
      res.json({ discount_id: discountId })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  // Get all discounts
  router.get("/discounts", async (req, res) => {
    try {
      const discounts = await discountService.getAllDiscounts()
      res.json({ discounts })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  // Get active discounts for product and store
  router.get("/products/:productId/stores/:storeId/discounts", async (req, res) => {
    try {
      const { productId, storeId } = req.params
      const discounts = await discountService.getActiveDiscounts(productId, storeId)
      res.json({ discounts })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  // Calculate discount preview
  router.post("/discounts/preview", async (req, res) => {
    try {
      const { productId, storeId, originalPrice } = req.body
      const preview = await discountService.calculateDiscountPreview(
        productId,
        storeId,
        originalPrice
      )
      res.json({ preview })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  // Update discount
  router.put("/discounts/:id", async (req, res) => {
    try {
      const { id } = req.params
      const updates = req.body
      await discountService.updateDiscount(id, updates)
      res.json({ success: true })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  // Delete discount
  router.delete("/discounts/:id", async (req, res) => {
    try {
      const { id } = req.params
      await discountService.deleteDiscount(id)
      res.json({ success: true })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  // Bulk create discounts
  router.post("/discounts/bulk", async (req, res) => {
    try {
      const { discountTemplate, productIds } = req.body
      const createdIds = await discountService.bulkCreateDiscounts(
        discountTemplate,
        productIds
      )
      res.json({ created_ids: createdIds })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  // Get discounts by status
  router.get("/discounts/status/:status", async (req, res) => {
    try {
      const { status } = req.params
      const discounts = await discountService.getDiscountsByStatus(
        status as 'active' | 'expired' | 'scheduled'
      )
      res.json({ discounts })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  // Get discount statistics
  router.get("/discounts/statistics", async (req, res) => {
    try {
      const statistics = await discountService.getDiscountStatistics()
      res.json({ statistics })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  // Export discount report
  router.get("/discounts/export", async (req, res) => {
    try {
      const report = await discountService.exportDiscountReport()
      res.json({ report })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  return router
} 