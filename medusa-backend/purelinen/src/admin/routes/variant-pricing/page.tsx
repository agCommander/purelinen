import * as React from 'react';
import { defineRouteConfig } from '@medusajs/admin-sdk';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Container,
  Heading,
  Button,
  toast,
} from '@medusajs/ui';
import { ArrowLeft } from '@medusajs/icons';
import { sdk } from '../../lib/sdk';
import { DataGrid, createDataGridHelper } from '../../data-grid';
import { DataGridCurrencyCell } from '../../data-grid/components';
import { HttpTypes } from '@medusajs/framework/types';
import { withQueryClient } from '../../components/QueryClientProvider';

const variantPricingSchema = z.object({
  variants: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      prices: z.record(z.string(), z.string().or(z.number()).optional()).optional(),
      priceListPrices: z.record(z.string(), z.string().or(z.number()).optional()).optional(),
    })
  ),
});

type VariantPricingFormData = z.infer<typeof variantPricingSchema>;

const columnHelper = createDataGridHelper<
  HttpTypes.AdminProductVariant,
  VariantPricingFormData
>();

const ProductVariantPricingPage = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch product with variants
  const { data: productData, isLoading } = useQuery({
    queryKey: ['product', productId, 'variants-pricing'],
    enabled: !!productId,
    queryFn: async () => {
      const product = await sdk.admin.product.retrieve(productId!, {
        fields: 'variants.*,variants.prices.*',
      });
      
      // Fetch all Price List prices for all variants in one batch request
      if (product.product?.variants && product.product.variants.length > 0) {
        try {
          const pricesResponse = await fetch(
            `/admin/custom/products/${productId}/price-list-prices`,
            { credentials: 'include' }
          );
          if (pricesResponse.ok) {
            const pricesData = await pricesResponse.json();
            const pricesByVariant = pricesData.pricesByVariant || {};
            
            // Attach Price List prices to each variant
            for (const variant of product.product.variants) {
              (variant as any).priceListPrices = pricesByVariant[variant.id] || [];
            }
          } else {
            // If batch fetch fails, set empty arrays
            for (const variant of product.product.variants) {
              (variant as any).priceListPrices = [];
            }
          }
        } catch (e) {
          // If batch fetch fails, set empty arrays
          for (const variant of product.product.variants) {
            (variant as any).priceListPrices = [];
          }
        }
      }
      
      return product;
    },
  });

  // Fetch Price Lists
  const { data: priceLists } = useQuery({
    queryKey: ['price-lists'],
    queryFn: async () => {
      const response = await fetch('/admin/custom/price-lists');
      if (!response.ok) {
        throw new Error('Failed to fetch price lists');
      }
      const data = await response.json();
      return data.price_lists || [];
    },
  });

  // Fetch currencies
  const { data: currencies } = useQuery({
    queryKey: ['store'],
    queryFn: async () => {
      return await sdk.admin.store.list().then(({ stores }) => {
        return stores[0].supported_currencies;
      });
    },
  });

  const form = useForm<VariantPricingFormData>({
    resolver: zodResolver(variantPricingSchema),
    defaultValues: {
      variants: [],
    },
  });

  // Initialize form with variant data
  React.useEffect(() => {
    if (productData?.product?.variants) {
      form.reset({
        variants: productData.product.variants.map((variant: any) => ({
          id: variant.id,
          title: variant.title,
          prices: (variant.prices || []).reduce((acc: any, price: any) => {
            if (price.rules?.region_id) {
              acc[price.rules.region_id] = price.amount;
            } else {
              acc[price.currency_code] = price.amount;
            }
            return acc;
          }, {}),
          priceListPrices: (variant.priceListPrices || []).reduce((acc: any, price: any) => {
            if (price.price_list_id) {
              acc[price.price_list_id] = price.amount;
            }
            return acc;
          }, {}),
        })),
      });
    }
  }, [productData, form]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: VariantPricingFormData) => {
      if (!productId) {
        throw new Error('Product ID is required');
      }

      // Prepare variant updates for base prices
      const variantUpdates = data.variants
        .filter((variant) => variant.prices && Object.keys(variant.prices).length > 0)
        .map((variant) => {
          const prices = Object.entries(variant.prices!)
            .filter(([_, value]) => value !== '' && typeof value !== 'undefined')
            .map(([key, value]: any) => {
              const isRegion = key.startsWith('reg_');
              return {
                currency_code: isRegion ? undefined : key,
                amount: Math.round(Number(value)),
                ...(isRegion ? { rules: { region_id: key } } : {}),
              };
            });

          return {
            id: variant.id,
            prices: prices.length > 0 ? prices : undefined,
          };
        })
        .filter((update) => update.prices !== undefined);

      // Update base prices using batchVariants
      if (variantUpdates.length > 0) {
        await sdk.admin.product.batchVariants(productId, {
          update: variantUpdates,
        });
      }

      // Update Price List prices
      for (const variant of data.variants) {
        if (variant.priceListPrices && Object.keys(variant.priceListPrices).length > 0) {
          const priceListPrices = Object.entries(variant.priceListPrices)
            .filter(([_, value]) => value !== '' && typeof value !== 'undefined')
            .map(([priceListId, value]: any) => ({
              price_list_id: priceListId,
              amount: Math.round(Number(value)),
              currency_code: 'aud',
            }));

          if (priceListPrices.length > 0) {
            await fetch(`/admin/custom/variants/${variant.id}/price-list-prices`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prices: priceListPrices }),
            });
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      toast.success('Prices updated successfully');
      navigate(-1);
    },
    onError: (error: any) => {
      toast.error(`Failed to update prices: ${error.message}`);
    },
  });

  const columns = React.useMemo(() => {
    const audCurrency = currencies?.find((c) => c.currency_code.toLowerCase() === 'aud')?.currency_code || 'aud';
    
    // Identify price lists by title
    const pureLinenPriceList = priceLists?.find((pl: any) => 
      pl.title?.toUpperCase() === 'PURELINEN' || pl.title?.includes('Pure Linen')
    );
    const linenthingsPriceList = priceLists?.find((pl: any) => 
      pl.title?.toUpperCase() === 'LINENTHINGS' || pl.title?.includes('Linen Things')
    );
    
    return [
      columnHelper.column({
        id: 'Title',
        header: 'Title',
        size: 375, // Wider title column (350-400px as requested)
        cell: (context) => {
          const entity = context.row.original;
          return (
            <DataGrid.ReadonlyCell context={context}>
              <div className="flex h-full w-full items-center gap-x-2 overflow-hidden">
                <span className="truncate">{entity.title}</span>
              </div>
            </DataGrid.ReadonlyCell>
          );
        },
        disableHiding: true,
      }),
      // Base price column = Retail (Linen Things) price
      columnHelper.column({
        id: 'price_aud',
        name: 'Retail Price (Linen Things)',
        header: () => (
          <div className="flex flex-col">
            <span>Retail Price</span>
            <span className="text-xs text-gray-500 font-normal">(Linen Things)</span>
          </div>
        ),
        field: (context) => `variants.${context.row.index}.prices.${audCurrency}`,
        type: 'number',
        cell: (context) => <DataGridCurrencyCell code={audCurrency} context={context} />,
      }),
      // Pure Linen price list (B2B wholesale)
      ...(pureLinenPriceList ? [columnHelper.column({
        id: `price_list.${pureLinenPriceList.id}`,
        name: pureLinenPriceList.title,
        header: () => (
          <div className="flex flex-col">
            <span>Pure Linen</span>
            <span className="text-xs text-gray-500 font-normal">(B2B Wholesale)</span>
          </div>
        ),
        field: (context) => `variants.${context.row.index}.priceListPrices.${pureLinenPriceList.id}`,
        type: 'number',
        cell: (context) => <DataGridCurrencyCell code={audCurrency} context={context} />,
      })] : []),
      // Linen Things price list (Discounts only)
      ...(linenthingsPriceList ? [columnHelper.column({
        id: `price_list.${linenthingsPriceList.id}`,
        name: linenthingsPriceList.title,
        header: () => (
          <div className="flex flex-col">
            <span>Linen Things Discounts</span>
            <span className="text-xs text-gray-500 font-normal">(Date-ranged sales only)</span>
          </div>
        ),
        field: (context) => `variants.${context.row.index}.priceListPrices.${linenthingsPriceList.id}`,
        type: 'number',
        cell: (context) => <DataGridCurrencyCell code={audCurrency} context={context} />,
      })] : []),
    ];
  }, [currencies, priceLists]);

  const variants = form.watch('variants') || [];

  if (isLoading) {
    return <Container>Loading...</Container>;
  }

  if (!productData?.product) {
    return <Container>Product not found</Container>;
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="transparent"
            size="small"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft />
          </Button>
          <Heading level="h1">
            Edit Prices: {productData.product.title}
          </Heading>
        </div>
        <Button
          onClick={form.handleSubmit((data) => saveMutation.mutate(data))}
          disabled={saveMutation.isPending}
        >
          Save Prices
        </Button>
      </div>

      <FormProvider {...form}>
        <div className="p-6">
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Pricing Structure:</strong> Base prices are Retail (Linen Things) prices. 
              Pure Linen price list is for B2B wholesale. Linen Things price list is for date-ranged discounts/sales only.
            </p>
          </div>
          <DataGrid
            columns={columns}
            data={variants as any}
            state={form}
            onEditingChange={() => {}}
          />
        </div>
      </FormProvider>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: 'Variant Pricing',
});

export default withQueryClient(ProductVariantPricingPage);
