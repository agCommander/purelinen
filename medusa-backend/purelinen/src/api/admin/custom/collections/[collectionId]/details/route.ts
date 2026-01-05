import { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import { Modules } from '@medusajs/framework/utils';
import { z } from 'zod';

const collectionFieldsMetadataSchema = z.object({
  image: z
    .object({
      id: z.string(),
      url: z.string().url(),
    })
    .optional(),
  description: z.string().optional(),
  description_html: z.string().optional(),
});

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const { collectionId } = req.params;

  const productService = req.scope.resolve(Modules.PRODUCT);
  const collection = await productService.retrieveProductCollection(collectionId);

  res.json({
    image: collection.metadata?.image || null,
    description: collection.metadata?.description || '',
    description_html: collection.metadata?.description_html || '',
  });
}

export async function POST(
  req: MedusaRequest<typeof collectionFieldsMetadataSchema>,
  res: MedusaResponse,
): Promise<void> {
  try {
    const { collectionId } = req.params;
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const customFields = collectionFieldsMetadataSchema.parse(body);

    console.log('Collection update request:', { collectionId, customFields });

    const productService = req.scope.resolve(Modules.PRODUCT);
    const collection = await productService.retrieveProductCollection(collectionId);

    // Explicitly include description_html even if it's an empty string
    const metadata = {
      ...collection.metadata,
      ...customFields,
      description_html: customFields.description_html !== undefined ? customFields.description_html : collection.metadata?.description_html,
    };

    const updatedCollection = await productService.updateProductCollections(
      collectionId,
      {
        metadata,
      },
    );

    console.log('Collection updated successfully:', updatedCollection.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating collection:', error);
    res.status(500).json({ 
      error: 'Failed to update collection',
      details: error.message 
    });
  }
}