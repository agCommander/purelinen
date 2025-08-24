# Enhanced Medusa Admin System

This enhanced admin system extends Medusa's default functionality with Magento-like features including configurable products, advanced stock management, and comprehensive discount systems.

## 🚀 Features

### 1. Product Type System
- **Simple Products**: Standard Medusa products
- **Configurable Products**: Products with multiple options (size, color, etc.)
- **Grouped Products**: Bundles of multiple products
- **Bundle Products**: Customizable product combinations

### 2. Advanced Stock Management
- **Multi-Store Inventory**: Track stock per storefront
- **Stock Level Monitoring**: High/Medium/Low/Out of Stock indicators
- **Store Status Control**: Enable/disable products per store
- **Bulk Stock Operations**: Update multiple products at once
- **Stock Reports**: Export comprehensive inventory reports

### 3. Discount Management
- **Date-Based Pricing**: Set start and end dates for discounts
- **Store-Specific Discounts**: Apply discounts to specific storefronts
- **Percentage & Fixed Amount**: Flexible discount types
- **Bulk Discount Operations**: Apply discounts to multiple products
- **Discount Preview**: Real-time calculation of savings

## 📁 File Structure

```
src/admin-extensions/
├── product-types/
│   ├── product-type.entity.ts      # Product type definitions
│   └── product-type.service.ts     # Product type operations
├── stock-management/
│   └── stock-management.service.ts # Stock management operations
├── discount-management/
│   └── discount-management.service.ts # Discount operations
├── api/
│   ├── index.ts                    # Main API router
│   ├── product-types.api.ts        # Product type endpoints
│   ├── stock-management.api.ts     # Stock management endpoints
│   └── discount-management.api.ts  # Discount endpoints
└── README.md                       # This documentation
```

## 🛠️ Setup

### 1. Install Dependencies
The enhanced admin system uses Medusa's built-in services and doesn't require additional dependencies.

### 2. Register API Routes
Add the following to your Medusa configuration to register the enhanced admin routes:

```typescript
// In your medusa-config.ts or main app file
import { attachEnhancedAdminRoutes } from "./src/admin-extensions/api"

// Register routes with your Express app
attachEnhancedAdminRoutes(app, container)
```

### 3. Test the System
Run the test script to verify everything is working:

```bash
npx medusa exec ./src/scripts/test-enhanced-admin.ts
```

## 📡 API Endpoints

### Product Type System

#### Get Products by Type
```
GET /product-types/:type/products
```
Returns all products of a specific type (simple, configurable, grouped, bundle).

#### Get Product Type Data
```
GET /products/:id/product-type
```
Returns the product type configuration for a specific product.

#### Set Product Type
```
POST /products/:id/product-type
```
Sets the product type and configuration for a product.

#### Create Configurable Product
```
POST /product-types/configurable
```
Creates a new configurable product with variants.

**Request Body:**
```json
{
  "productData": {
    "title": "Linen Duvet Cover",
    "handle": "linen-duvet-cover",
    "description": "Pure linen duvet cover"
  },
  "configurableOptions": {
    "attributes": ["Size", "Color"],
    "variantMatrix": [
      {
        "Size": "Single",
        "Color": "White",
        "price": 89.99,
        "sku": "duvet-single-white"
      }
    ]
  }
}
```

#### Create Grouped Product
```
POST /product-types/grouped
```
Creates a new grouped product (bundle).

#### Get/Update Variant Matrix
```
GET /products/:id/variant-matrix
PUT /products/:id/variant-matrix
```
Manage the variant matrix for configurable products.

### Stock Management

#### Get Product Stock
```
GET /products/:id/stock
```
Returns comprehensive stock information for a product across all stores.

#### Update Store Stock
```
PUT /products/:id/stores/:storeId/stock
```
Updates stock information for a specific store.

**Request Body:**
```json
{
  "stock_quantity": 50,
  "min_stock_level": 10,
  "enabled": true,
  "store_name": "Pure Linen"
}
```

#### Bulk Stock Update
```
POST /stock/bulk-update
```
Updates stock for multiple products at once.

#### Get Low Stock Products
```
GET /stock/low-stock?limit=50
```
Returns products with low or out of stock status.

#### Get Stock Summary
```
GET /stock/summary
```
Returns overall stock statistics.

#### Set Store Status
```
PUT /products/:id/stores/:storeId/status
```
Enables or disables a product for a specific store.

#### Export Stock Report
```
GET /stock/export
```
Returns a comprehensive stock report in CSV format.

### Discount Management

#### Create Discount
```
POST /discounts
```
Creates a new discount.

**Request Body:**
```json
{
  "name": "Summer Sale",
  "description": "20% off summer items",
  "discount_type": "percentage",
  "discount_value": 20,
  "start_date": "2024-06-01T00:00:00Z",
  "end_date": "2024-08-31T23:59:59Z",
  "stores": ["purelinen", "linenthings"],
  "products": ["product-id-1", "product-id-2"]
}
```

#### Get All Discounts
```
GET /discounts
```
Returns all discounts.

#### Get Active Discounts
```
GET /products/:productId/stores/:storeId/discounts
```
Returns active discounts for a specific product and store.

#### Calculate Discount Preview
```
POST /discounts/preview
```
Calculates discount preview for a product.

#### Update/Delete Discount
```
PUT /discounts/:id
DELETE /discounts/:id
```
Manage existing discounts.

#### Bulk Create Discounts
```
POST /discounts/bulk
```
Creates discounts for multiple products.

#### Get Discount Statistics
```
GET /discounts/statistics
```
Returns discount statistics.

#### Export Discount Report
```
GET /discounts/export
```
Returns a comprehensive discount report.

## 🔧 Usage Examples

### Creating a Configurable Product

```typescript
const productTypeService = new ProductTypeService(container)

const productId = await productTypeService.createConfigurableProduct(
  {
    title: "Pure Linen Duvet Cover",
    handle: "pure-linen-duvet-cover",
    description: "Luxurious pure linen duvet cover"
  },
  {
    attributes: ["Size", "Color"],
    variantMatrix: [
      { Size: "Single", Color: "White", price: 89.99, sku: "duvet-single-white" },
      { Size: "Single", Color: "Natural", price: 89.99, sku: "duvet-single-natural" },
      { Size: "Queen", Color: "White", price: 99.99, sku: "duvet-queen-white" },
      { Size: "Queen", Color: "Natural", price: 99.99, sku: "duvet-queen-natural" }
    ]
  }
)
```

### Managing Stock

```typescript
const stockService = new StockManagementService(container)

// Set stock for Pure Linen store
await stockService.updateStoreStock(productId, "purelinen", {
  stock_quantity: 50,
  min_stock_level: 10,
  enabled: true,
  store_name: "Pure Linen"
})

// Get stock information
const stockInfo = await stockService.getProductStock(productId)
console.log(`Total stock: ${stockInfo.total_stock}`)
```

### Creating Discounts

```typescript
const discountService = new DiscountManagementService(container)

const discountId = await discountService.createDiscount({
  name: "End of Season Sale",
  discount_type: "percentage",
  discount_value: 25,
  start_date: new Date(),
  end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
  stores: ["purelinen", "linenthings"],
  products: ["product-id-1", "product-id-2"]
})
```

## 🎯 Integration with Frontend

The enhanced admin system is designed to work with the HTML prototype located at:
```
public/enhanced-admin.html
```

This prototype demonstrates all the features and can be served using:
```bash
cd public && python3 -m http.server 7001
```

Then visit: `http://localhost:7001/enhanced-admin.html`

## 🔍 Testing

Run the comprehensive test suite:

```bash
npx medusa exec ./src/scripts/test-enhanced-admin.ts
```

This will test:
- Product type creation and management
- Stock management across multiple stores
- Discount creation and calculation
- Statistics and reporting

## 🚀 Next Steps

1. **Integrate with Medusa Admin**: Connect the backend services to the official Medusa admin panel
2. **Add Authentication**: Implement proper authentication for admin routes
3. **Create Storefronts**: Build the customer-facing websites using Next.js
4. **Add More Features**: Implement additional Magento-like features as needed

## 📞 Support

For questions or issues with the enhanced admin system, refer to:
- Medusa Documentation: https://docs.medusajs.com/
- Product Type System: See `product-types/` directory
- Stock Management: See `stock-management/` directory
- Discount Management: See `discount-management/` directory 