import { defineMiddlewares } from "@medusajs/framework/http"
import type {
  MedusaRequest,
  MedusaResponse,
  MedusaNextFunction,
} from "@medusajs/framework/http"

/**
 * Middleware to ensure variant.prices is always an array
 * This fixes the "Cannot read properties of undefined (reading 'reduce')" error
 * in Medusa's core pricing component
 */
async function ensureVariantPrices(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  // Debug: log the request
  if (process.env.NODE_ENV === 'development') {
    console.log('[Middleware] Intercepting:', req.method, req.url)
  }

  // Store original methods
  const originalJson = res.json.bind(res)
  const originalSend = res.send.bind(res)

  // Helper to patch data
  const patchData = (data: any) => {
    // Debug: log what we're patching
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] Response data structure:', {
        hasProduct: !!data?.product,
        hasProducts: Array.isArray(data?.products),
        productVariantsCount: data?.product?.variants?.length,
        firstVariantHasPrices: !!data?.product?.variants?.[0]?.prices,
      })
    }
    // Helper function to ensure prices array exists
    const ensurePrices = (variant: any) => {
      if (!variant) return variant
      if (!variant.prices || !Array.isArray(variant.prices)) {
        return {
          ...variant,
          prices: [],
        }
      }
      return variant
    }

    // Patch single product response
    if (data?.product) {
      if (Array.isArray(data.product.variants)) {
        data.product.variants = data.product.variants.map(ensurePrices)
      } else if (data.product.variants && typeof data.product.variants === 'object') {
        // Handle case where variants might be an object with array inside
        if (Array.isArray(data.product.variants.data)) {
          data.product.variants.data = data.product.variants.data.map(ensurePrices)
        }
      }
    }

    // Patch array of products response
    if (Array.isArray(data?.products)) {
      data.products = data.products.map((product: any) => {
        if (product?.variants && Array.isArray(product.variants)) {
          product.variants = product.variants.map(ensurePrices)
        }
        return product
      })
    }

    // Patch direct variant array (if variants are returned directly)
    if (Array.isArray(data?.variants)) {
      data.variants = data.variants.map(ensurePrices)
    }

    // Debug logging (remove in production)
    if (process.env.NODE_ENV === 'development' && data?.product?.variants) {
      const hasMissingPrices = data.product.variants.some((v: any) => !v.prices || !Array.isArray(v.prices))
      if (hasMissingPrices) {
        console.log('[Middleware] Fixed missing prices in variants')
      }
    }

    return data
  }

  // Override json method to patch response
  res.json = function (data: any) {
    const patched = patchData(data)
    return originalJson(patched)
  }

  // Also override send method (some endpoints use send instead of json)
  res.send = function (data: any) {
    // Try to parse if it's a string
    let parsedData = data
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data)
      } catch (e) {
        // Not JSON, send as-is
        return originalSend(data)
      }
    }
    
    const patched = patchData(parsedData)
    return originalSend(typeof data === 'string' ? JSON.stringify(patched) : patched)
  }

  next()
}

function stripEmptyQueryParams(req: MedusaRequest) {
  const query = req.query || {}
  for (const [key, value] of Object.entries(query)) {
    if (value === "") {
      delete (query as Record<string, unknown>)[key]
      continue
    }

    if (Array.isArray(value) && value.every((entry) => entry === "")) {
      delete (query as Record<string, unknown>)[key]
    }
  }
}

export default defineMiddlewares({
  routes: [
    {
      // Remove empty query params so they don't trigger filters (e.g. q=)
      matcher: /\/admin\/products/,
      middlewares: [
        (req: MedusaRequest, _res: MedusaResponse, next: MedusaNextFunction) => {
          if (req.method === "GET") {
            stripEmptyQueryParams(req)
          }
          next()
        },
      ],
    },
    {
      // Match all admin product API routes (including nested routes)
      matcher: /\/admin\/products/,
      middlewares: [ensureVariantPrices],
    },
  ],
})
