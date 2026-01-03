import * as React from 'react';
import { defineWidgetConfig } from '@medusajs/admin-sdk';
import { DetailWidgetProps, AdminProductType } from '@medusajs/framework/types';
import { Container, Heading, Button, Text, Drawer, Label } from '@medusajs/ui';
import { PencilSquare } from '@medusajs/icons';
import { ImageField } from '../components/Form/ImageField';
import { TextareaField } from '../components/Form/TextareaField';
import { InputField } from '../components/Form/InputField';
import { Form } from '../components/Form/Form';
import { z } from 'zod';

const categoryFieldsMetadataSchema = z.object({
  image: z.object({
    id: z.string(),
    url: z.string().url(),
  }).optional().nullable(),
  // For mega menu: array of image filenames (e.g., ["home-decor-1.jpg", "home-decor-2.jpg"])
  menu_images: z.union([z.array(z.string()), z.string()]).optional().nullable(),
  // Number of columns for mega menu (1-4)
  menu_columns: z.union([z.number().int().min(1).max(4), z.string()]).optional().nullable(),
  description: z.string().optional().nullable(),
  description_html: z.string().optional().nullable(),
});


const CategoryDetailsWidget = ({ data }: DetailWidgetProps<AdminProductType>) => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [productTypeData, setProductTypeData] = React.useState(data);

  // Update local state when data prop changes (e.g., after page refresh)
  React.useEffect(() => {
    setProductTypeData(data);
  }, [data]);

  if (!data) {
    return null;
  }

  const onSubmit = async (formData: any) => {
    setIsLoading(true);
    setIsSuccess(false);

    try {
      // Convert menu_images string to array and menu_columns string to number
      const payload = {
        ...formData,
        menu_images: formData.menu_images && formData.menu_images.trim()
          ? formData.menu_images.split(',').map((img: string) => img.trim()).filter((img: string) => img)
          : null,
        menu_columns: formData.menu_columns 
          ? parseInt(formData.menu_columns, 10) 
          : null,
      };

      const response = await fetch(`/admin/custom/product-types/${data.id}/details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.details || errorData.error || "Failed to save product type details");
      }

      // Refetch the updated data
      const getResponse = await fetch(`/admin/custom/product-types/${data.id}/details`);
      if (getResponse.ok) {
        const updatedData = await getResponse.json();
        // Update local state with fresh data
        setProductTypeData({
          ...data,
          metadata: {
            ...data.metadata,
            ...updatedData,
          },
        });
      }

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
      setIsDrawerOpen(false);
    } catch (error) {
      console.error("Error saving category details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h2" className="text-base-semi">
            Product Type Configuration
          </Heading>
          <Text className="text-small text-gray-500 mt-1">
            Configure images, menu layout, and description for this product type
          </Text>
        </div>
        <Button
          variant="secondary"
          size="small"
          onClick={() => setIsDrawerOpen(true)}
        >
          <PencilSquare className="h-4 w-4" />
          Edit
        </Button>
      </div>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Content className="max-w-lg max-h-[90vh] flex flex-col">
          <Drawer.Header className="flex-shrink-0">
            <Drawer.Title>Edit Product Type Details</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="flex-1 overflow-y-auto p-4">
            <Form
              schema={categoryFieldsMetadataSchema}
              onSubmit={onSubmit}
              defaultValues={{
                image: (productTypeData?.metadata as any)?.image || undefined,
                menu_images: (productTypeData?.metadata as any)?.menu_images 
                  ? (productTypeData.metadata as any).menu_images.join(', ')
                  : '',
                menu_columns: (productTypeData?.metadata as any)?.menu_columns 
                  ? String((productTypeData.metadata as any).menu_columns)
                  : '4',
                description: (productTypeData?.metadata as any)?.description || '',
                description_html: (productTypeData?.metadata as any)?.description_html || '',
              }}
              key={JSON.stringify(productTypeData?.metadata)} // Force re-render when metadata changes
            >
              <div className="space-y-6">
                <div>
                  <Label className="text-base-regular text-gray-900">
                    Product Type Image
                  </Label>
                  <ImageField
                    name="image"
                    label="Upload Image"
                  />
                </div>

                <div>
                  <Label className="text-base-regular text-gray-900">
                    Mega Menu Images (Comma-separated filenames)
                  </Label>
                  <TextareaField
                    name="menu_images"
                    label="e.g., home-decor-1.jpg, home-decor-2.jpg"
                    className="min-h-20 font-mono text-sm"
                  />
                  <Text className="text-xs text-gray-500 mt-1">
                    Enter image filenames from /images/content/product-type/ separated by commas. Leave empty to use single image above or default.
                  </Text>
                </div>

                <div>
                  <Label className="text-base-regular text-gray-900">
                    Mega Menu Columns
                  </Label>
                  <InputField
                    name="menu_columns"
                    type="number"
                    inputProps={{
                      min: 1,
                      max: 4,
                      step: 1,
                    }}
                  />
                  <Text className="text-xs text-gray-500 mt-1">
                    Number of columns for categories (1-4). Default is 4.
                  </Text>
                </div>

                <div>
                  <Label className="text-base-regular text-gray-900">
                    Description
                  </Label>
                  <TextareaField
                    name="description"
                    label="Description"
                  />
                </div>

                <div>
                  <Label className="text-base-regular text-gray-900">
                    HTML Description
                  </Label>
                  <TextareaField
                    name="description_html"
                    label="HTML Description (from Magento)"
                    className="min-h-96 font-mono text-sm resize-y"
                  />
                  <Text className="text-xs text-gray-500 mt-1">
                    💡 Paste HTML content from Magento for rich formatting
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
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
              {isSuccess && (
                <div className="mt-2 text-sm text-green-600 font-medium">
                  ✅ Changes saved successfully!
                </div>
              )}
            </Form>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: 'product_type.details.after',
});

export default CategoryDetailsWidget;
