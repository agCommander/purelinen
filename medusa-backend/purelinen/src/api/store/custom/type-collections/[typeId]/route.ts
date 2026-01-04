import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { typeId } = req.params;
    
    if (!typeId) {
      return res.status(400).json({ error: "Type ID is required" });
    }

    // Get database manager to query the view directly
    const manager = req.scope.resolve("manager");
    
    // Query the type_collections view using raw SQL
    const collections = await manager.query(
      `SELECT DISTINCT 
        pc.id,
        pc.title,
        pc.handle,
        pc.metadata
      FROM type_collections tc
      INNER JOIN product_collection pc ON pc.id = tc.id
      WHERE tc.type_id = $1
      ORDER BY pc.title`,
      [typeId]
    );
    
    res.json({
      collections: collections || [],
      count: collections?.length || 0
    });
  } catch (error) {
    console.error("Error fetching collections by type:", error);
    res.status(500).json({ error: "Failed to fetch collections" });
  }
}

