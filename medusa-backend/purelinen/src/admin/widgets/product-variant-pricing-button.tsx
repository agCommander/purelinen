import * as React from 'react';
import { defineWidgetConfig } from '@medusajs/admin-sdk';
import { useNavigate } from 'react-router-dom';
import { Button } from '@medusajs/ui';
import { CurrencyDollar } from '@medusajs/icons';
import { DetailWidgetProps } from '@medusajs/framework/types';
import { AdminProduct } from '@medusajs/framework/types';

const ProductVariantPricingButton = ({ data: product }: DetailWidgetProps<AdminProduct>) => {
  const navigate = useNavigate();

  if (!product?.id || !product?.variants || product.variants.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="small"
        onClick={() => navigate(`/products/${product.id}/variant-pricing`)}
      >
        <CurrencyDollar />
        Edit Prices (with Price Lists)
      </Button>
    </div>
  );
};

export const config = defineWidgetConfig({
  zone: 'product.details.before',
});

export default ProductVariantPricingButton;
