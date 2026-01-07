import * as React from 'react';
import { defineWidgetConfig } from '@medusajs/admin-sdk';
import { DetailWidgetProps, AdminProductCategory } from '@medusajs/framework/types';
import { Container, Heading, Button, Text, Drawer, Input } from '@medusajs/ui';
import { PencilSquare } from '@medusajs/icons';

type ProductWithPosition = {
  id: string;
  title: string;
  handle: string;
  status: string;
  position: number;
};

const CategoryProductOrderWidget = ({ data }: DetailWidgetProps<AdminProductCategory>) => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [products, setProducts] = React.useState<ProductWithPosition[]>([]);
  const [editedPositions, setEditedPositions] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    if (isDrawerOpen && data?.id) {
      fetchProducts();
    }
  }, [isDrawerOpen, data?.id]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/admin/custom/product-categories/${data.id}/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        // Initialize edited positions with current positions
        const positions: Record<string, number> = {};
        (data.products || []).forEach((p: ProductWithPosition) => {
          positions[p.id] = p.position;
        });
        setEditedPositions(positions);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePositionChange = (productId: string, position: number) => {
    setEditedPositions(prev => ({
      ...prev,
      [productId]: position
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setIsSuccess(false);

    try {
      const productPositions = Object.entries(editedPositions).map(([product_id, position]) => ({
        product_id,
        position: parseInt(String(position), 10) || 0
      }));

      const response = await fetch(`/admin/custom/product-categories/${data.id}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productPositions }),
      });

      if (!response.ok) {
        throw new Error('Failed to save product positions');
      }

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
      // Refresh products to show updated order
      await fetchProducts();
    } catch (error) {
      console.error('Error saving product positions:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!data) {
    return null;
  }

  return (
    <Container>
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h2" className="text-base-semi">
            Product Order
          </Heading>
          <Text className="text-small text-gray-500 mt-1">
            Set the display order of products in this category
          </Text>
        </div>
        <Button
          variant="secondary"
          size="small"
          onClick={() => setIsDrawerOpen(true)}
        >
          <PencilSquare className="h-4 w-4" />
          Manage Order
        </Button>
      </div>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Content className="max-w-2xl max-h-[90vh] flex flex-col">
          <Drawer.Header className="flex-shrink-0">
            <Drawer.Title>Product Order - {data.name}</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <Text>Loading products...</Text>
            ) : products.length === 0 ? (
              <Text className="text-gray-500">No products in this category.</Text>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  Lower numbers appear first. Products are sorted by position, then alphabetically.
                </div>
                <div className="space-y-2">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 p-3 border border-gray-200 rounded-md"
                    >
                      <div className="flex-1">
                        <Text className="font-medium">{product.title}</Text>
                        <Text className="text-xs text-gray-500">{product.handle}</Text>
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          value={editedPositions[product.id] ?? product.position}
                          onChange={(e) => handlePositionChange(product.id, parseInt(e.target.value, 10) || 0)}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Drawer.Body>
          <Drawer.Footer className="flex-shrink-0">
            <div className="flex items-center justify-end gap-x-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleSave}
                isLoading={isSaving}
                disabled={isSaving || products.length === 0}
              >
                {isSaving ? "Saving..." : "Save Order"}
              </Button>
            </div>
            {isSuccess && (
              <div className="mt-2 text-sm text-green-600 font-medium">
                ✅ Product order saved successfully!
              </div>
            )}
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: 'product_category.details.after',
});

export default CategoryProductOrderWidget;

