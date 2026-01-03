-- Comprehensive script to ensure ALL products have inventory
-- This will:
-- 1. Create inventory items for variants that don't have them (via SKU)
-- 2. Create inventory levels for all inventory items at the location
-- 3. Set all inventory to 100

\set location_id 'sloc_01K3DQ8W9VYSX1ARQJ7J553CQK'

-- Step 1: Create inventory items for variants that don't have matching inventory items
-- (This handles cases where variants exist but inventory items don't)
INSERT INTO inventory_item (id, sku, created_at, updated_at)
SELECT DISTINCT
    'invitem_' || SUBSTRING(MD5(RANDOM()::TEXT || pv.id::TEXT) FROM 1 FOR 27),
    COALESCE(pv.sku, 'SKU-' || pv.id),
    NOW(),
    NOW()
FROM product_variant pv
WHERE pv.sku IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM inventory_item ii WHERE ii.sku = pv.sku
    )
ON CONFLICT (sku) DO NOTHING;

-- Step 2: Update existing inventory levels to 100
UPDATE inventory_level
SET 
    stocked_quantity = 100,
    reserved_quantity = 0,
    updated_at = NOW()
WHERE location_id = :'location_id';

-- Step 3: Create inventory levels for ALL inventory items that don't have them at this location
INSERT INTO inventory_level (id, inventory_item_id, location_id, stocked_quantity, reserved_quantity, created_at, updated_at)
SELECT 
    'invlevel_' || SUBSTRING(MD5(RANDOM()::TEXT || ii.id::TEXT || :'location_id') FROM 1 FOR 27),
    ii.id,
    :'location_id',
    100,
    0,
    NOW(),
    NOW()
FROM inventory_item ii
WHERE NOT EXISTS (
    SELECT 1 FROM inventory_level il 
    WHERE il.inventory_item_id = ii.id 
    AND il.location_id = :'location_id'
);

-- Step 4: Verify results for the Tablecloths category
SELECT 'Verification - Products in Tablecloths category:' as info;
SELECT 
    p.id,
    p.title,
    COUNT(DISTINCT pv.id) as variant_count,
    COUNT(DISTINCT ii.id) as inventory_item_count,
    COUNT(DISTINCT il.id) as inventory_level_count,
    SUM(il.stocked_quantity) as total_stock
FROM product p
INNER JOIN product_category_product pcp ON p.id = pcp.product_id
INNER JOIN product_category pc ON pcp.product_category_id = pc.id
LEFT JOIN product_variant pv ON p.id = pv.product_id
LEFT JOIN inventory_item ii ON pv.sku = ii.sku
LEFT JOIN inventory_level il ON ii.id = il.inventory_item_id AND il.location_id = :'location_id'
WHERE pc.handle = 'linen-tablecloths'
GROUP BY p.id, p.title
ORDER BY p.title;

-- Step 5: Summary
SELECT 'Summary:' as info;
SELECT 
    COUNT(DISTINCT pv.id) as total_variants,
    COUNT(DISTINCT ii.id) as variants_with_inventory_items,
    COUNT(DISTINCT il.id) as variants_with_inventory_levels,
    COUNT(DISTINCT CASE WHEN il.stocked_quantity > 0 THEN pv.id END) as variants_with_stock
FROM product_variant pv
LEFT JOIN inventory_item ii ON pv.sku = ii.sku
LEFT JOIN inventory_level il ON ii.id = il.inventory_item_id AND il.location_id = :'location_id';

