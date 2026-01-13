import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  let client: any = null;
  
  try {
    const { productId } = req.params;
    
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
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
    
    // Query the product_images view directly
    // variant_id will be NULL for hero images, and have a value for variant-specific images
    const result = await client.query(
      `SELECT 
        image_id,
        url,
        variant_id
      FROM product_images
      WHERE product_id = $1
      ORDER BY image_id ASC`,
      [productId]
    );
    
    // Format images to include variant_id flag
    const images = result.rows.map((row: any) => ({
      id: row.image_id,
      url: row.url,
      variant_id: row.variant_id || null, // Explicitly set to null for hero images
    }));
    
    res.json({
      images
    });
  } catch (error) {
    console.error("Error fetching product images:", error);
    res.status(500).json({ 
      error: "Failed to fetch product images",
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
