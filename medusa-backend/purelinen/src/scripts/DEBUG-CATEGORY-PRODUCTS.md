# Debug: Products Not Showing on Category Pages

## Current Status
- ✅ Products are published (`status = 'published'`)
- ✅ Products are assigned to sales channels (Pure Linen & Linen Things)
- ✅ Products have inventory (stocked_quantity = 100)
- ✅ Products are linked to categories in `product_category_product` table
- ❌ API returns 0 products when querying by `category_id`

## API Request Being Sent
```
category_id: ['pcat_01KDYW3TCYS7RZEKTST8QMZX3R']
limit: 12
region_id: [region_id]
fields: "*variants.calculated_price,+variants.inventory_quantity"
```

## Next Steps to Debug

### 1. Check Server-Side Logs
Look for `[getProductsList] Making API request with query:` in your backend terminal to see the exact query being sent to Medusa.

### 2. Test API Directly
Try calling the Medusa API directly:
```bash
curl "http://localhost:9000/store/products?category_id[]=pcat_01KDYW3TCYS7RZEKTST8QMZX3R&limit=12&region_id=[your_region_id]"
```

### 3. Check Medusa API Response
The API might be filtering products by:
- Inventory availability (even though we set it to 100)
- Sales channel assignment
- Product status
- Region availability

### 4. Verify Category ID Format
Check if Medusa expects `category_id` as:
- Array: `category_id[]=pcat_...`
- Single value: `category_id=pcat_...`
- Different parameter name

### 5. Check Backend Logs
Look at your Medusa backend logs when the request is made to see if there are any errors or warnings.

## Quick Test Query
Run this SQL to verify products are correctly linked:
```sql
SELECT 
    p.id,
    p.title,
    p.status,
    pc.id as category_id,
    pc.handle as category_handle,
    COUNT(DISTINCT pv.id) as variants,
    COUNT(DISTINCT il.id) as inventory_levels
FROM product p
INNER JOIN product_category_product pcp ON p.id = pcp.product_id
INNER JOIN product_category pc ON pcp.product_category_id = pc.id
LEFT JOIN product_variant pv ON p.id = pv.product_id
LEFT JOIN inventory_item ii ON pv.sku = ii.sku
LEFT JOIN inventory_level il ON ii.id = il.inventory_item_id 
    AND il.location_id = 'sloc_01K3DQ8W9VYSX1ARQJ7J553CQK'
WHERE pc.handle = 'linen-tablecloths'
    AND p.status = 'published'
GROUP BY p.id, p.title, p.status, pc.id, pc.handle
ORDER BY p.title;
```

## Possible Issues
1. **Medusa API filtering**: The store API might filter out products with 0 available inventory (even if stocked_quantity > 0)
2. **Region mismatch**: Products might not be available in the requested region
3. **Sales channel**: Products might need to be explicitly available in the store's sales channel
4. **Cache**: Next.js cache might be serving stale data (we changed to `no-store` but might need to clear cache)

## Files to Check
- `/medusa-storefront/purelinen/src/lib/data/products.ts` - API query logic
- `/medusa-storefront/purelinen/src/modules/store/templates/paginated-products.tsx` - Query params
- Backend terminal logs - Actual API request/response

