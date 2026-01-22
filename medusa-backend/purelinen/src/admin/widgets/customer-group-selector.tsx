"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { sdk } from "../lib/sdk"

/**
 * Customer Group Selector Widget
 * Adds a customer group selector to the customer form
 */
export function CustomerGroupSelector({ customerId }: { customerId?: string }) {
  const queryClient = useQueryClient()
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([])

  // Fetch available customer groups
  const { data: customerGroups, isLoading } = useQuery({
    queryKey: ["customer-groups"],
    queryFn: async () => {
      const response = await fetch("/admin/customer-groups")
      if (!response.ok) {
        throw new Error("Failed to fetch customer groups")
      }
      const data = await response.json()
      return data.customer_groups || []
    },
  })

  // Fetch customer's current groups if editing
  const { data: customerGroupsData } = useQuery({
    queryKey: ["customer-groups", customerId],
    queryFn: async () => {
      if (!customerId) return null
      const response = await fetch(`/admin/customers/${customerId}/groups`)
      if (!response.ok) {
        return null
      }
      const data = await response.json()
      return data.customer_groups || []
    },
    enabled: !!customerId,
  })

  // Set initial selected groups
  useEffect(() => {
    if (customerGroupsData) {
      setSelectedGroupIds(customerGroupsData.map((g: any) => g.id))
    }
  }, [customerGroupsData])

  // Update customer groups mutation
  const updateGroupsMutation = useMutation({
    mutationFn: async (groupIds: string[]) => {
      if (!customerId) return
      const response = await fetch(`/admin/customers/${customerId}/groups`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ group_ids: groupIds }),
      })
      if (!response.ok) {
        throw new Error("Failed to update customer groups")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-groups", customerId] })
      queryClient.invalidateQueries({ queryKey: ["customers"] })
    },
  })

  const handleGroupChange = (groupId: string, checked: boolean) => {
    const newGroupIds = checked
      ? [...selectedGroupIds, groupId]
      : selectedGroupIds.filter((id) => id !== groupId)
    
    setSelectedGroupIds(newGroupIds)
    
    // Auto-save if editing existing customer
    if (customerId) {
      updateGroupsMutation.mutate(newGroupIds)
    }
  }

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading customer groups...</div>
  }

  if (!customerGroups || customerGroups.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No customer groups available. Create groups first.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Customer Groups
      </label>
      <div className="space-y-2">
        {customerGroups.map((group: any) => (
          <label
            key={group.id}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedGroupIds.includes(group.id)}
              onChange={(e) => handleGroupChange(group.id, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{group.name}</span>
            {group.handle && (
              <span className="text-xs text-gray-500">({group.handle})</span>
            )}
          </label>
        ))}
      </div>
      {updateGroupsMutation.isPending && (
        <p className="text-xs text-gray-500">Saving...</p>
      )}
      {updateGroupsMutation.isError && (
        <p className="text-xs text-red-500">
          Failed to update customer groups
        </p>
      )}
    </div>
  )
}
