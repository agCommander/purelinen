import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { z } from "zod";

export const productHtmlDescriptionSchema = z.object({
  description_html: z.string().optional().nullable(),
});

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const { productId } = req.params;
  const productService = req.scope.resolve(Modules.PRODUCT);
  const product = await productService.retrieveProduct(productId);

  res.json({
    description_html: product.metadata?.description_html || null,
  });
}

export async function POST(
  req: MedusaRequest<typeof productHtmlDescriptionSchema>,
  res: MedusaResponse,
): Promise<void> {
  try {
    const { productId } = req.params;
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const customFields = productHtmlDescriptionSchema.parse(body);

    console.log('Product HTML update request:', { productId, customFields });

    const productService = req.scope.resolve(Modules.PRODUCT);
    const product = await productService.retrieveProduct(productId);

    const updatedProduct = await productService.updateProducts(productId, {
      metadata: {
        ...product.metadata,
        ...customFields,
      },
    });

    console.log('Product updated successfully:', updatedProduct.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ 
      error: 'Failed to update product',
      details: error.message 
    });
  }
}
