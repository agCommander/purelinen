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

    // Use pg Client directly for raw SQL queries
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
    
    console.log('Store: Fetching collections for category:', categoryId);
    
    // Add timeout wrapper for connection
    const connectPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 10000)
    );
    
    await Promise.race([connectPromise, timeoutPromise]);
    
    // Query collections that have this category_id in their metadata
    // Collections are linked to categories via metadata.category_id (set by admin widget)
    const queryPromise = client.query(
      `SELECT DISTINCT 
        pc.id,
        pc.title,
        pc.handle,
        pc.metadata
      FROM product_collection pc
      WHERE pc.metadata->>'category_id' = $1
        AND pc.deleted_at IS NULL
      ORDER BY pc.title`,
      [categoryId]
    );
    
    const queryTimeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout')), 10000)
    );
    
    const result = await Promise.race([queryPromise, queryTimeoutPromise]) as any;
    
    const collections = result.rows || [];
    
    console.log('Store: Found collections:', collections.length);
    
    res.json({
      collections: collections || [],
      count: collections?.length || 0
    });
  } catch (error) {
    console.error("Error fetching collections by category:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ 
      error: "Failed to fetch collections",
      message: error instanceof Error ? error.message : String(error)
    });
  } finally {
    // Always close the client connection if it was opened
    if (client) {
      try {
        await client.end();
        console.log('Store: Database client closed');
      } catch (closeError) {
        console.error('Error closing database client:', closeError);
      }
    }
  }
}

