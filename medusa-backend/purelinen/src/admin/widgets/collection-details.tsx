import * as React from 'react';
import { defineWidgetConfig } from '@medusajs/admin-sdk';
import { DetailWidgetProps, AdminCollection } from '@medusajs/framework/types';
import { Container, Heading, Button, Text, Drawer, Label } from '@medusajs/ui';
import { PencilSquare } from '@medusajs/icons';
import { ImageField } from '../components/Form/ImageField';
import { TextareaField } from '../components/Form/TextareaField';
import { Form } from '../components/Form/Form';
import { z } from 'zod';

const detailsFormSchema = z.object({
  image: z.object({
    id: z.string(),
    url: z.string().url(),
  }).optional(),
  description: z.string().optional(),
  description_html: z.string().optional(),
});

const CollectionDetailsWidget: React.FC<DetailWidgetProps<AdminCollection>> = ({
  data,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [details, setDetails] = React.useState<z.infer<typeof detailsFormSchema>>({
    image: (data?.metadata as any)?.image || undefined,
    description: (data?.metadata as any)?.description || '',
    description_html: (data?.metadata as any)?.description_html || '',
  });

  if (!data) {
    return null;
  }

  const handleSave = async (values: z.infer<typeof detailsFormSchema>) => {
    setIsLoading(true);
    setIsSuccess(false);
    
    try {
      const response = await fetch(`/admin/custom/collections/${data.id}/details`, {
        method: 'POST',
        body: JSON.stringify(values),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to save collection details');
      }

      // Fetch the updated data from the server
      const updatedResponse = await fetch(`/admin/custom/collections/${data.id}/details`, {
        credentials: 'include',
      });
      
      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setDetails(updatedData);
      } else {
        // Fallback: update with the values we just saved
        setDetails(values);
      }
      
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to save collection details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <div className="flex flex-row items-center justify-between mb-4">
        <Heading level="h2">Collection Details</Heading>
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <Drawer.Trigger asChild>
            <Button variant="secondary" size="small">
              <PencilSquare className="w-4 h-4" />
              Edit Details
            </Button>
          </Drawer.Trigger>
          <Drawer.Content className="max-h-full">
            <Drawer.Header>
              <Drawer.Title>Edit Collection Details</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body className="p-4 overflow-auto">
              <Form
                schema={detailsFormSchema}
                onSubmit={handleSave}
                defaultValues={details}
              >
                <div className="flex flex-col gap-4">
                  <ImageField
                    name="image"
                    label="Collection Image"
                    sizeRecommendation="1200 x 1600 (3:4) recommended, up to 10MB"
                  />
                  <TextareaField
                    name="description"
                    label="Collection Description"
                  />
                  <TextareaField
                    name="description_html"
                    label="HTML Description (from Magento)"
                    className="min-h-96 font-mono text-sm resize-y"
                  />
                  <Text className="text-xs text-gray-500 mt-1">
                    💡 Paste HTML content from Magento for rich formatting
                  </Text>
                </div>
                <div className="flex flex-row justify-end gap-2 mt-6">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    isLoading={isLoading}
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save"}
                  </Button>
                </div>
                {isSuccess && (
                  <div className="mt-2 text-sm text-green-600 font-medium">
                    ✅ Collection details saved successfully!
                  </div>
                )}
              </Form>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer>
      </div>
      
      <div className="flex flex-col gap-4">
        {details.image && (
          <div>
            <Label className="text-sm font-medium mb-2">Collection Image</Label>
            <img
              src={details.image.url}
              alt="Collection image"
              className="w-full max-w-md h-auto rounded-lg"
            />
          </div>
        )}
        
        {details.description && (
          <div>
            <Label className="text-sm font-medium mb-2">Description</Label>
            <Text className="text-sm text-gray-600">{details.description}</Text>
          </div>
        )}
        
        {details.description_html && (
          <div>
            <Label className="text-sm font-medium mb-2">HTML Description Preview</Label>
            <div 
              className="text-sm text-gray-600 border border-gray-200 rounded p-3 bg-gray-50 min-h-96 max-h-screen overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: details.description_html }}
            />
          </div>
        )}
        
        {!details.image && !details.description && !details.description_html && (
          <Text className="text-sm text-gray-500">
            No collection details added yet. Click "Edit Details" to add an image and description.
          </Text>
        )}
      </div>
    </Container>
  );
};

export default CollectionDetailsWidget;

export const config = defineWidgetConfig({
  zone: 'product_collection.details.after',
});