-- SQL Script to set inventory to 100 for all product variants
-- This script will:
-- 1. Create inventory items for variants that don't have them
-- 2. Set inventory levels to 100 for all variants at the default location

-- First, let's find the default location ID (usually 'loc_default' or similar)
-- You may need to adjust this based on your actual location ID

-- Step 1: Ensure all variants have inventory_item_id
-- If variants don't have inventory_item_id, we need to create inventory items first
-- This is typically handled by Medusa when variants are created, but we'll check

-- Step 2: Create inventory items for variants that don't have them
INSERT INTO inventory_item (id, sku, created_at, updated_at)
SELECT 
    'invitem_' || SUBSTRING(MD5(RANDOM()::TEXT || pv.id::TEXT) FROM 1 FOR 27),
    COALESCE(pv.sku, 'SKU-' || pv.id),
    NOW(),
    NOW()
FROM product_variant pv
LEFT JOIN inventory_item ii ON pv.inventory_item_id = ii.id
WHERE pv.inventory_item_id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 3: Update variants to link to their inventory items
UPDATE product_variant pv
SET inventory_item_id = (
    SELECT id FROM inventory_item 
    WHERE sku = COALESCE(pv.sku, 'SKU-' || pv.id)
    LIMIT 1
)
WHERE pv.inventory_item_id IS NULL;

-- Step 4: Get or create the default location (adjust location_id if needed)
-- Common default location IDs: 'loc_default', 'default_location', or check your stock_location table
DO $$
DECLARE
    default_location_id TEXT;
BEGIN
    -- Try to find the default location
    SELECT id INTO default_location_id 
    FROM stock_location 
    WHERE name = 'Default Location' OR name = 'default' OR id = 'loc_default'
    LIMIT 1;
    
    -- If no location exists, create one
    IF default_location_id IS NULL THEN
        default_location_id := 'loc_default';
        INSERT INTO stock_location (id, name, created_at, updated_at)
        VALUES (default_location_id, 'Default Location', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
    END IF;
    
    -- Step 5: Set inventory levels to 100 for all variants
    INSERT INTO inventory_level (id, inventory_item_id, location_id, stocked_quantity, reserved_quantity, created_at, updated_at)
    SELECT 
        'invlevel_' || SUBSTRING(MD5(RANDOM()::TEXT || pv.inventory_item_id::TEXT || default_location_id) FROM 1 FOR 27),
        pv.inventory_item_id,
        default_location_id,
        100,  -- stocked_quantity
        0,    -- reserved_quantity
        NOW(),
        NOW()
    FROM product_variant pv
    WHERE pv.inventory_item_id IS NOT NULL
    ON CONFLICT (inventory_item_id, location_id) 
    DO UPDATE SET
        stocked_quantity = 100,
        reserved_quantity = 0,
        updated_at = NOW();
END $$;

-- Verify the update
SELECT 
    COUNT(*) as total_variants,
    COUNT(pv.inventory_item_id) as variants_with_inventory_item,
    COUNT(il.id) as variants_with_inventory_level
FROM product_variant pv
LEFT JOIN inventory_level il ON pv.inventory_item_id = il.inventory_item_id;

