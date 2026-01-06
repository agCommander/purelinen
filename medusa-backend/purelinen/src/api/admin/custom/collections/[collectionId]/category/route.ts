import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import { z } from "zod";

export const collectionCategorySchema = z.object({
  category_id: z.string().optional().nullable(),
});

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  try {
    const { collectionId } = req.params;
    const productService = req.scope.resolve(Modules.PRODUCT);
    const collection = await productService.retrieveProductCollection(collectionId);
    
    const metadata = collection.metadata as any || {};
    
    res.json({
      category_id: metadata.category_id || null,
    });
  } catch (error) {
    console.error('Error fetching collection category:', error);
    res.status(500).json({ 
      error: 'Failed to fetch collection category',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

export async function POST(
  req: MedusaRequest<typeof collectionCategorySchema>,
  res: MedusaResponse,
): Promise<void> {
  try {
    const { collectionId } = req.params;
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    
    const customFields = collectionCategorySchema.parse(body);

    const productService = req.scope.resolve(Modules.PRODUCT);
    const collection = await productService.retrieveProductCollection(collectionId);

    if (!collection) {
      res.status(404).json({ error: "Collection not found" });
      return;
    }

    // Safely handle metadata - it might be null, undefined, or an object
    const existingMetadata = (collection?.metadata && typeof collection.metadata === 'object' && collection.metadata !== null) 
      ? collection.metadata 
      : {};
    
    const metadata = {
      ...existingMetadata,
      category_id: customFields.category_id || null,
    };

    const updatedCollection = await productService.updateProductCollections(
      collectionId,
      {
        metadata,
      },
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating collection category:', error);
    res.status(500).json({ 
      error: 'Failed to update collection category',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

