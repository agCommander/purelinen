import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

/**
 * Returns color filter groups for the filter panel
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const filterGroups: Array<{
      name: string
      hexCode: string
    }> = []
    
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
        
        // Fetch distinct filter groups with a representative hex code
        const result = await client.query(
          `
            SELECT DISTINCT
              c.filter_group as name,
              (
                SELECT c2.hex_code
                FROM color c2
                WHERE c2.filter_group = c.filter_group
                  AND c2.deleted_at IS NULL
                  AND c2.hex_code IS NOT NULL
                  AND c2.hex_code != ''
                ORDER BY c2.created_at ASC
                LIMIT 1
              ) as hex_code
            FROM color c
            WHERE c.deleted_at IS NULL
              AND c.filter_group IS NOT NULL
              AND c.filter_group != ''
            ORDER BY c.filter_group ASC
          `
        ).catch(() => null);
        
        if (result && result.rows) {
          result.rows.forEach((row: any) => {
            if (row.name && row.hex_code) {
              filterGroups.push({
                name: row.name,
                hexCode: row.hex_code,
              });
            }
          });
        }
      }
    } catch (error) {
      console.error('Could not fetch color filter groups from database:', error);
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
      filterGroups: filterGroups
    });
  } catch (error) {
    console.error("Error fetching color filter groups:", error);
    res.status(500).json({ 
      error: "Failed to fetch color filter groups",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}
