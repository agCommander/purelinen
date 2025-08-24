# Customer Groups & Sales Channels Setup

## Overview

This system creates two distinct customer experiences:

### 🏢 **Pure Linen (B2B)**
- **Customer Group**: B2B Clients
- **Sales Channel**: Pure Linen B2B
- **Features**:
  - ❌ No prices visible (wholesale)
  - ❌ No cart buttons
  - ✅ Requires login
  - ✅ Wholesale pricing
  - ✅ Bulk ordering capabilities

### 🛍️ **Linen Things (Retail)**
- **Customer Group**: Retail Customers  
- **Sales Channel**: Linen Things Retail
- **Features**:
  - ✅ Prices visible
  - ✅ Cart and checkout
  - ❌ No login required
  - ✅ Standard retail pricing

## How It Works

### 1. **Customer Groups**
- **B2B Clients**: Wholesale customers who need login
- **Retail Customers**: End consumers with public access

### 2. **Sales Channels**
- **Pure Linen B2B**: B2B storefront (hide prices/cart)
- **Linen Things Retail**: Retail storefront (show prices/cart)

### 3. **Price Lists**
- **B2B Wholesale**: Special pricing for business customers
- **Retail Pricing**: Standard consumer pricing

### 4. **Metadata Control**
Each customer group and sales channel has metadata that controls:
- `hide_prices`: Whether to show product prices
- `hide_cart`: Whether to show cart functionality
- `requires_login`: Whether authentication is required

## Frontend Implementation

### Pure Linen B2B Storefront
```typescript
// Check if user is in B2B group
if (customer?.groups?.some(g => g.handle === 'b2b-clients')) {
  // Hide prices and cart
  // Show wholesale information
  // Require login
}
```

### Linen Things Retail Storefront
```typescript
// Show prices and cart for everyone
// No login required
// Standard e-commerce experience
```

## Running the Setup

1. **Start Medusa server**: `npm run dev`
2. **Run setup script**: `npx medusa exec src/scripts/setup-customer-groups-v2.ts`
3. **Verify in admin panel**: Check Customer Groups, Sales Channels, and Price Lists
4. **Assign products**: Link products to appropriate sales channels

## Benefits

✅ **Clean Separation**: B2B and retail are completely separate
✅ **Flexible Pricing**: Different pricing per customer group  
✅ **UI Control**: Hide/show elements based on customer type
✅ **Built-in Security**: Login requirements for B2B
✅ **Scalable**: Easy to add more customer groups later

## Next Steps

1. Run the setup script
2. Configure your storefronts to check customer groups
3. Set up product assignments to sales channels
4. Configure pricing rules in each price list
5. Test both experiences
