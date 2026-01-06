import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  // In Medusa 2.12+, req.url is a string, not an object
  const url = typeof req.url === 'string' ? req.url : String(req.url || '');
  const pathname = url.includes('?') ? url.split('?')[0] : url;
  
  // Handle product-types endpoint
  if (pathname.includes('/product-types')) {
    try {
      const productTypeService = req.scope.resolve("productTypeService") as any;
      const productTypes = await productTypeService.listAndCount({});
      
      res.json({
        product_types: productTypes[0],
        count: productTypes[1]
      });
    } catch (error) {
      console.error("Error fetching product types:", error);
      res.status(500).json({ error: "Failed to fetch product types" });
    }
  } else {
    res.sendStatus(200);
  }
}
