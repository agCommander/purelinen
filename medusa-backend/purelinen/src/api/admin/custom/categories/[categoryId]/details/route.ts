import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "zod";

export const categoryFieldsMetadataSchema = z.object({
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
    const { categoryId } = req.params;
    const manager = req.scope.resolve("manager") as any;
    const productTypeRepository = manager.getRepository("product_type");
    
    const productType = await productTypeRepository.findOne({
      where: { id: categoryId },
    });

    if (!productType) {
      res.status(404).json({ error: "Product type not found" });
      return;
    }

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
  req: MedusaRequest<typeof categoryFieldsMetadataSchema>,
  res: MedusaResponse,
): Promise<void> {
  try {
    const { categoryId } = req.params;
    // Parse body manually if validatedBody is not available
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const validatedData = (req.validatedBody as any) || categoryFieldsMetadataSchema.parse(body);
    
    const image = validatedData.image;
    const menu_images = validatedData.menu_images;
    const menu_columns = validatedData.menu_columns;
    const description = validatedData.description;
    const description_html = validatedData.description_html;

    console.log('Product Type update request:', { categoryId, image, menu_images, menu_columns, description, description_html });

    // Get current product type to preserve existing metadata
    const manager = req.scope.resolve("manager") as any;
    const productTypeRepository = manager.getRepository("product_type");
    
    const currentProductType = await productTypeRepository.findOne({
      where: { id: categoryId },
    });

    if (!currentProductType) {
      res.status(404).json({ error: "Product type not found" });
      return;
    }

    const currentMetadata = currentProductType.metadata || {};

    const metadata = {
      ...currentMetadata,
      image,
      menu_images: menu_images || null,
      menu_columns: menu_columns || null,
      description,
      description_html,
    };
    
    // Use save() instead of update() to properly handle JSON metadata
    currentProductType.metadata = metadata;
    await productTypeRepository.save(currentProductType);

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
