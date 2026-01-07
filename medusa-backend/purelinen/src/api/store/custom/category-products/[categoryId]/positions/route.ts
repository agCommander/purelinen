import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  let client: any = null;
  
  try {
    const { categoryId } = req.params;
    
    if (!categoryId) {
      return res.status(400).json({ error: "Category ID is required" });
    }

    const { Client } = require('pg');
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    client = new Client({
      connectionString: connectionString,
      connectionTimeoutMillis: 10000,
      query_timeout: 10000,
    });
    
    await client.connect();
    
    // Fetch product positions for this category
    const result = await client.query(
      `SELECT 
        product_id,
        COALESCE(position, 0) as position
      FROM product_category_product
      WHERE product_category_id = $1`,
      [categoryId]
    );
    
    // Convert to a map for easy lookup
    const positions: Record<string, number> = {};
    result.rows.forEach((row: any) => {
      positions[row.product_id] = row.position;
    });
    
    res.json({
      positions
    });
  } catch (error) {
    console.error("Error fetching category product positions:", error);
    res.status(500).json({ 
      error: "Failed to fetch product positions",
      message: error instanceof Error ? error.message : String(error)
    });
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (closeError) {
        console.error('Error closing database client:', closeError);
      }
    }
  }
}

