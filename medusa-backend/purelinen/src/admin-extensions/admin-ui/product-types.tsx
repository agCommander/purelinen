import React, { useState, useEffect } from 'react'
import { 
  Button, 
  Card, 
  Badge, 
  Select, 
  Modal, 
  TextInput, 
  Textarea,
  Table,
  ActionMenu
} from '@medusajs/ui'
import { 
  Plus, 
  Edit, 
  Trash, 
  Settings,
  Package,
  Tag
} from '@medusajs/icons'

interface ProductType {
  id: string
  type: 'simple' | 'configurable' | 'grouped' | 'bundle'
  title: string
  description?: string
  attributes?: string[]
  variantMatrix?: any[]
}

const ProductTypesPage = () => {
  const [products, setProducts] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [showTypeModal, setShowTypeModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/admin/products')
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProductType = async (productId: string, type: string) => {
    try {
      await fetch(`/admin/products/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata: {
            product_type: { type }
          }
        })
      })
      fetchProducts()
    } catch (error) {
      console.error('Error updating product type:', error)
    }
  }

  const getProductType = (product: any) => {
    return product.metadata?.product_type?.type || 'simple'
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      simple: 'green',
      configurable: 'blue',
      grouped: 'orange',
      bundle: 'purple'
    }
    return <Badge color={colors[type as keyof typeof colors]}>{type}</Badge>
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Product Types</h1>
          <p className="text-gray-600">Manage product types and configurations</p>
        </div>
        <Button onClick={() => setShowTypeModal(true)}>
          <Plus />
          Create Configurable Product
        </Button>
      </div>

      <Card className="mb-6">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Product Type Statistics</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {products.filter(p => getProductType(p) === 'simple').length}
              </div>
              <div className="text-sm text-gray-600">Simple Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {products.filter(p => getProductType(p) === 'configurable').length}
              </div>
              <div className="text-sm text-gray-600">Configurable</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {products.filter(p => getProductType(p) === 'grouped').length}
              </div>
              <div className="text-sm text-gray-600">Grouped</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {products.filter(p => getProductType(p) === 'bundle').length}
              </div>
              <div className="text-sm text-gray-600">Bundle</div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Products</h2>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Product</Table.HeaderCell>
                <Table.HeaderCell>Type</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {products.map((product) => (
                <Table.Row key={product.id}>
                  <Table.Cell>
                    <div>
                      <div className="font-medium">{product.title}</div>
                      <div className="text-sm text-gray-500">{product.handle}</div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {getTypeBadge(getProductType(product))}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={product.status === 'published' ? 'green' : 'gray'}>
                      {product.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Select
                      value={getProductType(product)}
                      onValueChange={(value) => updateProductType(product.id, value)}
                    >
                      <Select.Trigger>
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="simple">Simple</Select.Item>
                        <Select.Item value="configurable">Configurable</Select.Item>
                        <Select.Item value="grouped">Grouped</Select.Item>
                        <Select.Item value="bundle">Bundle</Select.Item>
                      </Select.Content>
                    </Select>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </Card>

      {/* Configurable Product Modal */}
      <Modal open={showTypeModal} onOpenChange={setShowTypeModal}>
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>Create Configurable Product</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <TextInput label="Product Title" placeholder="Enter product title" />
              <Textarea label="Description" placeholder="Enter product description" />
              <Select label="Base Product Type">
                <Select.Trigger>
                  <Select.Value placeholder="Select base product" />
                </Select.Trigger>
                <Select.Content>
                  {products.filter(p => getProductType(p) === 'simple').map(product => (
                    <Select.Item key={product.id} value={product.id}>
                      {product.title}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowTypeModal(false)}>
              Cancel
            </Button>
            <Button>Create Product</Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </div>
  )
}

export default ProductTypesPage 