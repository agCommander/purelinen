"use client"

import { useState, useEffect } from "react"
import { Icon } from "@/components/Icon"
import * as ReactAria from "react-aria-components"
import {
  UiSelectButton,
  UiSelectIcon,
  UiSelectListBox,
  UiSelectListBoxItem,
  UiSelectValue,
} from "@/components/ui/Select"
import {
  UiCheckbox,
  UiCheckboxBox,
  UiCheckboxIcon,
  UiCheckboxLabel,
} from "@/components/ui/Checkbox"

type FilterPanelProps = {
  isOpen: boolean
  onClose: () => void
  productTypes: Record<string, string>
  colorFilterGroups: Array<{
    name: string
    hexCode: string
  }>
  selectedProductType?: string | null
  selectedColorGroups?: string[]
  onProductTypeChange: (type: string | null) => void
  onColorGroupsChange: (groups: string[]) => void
}


export default function FilterPanel({
  isOpen,
  onClose,
  productTypes,
  colorFilterGroups,
  selectedProductType,
  selectedColorGroups = [],
  onProductTypeChange,
  onColorGroupsChange,
}: FilterPanelProps) {
  const [isColorAccordionOpen, setIsColorAccordionOpen] = useState(false)
  
  // Local state for filter selections (not applied until "Apply Filters" is clicked)
  const [localProductType, setLocalProductType] = useState<string | null>(selectedProductType ?? null)
  const [localColorGroups, setLocalColorGroups] = useState<string[]>(selectedColorGroups)

  // Update local state when props change (e.g., when panel opens with current filters)
  useEffect(() => {
    if (isOpen) {
      setLocalProductType(selectedProductType ?? null)
      setLocalColorGroups(selectedColorGroups)
    }
  }, [isOpen, selectedProductType, selectedColorGroups])

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const handleColorGroupToggle = (groupName: string) => {
    if (localColorGroups.includes(groupName)) {
      setLocalColorGroups(localColorGroups.filter((g) => g !== groupName))
    } else {
      setLocalColorGroups([...localColorGroups, groupName])
    }
  }

  const handleApplyFilters = () => {
    // Apply the local state to the actual filters
    onProductTypeChange(localProductType)
    onColorGroupsChange(localColorGroups)
    onClose()
  }

  const handleClearAll = () => {
    // Clear local state and apply immediately
    setLocalProductType(null)
    setLocalColorGroups([])
    onProductTypeChange(null)
    onColorGroupsChange([])
    setIsColorAccordionOpen(false)
  }

  // Split color filter groups into 2 columns
  const midPoint = Math.ceil(colorFilterGroups.length / 2)
  const leftColumnGroups = colorFilterGroups.slice(0, midPoint)
  const rightColumnGroups = colorFilterGroups.slice(midPoint)

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Panel */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto"
        style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-medium">Filters</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-grayscale-100 rounded"
              aria-label="Close filters"
            >
              <Icon name="close" className="w-6 h-6" />
            </button>
          </div>

          {/* Product Type Filter */}
          <div className="mb-8">
            <label className="block text-sm font-medium mb-4">Product Type</label>
            <ReactAria.Select
              selectedKey={localProductType ?? ""}
              onSelectionChange={(value) => {
                const newType = value && value !== "" ? String(value) : null
                setLocalProductType(newType)
                // If clearing product type, also clear color groups
                if (!newType) {
                  setLocalColorGroups([])
                  setIsColorAccordionOpen(false)
                }
              }}
              placeholder="All Product Types"
              className="w-full"
            >
              <UiSelectButton className="!h-12 px-4 gap-2">
                <UiSelectValue />
                <UiSelectIcon className="h-6 w-6" />
              </UiSelectButton>
              <ReactAria.Popover className="w-[--trigger-width]">
                <UiSelectListBox className="!max-h-none">
                  <UiSelectListBoxItem id="">All Product Types</UiSelectListBoxItem>
                  {Object.entries(productTypes).map(([value, label]) => (
                    <UiSelectListBoxItem key={value} id={value}>
                      {label}
                    </UiSelectListBoxItem>
                  ))}
                </UiSelectListBox>
              </ReactAria.Popover>
            </ReactAria.Select>
          </div>

          {/* Color Filter */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <label className={`block text-sm font-medium ${!localProductType ? "text-grayscale-400" : ""}`}>
                Colour
                {!localProductType && (
                  <span className="ml-2 text-xs text-grayscale-400 font-normal">
                    (Select a product type first)
                  </span>
                )}
              </label>
              <button
                type="button"
                onClick={() => {
                  if (localProductType) {
                    setIsColorAccordionOpen(!isColorAccordionOpen)
                  }
                }}
                disabled={!localProductType}
                className={`flex items-center justify-center w-6 h-6 rounded transition-colors ${
                  localProductType 
                    ? "hover:bg-grayscale-100 cursor-pointer" 
                    : "opacity-50 cursor-not-allowed"
                }`}
                aria-label={isColorAccordionOpen ? "Collapse colors" : "Expand colors"}
                aria-expanded={isColorAccordionOpen}
                aria-disabled={!localProductType}
              >
                <Icon 
                  name={isColorAccordionOpen ? "minus" : "plus"} 
                  className="w-4 h-4" 
                />
              </button>
            </div>
            
            {isColorAccordionOpen && localProductType && (
              <div className="mt-4 border-t border-grayscale-200 pt-4">
                {colorFilterGroups.length === 0 ? (
                  <p className="text-sm text-grayscale-600">No color groups available</p>
                ) : (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {/* Left Column */}
                    <div className="flex flex-col space-y-2">
                      {leftColumnGroups.map((group) => {
                        const isSelected = localColorGroups.includes(group.name)
                        return (
                          <label
                            key={group.name}
                            className="flex items-center gap-2 cursor-pointer hover:bg-grayscale-50 p-1 rounded -ml-1"
                          >
                            <UiCheckbox
                              value={group.name}
                              isSelected={isSelected}
                              onChange={() => handleColorGroupToggle(group.name)}
                              className="flex-shrink-0"
                            >
                              <UiCheckboxBox>
                                <UiCheckboxIcon />
                              </UiCheckboxBox>
                            </UiCheckbox>
                            <UiCheckboxLabel className="text-sm cursor-pointer flex-1">
                              {group.name}
                            </UiCheckboxLabel>
                          </label>
                        )
                      })}
                    </div>
                    
                    {/* Right Column */}
                    <div className="flex flex-col space-y-2">
                      {rightColumnGroups.map((group) => {
                        const isSelected = localColorGroups.includes(group.name)
                        return (
                          <label
                            key={group.name}
                            className="flex items-center gap-2 cursor-pointer hover:bg-grayscale-50 p-1 rounded -ml-1"
                          >
                            <UiCheckbox
                              value={group.name}
                              isSelected={isSelected}
                              onChange={() => handleColorGroupToggle(group.name)}
                              className="flex-shrink-0"
                            >
                              <UiCheckboxBox>
                                <UiCheckboxIcon />
                              </UiCheckboxBox>
                            </UiCheckbox>
                            <UiCheckboxLabel className="text-sm cursor-pointer flex-1">
                              {group.name}
                            </UiCheckboxLabel>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {!localProductType && (
              <p className="text-xs text-grayscale-500 mt-2">
                Please select a product type to filter by color
              </p>
            )}
          </div>

          {/* Apply/Clear buttons */}
          <div className="flex gap-4 pt-4 border-t border-grayscale-200">
            <button
              onClick={handleClearAll}
              className="flex-1 px-4 py-2 border border-grayscale-300 rounded hover:bg-grayscale-50"
            >
              Clear All
            </button>
            <button
              onClick={handleApplyFilters}
              className="flex-1 px-4 py-2 bg-black text-white rounded hover:bg-grayscale-800"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
