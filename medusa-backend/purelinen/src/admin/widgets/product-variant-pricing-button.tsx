import { defineWidgetConfig } from '@medusajs/admin-sdk';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@medusajs/ui';
import { CurrencyDollar } from '@medusajs/icons';
import { DetailWidgetProps } from '@medusajs/framework/types';
import { AdminProduct } from '@medusajs/framework/types';
import { sdk } from '../lib/sdk';

const ProductVariantPricingButton = ({ data: product }: DetailWidgetProps<AdminProduct>) => {
  const navigate = useNavigate();

  // Fetch product with variants (similar to auto-gen-variants widget)
  const { data: productWithVariants, isLoading } = useQuery({
    queryKey: ['product', product?.id, 'variants-for-pricing-button'],
    enabled: Boolean(product?.id),
    queryFn: () =>
      sdk.admin.product.retrieve(product?.id as string, {
        fields: 'variants.*',
      }),
  });

  const fetchedProduct: AdminProduct | undefined = productWithVariants?.product;

  if (!product?.id || isLoading) {
    return null;
  }

  // Check if product has variants
  if (!fetchedProduct?.variants || fetchedProduct.variants.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-end gap-2 px-6 py-3 border-b border-ui-border-base -mb-px">
      <Button
        variant="primary"
        size="small"
        onClick={() => navigate(`/variant-pricing?productId=${product.id}`)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
      >
        <CurrencyDollar />
        Edit All Product Variant Prices (with Prices for both Purelinen and Linenthings)
      </Button>
    </div>
  );
};

export const config = defineWidgetConfig({
  zone: 'product.details.before', // Try placing it before other content
  // zone: 'product.details.after', // Fallback if before doesn't work
});

export default ProductVariantPricingButton;
