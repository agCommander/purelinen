-- Export pricing data from temp tables for analysis
-- Run this after the variant import to see what pricing data we have

-- Show all pricing data
SELECT 
    mat.id as money_amount_id,
    mat.currency_code,
    mat.amount as amount_cents,
    mat.price_usd,
    pv.id as variant_id,
    pv.sku,
    p.title as product_title,
    p.handle as product_handle
FROM money_amount_temp mat
INNER JOIN product_variant pv ON pv.id = mat.variant_id
INNER JOIN product p ON p.id = pv.product_id
ORDER BY p.handle, pv.sku;

-- Show pricing summary by product
SELECT 
    p.handle as product_handle,
    p.title as product_title,
    COUNT(mat.id) as variant_count,
    MIN(mat.price_usd) as min_price,
    MAX(mat.price_usd) as max_price,
    AVG(mat.price_usd) as avg_price
FROM money_amount_temp mat
INNER JOIN product_variant pv ON pv.id = mat.variant_id
INNER JOIN product p ON p.id = pv.product_id
GROUP BY p.handle, p.title
ORDER BY p.handle;

-- Show variant-price relationships
SELECT 
    pvpt.variant_id,
    pvpt.money_amount_id,
    pvpt.price_list_id,
    mat.price_usd,
    mat.amount as amount_cents,
    pv.sku,
    p.handle as product_handle
FROM product_variant_price_temp pvpt
INNER JOIN money_amount_temp mat ON mat.id = pvpt.money_amount_id
INNER JOIN product_variant pv ON pv.id = pvpt.variant_id
INNER JOIN product p ON p.id = pv.product_id
ORDER BY p.handle, pv.sku;
