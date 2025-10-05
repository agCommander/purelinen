-- Assign all products to their appropriate collections based on handle patterns

UPDATE product 
SET collection_id = 'pcol_' || SUBSTRING(handle FROM '^[a-z]+-[a-z]+')
WHERE deleted_at IS NULL;

-- Verify the assignments
SELECT 
    pc.title as collection_name,
    COUNT(p.id) as product_count
FROM product_collection pc
LEFT JOIN product p ON pc.id = p.collection_id AND p.deleted_at IS NULL
GROUP BY pc.id, pc.title
ORDER BY pc.title;

-- Check for any unassigned products
SELECT COUNT(*) as unassigned_products 
FROM product 
WHERE collection_id IS NULL AND deleted_at IS NULL;
