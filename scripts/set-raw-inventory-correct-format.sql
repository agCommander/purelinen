-- Script to set raw_stocked_quantity and raw_reserved_quantity in the correct format
-- Format: {"value": "number_as_string", "precision": 20}
-- This is the format Medusa 2.x expects for these fields

\set location_id 'sloc_01K3DQ8W9VYSX1ARQJ7J553CQK'

-- Update raw_stocked_quantity with the correct format
UPDATE inventory_level il
SET raw_stocked_quantity = jsonb_build_object(
    'value', il.stocked_quantity::text,
    'precision', 20
)
WHERE il.location_id = :'location_id'
    AND (il.raw_stocked_quantity IS NULL OR il.raw_stocked_quantity != jsonb_build_object('value', il.stocked_quantity::text, 'precision', 20));

-- Update raw_reserved_quantity with the correct format
UPDATE inventory_level il
SET raw_reserved_quantity = jsonb_build_object(
    'value', il.reserved_quantity::text,
    'precision', 20
)
WHERE il.location_id = :'location_id'
    AND (il.raw_reserved_quantity IS NULL OR il.raw_reserved_quantity != jsonb_build_object('value', il.reserved_quantity::text, 'precision', 20));

-- Verify the update
SELECT 
    COUNT(*) as total_levels,
    COUNT(CASE WHEN raw_stocked_quantity IS NOT NULL THEN 1 END) as with_raw_stocked,
    COUNT(CASE WHEN raw_reserved_quantity IS NOT NULL THEN 1 END) as with_raw_reserved
FROM inventory_level
WHERE location_id = :'location_id';

-- Show a sample to verify format
SELECT 
    il.inventory_item_id,
    il.stocked_quantity,
    il.reserved_quantity,
    il.raw_stocked_quantity,
    il.raw_reserved_quantity
FROM inventory_level il
WHERE il.location_id = :'location_id'
    AND il.raw_stocked_quantity IS NOT NULL
LIMIT 3;


