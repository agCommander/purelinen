import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { 
  Button, 
  Container,
  Text,
  Heading,
  Input,
  Badge
} from "@medusajs/ui"
import { useState, useEffect } from "react"

interface Swatch {
  id: string
  name: string
  hex?: string
  rgb?: string
  description?: string
  usage_count: number
}

const SwatchWidget = ({ product }: { product: any }) => {
  const [swatches, setSwatches] = useState<Record<string, Swatch[]>>({})
  const [selectedCategory, setSelectedCategory] = useState('color')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchSwatches()
  }, [])

  const fetchSwatches = async () => {
    try {
      const response = await fetch('/api/enhanced/swatches')
      if (response.ok) {
        const data = await response.json()
        setSwatches(data.data)
      }
    } catch (error) {
      console.error('Error fetching swatches:', error)
    }
  }

  const searchSwatches = async () => {
    if (!searchQuery.trim()) {
      fetchSwatches()
      return
    }
    
    try {
      const response = await fetch(`/api/enhanced/swatches/search?query=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        // Group search results by category
        const grouped = data.data.reduce((acc: Record<string, Swatch[]>, swatch: Swatch) => {
          const category = Object.keys(swatches).find(cat => 
            swatches[cat]?.some(s => s.id === swatch.id)
          ) || 'other'
          if (!acc[category]) acc[category] = []
          acc[category].push(swatch)
          return acc
        }, {})
        setSwatches(grouped)
      }
    } catch (error) {
      console.error('Error searching swatches:', error)
    }
  }

  const getCategorySwatches = () => {
    return swatches[selectedCategory] || []
  }

  const getSwatchColor = (swatch: Swatch) => {
    if (swatch.hex) return swatch.hex
    if (swatch.rgb) return `rgb(${swatch.rgb})`
    return '#ccc'
  }

  if (!product) return null

  return (
    <Container className="p-4 border border-gray-200 rounded-lg">
      <Heading level="h3" className="text-lg font-semibold mb-4">
        Swatch Database
      </Heading>

      <div className="space-y-4">
        {/* Search and Category Selection */}
        <div className="flex gap-3">
          <Input
            placeholder="Search swatches..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button onClick={searchSwatches} size="small">
            Search
          </Button>
        </div>

        <div className="flex gap-2">
          {Object.keys(swatches).map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "primary" : "secondary"}
              size="small"
              onClick={() => setSelectedCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>

        {/* Swatches Display */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {getCategorySwatches().map((swatch) => (
            <div
              key={swatch.id}
              className="p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                // Here you could add logic to apply the swatch to the product
                console.log('Selected swatch:', swatch)
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                {swatch.hex || swatch.rgb ? (
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: getSwatchColor(swatch) }}
                  />
                ) : (
                  <div className="w-6 h-6 rounded border bg-gray-200" />
                )}
                <Text className="font-medium text-sm">{swatch.name}</Text>
              </div>
              
              {swatch.description && (
                <Text className="text-xs text-gray-600 mb-2">
                  {swatch.description}
                </Text>
              )}
              
              <div className="flex items-center justify-between">
                <Badge color="blue" className="text-xs">
                  {swatch.usage_count} uses
                </Badge>
                {swatch.hex && (
                  <Text className="text-xs text-gray-500">{swatch.hex}</Text>
                )}
              </div>
            </div>
          ))}
        </div>

        {getCategorySwatches().length === 0 && (
          <div className="p-4 text-center text-gray-500">
            <Text>No swatches found in this category</Text>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-4 border-t">
          <Text className="text-sm font-medium mb-2">Quick Actions:</Text>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              size="small"
              onClick={() => window.open('/api/enhanced/swatches/summary', '_blank')}
            >
              View Summary
            </Button>
            <Button 
              variant="secondary" 
              size="small"
              onClick={() => window.open('/enhanced-admin.html', '_blank')}
            >
              Full Swatch Manager
            </Button>
          </div>
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default SwatchWidget
