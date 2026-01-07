import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  let client: any = null;
  
  try {
    const { collectionId } = req.params;
    
    if (!collectionId) {
      return res.status(400).json({ error: "Collection ID is required" });
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
    
    // Fetch products in this collection with their positions
    const result = await client.query(
      `SELECT 
        p.id,
        p.title,
        p.handle,
        p.status,
        COALESCE(p.collection_position, 0) as position
      FROM product p
      WHERE p.collection_id = $1
      ORDER BY COALESCE(p.collection_position, 0) ASC, p.title ASC`,
      [collectionId]
    );
    
    res.json({
      products: result.rows || [],
      count: result.rows?.length || 0
    });
  } catch (error) {
    console.error("Error fetching collection products:", error);
    res.status(500).json({ 
      error: "Failed to fetch collection products",
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

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  let client: any = null;
  
  try {
    const { collectionId } = req.params;
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { productPositions } = body; // Array of { product_id, position }
    
    if (!collectionId) {
      return res.status(400).json({ error: "Collection ID is required" });
    }
    
    if (!Array.isArray(productPositions)) {
      return res.status(400).json({ error: "productPositions must be an array" });
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
    
    // Update positions in a transaction
    await client.query('BEGIN');
    
    try {
      for (const { product_id, position } of productPositions) {
        // Verify product belongs to this collection
        const checkResult = await client.query(
          `SELECT id FROM product WHERE id = $1 AND collection_id = $2`,
          [product_id, collectionId]
        );
        
        if (checkResult.rows.length === 0) {
          throw new Error(`Product ${product_id} does not belong to collection ${collectionId}`);
        }
        
        await client.query(
          `UPDATE product 
           SET collection_position = $1 
           WHERE id = $2 AND collection_id = $3`,
          [position || 0, product_id, collectionId]
        );
      }
      
      await client.query('COMMIT');
      
      res.json({ success: true, updated: productPositions.length });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error("Error updating product positions:", error);
    res.status(500).json({ 
      error: "Failed to update product positions",
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

