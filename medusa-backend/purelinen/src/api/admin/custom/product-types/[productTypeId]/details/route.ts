import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "zod";

export const productTypeFieldsMetadataSchema = z.object({
  image: z.object({
    id: z.string(),
    url: z.string().url(),
  }).optional().nullable(),
  menu_images: z.array(z.string()).optional().nullable(),
  menu_columns: z.number().int().min(1).max(4).optional().nullable(),
  description: z.string().optional().nullable(),
  description_html: z.string().optional().nullable(),
});

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  try {
    const { productTypeId } = req.params;
    const query = req.scope.resolve("query") as any;
    
    const productTypes = await query({
      entity: "product_type",
      fields: ["id", "value", "metadata"],
      filters: { id: productTypeId },
    });

    if (!productTypes || productTypes.length === 0) {
      res.status(404).json({ error: "Product type not found" });
      return;
    }

    const productType = productTypes[0];

    res.json({
      image: productType.metadata?.image || null,
      menu_images: productType.metadata?.menu_images || null,
      menu_columns: productType.metadata?.menu_columns || null,
      description: productType.metadata?.description || '',
      description_html: productType.metadata?.description_html || '',
    });
  } catch (error) {
    console.error('Error fetching product type:', error);
    res.status(500).json({ 
      error: 'Failed to fetch product type',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

export async function POST(
  req: MedusaRequest<typeof productTypeFieldsMetadataSchema>,
  res: MedusaResponse,
): Promise<void> {
  try {
    const { productTypeId } = req.params;
    // Parse body manually if validatedBody is not available
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const validatedData = (req.validatedBody as any) || productTypeFieldsMetadataSchema.parse(body);
    
    const image = validatedData.image;
    const menu_images = validatedData.menu_images;
    const menu_columns = validatedData.menu_columns;
    const description = validatedData.description;
    const description_html = validatedData.description_html;

    console.log('Product Type update request:', { productTypeId, image, menu_images, menu_columns, description, description_html });

    // Get current product type to preserve existing metadata using query service
    const query = req.scope.resolve("query") as any;
    const productTypes = await query({
      entity: "product_type",
      fields: ["id", "value", "metadata"],
      filters: { id: productTypeId },
    });

    if (!productTypes || productTypes.length === 0) {
      res.status(404).json({ error: "Product type not found" });
      return;
    }

    const currentProductType = productTypes[0];
    const currentMetadata = currentProductType.metadata || {};

    // Only update fields that are explicitly provided (not undefined)
    // This preserves existing values if a field isn't being updated
    const metadata = {
      ...currentMetadata,
    };
    
    if (image !== undefined) {
      metadata.image = image || null;
    }
    if (menu_images !== undefined) {
      metadata.menu_images = menu_images || null;
    }
    if (menu_columns !== undefined) {
      metadata.menu_columns = menu_columns || null;
    }
    if (description !== undefined) {
      metadata.description = description || null;
    }
    if (description_html !== undefined) {
      metadata.description_html = description_html || null;
    }
    
    console.log('Updating metadata:', JSON.stringify(metadata, null, 2));
    
    // Use pg Client directly - use require for compatibility
    const { Client } = require('pg');
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    
    try {
      await client.connect();
      console.log('Connected to database for update');
      console.log('Updating product_type with id:', productTypeId);
      console.log('Metadata to save:', JSON.stringify(metadata, null, 2));
      
      // Use jsonb_set to merge with existing metadata, or just set it directly
      const result = await client.query(
        `UPDATE product_type SET metadata = $1::jsonb, updated_at = NOW() WHERE id = $2 RETURNING id, metadata`,
        [JSON.stringify(metadata), productTypeId]
      );
      
      console.log('Update result:', JSON.stringify(result.rows, null, 2));
      console.log('Rows affected:', result.rowCount);
      
      if (result.rowCount === 0) {
        throw new Error(`No product type found with id: ${productTypeId}`);
      }
      
      // Verify the update by querying it back
      const verifyResult = await client.query(
        `SELECT id, metadata FROM product_type WHERE id = $1`,
        [productTypeId]
      );
      
      console.log('Verification query result:', JSON.stringify(verifyResult.rows[0], null, 2));
      console.log('Saved metadata:', verifyResult.rows[0]?.metadata);
      
      console.log('Product type metadata updated via raw SQL');
    } finally {
      await client.end();
    }

    console.log('Product type updated successfully:', productTypeId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating product type:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorDetails = error instanceof Error && error.stack ? error.stack : errorMessage;
    
    res.status(500).json({ 
      error: 'Failed to update product type',
      details: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? errorDetails : undefined
    });
  }
}

