import { Router } from "express"
import { ProductTypeService } from "../product-types/product-type.service"
import { ProductType } from "../product-types/product-type.entity"

export function attachProductTypeRoutes(router: Router, container: any) {
  const productTypeService = new ProductTypeService(container)

  // Get all products by type
  router.get("/product-types/:type/products", async (req, res) => {
    try {
      const { type } = req.params
      const products = await productTypeService.getProductsByType(type as ProductType)
      res.json({ products })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  // Get product type data
  router.get("/products/:id/product-type", async (req, res) => {
    try {
      const { id } = req.params
      const productType = await productTypeService.getProductType(id)
      res.json({ product_type: productType })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  // Set product type
  router.post("/products/:id/product-type", async (req, res) => {
    try {
      const { id } = req.params
      const { type, options } = req.body
      await productTypeService.setProductType(id, type, options)
      res.json({ success: true })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  // Create configurable product
  router.post("/product-types/configurable", async (req, res) => {
    try {
      const { productData, configurableOptions } = req.body
      const productId = await productTypeService.createConfigurableProduct(
        productData,
        configurableOptions
      )
      res.json({ product_id: productId })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  // Create grouped product
  router.post("/product-types/grouped", async (req, res) => {
    try {
      const { productData, groupedOptions } = req.body
      const productId = await productTypeService.createGroupedProduct(
        productData,
        groupedOptions
      )
      res.json({ product_id: productId })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  // Get variant matrix
  router.get("/products/:id/variant-matrix", async (req, res) => {
    try {
      const { id } = req.params
      const variantMatrix = await productTypeService.getVariantMatrix(id)
      res.json({ variant_matrix: variantMatrix })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  // Update variant matrix
  router.put("/products/:id/variant-matrix", async (req, res) => {
    try {
      const { id } = req.params
      const { variantMatrix } = req.body
      await productTypeService.updateVariantMatrix(id, variantMatrix)
      res.json({ success: true })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  return router
} 