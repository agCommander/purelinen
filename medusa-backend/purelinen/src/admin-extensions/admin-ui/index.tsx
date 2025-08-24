import React from 'react'
import { 
  Route, 
  Routes,
  useLocation,
  useNavigate
} from 'react-router-dom'
import { 
  Button, 
  Container,
  Sidebar,
  SidebarItem
} from '@medusajs/ui'
import { 
  Package,
  Store,
  Tag,
  Settings,
  BarChart3
} from '@medusajs/icons'

import ProductTypesPage from './product-types'
import SharedStockPage from './shared-stock'

const EnhancedAdminApp = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    {
      label: 'Product Types',
      icon: Package,
      path: '/enhanced/product-types'
    },
    {
      label: 'Shared Stock',
      icon: Store,
      path: '/enhanced/shared-stock'
    },
    {
      label: 'Discounts',
      icon: Tag,
      path: '/enhanced/discounts'
    },
    {
      label: 'Swatch Database',
      icon: Settings,
      path: '/enhanced/swatches'
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      path: '/enhanced/analytics'
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar className="w-64 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Enhanced Admin</h1>
          <p className="text-sm text-gray-600">Advanced e-commerce management</p>
        </div>
        
        <nav className="p-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <SidebarItem
                key={item.path}
                active={isActive}
                onClick={() => navigate(item.path)}
                className="mb-2"
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </SidebarItem>
            )
          })}
        </nav>
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Container>
          <Routes>
            <Route path="/enhanced/product-types" element={<ProductTypesPage />} />
            <Route path="/enhanced/shared-stock" element={<SharedStockPage />} />
            <Route path="/enhanced/discounts" element={<div>Discounts Page (Coming Soon)</div>} />
            <Route path="/enhanced/swatches" element={<div>Swatch Database (Coming Soon)</div>} />
            <Route path="/enhanced/analytics" element={<div>Analytics (Coming Soon)</div>} />
            <Route path="/enhanced" element={<ProductTypesPage />} />
          </Routes>
        </Container>
      </div>
    </div>
  )
}

export default EnhancedAdminApp 