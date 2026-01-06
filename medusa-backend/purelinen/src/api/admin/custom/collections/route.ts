import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    // Use the query service like the product-types endpoint
    const query = req.scope.resolve("query") as any;
    const collections = await query({
      entity: "product_collection",
      fields: ["id", "title", "handle", "metadata"],
      filters: {},
    });
    
    console.log('Collections fetched:', collections?.length || 0);
    
    res.json({
      collections: collections || [],
      count: collections?.length || 0
    });
  } catch (error) {
    console.error("Error fetching collections:", error);
    res.status(500).json({ 
      error: "Failed to fetch collections",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

