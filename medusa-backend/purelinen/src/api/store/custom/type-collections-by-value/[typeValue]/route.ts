import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { typeValue } = req.params;
    const colorGroups = req.query.colorGroup;
    
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
      
      let collectionsResult;
      
      // If color groups are specified, filter collections by products with matching colors
      if (colorGroups && (Array.isArray(colorGroups) ? colorGroups.length > 0 : true)) {
        const colorGroupArray = Array.isArray(colorGroups) ? colorGroups : [colorGroups];
        
        // Find color names that belong to the selected filter groups
        const colorNamesResult = await client.query(
          `SELECT DISTINCT name 
           FROM color 
           WHERE filter_group = ANY($1::text[])
             AND deleted_at IS NULL
             AND name IS NOT NULL
             AND name != ''`,
          [colorGroupArray]
        );
        
        const colorNames = colorNamesResult.rows.map((row: any) => row.name);
        
        if (colorNames.length === 0) {
          // No colors found for these filter groups, return empty
          return res.json({
            collections: [],
            count: 0
          });
        }
        
        // Find collections that have products with variants matching these colors
        // Colors are stored as product option values where option title is "Color" or "Colour"
        // Products are linked to collections via product.collection_id
        // Variants are linked to option values via product_variant_option junction table
        collectionsResult = await client.query(
          `SELECT DISTINCT 
            pc.id,
            pc.title,
            pc.handle,
            pc.metadata
          FROM type_collections tc
          INNER JOIN product_collection pc ON pc.id = tc.id
          INNER JOIN product p ON p.collection_id = pc.id
          INNER JOIN product_variant pv ON pv.product_id = p.id
          INNER JOIN product_variant_option pvo ON pvo.variant_id = pv.id
          INNER JOIN product_option_value pov ON pov.id = pvo.option_value_id
          INNER JOIN product_option po ON po.id = pov.option_id AND (po.title = 'Color' OR po.title = 'Colour')
          WHERE tc.type_id = $1
            AND p.deleted_at IS NULL
            AND pv.deleted_at IS NULL
            AND pov.value = ANY($2::text[])
          ORDER BY pc.title`,
          [typeId, colorNames]
        );
      } else {
        // No color filter, return all collections for this type
        collectionsResult = await client.query(
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
      }
      
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

