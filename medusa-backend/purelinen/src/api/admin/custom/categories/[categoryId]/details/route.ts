import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "zod";

export const categoryFieldsMetadataSchema = z.object({
  image: z.object({
    id: z.string(),
    url: z.string().url(),
  }).optional().nullable(),
  description: z.string().optional().nullable(),
  description_html: z.string().optional().nullable(),
});

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  try {
    const { categoryId } = req.params;
    const query = req.scope.resolve("query");
    
    const productTypes = await query({
      entity: "product_type",
      fields: ["id", "value", "metadata"],
      filters: { id: categoryId },
    });

    if (!productTypes || productTypes.length === 0) {
      res.status(404).json({ error: "Product type not found" });
      return;
    }

    const productType = productTypes[0];

    res.json({
      image: productType.metadata?.image || null,
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
  req: MedusaRequest<typeof categoryFieldsMetadataSchema>,
  res: MedusaResponse,
): Promise<void> {
  try {
    const { categoryId } = req.params;
    const validatedData = req.validatedBody as any;
    const image = validatedData.image;
    const description = validatedData.description;
    const description_html = validatedData.description_html;

    console.log('Product Type update request:', { categoryId, image, description, description_html });

    // Use query to update product type metadata
    const query = req.scope.resolve("query");
    
    // Get current product type to preserve existing metadata
    const productTypes = await query({
      entity: "product_type",
      fields: ["id", "value", "metadata"],
      filters: { id: categoryId },
    });

    if (!productTypes || productTypes.length === 0) {
      res.status(404).json({ error: "Product type not found" });
      return;
    }

    const currentProductType = productTypes[0];
    const currentMetadata = currentProductType.metadata || {};

    const metadata = {
      ...currentMetadata,
      image,
      description,
      description_html,
    };

    // Use manager to update product type directly in database
    const manager = req.scope.resolve("manager");
    const productTypeRepository = manager.getRepository("product_type");
    
    await productTypeRepository.update(
      { id: categoryId },
      { metadata }
    );

    console.log('Product type updated successfully:', categoryId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating product type:', error);
    res.status(500).json({ 
      error: 'Failed to update product type',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
