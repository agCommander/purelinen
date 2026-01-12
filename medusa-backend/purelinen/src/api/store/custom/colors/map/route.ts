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
    // Default color mapping - common linen colors
    // You can extend this to query from database or materials system
    const colorMap: Record<string, string> = {
      // Whites and neutrals
      "White": "#FFFFFF",
      "Natural": "#b7b3a7",
      "Natural Flax": "#b7b3a7",
      "Off White": "#FAF0E6",
      "Cream": "#FFFDD0",
      "Ivory": "#FFFFF0",
      "Beige": "#F5F5DC",
      
      // Grays
      "Grey": "#808080",
      "Steel Grey": "#808080",
      "Gray": "#808080",
      "Charcoal": "#36454F",
      "Stone Grey": "#8B8680",
      "Taupe": "#483C32",
      
      // Browns
      "Brown": "#8B4513",
      "Tobacco": "#514542",
      "Natural Brown": "#A0522D",
      "Camel": "#C19A6B",
      
      // Blues
      "Blue": "#0000FF",
      "Navy": "#000080",
      "Tiffany": "#83ccd4",
      "FrenchNavy": "#000080",
      "Sky Blue": "#e0e8ea",
      "Pearl Blue": "#cfd1dd",
      
      // Other colors
      "Dusty Rose": "#b38c91",
      "Nude": "#FFC0CB",
      "Pink": "#FFC0CB",
      "Red": "#FF0000",
      "Green": "#008000",
      "Serena": "#b6b3a0",
      "Yellow": "#FFFF00",
      "Black": "#000000",
    }

    // Query color names from materials system if available
    // This is optional - you can extend this to query from your materials/colors database
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
      // If database query fails, just use the default mapping
      console.log('Could not fetch colors from database, using default mapping');
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
