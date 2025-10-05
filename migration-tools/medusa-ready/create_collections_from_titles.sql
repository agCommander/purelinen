-- Create collections using full product titles as collection names
-- This gives you complete context to clean up manually later

INSERT INTO product_collection (id, title, handle)
SELECT 
    'pcol_' || SUBSTRING(handle FROM '^[a-z]+-[a-z]+') as id,
    MIN(title) as title,
    SUBSTRING(handle FROM '^[a-z]+-[a-z]+') || '-' || LOWER(REPLACE(MIN(title), ' ', '-')) as handle
FROM product 
WHERE deleted_at IS NULL
GROUP BY SUBSTRING(handle FROM '^[a-z]+-[a-z]+')
ORDER BY SUBSTRING(handle FROM '^[a-z]+-[a-z]+');

-- Show the collections created
SELECT id, title, handle FROM product_collection ORDER BY title;
