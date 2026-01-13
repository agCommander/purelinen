import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

/**
 * Returns a mapping of color names to hex codes
 * This can be extended to query from database or use a more sophisticated mapping
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    // Query colors from database only (no hardcoded fallback)
    const colorMap: Record<string, string> = {}
    let client: any = null;
    try {
      const { Client } = require('pg');
      const connectionString = process.env.DATABASE_URL;
      
      if (connectionString) {
        client = new Client({
          connectionString: connectionString,
          connectionTimeoutMillis: 5000,
          query_timeout: 5000,
        });
        
        await client.connect();
        
        // Query colors from materials system (if you have a fashion/materials module)
        // Adjust this query based on your actual database schema
        const result = await client.query(`
          SELECT DISTINCT 
            c.name,
            c.hex_code
          FROM color c
          WHERE c.deleted_at IS NULL
            AND c.hex_code IS NOT NULL
            AND c.hex_code != ''
          ORDER BY c.name
        `).catch(() => null);
        
        if (result && result.rows) {
          result.rows.forEach((row: any) => {
            if (row.name && row.hex_code) {
              colorMap[row.name] = row.hex_code;
            }
          });
        }
      }
    } catch (error) {
      // If database query fails, return empty map
      console.error('Could not fetch colors from database:', error);
    } finally {
      if (client) {
        try {
          await client.end();
        } catch (e) {
          // Ignore
        }
      }
    }

    res.json({
      colors: colorMap
    });
  } catch (error) {
    console.error("Error fetching color map:", error);
    res.status(500).json({ 
      error: "Failed to fetch color map",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}
