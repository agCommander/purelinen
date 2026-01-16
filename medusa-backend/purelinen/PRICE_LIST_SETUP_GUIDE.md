# Price List Setup Guide

## Issues and Solutions

### Issue 1: No Metadata Field in Admin UI

**Problem**: The Medusa admin UI doesn't expose a `metadata` field when creating Price Lists.

**Solution**: Add metadata via API after creating the Price List:

```bash
# Example: Add metadata to a Price List
curl -X PATCH http://localhost:9000/admin/price-lists/{price_list_id} \
  -H "Authorization: Bearer {your_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "metadata": {
      "store": "purelinen",
      "pricing_type": "wholesale",
      "requires_login": true
    }
  }'
```

Or use the Medusa Admin API SDK in a script.

### Issue 2: "no price set exists for variants" Error

**Problem**: This error occurs when trying to add variant prices to a Price List, but the variants don't have base prices set first.

**Root Cause**: In Medusa, variants must have **base prices** before they can be added to Price Lists. Price Lists are meant to override or supplement base prices, not replace them entirely.

**Solution**: 

1. **First, ensure all variants have base prices:**

   Run the script to set base prices for all variants:
   ```bash
   npx medusa exec src/scripts/set-base-prices-for-variants.ts
   ```

   This script will:
   - Find all variants without prices
   - Set a default base price ($100.00 USD) for each variant
   - Skip variants that already have prices

2. **Then, create Price Lists and add variants:**

   - Go to Admin → Pricing → Price Lists
   - Create a new Price List
   - In the "Products" tab, add products (variants must have base prices!)
   - In the "Prices" tab, set override prices for each variant

## Step-by-Step Price List Creation

### For Pure Linen Wholesale Pricing:

1. **Ensure variants have base prices** (run script above)

2. **Create Price List:**
   - Name: `Pure Linen Wholesale Pricing`
   - Type: `Sale`
   - Status: `Active`
   - Customer Groups: Select `B2B Clients` (if created)
   - Start/End Date: Leave empty (permanent)

3. **Add Products:**
   - Go to "Products" tab
   - Add products that contain variants you want to price
   - Variants must have base prices set!

4. **Add Prices:**
   - Go to "Prices" tab
   - Expand each product to see variants
   - Click "Edit Prices" for each variant
   - Enter wholesale prices for each currency/region
   - Save

5. **Add Metadata (via API):**
   ```bash
   PATCH /admin/price-lists/{id}
   {
     "metadata": {
       "store": "purelinen",
       "pricing_type": "wholesale",
       "requires_login": true
     }
   }
   ```

### For Linen Things Retail Pricing:

Same steps as above, but:
- Name: `Linen Things Retail Pricing`
- Customer Groups: None (available to all)
- Metadata: `{ "store": "linenthings", "pricing_type": "retail", "permanent": true }`

### For Linen Things Discount Pricing:

Same steps as above, but:
- Name: `Linen Things Discount Pricing`
- Customer Groups: None
- Start Date: `2026-01-01T00:00:00Z`
- End Date: `2026-03-03T23:59:59Z`
- Metadata: `{ "store": "linenthings", "pricing_type": "discount", "temporary": true }`

## Troubleshooting

### UI Error: "Cannot read properties of undefined (reading 'reduce')" in product-prices component

**Cause**: This error occurs when the Medusa admin UI tries to edit variant prices, but the price data structure doesn't match what the component expects. This is common after data migrations (like from Magento).

**Possible Causes**:
1. Variants have `price_set_id` but the `prices` array is missing or malformed
2. Prices exist in the database but aren't properly loaded in the variant object
3. Price structure from migration doesn't match Medusa's expected format

**Diagnosis**:
Run the diagnostic script to check your price structure:
```bash
npx medusa exec src/scripts/check-price-structure.ts
```

**Fix Options**:

1. **Check Price Structure**:
   - Run the diagnostic script above
   - Verify that variants have both `price_set_id` AND a `prices` array
   - Ensure prices have `amount` and `currency_code` fields

2. **If prices are missing from variant object**:
   - Prices might exist in the database but not be loaded
   - Try refreshing the product/variant in admin
   - Check if the `variants.prices` relation is being loaded correctly

3. **If price structure is wrong**:
   - Prices might need to be re-migrated or fixed
   - Contact Medusa support or check migration documentation
   - Consider using the Medusa Admin API directly instead of UI

4. **Workaround**:
   - Use Price Lists to set prices instead of editing variant prices directly
   - Price Lists can override base prices without editing variants
   - This avoids the UI component issue entirely

### "no price set exists for variants" Error

**Cause**: Variants don't have base prices set.

**Fix**: 
1. Run `npx medusa exec src/scripts/set-base-prices-for-variants.ts`
2. Verify variants have prices: Go to Admin → Products → [Product] → Variants
3. If prices are missing, set them manually or update the script
4. **Note**: If you have prices from Magento migration, the script will skip variants that already have prices

### Variants Not Showing in Price List

**Cause**: Variants don't have base prices.

**Fix**: Ensure variants have base prices before adding products to Price List.

### Prices Not Appearing on Storefront

**Possible Causes**:
1. Price List is not active
2. Date range is incorrect (for discount pricing)
3. Customer group mismatch
4. Sales channel not configured correctly
5. Variant doesn't have base price (Price Lists supplement, not replace)

**Fix**: Check each of these in order.

## Notes

- **Base prices are required**: Variants must have base prices before adding to Price Lists
- **Price Lists supplement base prices**: They don't replace them entirely
- **Metadata is API-only**: Cannot be set via admin UI
- **Date ranges work automatically**: Discount pricing activates/deactivates based on dates
