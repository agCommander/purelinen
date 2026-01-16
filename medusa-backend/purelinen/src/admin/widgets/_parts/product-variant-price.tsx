import { useMemo, useState, useCallback } from "react";
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
      
      // Apply to AUD currency (for linenthings pricing)
      // Note: These will be base prices, but you can later add them to Price Lists
      const audCurrency = currencyCodes.find(c => c.toLowerCase() === 'aud') || currencyCodes[0];
      if (audCurrency) {
        // Store linenthings price - you might want to use a different key or metadata
        // For now, we'll apply to the same base price columns
        // You can distinguish them later when adding to Price Lists
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
  const handleAutoGeneratePrices = useCallback((priceType: 'base' | 'purelinen' | 'linenthings') => {
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
        
        if (priceType === 'base' && skuPrices.purelinen) {
          priceAmount = skuPrices.purelinen;
        } else if (priceType === 'purelinen' && skuPrices.purelinen) {
          priceAmount = skuPrices.purelinen;
        } else if (priceType === 'linenthings' && skuPrices.linenthings) {
          priceAmount = skuPrices.linenthings;
        }
      }

      // If no SKU match and looking for linenthings, try variant_id (for existing variants)
      if (!priceAmount && priceType === 'linenthings' && matchingVariant.id) {
        // Note: This won't work for new variants, but we can try
        // For new variants, SKU matching is the only option
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

  const columns = useVariantPriceGridColumns({
    currencies,
    regions: [], // Not using regional pricing - only AUD currency
    pricePreferences,
    priceLists: priceLists || [],
  });

  return (
    <div className="flex flex-col gap-4 p-6">
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
            onClick={() => handleAutoGeneratePrices('base')}
            disabled={isGeneratingPrices || !priceImportData || variants.length === 0}
          >
            Load Base Prices (Purelinen)
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={() => handleAutoGeneratePrices('purelinen')}
            disabled={isGeneratingPrices || !priceImportData || variants.length === 0}
          >
            Load Purelinen Prices
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={() => handleAutoGeneratePrices('linenthings')}
            disabled={isGeneratingPrices || !priceImportData || variants.length === 0}
          >
            Load Linenthings Prices
          </Button>
        </div>
        
        {priceImportData && (
          <p className="text-xs text-ui-fg-subtle">
            Loaded: {priceImportData.stats?.skusWithPurelinen || 0} purelinen prices,{' '}
            {priceImportData.stats?.skusWithLinenthings || 0} linenthings prices
          </p>
        )}
      </div>

      {/* Size-based pricing section - Purelinen (Base) */}
      {sizeKey && uniqueSizes.length > 0 && (
        <>
          <div className="flex flex-col gap-4 p-4 border border-ui-border-base rounded-lg bg-ui-bg-subtle">
          <div className="flex flex-col gap-2">
            <Label>Set Purelinen (Base) Prices by Size</Label>
            <p className="text-xs text-ui-fg-subtle">
              Enter Purelinen prices for each size and click "Apply Purelinen Prices" to set base prices.
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
              Apply Purelinen Prices by Size
            </Button>
          </div>

          {/* Size-based pricing section - Linenthings */}
          <div className="flex flex-col gap-4 p-4 border border-ui-border-base rounded-lg bg-ui-bg-subtle">
          <div className="flex flex-col gap-2">
            <Label>Set Linenthings Prices by Size</Label>
            <p className="text-xs text-ui-fg-subtle">
              Enter Linenthings prices for each size and click "Apply Linenthings Prices" to set retail prices.
            </p>
          </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {uniqueSizes.map((size) => (
                <div key={`linenthings-${size}`} className="flex flex-col gap-1">
                  <Label htmlFor={`linenthings-price-${size}`} className="text-xs">
                    {size}
                  </Label>
                  <Input
                    id={`linenthings-price-${size}`}
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
              Apply Linenthings Prices by Size
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
        size: 300,
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
      // Add Price List columns
      ...(priceLists.map((priceList) => {
        const audCurrency = currencies?.find((c) => c.currency_code.toLowerCase() === 'aud')?.currency_code || 'aud';
        return columnHelper.column({
          id: `price_list.${priceList.id}`,
          name: priceList.title,
          header: () => (
            <div className="flex w-full items-center justify-between gap-3">
              <span className="truncate" title={priceList.title}>
                Price {priceList.title}
              </span>
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
