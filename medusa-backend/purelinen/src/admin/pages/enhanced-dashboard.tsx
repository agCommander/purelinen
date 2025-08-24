import React, { useState, useEffect } from 'react'
import { definePageConfig } from "@medusajs/admin-sdk"
import { 
  Button, 
  Card, 
  Badge, 
  Heading,
  Text,
  Table,
  Select,
  TextInput,
  Modal,
  Alert
} from '@medusajs/ui'
import { 
  Package,
  Store,
  Tag,
  Settings,
  BarChart3,
  Plus,
  TrendingUp,
  AlertTriangle
} from '@medusajs/icons'

const EnhancedDashboardPage = () => {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    configurableProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    activeDiscounts: 0
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/admin/products')
      const data = await response.json()
      const productsData = data.products || []
      setProducts(productsData)
      
      // Calculate stats
      const configurableCount = productsData.filter((p: any) => 
        p.metadata?.product_type?.type === 'configurable'
      ).length
      
      const lowStockCount = productsData.filter((p: any) => {
        const stock = p.metadata?.shared_stock || 0
        return stock > 0 && stock <= 10
      }).length
      
      const outOfStockCount = productsData.filter((p: any) => 
        (p.metadata?.shared_stock || 0) === 0
      ).length
      
      const activeDiscountsCount = productsData.filter((p: any) => {
        const discounts = p.metadata?.discounts || []
        const now = new Date()
        return discounts.some((d: any) => {
          const startDate = new Date(d.startDate)
          const endDate = new Date(d.endDate)
          return d.active && now >= startDate && now <= endDate
        })
      }).length

      setStats({
        totalProducts: productsData.length,
        configurableProducts: configurableCount,
        lowStockProducts: lowStockCount,
        outOfStockProducts: outOfStockCount,
        activeDiscounts: activeDiscountsCount
      })
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProductType = (product: any) => {
    return product.metadata?.product_type?.type || 'simple'
  }

  const getStockStatus = (product: any) => {
    const stock = product.metadata?.shared_stock || 0
    if (stock === 0) return { status: 'out', text: 'Out of Stock', color: 'red' }
    if (stock <= 10) return { status: 'low', text: 'Low Stock', color: 'orange' }
    return { status: 'in', text: 'In Stock', color: 'green' }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Heading level="h1">Enhanced Admin Dashboard</Heading>
        <Text className="text-gray-600">Advanced e-commerce management for Pure Linen & Linen Things</Text>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalProducts}
            </div>
            <div className="text-sm text-gray-600">Total Products</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.configurableProducts}
            </div>
            <div className="text-sm text-gray-600">Configurable</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.lowStockProducts}
            </div>
            <div className="text-sm text-gray-600">Low Stock</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.outOfStockProducts}
            </div>
            <div className="text-sm text-gray-600">Out of Stock</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.activeDiscounts}
            </div>
            <div className="text-sm text-gray-600">Active Discounts</div>
          </div>
        </Card>
      </div>

      {/* Alerts */}
      {stats.lowStockProducts > 0 && (
        <Alert className="mb-6" variant="warning">
          <AlertTriangle className="w-4 h-4" />
          <Alert.Title>Low Stock Alert</Alert.Title>
          <Alert.Description>
            {stats.lowStockProducts} products are running low on stock and need attention.
          </Alert.Description>
        </Alert>
      )}

      {stats.outOfStockProducts > 0 && (
        <Alert className="mb-6" variant="error">
          <AlertTriangle className="w-4 h-4" />
          <Alert.Title>Out of Stock Alert</Alert.Title>
          <Alert.Description>
            {stats.outOfStockProducts} products are currently out of stock.
          </Alert.Description>
        </Alert>
      )}

      {/* Quick Actions */}
      <Card className="mb-6">
        <div className="p-4">
          <Heading level="h3" className="mb-4">Quick Actions</Heading>
          <div className="grid grid-cols-4 gap-4">
            <Button variant="secondary" className="h-20 flex-col">
              <Package className="w-6 h-6 mb-2" />
              <span>Product Types</span>
            </Button>
            <Button variant="secondary" className="h-20 flex-col">
              <Store className="w-6 h-6 mb-2" />
              <span>Stock Management</span>
            </Button>
            <Button variant="secondary" className="h-20 flex-col">
              <Tag className="w-6 h-6 mb-2" />
              <span>Discounts</span>
            </Button>
            <Button variant="secondary" className="h-20 flex-col">
              <Settings className="w-6 h-6 mb-2" />
              <span>Swatch Database</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Recent Products */}
      <Card>
        <div className="p-4">
          <Heading level="h3" className="mb-4">Recent Products</Heading>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Product</Table.HeaderCell>
                <Table.HeaderCell>Type</Table.HeaderCell>
                <Table.HeaderCell>Stock</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {products.slice(0, 10).map((product) => {
                const stockStatus = getStockStatus(product)
                return (
                  <Table.Row key={product.id}>
                    <Table.Cell>
                      <div>
                        <div className="font-medium">{product.title}</div>
                        <div className="text-sm text-gray-500">{product.handle}</div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={getProductType(product) === 'configurable' ? 'blue' : 'green'}>
                        {getProductType(product)}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-2">
                        <span>{product.metadata?.shared_stock || 0}</span>
                        <Badge color={stockStatus.color} size="small">
                          {stockStatus.text}
                        </Badge>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={product.status === 'published' ? 'green' : 'gray'}>
                        {product.status}
                      </Badge>
                    </Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table>
        </div>
      </Card>
    </div>
  )
}

export const config = definePageConfig({
  name: "enhanced-dashboard",
  path: "/enhanced-dashboard",
})

export default EnhancedDashboardPage 