"use server"

/**
 * Server-side function to fetch color name to hex code mapping from database
 * This eliminates the client-side API call delay
 */
export async function getColorMap(): Promise<Record<string, string>> {
  const colorMap: Record<string, string> = {}

  // Query colors from database
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

  return colorMap
}
