import { useMemo, useState, useCallback } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { DataGrid, createDataGridHelper } from "../../data-grid";
import { HttpTypes } from "@medusajs/framework/types";
import { DataGridTextCell } from "../../data-grid/components";
import { Input, Button, Label, Checkbox } from "@medusajs/ui";

type ProductCreateSchemaType = any;

type VariantDraft = {
  id: string;
  title: string;
  sku: string | null;
  options: Array<{ name: string; value: string }>;
  optionByTitle: Record<string, string>;
  combinationKey: string;
};

type VariantInventoryFormProps = {
  form: UseFormReturn<ProductCreateSchemaType>;
  variantsToGenerate?: VariantDraft[];
  selectedVariantIds?: string[];
};

const ProductVariantInventory = ({ 
  form, 
  variantsToGenerate = [],
  selectedVariantIds = []
}: VariantInventoryFormProps) => {
  const [skuPrefix, setSkuPrefix] = useState("");

  const columns = useVariantInventoryGridColumns(form);

  const variants = useWatch({
    control: form.control,
    name: "variants",
  }) as HttpTypes.AdminProductVariant[];

  // Helper function to normalize option names (handle Color/Colour, etc.)
  const normalizeOptionName = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower === "colour" || lower === "color") return "color";
    if (lower === "size") return "size";
    return lower;
  };

  // Find Color and Size option names from the first variant
  const getColorAndSizeOptions = useCallback(() => {
    if (!variantsToGenerate.length) return { colorKey: null, sizeKey: null };
    
    const firstVariant = variantsToGenerate[0];
    const optionNames = Object.keys(firstVariant.optionByTitle);
    
    let colorKey: string | null = null;
    let sizeKey: string | null = null;
    
    for (const key of optionNames) {
      const normalized = normalizeOptionName(key);
      if (normalized === "color" && !colorKey) {
        colorKey = key;
      } else if (normalized === "size" && !sizeKey) {
        sizeKey = key;
      }
    }
    
    return { colorKey, sizeKey };
  }, [variantsToGenerate]);

  // Auto-generate SKUs based on prefix
  const handleGenerateSkus = useCallback(() => {
    if (!skuPrefix.trim()) {
      return;
    }

    const { colorKey, sizeKey } = getColorAndSizeOptions();
    
    if (!colorKey || !sizeKey) {
      console.warn("Could not find Color and Size options");
      return;
    }

    const currentVariants = form.getValues("variants") || [];
    const updatedVariants = currentVariants.map((variant: any, index: number) => {
      // Find the corresponding variant in variantsToGenerate by matching title
      const matchingVariant = variantsToGenerate.find(
        (v) => v.title === variant.title
      );

      if (!matchingVariant) {
        return variant;
      }

      const colorValue = matchingVariant.optionByTitle[colorKey] || "";
      const sizeValue = matchingVariant.optionByTitle[sizeKey] || "";

      // Normalize values for SKU (remove spaces, special chars, uppercase)
      const normalizeForSku = (val: string) => {
        return val
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9_]/g, "")
          .toUpperCase();
      };

      const colorSku = normalizeForSku(colorValue);
      const sizeSku = normalizeForSku(sizeValue);

      const generatedSku = `${skuPrefix.trim()}${colorSku}_${sizeSku}`;

      return {
        ...variant,
        sku: generatedSku,
      };
    });

    form.setValue("variants", updatedVariants);
  }, [skuPrefix, form, variantsToGenerate, getColorAndSizeOptions]);

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="sku-prefix">SKU Prefix</Label>
        <div className="flex gap-2">
          <Input
            id="sku-prefix"
            value={skuPrefix}
            onChange={(e) => setSkuPrefix(e.target.value)}
            placeholder="e.g., NA_AM_TC_"
            className="flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleGenerateSkus}
            disabled={!skuPrefix.trim() || variants.length === 0}
          >
            Generate SKUs
          </Button>
        </div>
        <p className="text-xs text-ui-fg-subtle">
          Enter a prefix and click "Generate SKUs" to auto-populate SKUs in the format: {"{"}prefix{"}"}Color_Size
        </p>
      </div>

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

const useVariantInventoryGridColumns = (form: UseFormReturn<ProductCreateSchemaType>) => {
  const variants = useWatch({
    control: form.control,
    name: "variants",
  }) as HttpTypes.AdminProductVariant[];

  // Calculate if all variants are checked for a given field
  const areAllChecked = useCallback((fieldName: "manage_inventory" | "allow_backorder") => {
    if (!variants || variants.length === 0) return false;
    return variants.every((variant: any) => variant[fieldName] === true);
  }, [variants]);

  // Calculate if some (but not all) variants are checked
  const areSomeChecked = useCallback((fieldName: "manage_inventory" | "allow_backorder") => {
    if (!variants || variants.length === 0) return false;
    const checkedCount = variants.filter((variant: any) => variant[fieldName] === true).length;
    return checkedCount > 0 && checkedCount < variants.length;
  }, [variants]);

  // Toggle all variants for a given field
  const toggleAll = useCallback((fieldName: "manage_inventory" | "allow_backorder") => {
    const currentVariants = form.getValues("variants") || [];
    const allChecked = areAllChecked(fieldName);
    const newValue = !allChecked;

    const updatedVariants = currentVariants.map((variant: any) => ({
      ...variant,
      [fieldName]: newValue,
    }));

    form.setValue("variants", updatedVariants);
  }, [form, areAllChecked]);

  // Create header with select all checkbox
  const createSelectAllHeader = useCallback((fieldName: "manage_inventory" | "allow_backorder", label: string) => {
    return () => {
      const allChecked = areAllChecked(fieldName);
      const someChecked = areSomeChecked(fieldName);

      return (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allChecked}
            onCheckedChange={() => toggleAll(fieldName)}
          />
          <span className="text-sm font-medium">{label}</span>
          {someChecked && (
            <span className="text-xs text-ui-fg-subtle">(some selected)</span>
          )}
        </div>
      );
    };
  }, [areAllChecked, areSomeChecked, toggleAll]);

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

      // SKU (text)
      columnHelper.column({
        id: "sku", // must match field name
        header: "SKU",
        field: (context) => `variants.${context.row.index}.sku`,
        type: "text",
        cell: (context) => <DataGridTextCell context={context} />,
        disableHiding: true,
      }),

      // Manage inventory (boolean) with select all
      columnHelper.column({
        id: "manage_inventory",
        name: "Manage Inventory",
        header: createSelectAllHeader("manage_inventory", "Manage Inventory"),
        field: (context) => `variants.${context.row.index}.manage_inventory`,
        type: "boolean",
        cell: (context) => {
          return <DataGrid.BooleanCell context={context} />;
        },
      }),
      // Allow backorders (boolean) with select all
      columnHelper.column({
        id: "allow_backorder",
        name: "Allow Backorders",
        header: createSelectAllHeader("allow_backorder", "Allow Backorders"),
        field: (context) => `variants.${context.row.index}.allow_backorder`,
        type: "boolean",
        cell: (context) => {
          return <DataGrid.BooleanCell context={context} />;
        },
      }),
    ];
  }, [createSelectAllHeader]);
};

export default ProductVariantInventory;
