import * as React from 'react';
import { defineWidgetConfig } from '@medusajs/admin-sdk';
import { DetailWidgetProps, AdminProductCategory } from '@medusajs/framework/types';
import { Container, Heading, Button, Text, Drawer, Label } from '@medusajs/ui';
import { PencilSquare } from '@medusajs/icons';
import { Form } from '../components/Form/Form';
import { SelectField } from '../components/Form/SelectField';
import { InputField } from '../components/Form/InputField';
import { useWatch } from 'react-hook-form';
import { z } from 'zod';

// Form input schema (accepts strings from form fields)
const categoryTypeFormSchema = z.object({
  product_type_id: z.string().optional().nullable(),
  menu_order: z.string().optional().nullable(),
  column: z.string().optional().nullable(),
  display_mode: z.enum(['products', 'collections']).optional().nullable(),
  static_page_path: z.string().optional().nullable(),
});

type CategoryTypeFormData = z.infer<typeof categoryTypeFormSchema>;

const ProductCategoryTypeWidget = ({ data }: DetailWidgetProps<AdminProductCategory>) => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [productTypes, setProductTypes] = React.useState<Array<{ id: string; value: string }>>([]);
  const [collections, setCollections] = React.useState<Array<{ id: string; title: string }>>([]);
  const [selectedCollectionIds, setSelectedCollectionIds] = React.useState<string[]>([]);

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
    
    // Fetch collections filtered by this category
    if (data?.id) {
      console.log('Fetching collections for category:', data.id);
      fetch(`/admin/custom/collections?category_id=${data.id}`)
        .then(res => {
          console.log('Collections fetch response status:', res.status);
          if (!res.ok) {
            return res.json().then(errData => {
              console.error('Collections fetch error response:', errData);
              throw new Error(errData.message || `HTTP error! status: ${res.status}`);
            });
          }
          return res.json();
        })
        .then(data => {
          console.log('Collections response:', data);
          if (data.collections && Array.isArray(data.collections)) {
            setCollections(data.collections.map((c: any) => ({
              id: c.id,
              title: c.title || c.handle || 'Untitled Collection'
            })));
            console.log('Collections set:', data.collections.length);
          } else {
            console.warn('Unexpected collections response format:', data);
            setCollections([]);
          }
        })
        .catch(err => {
          console.error('Error fetching collections:', err);
          console.error('Error details:', err.message, err.stack);
          setCollections([]);
        });
    }
  }, [data?.id]);
  
  const currentDisplayMode = (data?.metadata && typeof data.metadata === 'object' && (data.metadata as any)?.display_mode) 
    ? (data.metadata as any).display_mode 
    : 'products';
  
  const currentStaticPagePath = (data?.metadata && typeof data.metadata === 'object' && (data.metadata as any)?.static_page_path) 
    ? (data.metadata as any).static_page_path 
    : '';
  
  // Load currently linked collections when drawer opens and display mode is collections
  React.useEffect(() => {
    if (isDrawerOpen && currentDisplayMode === 'collections' && collections.length > 0 && data?.id) {
      // Fetch collections linked to this category
      Promise.all(
        collections.map(async (collection: any) => {
          try {
            const res = await fetch(`/admin/custom/collections/${collection.id}/category`);
            if (res.ok) {
              const collectionData = await res.json();
              if (collectionData.category_id === data.id) {
                return collection.id;
              }
            }
          } catch (err) {
            console.error(`Error checking collection ${collection.id}:`, err);
          }
          return null;
        })
      ).then((linkedIds) => {
        setSelectedCollectionIds(linkedIds.filter((id): id is string => id !== null));
      });
    }
  }, [isDrawerOpen, currentDisplayMode, collections, data?.id]);

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
        display_mode: formData.display_mode || 'products',
        static_page_path: formData.static_page_path && formData.static_page_path.trim() !== '' 
          ? formData.static_page_path.trim() 
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

      // If display mode is collections, update collection metadata
      if (payload.display_mode === 'collections' && data.id) {
        // Update all selected collections to link to this category
        const updatePromises = selectedCollectionIds.map((collectionId) =>
          fetch(`/admin/custom/collections/${collectionId}/category`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ category_id: data.id }),
          })
        );
        
        // Also unlink collections that were deselected
        const allCollectionIds = collections.map((c: any) => c.id);
        const deselectedIds = allCollectionIds.filter((id: string) => !selectedCollectionIds.includes(id));
        const unlinkPromises = deselectedIds.map((collectionId) =>
          fetch(`/admin/custom/collections/${collectionId}/category`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ category_id: null }),
          })
        );
        
        await Promise.all([...updatePromises, ...unlinkPromises]);
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
  
  // Component to watch display_mode and show collections selector
  const CollectionSelector = () => {
    const watchedDisplayMode = useWatch({ name: 'display_mode' }) as string;
    const displayModeValue = watchedDisplayMode || currentDisplayMode;
    
    if (displayModeValue !== 'collections') {
      return null;
    }
    
    return (
      <div>
        <Label className="text-base-regular text-gray-900 mb-2 block">
          Linked Collections
        </Label>
        <div className="border border-gray-300 rounded-md p-3 max-h-60 overflow-y-auto">
          {collections.length === 0 ? (
            <Text className="text-sm text-gray-500">Loading collections...</Text>
          ) : (
            collections.map((collection: any) => (
              <label key={collection.id} className="flex items-center space-x-2 py-2 cursor-pointer hover:bg-gray-50 px-2 rounded">
                <input
                  type="checkbox"
                  checked={selectedCollectionIds.includes(collection.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCollectionIds([...selectedCollectionIds, collection.id]);
                    } else {
                      setSelectedCollectionIds(selectedCollectionIds.filter((id) => id !== collection.id));
                    }
                  }}
                  className="rounded border-gray-300 text-violet-60 focus:ring-violet-60"
                />
                <Text className="text-sm">{collection.title}</Text>
              </label>
            ))
          )}
        </div>
        <Text className="text-xs text-gray-500 mt-1">
          Select which collections should be displayed on this category page.
        </Text>
      </div>
    );
  };

  return (
    <Container>
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h2" className="text-base-semi">
            Category Settings
          </Heading>
          <Text className="text-small text-gray-500 mt-1">
            Configure product type, menu settings, and display mode
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

      <div className="mt-4 space-y-2">
        {currentProductType && (
          <Text className="text-sm">
            <strong>Product Type:</strong> {currentProductType.value}
          </Text>
        )}
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
        <Text className="text-sm">
          <strong>Display Mode:</strong> {currentDisplayMode === 'collections' ? 'Collections' : 'Products'}
        </Text>
      </div>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Content className="max-w-lg max-h-[90vh] flex flex-col">
          <Drawer.Header className="flex-shrink-0">
            <Drawer.Title>Category Settings</Drawer.Title>
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
                display_mode: currentDisplayMode || 'products',
                static_page_path: currentStaticPagePath || '',
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

                <div>
                  <SelectField
                    name="display_mode"
                    label="Display Mode"
                    options={[
                      { label: 'Products', value: 'products' },
                      { label: 'Collections', value: 'collections' },
                    ]}
                  />
                  <Text className="text-xs text-gray-500 mt-1">
                    <strong>Products:</strong> Display products in this category (default behavior).<br />
                    <strong>Collections:</strong> Display collections linked to this category. Select collections below.
                  </Text>
                </div>

                <CollectionSelector />

                <div>
                  <InputField
                    name="static_page_path"
                    label="Static Page Path (Optional)"
                    type="text"
                    inputProps={{
                      placeholder: "e.g., custom-tablecloths",
                    }}
                  />
                  <Text className="text-xs text-gray-500 mt-1">
                    If set, this category will link to a static page instead of showing products/collections.
                    Enter the path without leading slash (e.g., "custom-tablecloths" for /custom-tablecloths).
                    Leave empty to use the category page.
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
                  ✅ Category settings saved successfully!
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

