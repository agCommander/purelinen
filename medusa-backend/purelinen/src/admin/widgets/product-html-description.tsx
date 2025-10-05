import * as React from 'react';
import { defineWidgetConfig } from '@medusajs/admin-sdk';
import { DetailWidgetProps, AdminProduct } from '@medusajs/framework/types';
import { Container, Heading, Button, Text, Drawer, Label } from '@medusajs/ui';
import { PencilSquare } from '@medusajs/icons';
import { TextareaField } from '../components/Form/TextareaField';
import { Form } from '../components/Form/Form';
import { z } from 'zod';

const htmlDescriptionSchema = z.object({
  description_html: z.string().optional().nullable(),
});

type HtmlDescriptionData = z.infer<typeof htmlDescriptionSchema>;

const ProductHtmlDescriptionWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  if (!data) {
    return null;
  }

  const onSubmit = async (formData: HtmlDescriptionData) => {
    setIsLoading(true);
    setIsSuccess(false);

    try {
      const response = await fetch(`/admin/custom/products/${data.id}/html-description`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save HTML description");
      }

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
      setIsDrawerOpen(false);
    } catch (error) {
      console.error("Error saving HTML description:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentHtmlDescription = (data?.metadata as any)?.description_html || '';

  return (
    <Container>
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h2" className="text-base-semi">
            HTML Product Description
          </Heading>
          <Text className="text-small text-gray-500 mt-1">
            Add rich HTML content for product descriptions (from Magento)
          </Text>
        </div>
        <Button
          variant="secondary"
          size="small"
          onClick={() => setIsDrawerOpen(true)}
        >
          <PencilSquare className="h-4 w-4" />
          Edit HTML
        </Button>
      </div>

      {currentHtmlDescription && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <Text className="text-small font-medium text-gray-700 mb-2">
            Current HTML Preview:
          </Text>
          <div 
            className="text-small text-gray-600 max-h-32 overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: currentHtmlDescription }}
          />
        </div>
      )}

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Content>
          <div className="max-w-4xl">
            <Drawer.Header>
              <Drawer.Title>Edit HTML Product Description</Drawer.Title>
              <Text className="text-small text-gray-500 mt-2">
                Paste your HTML content from Magento here. This will be displayed on the product page.
              </Text>
            </Drawer.Header>
            <Form
              schema={htmlDescriptionSchema}
              onSubmit={onSubmit}
              defaultValues={{
                description_html: currentHtmlDescription,
              }}
            >
              <div className="space-y-6">
                <div>
                  <Label className="text-base-regular text-gray-900">
                    HTML Description
                  </Label>
                  <TextareaField
                    name="description_html"
                    label="HTML Content"
                    className="min-h-96 font-mono text-sm resize-y"
                  />
                  <Text className="text-small text-gray-500 mt-2">
                    💡 Tip: Copy and paste your HTML from Magento's product description field
                  </Text>
                </div>

                {currentHtmlDescription && (
                  <div>
                    <Label className="text-base-regular text-gray-900 mb-2">
                      Live Preview
                    </Label>
                    <div className="border border-gray-200 rounded-lg p-4 bg-white min-h-96 max-h-screen overflow-y-auto">
                      <div 
                        dangerouslySetInnerHTML={{ __html: currentHtmlDescription }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Drawer.Footer>
                <div className="flex items-center justify-end gap-x-2">
                  <Button
                    variant="secondary"
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
                    {isLoading ? "Saving..." : "Save HTML Description"}
                  </Button>
                </div>
                {isSuccess && (
                  <div className="mt-2 text-sm text-green-600 font-medium">
                    ✅ HTML description saved successfully!
                  </div>
                )}
              </Drawer.Footer>
            </Form>
          </div>
        </Drawer.Content>
      </Drawer>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: 'product.details.after',
});

export default ProductHtmlDescriptionWidget;
