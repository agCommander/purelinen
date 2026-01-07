import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  let client: any = null;
  
  try {
    const { category_id } = req.query;
    console.log('Collections GET request, category_id:', category_id);
    
    let collections;
    
    if (category_id && typeof category_id === 'string') {
      // Filter by category using the category_collections view
      // Use pg Client directly for raw SQL queries on views
      const { Client } = require('pg');
      
      const connectionString = process.env.DATABASE_URL;
      if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is not set');
      }
      
      client = new Client({
        connectionString: connectionString,
        connectionTimeoutMillis: 10000, // 10 second timeout
        query_timeout: 10000, // 10 second query timeout
      });
      
      console.log('Attempting to connect to database for category:', category_id);
      
      // Add timeout wrapper
      const connectPromise = client.connect();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 10000)
      );
      
      await Promise.race([connectPromise, timeoutPromise]);
      console.log('Connected to database, querying category_collections view for category:', category_id);
      
      const queryPromise = client.query(
        `SELECT DISTINCT 
          id,
          title,
          handle,
          metadata
        FROM category_collections
        WHERE category_id = $1
        ORDER BY title`,
        [category_id]
      );
      
      const queryTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 10000)
      );
      
      const result = await Promise.race([queryPromise, queryTimeoutPromise]) as any;
      
      collections = result.rows || [];
      console.log('Found collections:', collections.length);
    } else {
      // Return all collections if no category filter
      const query = req.scope.resolve("query") as any;
      collections = await query({
        entity: "product_collection",
        fields: ["id", "title", "handle", "metadata"],
        filters: {},
      });
      console.log('Found all collections:', collections?.length || 0);
    }
    
    console.log('Collections fetched:', collections?.length || 0, category_id ? `(filtered by category: ${category_id})` : '(all collections)');
    
    res.json({
      collections: collections || [],
      count: collections?.length || 0
    });
  } catch (error) {
    console.error("Error fetching collections:", error);
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
        console.log('Database client closed');
      } catch (closeError) {
        console.error('Error closing database client:', closeError);
      }
    }
  }
}

