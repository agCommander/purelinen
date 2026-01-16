# Sales Channel Pricing Setup

## Overview

This system enables different pricing strategies for different stores (Sales Channels) sharing the same database:

- **Pure Linen (B2B)**: Wholesale pricing, only visible to logged-in users
- **Linen Things (Retail)**: Retail pricing, always visible
- **Linen Things (Discount)**: Temporary discount pricing with date ranges

## Architecture

### 1. Sales Channels
- **Pure Linen B2B**: Wholesale storefront
- **Linen Things Retail**: Retail storefront

### 2. Price Lists

#### a) Pure Linen Wholesale Pricing
- **Type**: `sale`
- **Status**: `active`
- **Customer Groups**: B2B Clients (requires login)
- **Purpose**: Wholesale prices only visible to logged-in B2B customers
- **Store**: Pure Linen

#### b) Linen Things Retail Pricing
- **Type**: `sale`
- **Status**: `active`
- **Customer Groups**: None (available to all)
- **Date Range**: None (permanent)
- **Purpose**: Standard retail pricing always visible
- **Store**: Linen Things

#### c) Linen Things Discount Pricing
- **Type**: `sale`
- **Status**: `active`
- **Customer Groups**: None (available to all)
- **Date Range**: `starts_at` to `ends_at` (e.g., Jan 1 - March 3, 2026)
- **Purpose**: Temporary promotional pricing
- **Store**: Linen Things

## How It Works

### Price Resolution Priority

When a customer views a product, Medusa resolves prices in this order:

1. **Active Price Lists** (with date ranges if applicable)
   - Discount Price List (if within date range)
   - Linen Things only
   - Retail Price List (permanent)
   - Linen Things only
   - Wholesale Price List (if customer is logged in and in B2B group)
   - Pure Linen only

2. **Base Variant Prices** (fallback)

### Date-Based Pricing

Price Lists with `starts_at` and `ends_at` automatically:
- ✅ Activate when `starts_at` date is reached
- ✅ Deactivate when `ends_at` date passes
- ✅ Override base prices when active
- ✅ Fall back to retail/base prices when inactive

## Setup Instructions

### 1. Run the Setup Script

```bash
npx medusa exec src/scripts/setup-sales-channel-pricing.ts
```

This will:
- Find existing Sales Channels
- Create/update Customer Groups
- Create three Price Lists:
  - Pure Linen Wholesale Pricing
  - Linen Things Retail Pricing
  - Linen Things Discount Pricing (with date range)

### 2. Add Prices to Price Lists

#### Option A: Via Admin Panel
1. Go to **Pricing** → **Price Lists**
2. Select a Price List
3. Add prices for each variant
4. Prices can be added in bulk using the variant management tools

#### Option B: Via API/Script
```typescript
await priceListService.addPrices(priceListId, [
  {
    variant_id: "variant_123",
    amount: 10000, // $100.00 in cents
    currency_code: "usd"
  }
])
```

### 3. Configure Storefronts

#### Pure Linen Storefront
- Use Sales Channel: `Pure Linen B2B`
- Require login to view prices
- Show wholesale prices from "Pure Linen Wholesale Pricing" Price List
- Hide prices for non-logged-in users

#### Linen Things Storefront
- Use Sales Channel: `Linen Things Retail`
- Show prices to everyone
- Display retail prices from "Linen Things Retail Pricing" Price List
- Automatically show discount prices during active date ranges

## Managing Discount Pricing

### Creating a New Discount Period

1. **Create a new Price List**:
   ```typescript
   await priceListService.create({
     name: "Linen Things Summer Sale 2026",
     type: "sale",
     status: "active",
     starts_at: new Date("2026-06-01T00:00:00Z"),
     ends_at: new Date("2026-08-31T23:59:59Z"),
     metadata: {
       store: "linenthings",
       pricing_type: "discount"
     }
   })
   ```

2. **Add discount prices** to the Price List

3. **Prices automatically activate/deactivate** based on dates

### Updating Existing Discount Dates

```typescript
await priceListService.update(priceListId, {
  starts_at: new Date("2026-01-15T00:00:00Z"), // Extended start date
  ends_at: new Date("2026-03-15T23:59:59Z")    // Extended end date
})
```

## Best Practices

1. **Base Prices**: Always set base variant prices as fallback
2. **Price Lists**: Use Price Lists for store-specific or promotional pricing
3. **Date Ranges**: Set clear start/end dates for promotions
4. **Testing**: Test price resolution before going live
5. **Monitoring**: Monitor active Price Lists to ensure correct pricing

## Troubleshooting

### Prices Not Showing
- Check Sales Channel association
- Verify Price List status is `active`
- Check date ranges (if applicable)
- Verify customer is in correct Customer Group (for wholesale)

### Wrong Prices Displaying
- Check Price List priority (discount > retail > wholesale > base)
- Verify date ranges are correct
- Check Sales Channel configuration

### Discount Not Activating
- Verify `starts_at` date has passed
- Check `ends_at` date hasn't passed
- Ensure Price List status is `active`
- Verify prices are added to the Price List
