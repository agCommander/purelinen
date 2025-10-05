-- Fix the collection titles issue properly
-- The previous script used MIN(title) which caused all collections to have the same title
-- Let's recreate them properly with the FIRST title alphabetically for each handle pattern

-- First, remove all the incorrectly created collections (keep your original 2)
DELETE FROM product_collection 
WHERE id NOT IN ('pcol_01K5320YT0E4FC27NSX51C97Z4', 'pcol_01K531XJHP66SQ6VYSSVCMME35');

-- Reset all products to have no collection
UPDATE product SET collection_id = NULL WHERE deleted_at IS NULL;

-- Now recreate collections with proper titles using MIN(title) to get first alphabetically
INSERT INTO product_collection (id, title, handle)
SELECT 
    'pcol_' || SUBSTRING(handle FROM '^[a-z]+-[a-z]+') as id,
    UPPER(MIN(title)) as title,
    SUBSTRING(handle FROM '^[a-z]+-[a-z]+') || '-' || LOWER(REPLACE(MIN(title), ' ', '-')) as handle
FROM product 
WHERE deleted_at IS NULL
GROUP BY SUBSTRING(handle FROM '^[a-z]+-[a-z]+')
ORDER BY SUBSTRING(handle FROM '^[a-z]+-[a-z]+');

UPDATE product_collection SET title = REPLACE(title, 'COONA COVER', 'Bed Linen');
UPDATE product_collection SET title = REPLACE(title, 'DOONA COVER', 'Bed Linen');
UPDATE product_collection SET title = REPLACE(title, 'PILLOW CASE', 'Bed Linen');
UPDATE product_collection SET title = REPLACE(title, 'BED RUNNER', 'Bed Linen');
UPDATE product_collection SET title = REPLACE(title, 'CURTAINS', 'Curtains');
UPDATE product_collection SET title = REPLACE(title, 'CURTAIN', 'Curtains');
UPDATE product_collection SET title = REPLACE(title, 'CUSHION COVERS', 'Cushion Covers');
UPDATE product_collection SET title = REPLACE(title, 'CUSHION COVER', 'Cushion Covers');
UPDATE product_collection SET title = REPLACE(title, 'TEA TOWELS', 'Tea Towels');
UPDATE product_collection SET title = REPLACE(title, 'TEA TOWEL', 'Tea Towels');
UPDATE product_collection SET title = REPLACE(title, 'APRONS', 'Aprons');
UPDATE product_collection SET title = REPLACE(title, 'APRON', 'Aprons');
UPDATE product_collection SET title = REPLACE(title, 'NAPKINS', 'Table Linen');
UPDATE product_collection SET title = REPLACE(title, 'NAPKIN', 'Table Linen');
UPDATE product_collection SET title = REPLACE(title, 'TABLECLOTHS', 'Table Linen');
UPDATE product_collection SET title = REPLACE(title, 'TABLECLOTH', 'Table Linen');
UPDATE product_collection SET title = REPLACE(title, 'COASTERS', 'Table Linen');
UPDATE product_collection SET title = REPLACE(title, 'PLACEMAT', 'Table Linen');
UPDATE product_collection SET title = REPLACE(title, 'RUNNER', 'Table Linen');
