-- Assign products to product types based on handle prefixes
-- This will enable the frontend to filter by product type/category

UPDATE product SET type_id = 'pt_na' WHERE handle LIKE 'na-%' AND deleted_at IS NULL;
UPDATE product SET type_id = 'pt_bl' WHERE handle LIKE 'bl-%' AND deleted_at IS NULL;
UPDATE product SET type_id = 'pt_hd' WHERE handle LIKE 'hd-%' AND deleted_at IS NULL;
UPDATE product SET type_id = 'pt_kl' WHERE handle LIKE 'kl-%' AND deleted_at IS NULL;
UPDATE product SET type_id = 'pt_ba' WHERE handle LIKE 'ba-%' AND deleted_at IS NULL;

-- Show the results
SELECT 
    pt.value as product_type,
    COUNT(p.id) as product_count
FROM product_type pt
LEFT JOIN product p ON p.type_id = pt.id AND p.deleted_at IS NULL
GROUP BY pt.id, pt.value
ORDER BY product_count DESC;
