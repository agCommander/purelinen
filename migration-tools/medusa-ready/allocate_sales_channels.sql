-- Allocate all products to both sales channels
-- Sales Channels:
-- sc_01K1MYP9G0E3AKEZ5GA13VTZXK	Linen Things Store
-- sc_01K1MYP9EG0TY2JTKNATZNC9V2	Pure Linen Store

-- Step 1: Allocate all products to Linen Things Store
INSERT INTO product_sales_channel (id, product_id, sales_channel_id)
SELECT 
    'psc_' || substr(md5(random()::text), 1, 20) as id,
    p.id as product_id,
    'sc_01K1MYP9G0E3AKEZ5GA13VTZXK' as sales_channel_id
FROM product p
WHERE p.deleted_at IS NULL;

-- Step 2: Allocate all products to Pure Linen Store
INSERT INTO product_sales_channel (id, product_id, sales_channel_id)
SELECT 
    'psc_' || substr(md5(random()::text), 1, 20) as id,
    p.id as product_id,
    'sc_01K1MYP9EG0TY2JTKNATZNC9V2' as sales_channel_id
FROM product p
WHERE p.deleted_at IS NULL;

-- Verify the allocation
SELECT 
    sc.name as sales_channel_name,
    COUNT(psc.product_id) as product_count
FROM product_sales_channel psc
JOIN sales_channel sc ON psc.sales_channel_id = sc.id
GROUP BY sc.id, sc.name
ORDER BY sc.name;
