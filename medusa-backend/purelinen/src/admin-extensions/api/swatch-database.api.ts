import { Router } from "express"
import { SwatchDatabaseService } from "../image-management/swatch-database.service"

export function attachSwatchDatabaseRoutes(router: Router, container: any) {
    const swatchService = new SwatchDatabaseService(container)

    // Get all swatches
    router.get("/admin/swatches", async (req, res) => {
        try {
            const swatches = await swatchService.getAllSwatches()
            res.json({ swatches })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    })

    // Get swatch by ID
    router.get("/admin/swatches/:id", async (req, res) => {
        try {
            const swatch = await swatchService.getSwatch(req.params.id)
            if (!swatch) {
                return res.status(404).json({ error: "Swatch not found" })
            }
            res.json({ swatch })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    })

    // Create new swatch
    router.post("/admin/swatches", async (req, res) => {
        try {
            const { name, color_code, color_name, category, image_url, thumbnail_url } = req.body
            
            if (!name || !color_code || !color_name || !category) {
                return res.status(400).json({ error: "Missing required fields" })
            }

            const swatchId = await swatchService.createSwatch({
                name,
                color_code,
                color_name,
                category,
                image_url: image_url || "",
                thumbnail_url: thumbnail_url || ""
            })

            res.json({ swatch_id: swatchId, message: "Swatch created successfully" })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    })

    // Update swatch
    router.put("/admin/swatches/:id", async (req, res) => {
        try {
            const updates = req.body
            await swatchService.updateSwatch(req.params.id, updates)
            res.json({ message: "Swatch updated successfully" })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    })

    // Delete swatch
    router.delete("/admin/swatches/:id", async (req, res) => {
        try {
            await swatchService.deleteSwatch(req.params.id)
            res.json({ message: "Swatch deleted successfully" })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    })

    // Search swatches
    router.get("/admin/swatches/search", async (req, res) => {
        try {
            const { query } = req.query
            const swatches = await swatchService.searchSwatches(query as string)
            res.json({ swatches })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    })

    // Get swatches by category
    router.get("/admin/swatches/category/:category", async (req, res) => {
        try {
            const swatches = await swatchService.getSwatchesByCategory(req.params.category)
            res.json({ swatches })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    })

    // Get popular swatches
    router.get("/admin/swatches/popular", async (req, res) => {
        try {
            const limit = parseInt(req.query.limit as string) || 10
            const swatches = await swatchService.getPopularSwatches(limit)
            res.json({ swatches })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    })

    // Get swatch statistics
    router.get("/admin/swatches/stats", async (req, res) => {
        try {
            const stats = await swatchService.getSwatchStatistics()
            res.json({ stats })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    })

    // Increment usage count
    router.post("/admin/swatches/:id/increment-usage", async (req, res) => {
        try {
            await swatchService.incrementUsageCount(req.params.id)
            res.json({ message: "Usage count incremented" })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    })

    // Decrement usage count
    router.post("/admin/swatches/:id/decrement-usage", async (req, res) => {
        try {
            await swatchService.decrementUsageCount(req.params.id)
            res.json({ message: "Usage count decremented" })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    })

    // Export swatch report
    router.get("/admin/swatches/export", async (req, res) => {
        try {
            const report = await swatchService.exportSwatchReport()
            res.json({ report })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    })
} 