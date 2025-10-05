-- Create collections based on handle patterns with proper brand names
-- Extract brand name from first word of first title in each group
-- Add appropriate collection type based on prefix

-- Create collections for each handle pattern
INSERT INTO product_collection (id, title, handle)
SELECT 
    'pcol_' || SUBSTRING(handle_pattern FROM '^[a-z]+-[a-z]+') as id,
    CASE 
        WHEN handle_pattern LIKE 'na-%' THEN SUBSTRING(MIN(title) FROM '^[A-Z]+') || ' Table Linen'
        WHEN handle_pattern LIKE 'bl-%' THEN SUBSTRING(MIN(title) FROM '^[A-Z]+') || ' Bed Linen'
        WHEN handle_pattern LIKE 'kl-%' THEN SUBSTRING(MIN(title) FROM '^[A-Z]+') || ' Kitchen Linen'
        WHEN handle_pattern LIKE 'hd-%' THEN SUBSTRING(MIN(title) FROM '^[A-Z]+') || ' Home Decor'
        WHEN handle_pattern LIKE 'ba-%' THEN SUBSTRING(MIN(title) FROM '^[A-Z]+') || ' Bathroom Linens'
        ELSE SUBSTRING(MIN(title) FROM '^[A-Z]+') || ' Collection'
    END as title,
    LOWER(SUBSTRING(MIN(title) FROM '^[A-Z]+')) || '-' || 
    CASE 
        WHEN handle_pattern LIKE 'na-%' THEN 'table-linen'
        WHEN handle_pattern LIKE 'bl-%' THEN 'bed-linen'
        WHEN handle_pattern LIKE 'kl-%' THEN 'kitchen-linen'
        WHEN handle_pattern LIKE 'hd-%' THEN 'home-decor'
        WHEN handle_pattern LIKE 'ba-%' THEN 'bathroom-linens'
        ELSE 'collection'
    END as handle
FROM (
    SELECT 
        SUBSTRING(handle FROM '^[a-z]+-[a-z]+') as handle_pattern,
        title
    FROM product 
    WHERE deleted_at IS NULL
) grouped
GROUP BY handle_pattern
ORDER BY handle_pattern;

-- Show the collections created
SELECT id, title, handle FROM product_collection ORDER BY title;
