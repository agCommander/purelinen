import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    // Query product types directly from the database
    const query = req.scope.resolve("query");
    const productTypes = await query({
      entity: "product_type",
      fields: ["id", "value", "metadata"],
      filters: {},
    });
    
    res.json({
      product_types: productTypes,
      count: productTypes.length
    });
  } catch (error) {
    console.error("Error fetching product types:", error);
    res.status(500).json({ error: "Failed to fetch product types" });
  }
}

