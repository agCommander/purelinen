# Setting Up Customer Groups

## Quick Start

1. **Make sure your Medusa backend is running:**
   ```bash
   ./start-be-dev.sh
   ```

2. **Run the setup script:**
   ```bash
   cd medusa-backend/purelinen
   npx medusa exec ./src/scripts/setup-customer-groups-v2.ts
   ```

## What Gets Created

The script creates:

1. **Customer Groups:**
   - `B2B Clients` (handle: `b2b-clients`) - For Pure Linen wholesale customers
   - `Retail Customers` (handle: `retail-customers`) - For Linen Things retail customers

2. **Sales Channels:**
   - `Pure Linen B2B` (handle: `purelinen-b2b`)
   - `Linen Things Retail` (handle: `linenthings-retail`)

3. **Price Lists:**
   - `B2B Wholesale Pricing` - Linked to B2B customer group
   - `Retail Pricing` - Linked to Retail customer group

## Viewing Customer Groups in Admin

Customer Groups are available in the Medusa Admin panel:

1. Go to: **Settings → Customer Groups**
2. Or navigate to: `http://localhost:9000/app/settings/customer-groups`

If you don't see them:
- Make sure the script ran successfully
- Check the console output for any errors
- Customer groups might be under a different menu (Settings → Customers → Groups)

## Assigning Customers to Groups

After creating customer groups, you can assign customers:

1. Go to **Customers** in the admin panel
2. Edit a customer
3. Assign them to a customer group (B2B Clients or Retail Customers)

## Using Customer Groups in Your Storefront

Check customer groups in your frontend code:

```typescript
// Check if customer is in B2B group
if (customer?.groups?.some(g => g.handle === 'b2b-clients')) {
  // Hide prices and cart for B2B
  // Show wholesale information
}
```

## Troubleshooting

**Script fails with "Cannot resolve customerGroupService":**
- Make sure Medusa backend is running
- Check that you're running from `medusa-backend/purelinen/` directory

**Customer Groups not visible in admin:**
- Refresh the admin panel
- Check browser console for errors
- Try accessing directly: `/app/settings/customer-groups`

**Groups already exist:**
- The script checks for existing groups and won't create duplicates
- It will show a message if groups already exist
