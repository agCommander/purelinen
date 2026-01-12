import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  let client: any = null;
  
  try {
    const { variantId } = req.params;
    
    if (!variantId) {
      return res.status(400).json({ error: "Variant ID is required" });
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
    
    // Check the structure of product_variant_product_image table to find the join column
    const tableInfo = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'product_variant_product_image'
      ORDER BY ordinal_position
    `);
    
    const columns = tableInfo.rows.map((row: any) => row.column_name);
    console.log('product_variant_product_image columns:', columns);
    
    // Find the column that links to the image table
    // Common column names: image_id, product_image_id
    const safeImageIdColumns = ['image_id', 'product_image_id'];
    const imageIdColumn = safeImageIdColumns.find(col => columns.includes(col));
    
    if (!imageIdColumn) {
      throw new Error(
        `Could not find image ID column in product_variant_product_image table. ` +
        `Available columns: ${columns.join(', ')}. ` +
        `Expected one of: ${safeImageIdColumns.join(', ')}`
      );
    }
    
    // Build the query with proper column name (using whitelist for safety)
    let joinCondition = '';
    if (imageIdColumn === 'image_id') {
      joinCondition = 'pvpi.image_id = img.id';
    } else if (imageIdColumn === 'product_image_id') {
      joinCondition = 'pvpi.product_image_id = img.id';
    }
    
    // Query variant-specific images by joining with image table
    const result = await client.query(
      `SELECT 
        img.id,
        img.url
      FROM product_variant_product_image pvpi
      INNER JOIN image img ON ${joinCondition}
      WHERE pvpi.variant_id = $1
        AND (img.deleted_at IS NULL OR img.deleted_at > NOW())
      ORDER BY pvpi.created_at ASC`,
      [variantId]
    );
    
    // Format images to match StoreProductImage type
    const images = result.rows.map((row: any) => ({
      id: row.id,
      url: row.url,
    }));
    
    res.json({
      images
    });
  } catch (error) {
    console.error("Error fetching variant images:", error);
    res.status(500).json({ 
      error: "Failed to fetch variant images",
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
