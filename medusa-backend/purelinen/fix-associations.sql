-- Fix Product Sales Channel Associations
-- This script will associate all products with both Pure Linen and Linen Things sales channels

-- First, let's see what we have
SELECT 'Current state:' as info;
SELECT COUNT(*) as total_products FROM product;
SELECT COUNT(*) as total_associations FROM product_sales_channel;
SELECT COUNT(*) as total_sales_channels FROM sales_channel;

-- Get the sales channel IDs
SELECT 'Sales Channels:' as info;
SELECT id, name FROM sales_channel;

-- Insert associations for Pure Linen Store
INSERT INTO product_sales_channel (id, product_id, sales_channel_id)
SELECT 
    'psc_' || substr(md5(random()::text), 1, 25) as id,
    p.id as product_id, 
    sc.id as sales_channel_id
FROM product p
CROSS JOIN sales_channel sc
WHERE sc.name = 'Pure Linen Store'
AND NOT EXISTS (
    SELECT 1 FROM product_sales_channel psc 
    WHERE psc.product_id = p.id AND psc.sales_channel_id = sc.id
);

-- Insert associations for Linen Things Store
INSERT INTO product_sales_channel (id, product_id, sales_channel_id)
SELECT 
    'psc_' || substr(md5(random()::text), 1, 25) as id,
    p.id as product_id, 
    sc.id as sales_channel_id
FROM product p
CROSS JOIN sales_channel sc
WHERE sc.name = 'Linen Things Store'
AND NOT EXISTS (
    SELECT 1 FROM product_sales_channel psc 
    WHERE psc.product_id = p.id AND psc.sales_channel_id = sc.id
);

-- Show the results
SELECT 'After fix:' as info;
SELECT COUNT(*) as total_associations FROM product_sales_channel;

-- Show sample associations
SELECT 'Sample associations:' as info;
SELECT p.title, sc.name
FROM product p
JOIN product_sales_channel psc ON p.id = psc.product_id
JOIN sales_channel sc ON psc.sales_channel_id = sc.id
LIMIT 10; 