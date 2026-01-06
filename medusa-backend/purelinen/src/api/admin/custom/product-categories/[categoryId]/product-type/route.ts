import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import { z } from "zod";

export const categoryTypeSchema = z.object({
  product_type_id: z.string().optional().nullable(),
  menu_order: z.number().int().min(0).optional().nullable(),
  column: z.number().int().min(0).max(3).optional().nullable(),
  display_mode: z.enum(['products', 'collections']).optional().nullable(),
});

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  try {
    const { categoryId } = req.params;
    const productService = req.scope.resolve(Modules.PRODUCT);
    
    const category = await productService.retrieveProductCategory(categoryId);
    const metadata = category.metadata as any || {};
    
    res.json({
      product_type_id: metadata.product_type_id || null,
      menu_order: metadata.menu_order !== undefined ? metadata.menu_order : null,
      column: metadata.column !== undefined ? metadata.column : null,
      display_mode: metadata.display_mode || 'products',
    });
  } catch (error) {
    console.error('Error fetching category product type:', error);
    res.status(500).json({ 
      error: 'Failed to fetch category product type',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

export async function POST(
  req: MedusaRequest<typeof categoryTypeSchema>,
  res: MedusaResponse,
): Promise<void> {
  try {
    const { categoryId } = req.params;
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    
    console.log('Raw request body:', body);
    
    const customFields = categoryTypeSchema.parse(body);
    console.log('Parsed customFields:', customFields);

    if (!customFields || typeof customFields !== 'object') {
      throw new Error('Invalid customFields: ' + JSON.stringify(customFields));
    }

    console.log('Category product type update request:', { categoryId, body, customFields });

    const productService = req.scope.resolve(Modules.PRODUCT);
    const category = await productService.retrieveProductCategory(categoryId);

    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    console.log('Retrieved category:', { 
      id: category?.id, 
      name: category?.name,
      metadata: category?.metadata,
      metadataType: typeof category?.metadata 
    });

    // Safely handle metadata - it might be null, undefined, or an object
    const existingMetadata = (category?.metadata && typeof category.metadata === 'object' && category.metadata !== null) 
      ? category.metadata 
      : {};

    // Ensure all fields are explicitly set (even if null)
    const productTypeId = customFields?.product_type_id ?? null;
    const menuOrder = customFields?.menu_order !== undefined ? customFields.menu_order : null;
    const column = customFields?.column !== undefined ? customFields.column : null;
    const displayMode = customFields?.display_mode || 'products';
    
    const metadata = {
      ...existingMetadata,
      product_type_id: productTypeId,
      menu_order: menuOrder,
      column: column,
      display_mode: displayMode,
    };

    console.log('Updating with metadata:', metadata);
    console.log('productTypeId value:', productTypeId, 'type:', typeof productTypeId);

    const updatedCategory = await productService.updateProductCategories(
      categoryId,
      {
        metadata,
      },
    );

    console.log('Category updated successfully:', updatedCategory?.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating category:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({ 
      error: 'Failed to update category',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

