-- Script to fix products not displaying on category pages
-- This will:
-- 1. Publish all products (set status = 'published')
-- 2. Verify products are linked to categories
-- 3. Check inventory levels

-- Step 1: Publish all products
UPDATE product
SET status = 'published', updated_at = NOW()
WHERE status != 'published' OR status IS NULL;

-- Step 2: Verify category assignments for a specific category
-- Replace 'linen-tablecloths' with your category handle
\set category_handle 'linen-tablecloths'

SELECT 'Products in category:' as info;
SELECT 
    p.id,
    p.title,
    p.status,
    pc.name as category_name,
    COUNT(DISTINCT pv.id) as variant_count,
    COUNT(DISTINCT il.id) as inventory_level_count
FROM product p
INNER JOIN product_category_product pcp ON p.id = pcp.product_id
INNER JOIN product_category pc ON pcp.product_category_id = pc.id
LEFT JOIN product_variant pv ON p.id = pv.product_id
LEFT JOIN inventory_item ii ON pv.sku = ii.sku
LEFT JOIN inventory_level il ON ii.id = il.inventory_item_id AND il.location_id = 'sloc_01K3DQ8W9VYSX1ARQJ7J553CQK'
WHERE pc.handle = :'category_handle'
GROUP BY p.id, p.title, p.status, pc.name
ORDER BY p.title
LIMIT 10;

-- Step 3: Check if products have inventory
SELECT 'Inventory check:' as info;
SELECT 
    COUNT(DISTINCT p.id) as products_in_category,
    COUNT(DISTINCT CASE WHEN il.stocked_quantity > 0 THEN p.id END) as products_with_stock
FROM product p
INNER JOIN product_category_product pcp ON p.id = pcp.product_id
INNER JOIN product_category pc ON pcp.product_category_id = pc.id
LEFT JOIN product_variant pv ON p.id = pv.product_id
LEFT JOIN inventory_item ii ON pv.sku = ii.sku
LEFT JOIN inventory_level il ON ii.id = il.inventory_item_id AND il.location_id = 'sloc_01K3DQ8W9VYSX1ARQJ7J553CQK'
WHERE pc.handle = :'category_handle';

-- Step 4: Show summary
SELECT 'Summary:' as info;
SELECT 
    COUNT(*) as total_products,
    COUNT(CASE WHEN status = 'published' THEN 1 END) as published_products,
    COUNT(CASE WHEN status != 'published' OR status IS NULL THEN 1 END) as unpublished_products
FROM product
WHERE deleted_at IS NULL;

