import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { typeValue } = req.params;
    
    if (!typeValue) {
      return res.status(400).json({ error: "Type value is required" });
    }

    // Use pg Client directly
    const { Client } = require('pg');
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    
    try {
      await client.connect();
      
      // First get the product type ID from the value
      const productTypeResult = await client.query(
        `SELECT id FROM product_type WHERE value = $1 LIMIT 1`,
        [typeValue]
      );
      
      if (!productTypeResult || productTypeResult.rows.length === 0) {
        return res.json({
          collections: [],
          count: 0
        });
      }
      
      const typeId = productTypeResult.rows[0].id;
      
      // Query the type_collections view using raw SQL
      const collectionsResult = await client.query(
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
      
      const collections = collectionsResult.rows || [];
      
      res.json({
        collections: collections,
        count: collections.length
      });
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error("Error fetching collections by type value:", error);
    res.status(500).json({ 
      error: "Failed to fetch collections",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

