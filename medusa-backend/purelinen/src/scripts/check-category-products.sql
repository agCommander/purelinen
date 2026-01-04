-- Diagnostic script to check why products aren't showing on category pages
-- Run this to check:
-- 1. Are products assigned to the category?
-- 2. Are products published?
-- 3. Are products assigned to a sales channel?
-- 4. Do products have inventory?

-- Replace 'linen-tablecloths' with your category handle
\set category_handle 'linen-tablecloths'

-- Check category exists
SELECT 'Category Info:' as check_type;
SELECT id, name, handle, is_active 
FROM product_category 
WHERE handle = :'category_handle';

-- Check products assigned to category
SELECT 'Products in Category:' as check_type;
SELECT 
    p.id,
    p.title,
    p.status,
    p.handle,
    COUNT(DISTINCT psc.sales_channel_id) as sales_channel_count,
    COUNT(DISTINCT il.id) as inventory_level_count,
    MAX(il.stocked_quantity) as max_stock
FROM product p
INNER JOIN product_category_product pcp ON p.id = pcp.product_id
INNER JOIN product_category pc ON pcp.product_category_id = pc.id
LEFT JOIN product_sales_channel psc ON p.id = psc.product_id
LEFT JOIN product_variant pv ON p.id = pv.product_id
LEFT JOIN inventory_item ii ON pv.sku = ii.sku
LEFT JOIN inventory_level il ON ii.id = il.inventory_item_id AND il.location_id = 'sloc_01K3DQ8W9VYSX1ARQJ7J553CQK'
WHERE pc.handle = :'category_handle'
GROUP BY p.id, p.title, p.status, p.handle
ORDER BY p.title
LIMIT 20;

-- Summary
SELECT 'Summary:' as check_type;
SELECT 
    COUNT(DISTINCT p.id) as total_products,
    COUNT(DISTINCT CASE WHEN p.status = 'published' THEN p.id END) as published_products,
    COUNT(DISTINCT CASE WHEN psc.sales_channel_id IS NOT NULL THEN p.id END) as products_with_sales_channel,
    COUNT(DISTINCT CASE WHEN il.id IS NOT NULL THEN p.id END) as products_with_inventory
FROM product p
INNER JOIN product_category_product pcp ON p.id = pcp.product_id
INNER JOIN product_category pc ON pcp.product_category_id = pc.id
LEFT JOIN product_sales_channel psc ON p.id = psc.product_id
LEFT JOIN product_variant pv ON p.id = pv.product_id
LEFT JOIN inventory_item ii ON pv.sku = ii.sku
LEFT JOIN inventory_level il ON ii.id = il.inventory_item_id AND il.location_id = 'sloc_01K3DQ8W9VYSX1ARQJ7J553CQK'
WHERE pc.handle = :'category_handle';


