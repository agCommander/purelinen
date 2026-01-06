import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { categoryId } = req.params;
    
    if (!categoryId) {
      return res.status(400).json({ error: "Category ID is required" });
    }

    // Get database manager to query collections
    const manager = req.scope.resolve("manager") as any;
    
    // Query collections that have this category_id in their metadata
    // Collections can be linked to categories via metadata.category_id or metadata.category_ids
    const collections = await manager.query(
      `SELECT DISTINCT 
        pc.id,
        pc.title,
        pc.handle,
        pc.metadata
      FROM product_collection pc
      WHERE (
        pc.metadata->>'category_id' = $1
        OR pc.metadata->'category_ids' @> $2::jsonb
      )
      AND pc.deleted_at IS NULL
      ORDER BY pc.title`,
      [categoryId, JSON.stringify([categoryId])]
    );
    
    res.json({
      collections: collections || [],
      count: collections?.length || 0
    });
  } catch (error) {
    console.error("Error fetching collections by category:", error);
    res.status(500).json({ 
      error: "Failed to fetch collections",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

