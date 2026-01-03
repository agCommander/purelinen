-- Simple SQL Script to set inventory to 100 for all product variants
-- Run this script in your PostgreSQL database

-- Step 1: Find the default location ID (check your stock_location table first)
-- You can run this to see available locations:
-- SELECT id, name FROM stock_location;

-- Step 2: Set inventory levels to 100 for all existing inventory items
UPDATE inventory_level
SET 
    stocked_quantity = 100,
    reserved_quantity = 0,
    updated_at = NOW()
WHERE location_id = 'sloc_01K3DQ8W9VYSX1ARQJ7J553CQK';

-- Step 3: Insert inventory levels for variants that don't have them yet
-- Link variants to inventory items via SKU
DO $$
DECLARE
    default_loc_id TEXT;
BEGIN
    -- Use the actual location ID
    default_loc_id := 'sloc_01K3DQ8W9VYSX1ARQJ7J553CQK';
    
    -- Insert inventory levels by matching variants to inventory items via SKU
    -- Only insert for inventory items that don't already have a level at this location
    INSERT INTO inventory_level (id, inventory_item_id, location_id, stocked_quantity, reserved_quantity, created_at, updated_at)
    SELECT 
        'invlevel_' || SUBSTRING(MD5(RANDOM()::TEXT || ii.id::TEXT || default_loc_id) FROM 1 FOR 27),
        ii.id,
        default_loc_id,
        100,
        0,
        NOW(),
        NOW()
    FROM inventory_item ii
    WHERE ii.sku IS NOT NULL
        AND EXISTS (SELECT 1 FROM product_variant pv WHERE pv.sku = ii.sku)
        AND NOT EXISTS (
            SELECT 1 FROM inventory_level il 
            WHERE il.inventory_item_id = ii.id 
            AND il.location_id = default_loc_id
        );
    
    RAISE NOTICE 'Inventory set to 100 for all variants at location: %', default_loc_id;
END $$;

-- Step 4: Verify results
SELECT 
    COUNT(DISTINCT pv.id) as total_variants,
    COUNT(DISTINCT il.id) as variants_with_inventory,
    SUM(il.stocked_quantity) as total_stock
FROM product_variant pv
INNER JOIN inventory_item ii ON pv.sku = ii.sku
LEFT JOIN inventory_level il ON ii.id = il.inventory_item_id
WHERE il.location_id = 'sloc_01K3DQ8W9VYSX1ARQJ7J553CQK';

