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
  const { categoryId } = req.params;
  const productTypeService = req.scope.resolve('productTypeService') as any;
  const category = await productTypeService.retrieve(categoryId);

  res.json({
    image: category.metadata?.image || null,
    description: category.metadata?.description || '',
    description_html: category.metadata?.description_html || '',
  });
}

export async function POST(
  req: MedusaRequest<typeof categoryFieldsMetadataSchema>,
  res: MedusaResponse,
): Promise<void> {
  const { categoryId } = req.params;
  const validatedData = req.validatedBody as any;
  const image = validatedData.image;
  const description = validatedData.description;
  const description_html = validatedData.description_html;

  const productTypeService = req.scope.resolve('productTypeService') as any;

  // Get current category to preserve existing metadata
  const currentCategory = await productTypeService.retrieve(categoryId);
  const currentMetadata = currentCategory.metadata || {};

  const metadata = {
    ...currentMetadata,
    image,
    description,
    description_html,
  };

  await productTypeService.update(categoryId, {
    metadata,
  });

  res.json({ success: true });
}
