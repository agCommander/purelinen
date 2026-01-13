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

type FilterPanelProps = {
  isOpen: boolean
  onClose: () => void
  productTypes: Record<string, string>
  colorFilterGroups: Array<{
    groupName: string
    hexCode: string
    colorCount: number
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
    if (selectedColorGroups.includes(groupName)) {
      onColorGroupsChange(selectedColorGroups.filter((g) => g !== groupName))
    } else {
      onColorGroupsChange([...selectedColorGroups, groupName])
    }
  }

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
              selectedKey={selectedProductType ?? null}
              onSelectionChange={(value) => {
                onProductTypeChange(value ? String(value) : null)
              }}
              placeholder="All Product Types"
              className="w-full"
            >
              <UiSelectButton className="!h-12 px-4 gap-2">
                <UiSelectValue />
                <UiSelectIcon className="h-6 w-6" />
              </UiSelectButton>
              <ReactAria.Popover className="w-[--trigger-width]">
                <UiSelectListBox>
                  <UiSelectListBoxItem id={null}>All Product Types</UiSelectListBoxItem>
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
            <label className="block text-sm font-medium mb-4">Colors</label>
            <div className="flex flex-wrap gap-4">
              {colorFilterGroups.map((group) => {
                const isSelected = selectedColorGroups.includes(group.groupName)
                return (
                  <button
                    key={group.groupName}
                    type="button"
                    onClick={() => handleColorGroupToggle(group.groupName)}
                    className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                      isSelected
                        ? "border-black scale-110"
                        : "border-grayscale-300 hover:border-grayscale-400"
                    }`}
                    style={{ backgroundColor: group.hexCode }}
                    aria-label={`Select ${group.groupName}`}
                    title={group.groupName}
                  />
                )
              })}
            </div>
            {selectedColorGroups.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-grayscale-600 mb-2">Selected:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedColorGroups.map((group) => (
                    <span
                      key={group}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-grayscale-100 text-xs rounded"
                    >
                      {group}
                      <button
                        onClick={() => handleColorGroupToggle(group)}
                        className="hover:text-red-500"
                        aria-label={`Remove ${group}`}
                      >
                        <Icon name="close" className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Apply/Clear buttons */}
          <div className="flex gap-4 pt-4 border-t border-grayscale-200">
            <button
              onClick={() => {
                onProductTypeChange(null)
                onColorGroupsChange([])
              }}
              className="flex-1 px-4 py-2 border border-grayscale-300 rounded hover:bg-grayscale-50"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
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
