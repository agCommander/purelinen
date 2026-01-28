import React, { useMemo, useState, useCallback } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import {
  DataGrid,
  createDataGridHelper,
  createDataGridPriceColumns,
} from "../../data-grid";
import { DataGridCurrencyCell } from "../../data-grid/components";
import { HttpTypes } from "@medusajs/framework/types";
import { sdk } from "../../lib/sdk";
import { useQuery } from "@tanstack/react-query";
import { Input, Button, Label, toast } from "@medusajs/ui";

type ProductCreateSchemaType = any;

type VariantDraft = {
  id: string;
  title: string;
  sku: string | null;
  options: Array<{ name: string; value: string }>;
  optionByTitle: Record<string, string>;
  combinationKey: string;
};

type VariantPricingFormProps = {
  form: UseFormReturn<ProductCreateSchemaType>;
  variantsToGenerate?: VariantDraft[];
};

const ProductVariantPrice = ({ 
  form, 
  variantsToGenerate = []
}: VariantPricingFormProps) => {
  const { data: currencies } = useQuery({
    queryKey: ["store"],
    queryFn: async () => {
      return await sdk.admin.store.list().then(({ stores }) => {
        return stores[0].supported_currencies;
      });
    },
  });

  const { data: regions } = useQuery({
    queryKey: ["regions"],
    queryFn: async () => {
      const response = await sdk.admin.region.list({ limit: 9999 });
      return response.regions;
    },
  });

  const { data: pricePreferences } = useQuery({
    queryKey: ["price-preferences"],
    queryFn: async () => {
      const response = await sdk.admin.pricePreference.list();
      return response.price_preferences;
    },
  });

  // Fetch Price Lists
  const { data: priceLists } = useQuery({
    queryKey: ["price-lists"],
    queryFn: async () => {
      const response = await fetch('/admin/custom/price-lists');
      if (!response.ok) {
        throw new Error('Failed to fetch price lists');
      }
      const data = await response.json();
      return data.price_lists || [];
    },
  });

  // Fetch price import data
  const { data: priceImportData } = useQuery({
    queryKey: ["price-import-data"],
    queryFn: async () => {
      const response = await fetch('/admin/custom/prices/import-data');
      if (!response.ok) {
        throw new Error('Failed to fetch price data');
      }
      return response.json();
    },
  });

  const variants = useWatch({
    control: form.control,
    name: "variants",
  }) as any;

  // Helper function to normalize option names (handle Size variations)
  const normalizeOptionName = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower === "size") return "size";
    return lower;
  };

  // Find Size option name and get unique sizes
  const { sizeKey, uniqueSizes } = useMemo(() => {
    if (!variantsToGenerate.length) return { sizeKey: null, uniqueSizes: [] };
    
    const firstVariant = variantsToGenerate[0];
    const optionNames = Object.keys(firstVariant.optionByTitle);
    
    let sizeKey: string | null = null;
    
    for (const key of optionNames) {
      const normalized = normalizeOptionName(key);
      if (normalized === "size" && !sizeKey) {
        sizeKey = key;
        break;
      }
    }
    
    if (!sizeKey) return { sizeKey: null, uniqueSizes: [] };
    
    // Get unique sizes from all variants
    const sizes = new Set<string>();
    variantsToGenerate.forEach((variant) => {
      const sizeValue = variant.optionByTitle[sizeKey];
      if (sizeValue) {
        sizes.add(sizeValue);
      }
    });
    
    return { 
      sizeKey, 
      uniqueSizes: Array.from(sizes).sort() 
    };
  }, [variantsToGenerate]);

  // State for size-based prices - separate for purelinen (base) and linenthings
  const [purelinenSizePrices, setPurelinenSizePrices] = useState<Record<string, string>>({});
  const [linenthingsSizePrices, setLinenthingsSizePrices] = useState<Record<string, string>>({});
  
  // State for auto-generation
  const [isGeneratingPrices, setIsGeneratingPrices] = useState(false);

  // Apply purelinen (base) prices by size
  const handleApplyPurelinenPricesBySize = useCallback(() => {
    if (!sizeKey || (!currencies?.length && !regions?.length)) {
      return;
    }

    const currentVariants = form.getValues("variants") || [];
    const currencyCodes = currencies?.map((c) => c.currency_code) || [];
    
    const updatedVariants = currentVariants.map((variant: any) => {
      const matchingVariant = variantsToGenerate.find(
        (v) => v.title === variant.title
      );

      if (!matchingVariant) {
        return variant;
      }

      const sizeValue = matchingVariant.optionByTitle[sizeKey];
      if (!sizeValue || !purelinenSizePrices[sizeValue]) {
        return variant;
      }

      const priceValue = purelinenSizePrices[sizeValue];
      const prices = variant.prices || {};
      
      // Apply to AUD currency (base price) - no regional pricing needed
      const audCurrency = currencyCodes.find(c => c.toLowerCase() === 'aud') || currencyCodes[0];
      if (audCurrency) {
        prices[audCurrency] = priceValue;
      }

      return {
        ...variant,
        prices,
      };
    });

    form.setValue("variants", updatedVariants);
    toast.success(`Applied Purelinen (base) prices by size`);
  }, [sizeKey, purelinenSizePrices, form, variantsToGenerate, currencies, regions]);

  // Apply linenthings prices by size
  const handleApplyLinenthingsPricesBySize = useCallback(() => {
    if (!sizeKey || (!currencies?.length && !regions?.length)) {
      return;
    }

    const currentVariants = form.getValues("variants") || [];
    const currencyCodes = currencies?.map((c) => c.currency_code) || [];
    
    const updatedVariants = currentVariants.map((variant: any) => {
      const matchingVariant = variantsToGenerate.find(
        (v) => v.title === variant.title
      );

      if (!matchingVariant) {
        return variant;
      }

      const sizeValue = matchingVariant.optionByTitle[sizeKey];
      if (!sizeValue || !linenthingsSizePrices[sizeValue]) {
        return variant;
      }

      const priceValue = linenthingsSizePrices[sizeValue];
      const prices = variant.prices || {};
      
      // Apply to AUD currency (for retail/Linen Things pricing)
      // These are base prices, which are now Retail (Linen Things) prices
      const audCurrency = currencyCodes.find(c => c.toLowerCase() === 'aud') || currencyCodes[0];
      if (audCurrency) {
        prices[audCurrency] = priceValue;
      }

      return {
        ...variant,
        prices,
      };
    });

    form.setValue("variants", updatedVariants);
    toast.success(`Applied Linenthings prices by size`);
  }, [sizeKey, linenthingsSizePrices, form, variantsToGenerate, currencies, regions]);

  // Auto-generate prices from import data (by SKU matching)
  // priceType: 'linenthings' = Retail prices (base prices), 'purelinen' = B2B wholesale (price list)
  const handleAutoGeneratePrices = useCallback((priceType: 'purelinen' | 'linenthings') => {
    if (!priceImportData || !variantsToGenerate.length) {
      toast.error('Price data not loaded');
      return;
    }

    setIsGeneratingPrices(true);
    const currentVariants = form.getValues("variants") || [];
    const currencyCodes = currencies?.map((c) => c.currency_code) || [];
    
    let matched = 0;
    let unmatched = 0;

    const updatedVariants = currentVariants.map((variant: any) => {
      const matchingVariant = variantsToGenerate.find(
        (v) => v.title === variant.title
      );

      if (!matchingVariant) {
        return variant;
      }

      let priceAmount: number | null = null;

      // Try to match by SKU first
      if (matchingVariant.sku && priceImportData.pricesBySku[matchingVariant.sku]) {
        const skuPrices = priceImportData.pricesBySku[matchingVariant.sku];
        
        if (priceType === 'purelinen' && skuPrices.purelinen) {
          priceAmount = skuPrices.purelinen;
        } else if (priceType === 'linenthings' && skuPrices.linenthings) {
          priceAmount = skuPrices.linenthings;
        }
      }

      if (!priceAmount) {
        unmatched++;
        return variant;
      }

      matched++;
      const prices = variant.prices || {};
      const priceInCents = Math.round(priceAmount * 100);

      // Apply to AUD currency (or first currency if AUD not available)
      const audCurrency = currencyCodes.find(c => c.toLowerCase() === 'aud') || currencyCodes[0];
      if (audCurrency) {
        prices[audCurrency] = priceInCents;
      }

      return {
        ...variant,
        prices,
      };
    });

    form.setValue("variants", updatedVariants);
    setIsGeneratingPrices(false);

    if (matched > 0) {
      toast.success(`Generated ${matched} ${priceType} prices${unmatched > 0 ? ` (${unmatched} unmatched)` : ''}`);
    } else {
      toast.error(`No prices found. Make sure variants have SKUs set.`);
    }
  }, [priceImportData, variantsToGenerate, form, currencies, regions]);

  const baseColumns = useVariantPriceGridColumns({
    currencies,
    regions: [], // Not using regional pricing - only AUD currency
    pricePreferences,
    priceLists: priceLists || [],
  });
  
  // Customize base price column header to indicate it's Retail (Linen Things)
  const columns = React.useMemo(() => {
    return baseColumns.map((col: any) => {
      // Update AUD price column header - check for currency_prices.aud or similar patterns
      if (col.id === 'currency_prices.aud' || 
          (typeof col.id === 'string' && col.id.includes('aud') && col.id.includes('currency'))) {
        return {
          ...col,
          header: () => (
            <div className="flex flex-col">
              <span>Retail Price</span>
              <span className="text-xs text-gray-500 font-normal">(Linen Things)</span>
            </div>
          ),
        };
      }
      return col;
    });
  }, [baseColumns]);

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Pricing Structure Info */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Pricing Structure:</strong> Base prices are Retail (Linen Things) prices. 
          Pure Linen price list is for B2B wholesale. Linen Things price list is for date-ranged discounts/sales only.
        </p>
      </div>
      
      {/* Auto-Generate Prices Section */}
      <div className="flex flex-col gap-4 p-4 border border-ui-border-base rounded-lg bg-ui-bg-subtle">
        <div className="flex flex-col gap-2">
          <Label>Auto-Generate Prices from Import Data</Label>
          <p className="text-xs text-ui-fg-subtle">
            Load prices from CSV/JSON files. Variants must have SKUs set in the Details tab first.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={() => handleAutoGeneratePrices('linenthings')}
            disabled={isGeneratingPrices || !priceImportData || variants.length === 0}
          >
            Load Retail Prices (Linen Things)
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={() => handleAutoGeneratePrices('purelinen')}
            disabled={isGeneratingPrices || !priceImportData || variants.length === 0}
          >
            Load Pure Linen Prices (B2B)
          </Button>
        </div>
        
        {priceImportData && (
          <p className="text-xs text-ui-fg-subtle">
            Loaded: {priceImportData.stats?.skusWithPurelinen || 0} purelinen prices,{' '}
            {priceImportData.stats?.skusWithLinenthings || 0} linenthings prices
          </p>
        )}
      </div>

      {/* Size-based pricing section - Retail (Linen Things) */}
      {sizeKey && uniqueSizes.length > 0 && (
        <>
          <div className="flex flex-col gap-4 p-4 border border-ui-border-base rounded-lg bg-ui-bg-subtle">
          <div className="flex flex-col gap-2">
            <Label>Set Retail Prices (Linen Things) by Size</Label>
            <p className="text-xs text-ui-fg-subtle">
              Enter retail prices for each size. These will be set as base prices (used by Linen Things storefront).
            </p>
          </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {uniqueSizes.map((size) => (
                <div key={`retail-${size}`} className="flex flex-col gap-1">
                  <Label htmlFor={`retail-price-${size}`} className="text-xs">
                    {size}
                  </Label>
                  <Input
                    id={`retail-price-${size}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={linenthingsSizePrices[size] || ""}
                    onChange={(e) => {
                      setLinenthingsSizePrices((prev) => ({
                        ...prev,
                        [size]: e.target.value,
                      }));
                    }}
                    placeholder="0.00"
                  />
                </div>
              ))}
            </div>
            
            <Button
              type="button"
              variant="secondary"
              onClick={handleApplyLinenthingsPricesBySize}
              disabled={Object.keys(linenthingsSizePrices).length === 0 || variants.length === 0}
            >
              Apply Retail Prices (Linen Things) by Size
            </Button>
          </div>

          {/* Size-based pricing section - Pure Linen (B2B) */}
          <div className="flex flex-col gap-4 p-4 border border-ui-border-base rounded-lg bg-ui-bg-subtle">
          <div className="flex flex-col gap-2">
            <Label>Set Pure Linen Prices (B2B Wholesale) by Size</Label>
            <p className="text-xs text-ui-fg-subtle">
              Enter Pure Linen wholesale prices for each size. These will be added to the Pure Linen price list.
            </p>
          </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {uniqueSizes.map((size) => (
                <div key={`purelinen-${size}`} className="flex flex-col gap-1">
                  <Label htmlFor={`purelinen-price-${size}`} className="text-xs">
                    {size}
                  </Label>
                  <Input
                    id={`purelinen-price-${size}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={purelinenSizePrices[size] || ""}
                    onChange={(e) => {
                      setPurelinenSizePrices((prev) => ({
                        ...prev,
                        [size]: e.target.value,
                      }));
                    }}
                    placeholder="0.00"
                  />
                </div>
              ))}
            </div>
            
            <Button
              type="button"
              variant="secondary"
              onClick={handleApplyPurelinenPricesBySize}
              disabled={Object.keys(purelinenSizePrices).length === 0 || variants.length === 0}
            >
              Apply Pure Linen Prices (B2B) by Size
            </Button>
          </div>
        </>
      )}

      <DataGrid
        columns={columns}
        data={variants}
        state={form}
        onEditingChange={() => {}}
      />
    </div>
  );
};
const columnHelper = createDataGridHelper<
  HttpTypes.AdminProductVariant,
  ProductCreateSchemaType
>();

type PriceList = {
  id: string;
  title: string;
  status: string;
};

const useVariantPriceGridColumns = ({
  currencies = [],
  regions = [],
  pricePreferences = [],
  priceLists = [],
}: {
  currencies?: HttpTypes.AdminStore["supported_currencies"];
  regions?: HttpTypes.AdminRegion[];
  pricePreferences?: HttpTypes.AdminPricePreference[];
  priceLists?: PriceList[];
}) => {
  return useMemo(() => {
    return [
      columnHelper.column({
        id: "Title",
        header: "Title",
        size: 500, // Increased from 300 to 400px for better visibility
       // minSize: 300, // Minimum width
       // maxSize: 600, // Maximum width (allows some adjustment)
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

      // Base prices = Retail (Linen Things) prices
      ...createDataGridPriceColumns<
        HttpTypes.AdminProductVariant,
        ProductCreateSchemaType
      >({
        currencies: currencies.map((c) => c.currency_code),
        regions,
        pricePreferences,
        getFieldName: (context, value) => {
          if (context.column.id?.startsWith("currency_prices")) {
            return `variants.${context.row.index}.prices.${value}`;
          }
          return `variants.${context.row.index}.prices.${value}`;
        },
        t: ((key: any) => key) as any,
      }),
      // Add Price List columns with proper labels
      ...(priceLists.map((priceList) => {
        const audCurrency = currencies?.find((c) => c.currency_code.toLowerCase() === 'aud')?.currency_code || 'aud';
        const isPureLinen = priceList.title?.toUpperCase() === 'PURELINEN' || priceList.title?.includes('Pure Linen');
        const isLinenthings = priceList.title?.toUpperCase() === 'LINENTHINGS' || priceList.title?.includes('Linen Things');
        
        let headerLabel = `Price ${priceList.title}`;
        let subLabel = '';
        
        if (isPureLinen) {
          headerLabel = 'Pure Linen';
          subLabel = '(B2B Wholesale)';
        } else if (isLinenthings) {
          headerLabel = 'Linen Things Discounts';
          subLabel = '(Date-ranged sales only)';
        }
        
        return columnHelper.column({
          id: `price_list.${priceList.id}`,
          name: priceList.title,
          header: () => (
            <div className="flex flex-col">
              <span className="truncate" title={priceList.title}>
                {headerLabel}
              </span>
              {subLabel && (
                <span className="text-xs text-gray-500 font-normal">{subLabel}</span>
              )}
            </div>
          ),
          field: (context) => {
            return `variants.${context.row.index}.priceListPrices.${priceList.id}`;
          },
          type: "number",
          cell: (context) => {
            return <DataGridCurrencyCell code={audCurrency} context={context} />;
          },
        });
      })),
    ];
  }, [currencies, regions, pricePreferences, priceLists]);
};

export default ProductVariantPrice;
