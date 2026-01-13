"use client"

import { isEqual } from "lodash"
import { useEffect, useMemo, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import * as ReactAria from "react-aria-components"
import { getVariantItemsInStock } from "@lib/util/inventory"
import { Button } from "@/components/Button"
import { NumberField } from "@/components/NumberField"
import {
  UiSelectButton,
  UiSelectIcon,
  UiSelectListBox,
  UiSelectListBoxItem,
  UiSelectValue,
} from "@/components/ui/Select"
import { useCountryCode } from "hooks/country-code"
import ProductPrice from "@modules/products/components/product-price"
import { UiRadioGroup } from "@/components/ui/Radio"
import { withReactQueryProvider } from "@lib/util/react-query"
import { useAddLineItem } from "hooks/cart"
import { useCustomer } from "hooks/customer"
import ColorSwatchPicker from "@modules/products/components/color-swatch-picker"
import SizeSelector from "@modules/products/components/size-selector"
import { sdk } from "@lib/config"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  materials: {
    id: string
    name: string
    colors: {
      id: string
      name: string
      hex_code: string
    }[]
  }[]
  region: HttpTypes.StoreRegion
  disabled?: boolean
  onVariantChange?: (variant: HttpTypes.StoreProductVariant | undefined) => void
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt) => {
    if (varopt.option_id) {
      acc[varopt.option_id] = varopt.value
    }
    return acc
  }, {})
}

const priorityOptions = ["Material", "Color", "Colour", "Size"]

const getInitialOptions = (product: ProductActionsProps["product"]) => {
  if (product.variants?.length === 1) {
    const variantOptions = optionsAsKeymap(product.variants[0].options)
    return variantOptions ?? {}
  }

  if (product.options) {
    const singleOptionValues = product.options
      .filter((option) => option.values)
      .filter((option) => option.values!.length === 1)
      .reduce(
        (acc, option) => {
          acc[option.id] = option.values![0].value
          return acc
        },
        {} as Record<string, string>
      )

    return singleOptionValues
  }

  return null
}

function ProductActions({ product, materials, disabled, onVariantChange }: ProductActionsProps) {
  const [options, setOptions] = useState<Record<string, string | undefined>>(
    getInitialOptions(product) ?? {}
  )
  const [quantity, setQuantity] = useState(1)
  const countryCode = useCountryCode()
  const { data: customer } = useCustomer()

  const { mutateAsync, isPending } = useAddLineItem()

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    const initialOptions = getInitialOptions(product)
    if (initialOptions) {
      setOptions(initialOptions)
    }
  }, [product])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    // First try to find exact match (all options match)
    const exactMatch = product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return variantOptions && isEqual(variantOptions, options)
    })
    
    if (exactMatch) {
      return exactMatch
    }

    // If no exact match, find variants that match the selected options (partial match)
    // This allows images to update when Color is selected, even if Size isn't selected yet
    const selectedOptions = Object.entries(options).filter(([_, value]) => value !== undefined)
    
    if (selectedOptions.length === 0) {
      return undefined
    }

    // Find the Color/Colour option if it exists (handle both spellings)
    const colorOption = product.options?.find((o) => o.title === "Color" || o.title === "Colour")
    const colorOptionId = colorOption?.id
    const selectedColor = colorOptionId ? options[colorOptionId] : undefined

    // If Color is selected, prioritize variants that match the Color
    // Otherwise, find variants that match the most selected options
    const matchingVariants = product.variants
      .map((v) => {
        const variantOptions = optionsAsKeymap(v.options)
        if (!variantOptions) {
          return null
        }
        const matchCount = selectedOptions.filter(([optionId, value]) => 
          variantOptions[optionId] === value
        ).length
        const colorMatches = selectedColor && colorOptionId 
          ? variantOptions[colorOptionId] === selectedColor
          : false
        return { variant: v, matchCount, colorMatches }
      })
      .filter((item): item is { variant: HttpTypes.StoreProductVariant; matchCount: number; colorMatches: boolean } => 
        item !== null && item.matchCount > 0
      )
      .sort((a, b) => {
        // Prioritize color matches
        if (a.colorMatches && !b.colorMatches) return -1
        if (!a.colorMatches && b.colorMatches) return 1
        // Then by match count
        return b.matchCount - a.matchCount
      })

    return matchingVariants[0]?.variant
  }, [product.variants, options])

  // Notify parent component when variant changes
  useEffect(() => {
    if (onVariantChange) {
      onVariantChange(selectedVariant)
    }
  }, [selectedVariant, onVariantChange])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string | undefined) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  // check if the selected variant is in stock
  const itemsInStock = selectedVariant
    ? getVariantItemsInStock(selectedVariant)
    : 0

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    await mutateAsync({
      variantId: selectedVariant.id,
      quantity,
      countryCode,
    })
  }

  const hasMultipleVariants = (product.variants?.length ?? 0) > 1
  const productOptions = (product.options || []).sort((a, b) => {
    let aPriority = priorityOptions.indexOf(a.title ?? "")
    let bPriority = priorityOptions.indexOf(b.title ?? "")

    if (aPriority === -1) {
      aPriority = priorityOptions.length
    }

    if (bPriority === -1) {
      bPriority = priorityOptions.length
    }

    return aPriority - bPriority
  })

  const materialOption = productOptions.find((o) => o.title === "Material")
  const colorOption = productOptions.find((o) => o.title === "Color" || o.title === "Colour")
  const sizeOption = productOptions.find((o) => o.title === "Size")
  const otherOptions = productOptions.filter((o) => {
    // Always exclude Material, Color/Colour, and Size from dropdown options
    // Material has its own dropdown, Color/Colour uses swatches, Size uses SizeSelector
    if (materialOption && o.id === materialOption.id) return false
    if (colorOption && o.id === colorOption.id) return false
    if (sizeOption && o.id === sizeOption.id) return false
    if (o.title === "Color" || o.title === "Colour") return false
    return true
  })

  const selectedMaterial =
    materialOption && options[materialOption.id]
      ? materials.find((m) => m.name === options[materialOption.id])
      : undefined

  // Fetch color hex code mapping
  const [colorHexMap, setColorHexMap] = useState<Record<string, string>>({})
  
  useEffect(() => {
    // Fetch color hex code mapping from backend
    sdk.client
      .fetch<{ colors: Record<string, string> }>(`/store/custom/colors/map`, {
        cache: "force-cache",
      })
      .then(({ colors }: { colors: Record<string, string> }) => {
        setColorHexMap(colors || {})
      })
      .catch((error: unknown) => {
        console.error("Error fetching color map:", error)
        setColorHexMap({})
      })
  }, [])

  // Extract colors from variants when Material isn't available or selected
  const colorsFromVariants = useMemo(() => {
    if (!colorOption) return []
    
    // If we have a selected material with colors, use those
    if (selectedMaterial && selectedMaterial.colors.length > 0) {
      return selectedMaterial.colors
    }
    
    // Otherwise, extract unique colors from product variants
    const colorValues = new Set<string>()
    
    product.variants?.forEach((variant) => {
      const colorValue = variant.options?.find(
        (opt) => opt.option_id === colorOption.id
      )?.value
      
      if (colorValue) {
        colorValues.add(colorValue)
      }
    })
    
    // Return colors with hex codes from mapping
    return Array.from(colorValues).map((colorName) => {
      // Try to find hex code from colorHexMap (case-insensitive)
      const hexCode = colorHexMap[colorName] || 
                     colorHexMap[colorName.toLowerCase()] ||
                     colorHexMap[colorName.charAt(0).toUpperCase() + colorName.slice(1).toLowerCase()] ||
                     "#CCCCCC" // Default gray if not found
      
      return {
        id: colorName,
        name: colorName,
        hex_code: hexCode,
      }
    })
  }, [product.variants, colorOption, selectedMaterial, materials, colorHexMap])

  // Extract sizes from variants for SizeSelector
  const sizesFromVariants = useMemo(() => {
    if (!sizeOption) return []
    
    // Filter variants based on selected options (except size)
    const filteredVariants = product.variants?.filter((variant) => {
      const variantOptions = optionsAsKeymap(variant.options)
      if (!variantOptions) return false
      
      // Check if variant matches all selected options except size
      return Object.entries(options)
        .filter(([optionId]) => optionId !== sizeOption.id) // Exclude size option
        .every(([optionId, value]) => {
          if (value === undefined) return true // Option not selected, skip
          return variantOptions[optionId] === value
        })
    }) || []
    
    // Extract unique sizes from filtered variants
    const sizeMap = new Map<string, HttpTypes.StoreProductVariant>()
    
    filteredVariants.forEach((variant) => {
      const sizeValue = variant.options?.find(
        (opt) => opt.option_id === sizeOption.id
      )?.value
      
      if (sizeValue && !sizeMap.has(sizeValue)) {
        sizeMap.set(sizeValue, variant)
      }
    })
    
    // Return sizes with their variants
    return Array.from(sizeMap.entries()).map(([sizeValue, variant]) => ({
      id: sizeValue,
      value: sizeValue,
      variant,
    }))
  }, [product.variants, sizeOption, options])

  const showOtherOptions =
    !materialOption ||
    !colorOption ||
    (selectedMaterial &&
      (selectedMaterial.colors.length < 2 || options[colorOption.id]))

  return (
    <>
      {customer && <ProductPrice product={product} variant={selectedVariant} />}
      <div className="max-md:text-xs mb-8 md:mb-16 max-w-120">
        <p>{product.description}</p>
      </div>
      {hasMultipleVariants && (
        <div className="flex flex-col gap-8 md:gap-6 mb-4 md:mb-26">
          {materialOption && (
            <div>
              <p className="mb-4">
                Materials
                {options[materialOption.id] && (
                  <span className="text-grayscale-500 ml-6">
                    {options[materialOption.id]}
                  </span>
                )}
              </p>
              <ReactAria.Select
                selectedKey={options[materialOption.id] ?? null}
                onSelectionChange={(value) => {
                  setOptions({ [materialOption.id]: `${value}` })
                }}
                placeholder="Choose material"
                className="w-full md:w-60"
                isDisabled={!!disabled || isPending}
                aria-label="Material"
              >
                <UiSelectButton className="!h-12 px-4 gap-2 max-md:text-base">
                  <UiSelectValue />
                  <UiSelectIcon className="h-6 w-6" />
                </UiSelectButton>
                <ReactAria.Popover className="w-[--trigger-width]">
                  <UiSelectListBox>
                    {materials.map((material) => (
                      <UiSelectListBoxItem
                        key={material.id}
                        id={material.name}
                      >
                        {material.name}
                      </UiSelectListBoxItem>
                    ))}
                  </UiSelectListBox>
                </ReactAria.Popover>
              </ReactAria.Select>
            </div>
          )}
          {/* Show Color swatch picker if Color option exists and has colors */}
          {colorOption && colorsFromVariants.length > 0 && (
            <div className="mb-6">
              <p className="mb-4">
                Colors
                {options[colorOption.id] && (
                  <span className="text-grayscale-500 ml-6">
                    {options[colorOption.id]}
                  </span>
                )}
              </p>
              <ColorSwatchPicker
                colors={colorsFromVariants}
                selectedColor={options[colorOption.id] ?? null}
                onColorChange={(color) => {
                  setOptionValue(colorOption.id, color ?? undefined)
                }}
                disabled={!!disabled || isPending}
                aria-label="Color"
              />
            </div>
          )}
          {/* Show Size selector if Size option exists and has sizes */}
          {sizeOption && sizesFromVariants.length > 0 && (
            <div className="mb-6">
              <p className="mb-4">Sizes</p>
              <SizeSelector
                sizes={sizesFromVariants}
                selectedSize={options[sizeOption.id] ?? null}
                onSizeChange={(size: string | null) => {
                  setOptionValue(sizeOption.id, size ?? undefined)
                }}
                quantity={quantity}
                onQuantityChange={setQuantity}
                product={product}
                disabled={!!disabled || isPending}
                showPrices={!!customer}
                maxQuantity={itemsInStock}
                ariaLabel="Sizes"
              />
            </div>
          )}
          {showOtherOptions &&
            otherOptions.map((option) => {
              return (
                <div key={option.id}>
                  <p className="mb-4">
                    {option.title}
                    {options[option.id] && (
                      <span className="text-grayscale-500 ml-6">
                        {options[option.id]}
                      </span>
                    )}
                  </p>
                  <ReactAria.Select
                    selectedKey={options[option.id] ?? null}
                    onSelectionChange={(value) => {
                      setOptionValue(option.id, `${value}`)
                    }}
                    placeholder={`Choose ${option.title.toLowerCase()}`}
                    className="w-full md:w-60"
                    isDisabled={!!disabled || isPending}
                    aria-label={option.title}
                  >
                    <UiSelectButton className="!h-12 px-4 gap-2 max-md:text-base">
                      <UiSelectValue />
                      <UiSelectIcon className="h-6 w-6" />
                    </UiSelectButton>
                    <ReactAria.Popover className="w-[--trigger-width]">
                      <UiSelectListBox>
                        {(option.values ?? [])
                          .filter((value) => Boolean(value.value))
                          .map((value) => (
                            <UiSelectListBoxItem
                              key={value.id}
                              id={value.value}
                            >
                              {value.value}
                            </UiSelectListBoxItem>
                          ))}
                      </UiSelectListBox>
                    </ReactAria.Popover>
                  </ReactAria.Select>
                </div>
              )
            })}
        </div>
      )}
      {customer && (
        <div className="flex max-sm:flex-col gap-4">
          <NumberField
            isDisabled={
              !itemsInStock || !selectedVariant || !!disabled || isPending
            }
            value={quantity}
            onChange={setQuantity}
            minValue={1}
            maxValue={itemsInStock}
            className="w-full sm:w-35 max-md:justify-center max-md:gap-2"
            aria-label="Quantity"
          />
          <Button
            onPress={handleAddToCart}
            isDisabled={!itemsInStock || !selectedVariant || !!disabled}
            isLoading={isPending}
            className="sm:flex-1"
          >
            {!selectedVariant
              ? "Select variant"
              : !itemsInStock
                ? "Out of stock"
                : "Add to cart"}
          </Button>
        </div>
      )}
    </>
  )
}

export default withReactQueryProvider(ProductActions)
