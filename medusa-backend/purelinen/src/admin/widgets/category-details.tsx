import * as React from 'react';
import { defineWidgetConfig } from '@medusajs/admin-sdk';
import { DetailWidgetProps, AdminProductType } from '@medusajs/framework/types';
import { Container, Heading, Button, Text, Drawer, Label } from '@medusajs/ui';
import { PencilSquare } from '@medusajs/icons';
import { ImageField } from '../components/Form/ImageField';
import { TextareaField } from '../components/Form/TextareaField';
import { Form } from '../components/Form/Form';
import { z } from 'zod';

const categoryFieldsMetadataSchema = z.object({
  image: z.object({
    id: z.string(),
    url: z.string().url(),
  }).optional().nullable(),
  description: z.string().optional().nullable(),
  description_html: z.string().optional().nullable(),
});

type CategoryFieldsMetadata = z.infer<typeof categoryFieldsMetadataSchema>;

const CategoryDetailsWidget = ({ data }: DetailWidgetProps<AdminProductType>) => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  if (!data) {
    return null;
  }

  const onSubmit = async (formData: CategoryFieldsMetadata) => {
    setIsLoading(true);
    setIsSuccess(false);

    try {
      const response = await fetch(`/admin/custom/categories/${data.id}/details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save category details");
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
            Product Type Image & Description
          </Heading>
          <Text className="text-small text-gray-500 mt-1">
            Add an image and description for this product type
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
                image: (data?.metadata as any)?.image || undefined,
                description: (data?.metadata as any)?.description || '',
                description_html: (data?.metadata as any)?.description_html || '',
              }}
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
