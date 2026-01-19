-- Script to link all product variants to inventory items via product_variant_inventory_item junction table
-- This fixes the issue where admin panel shows "0 available" for variants that have inventory

\set location_id 'sloc_01K3DQ8W9VYSX1ARQJ7J553CQK'

-- Step 1: Create inventory items for variants that don't have matching inventory items
-- Note: We check for existence first since there's no unique constraint on sku
INSERT INTO inventory_item (id, sku, created_at, updated_at)
SELECT DISTINCT
    'iitem_' || SUBSTRING(MD5(RANDOM()::TEXT || pv.id::TEXT || NOW()::TEXT) FROM 1 FOR 27),
    pv.sku,
    NOW(),
    NOW()
FROM product_variant pv
WHERE pv.deleted_at IS NULL
    AND pv.sku IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM inventory_item ii WHERE ii.sku = pv.sku AND ii.deleted_at IS NULL
    );

-- Step 2: Create inventory levels for inventory items that don't have them
-- First, update existing levels to 100
UPDATE inventory_level
SET 
    stocked_quantity = 100,
    reserved_quantity = 0,
    updated_at = NOW()
WHERE location_id = :'location_id';

-- Then, insert new levels for items that don't have them
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
WHERE ii.sku IS NOT NULL
    AND ii.deleted_at IS NULL
    AND EXISTS (
        SELECT 1 FROM product_variant pv 
        WHERE pv.sku = ii.sku 
        AND pv.deleted_at IS NULL
    )
    AND NOT EXISTS (
        SELECT 1 FROM inventory_level il 
        WHERE il.inventory_item_id = ii.id 
        AND il.location_id = :'location_id'
    );

-- Step 3: Link variants to inventory items through the junction table
INSERT INTO product_variant_inventory_item (id, variant_id, inventory_item_id, required_quantity, created_at, updated_at)
SELECT 
    'pvitem_' || SUBSTRING(MD5(RANDOM()::TEXT || pv.id::TEXT || ii.id::TEXT || NOW()::TEXT) FROM 1 FOR 27),
    pv.id,
    ii.id,
    1,
    NOW(),
    NOW()
FROM product_variant pv
INNER JOIN inventory_item ii ON pv.sku = ii.sku
WHERE pv.deleted_at IS NULL
    AND pv.sku IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM product_variant_inventory_item pvi 
        WHERE pvi.variant_id = pv.id 
        AND pvi.inventory_item_id = ii.id
        AND pvi.deleted_at IS NULL
    )
ON CONFLICT (variant_id, inventory_item_id) DO NOTHING;

-- Step 4: Verify the results
SELECT 
    'Verification' as step,
    COUNT(DISTINCT pv.id) as total_variants,
    COUNT(DISTINCT pvi.variant_id) as linked_variants,
    COUNT(DISTINCT CASE WHEN il.stocked_quantity > 0 THEN pvi.variant_id END) as variants_with_stock
FROM product_variant pv
LEFT JOIN product_variant_inventory_item pvi ON pv.id = pvi.variant_id AND pvi.deleted_at IS NULL
LEFT JOIN inventory_item ii ON pvi.inventory_item_id = ii.id
LEFT JOIN inventory_level il ON ii.id = il.inventory_item_id AND il.location_id = :'location_id'
WHERE pv.deleted_at IS NULL;

-- Step 5: Show unlinked variants (should be 0 after running this script)
SELECT 
    'Unlinked Variants' as info,
    COUNT(*) as count
FROM product_variant pv
WHERE pv.deleted_at IS NULL
    AND NOT EXISTS (
        SELECT 1 FROM product_variant_inventory_item pvi 
        WHERE pvi.variant_id = pv.id 
        AND pvi.deleted_at IS NULL
    );

