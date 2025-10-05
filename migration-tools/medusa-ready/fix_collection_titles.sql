-- Fix the collection titles issue
-- The previous script used MIN(title) which caused all collections to have the same title
-- Let's recreate them properly

-- First, remove all the incorrectly created collections (keep your original 2)
DELETE FROM product_collection 
WHERE id NOT IN ('pcol_01K5320YT0E4FC27NSX51C97Z4', 'pcol_01K531XJHP66SQ6VYSSVCMME35');

-- Reset all products to have no collection
UPDATE product SET collection_id = NULL WHERE deleted_at IS NULL;

-- Now recreate collections with proper titles
INSERT INTO product_collection (id, title, handle)
SELECT 
    'pcol_' || SUBSTRING(handle FROM '^[a-z]+-[a-z]+') as id,
    (SELECT title FROM product p2 WHERE p2.handle LIKE SUBSTRING(handle FROM '^[a-z]+-[a-z]+') || '-%' AND p2.deleted_at IS NULL LIMIT 1) as title,
    SUBSTRING(handle FROM '^[a-z]+-[a-z]+') || '-' || LOWER(REPLACE((SELECT title FROM product p2 WHERE p2.handle LIKE SUBSTRING(handle FROM '^[a-z]+-[a-z]+') || '-%' AND p2.deleted_at IS NULL LIMIT 1), ' ', '-')) as handle
FROM product 
WHERE deleted_at IS NULL
GROUP BY SUBSTRING(handle FROM '^[a-z]+-[a-z]+')
ORDER BY SUBSTRING(handle FROM '^[a-z]+-[a-z]+');

-- Show the collections created
SELECT id, title, handle FROM product_collection ORDER BY title;
