import * as React from 'react';
import { defineWidgetConfig } from '@medusajs/admin-sdk';
import { DetailWidgetProps, AdminProductCategory } from '@medusajs/framework/types';
import { Container, Heading, Button, Text, Drawer } from '@medusajs/ui';
import { PencilSquare } from '@medusajs/icons';
import { Form } from '../components/Form/Form';
import { SelectField } from '../components/Form/SelectField';
import { InputField } from '../components/Form/InputField';
import { z } from 'zod';

// Form input schema (accepts strings from form fields)
const categoryTypeFormSchema = z.object({
  product_type_id: z.string().optional().nullable(),
  menu_order: z.string().optional().nullable(),
  column: z.string().optional().nullable(),
});

type CategoryTypeFormData = z.infer<typeof categoryTypeFormSchema>;

const ProductCategoryTypeWidget = ({ data }: DetailWidgetProps<AdminProductCategory>) => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [productTypes, setProductTypes] = React.useState<Array<{ id: string; value: string }>>([]);

  React.useEffect(() => {
    console.log('ProductCategoryTypeWidget mounted', data);
    // Fetch product types
    fetch('/admin/custom/product-types')
      .then(res => res.json())
      .then(data => {
        if (data.product_types) {
          setProductTypes(data.product_types.map((pt: any) => ({
            id: pt.id,
            value: pt.value
          })));
        }
      })
      .catch(err => console.error('Error fetching product types:', err));
  }, []);

  if (!data) {
    console.log('ProductCategoryTypeWidget: no data');
    return null;
  }

  console.log('ProductCategoryTypeWidget rendering for category:', data.id, data.name);

  const onSubmit = async (formData: CategoryTypeFormData) => {
    setIsLoading(true);
    setIsSuccess(false);

    try {
      // Convert form data (strings) to API format (numbers)
      const payload = {
        product_type_id: formData.product_type_id || null,
        menu_order: formData.menu_order && formData.menu_order !== '' 
          ? parseInt(formData.menu_order, 10) 
          : null,
        column: formData.column && formData.column !== '' 
          ? parseInt(formData.column, 10) 
          : null,
      };

      const response = await fetch(`/admin/custom/product-categories/${data.id}/product-type`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save product type");
      }

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
      setIsDrawerOpen(false);
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Error saving product type:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentProductTypeId = (data?.metadata && typeof data.metadata === 'object' && (data.metadata as any)?.product_type_id) 
    ? (data.metadata as any).product_type_id 
    : null;
  const currentProductType = productTypes.find(pt => pt.id === currentProductTypeId);

  return (
    <Container>
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h2" className="text-base-semi">
            Product Type Assignment
          </Heading>
          <Text className="text-small text-gray-500 mt-1">
            Link this category to a product type
          </Text>
        </div>
        <Button
          variant="secondary"
          size="small"
          onClick={() => setIsDrawerOpen(true)}
        >
          <PencilSquare className="h-4 w-4" />
          {currentProductType ? 'Edit' : 'Assign'}
        </Button>
      </div>

      {currentProductType && (
        <div className="mt-4 space-y-2">
          <Text className="text-sm">
            <strong>Current Product Type:</strong> {currentProductType.value}
          </Text>
          {(data?.metadata && typeof data.metadata === 'object' && (data.metadata as any)?.menu_order !== undefined) && (
            <Text className="text-sm">
              <strong>Menu Order:</strong> {(data.metadata as any).menu_order}
            </Text>
          )}
          {(data?.metadata && typeof data.metadata === 'object' && (data.metadata as any)?.column !== undefined) && (
            <Text className="text-sm">
              <strong>Column:</strong> {(data.metadata as any).column + 1} (of 4)
            </Text>
          )}
        </div>
      )}

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Content className="max-w-lg max-h-[90vh] flex flex-col">
          <Drawer.Header className="flex-shrink-0">
            <Drawer.Title>Product Type & Menu Settings</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="flex-1 overflow-y-auto p-4">
            <Form
              schema={categoryTypeFormSchema}
              onSubmit={onSubmit}
              defaultValues={{
                product_type_id: currentProductTypeId || undefined,
                menu_order: (data?.metadata && typeof data.metadata === 'object' && (data.metadata as any)?.menu_order !== undefined)
                  ? String((data.metadata as any).menu_order)
                  : '',
                column: (data?.metadata && typeof data.metadata === 'object' && (data.metadata as any)?.column !== undefined)
                  ? String((data.metadata as any).column)
                  : '',
              }}
            >
              <div className="space-y-6">
                <div>
                  <SelectField
                    name="product_type_id"
                    label="Product Type"
                    options={productTypes.map(pt => ({
                      label: pt.value,
                      value: pt.id,
                    }))}
                    placeholder="Select a product type..."
                  />
                  <Text className="text-xs text-gray-500 mt-1">
                    Select the product type this category belongs to
                  </Text>
                </div>

                <div>
                  <InputField
                    name="menu_order"
                    label="Menu Order"
                    type="number"
                    inputProps={{
                      min: 0,
                      step: 1,
                    }}
                  />
                  <Text className="text-xs text-gray-500 mt-1">
                    Lower numbers appear first. Leave empty for alphabetical sorting.
                  </Text>
                </div>

                <div>
                  <SelectField
                    name="column"
                    label="Column (Optional)"
                    options={[
                      { label: 'Auto (distribute sequentially)', value: '' },
                      { label: 'Column 1', value: '0' },
                      { label: 'Column 2', value: '1' },
                      { label: 'Column 3', value: '2' },
                      { label: 'Column 4', value: '3' },
                    ]}
                    placeholder="Auto"
                  />
                  <Text className="text-xs text-gray-500 mt-1">
                    Specify which column this category should appear in (0-3). Leave empty for automatic distribution.
                  </Text>
                </div>
              </div>

              <div className="flex items-center justify-end gap-x-2 mt-6 pt-4 border-t">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save"}
                </Button>
              </div>
              {isSuccess && (
                <div className="mt-2 text-sm text-green-600 font-medium">
                  ✅ Product type assigned successfully!
                </div>
              )}
            </Form>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>
    </Container>
  );
};

// Try different zone names - uncomment the one that works
export const config = defineWidgetConfig({
  zone: 'product_category.details.after', // Try this first
  // zone: 'product-category.details.after', // Alternative with hyphen
  // zone: 'category.details.after', // Simpler version
});

export default ProductCategoryTypeWidget;

