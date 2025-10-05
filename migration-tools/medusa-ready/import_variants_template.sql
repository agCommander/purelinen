-- Complete SQL script for importing variants and related data
-- Generated from variants.csv
-- Handles: product_variant, product_option, product_option_value, product_variant_option

-- Step 1: Create temporary table for variants
CREATE TEMP TABLE product_variant_temp (
    id VARCHAR(255),
    title VARCHAR(255),
    sku VARCHAR(255),
    price_usd DECIMAL(10,2),
    allow_backorder BOOLEAN DEFAULT false,
    manage_inventory BOOLEAN DEFAULT true,
    product_handle VARCHAR(255),
    variant1_name VARCHAR(255),
    variant1_value VARCHAR(255),
    variant2_name VARCHAR(255),
    variant2_value VARCHAR(255),
    variant3_name VARCHAR(255),
    variant3_value VARCHAR(255),
    image_url TEXT
);

-- Step 2: Insert data into temp table (this will be populated by CSV import or manual insert)
-- For now, we'll create the structure and show the pattern

-- Step 3: Insert into product_variant table
INSERT INTO product_variant (
    id,
    title,
    sku,
    allow_backorder,
    manage_inventory,
    product_id
)
SELECT 
    vt.id,
    vt.title,
    vt.sku,
    vt.allow_backorder,
    vt.manage_inventory,
    p.id as product_id
FROM product_variant_temp vt 
INNER JOIN product p ON p.handle = vt.product_handle;

-- Step 4 - 6 Insert into product_option table (Variant1Name)
INSERT INTO product_option (
    id,
    title,
    product_id
)
SELECT DISTINCT 
    'opt_' || substr(md5(random()::text), 1, 20),
    title,
    product_id
FROM  
(
SELECT DISTINCT 

    vt.variant1_name as title,
    p.id as product_id
FROM product_variant_temp vt 
INNER JOIN product p ON p.handle = vt.product_handle
WHERE vt.variant1_name IS NOT NULL AND vt.variant1_name != ''
UNION 
SELECT DISTINCT 

    vt.variant2_name as title,
    p.id as product_id
FROM product_variant_temp vt 
INNER JOIN product p ON p.handle = vt.product_handle
WHERE vt.variant2_name IS NOT NULL AND vt.variant2_name != ''
UNION
SELECT DISTINCT 
    vt.variant3_name as title,
    p.id as product_id
FROM product_variant_temp vt 
INNER JOIN product p ON p.handle = vt.product_handle
WHERE vt.variant3_name IS NOT NULL AND vt.variant3_name != ''
)  x;


-- Step 7 - 9 : Insert into product_option_value (Variant1Value)
INSERT INTO product_option_value (
    id,
    value,
    option_id
)
SELECT DISTINCT 
    'optval_' || substr(md5(random()::text), 1, 20),
    value,
    option_id
FROM (
SELECT DISTINCT 
    vt.variant1_value as value,
    po.id as option_id
FROM product_variant_temp vt 
INNER JOIN product p ON p.handle = vt.product_handle
INNER JOIN product_option po ON po.product_id = p.id AND po.title = vt.variant1_name
WHERE vt.variant1_value IS NOT NULL AND vt.variant1_value != ''
UNION 
SELECT DISTINCT 
    vt.variant2_value as value,
    po.id as option_id
FROM product_variant_temp vt 
INNER JOIN product p ON p.handle = vt.product_handle
INNER JOIN product_option po ON po.product_id = p.id AND po.title = vt.variant2_name
WHERE vt.variant2_value IS NOT NULL AND vt.variant2_value != ''
UNION
SELECT DISTINCT 
    vt.variant3_value as value,
    po.id as option_id
FROM product_variant_temp vt 
INNER JOIN product p ON p.handle = vt.product_handle
INNER JOIN product_option po ON po.product_id = p.id AND po.title = vt.variant3_name
WHERE vt.variant3_value IS NOT NULL AND vt.variant3_value != ''
)  x;


-- Step 10: Insert into product_variant_option (link variants to option values)
INSERT INTO product_variant_option (
    variant_id,
    option_value_id
)
SELECT DISTINCT 
    variant_id,
    option_value_id
FROM(    
SELECT 
    pv.id as variant_id,
    pov1.id as option_value_id
FROM product_variant_temp vt
INNER JOIN product p ON p.handle = vt.product_handle
INNER JOIN product_variant pv ON pv.product_id = p.id AND pv.sku = vt.sku
INNER JOIN product_option po1 ON po1.product_id = p.id AND po1.title = vt.variant1_name
INNER JOIN product_option_value pov1 ON pov1.option_id = po1.id AND pov1.value = vt.variant1_value
WHERE vt.variant1_value IS NOT NULL AND vt.variant1_value != ''

UNION ALL

SELECT 
    pv.id as variant_id,
    pov2.id as option_value_id
FROM product_variant_temp vt
INNER JOIN product p ON p.handle = vt.product_handle
INNER JOIN product_variant pv ON pv.product_id = p.id AND pv.sku = vt.sku
INNER JOIN product_option po2 ON po2.product_id = p.id AND po2.title = vt.variant2_name
INNER JOIN product_option_value pov2 ON pov2.option_id = po2.id AND pov2.value = vt.variant2_value
WHERE vt.variant2_value IS NOT NULL AND vt.variant2_value != ''

UNION ALL

SELECT 
    pv.id as variant_id,
    pov3.id as option_value_id
FROM product_variant_temp vt
INNER JOIN product p ON p.handle = vt.product_handle
INNER JOIN product_variant pv ON pv.product_id = p.id AND pv.sku = vt.sku
INNER JOIN product_option po3 ON po3.product_id = p.id AND po3.title = vt.variant3_name
INNER JOIN product_option_value pov3 ON pov3.option_id = po3.id AND pov3.value = vt.variant3_value
WHERE vt.variant3_value IS NOT NULL AND vt.variant3_value != ''
) x;
-- Step 11: Create temp tables for pricing (to be figured out later)
CREATE TEMP TABLE money_amount_temp (
    id VARCHAR(255),
    currency_code VARCHAR(3),
    amount INTEGER,
    variant_id VARCHAR(255),
    price_usd DECIMAL(10,2)
);

CREATE TEMP TABLE product_variant_price_temp (
    variant_id VARCHAR(255),
    money_amount_id VARCHAR(255),
    price_list_id VARCHAR(255)
);

-- Step 12: Insert into temp money_amount table for variant prices
INSERT INTO money_amount_temp (
    id,
    currency_code,
    amount,
    variant_id,
    price_usd
)
SELECT 
    'ma_' || substr(md5(random()::text), 1, 20),
    'aud',
    vt.price_usd * 100,  -- Convert to cents
    pv.id as variant_id,
    vt.price_usd
FROM product_variant_temp vt
INNER JOIN product p ON p.handle = vt.product_handle
INNER JOIN product_variant pv ON pv.product_id = p.id AND pv.sku = vt.sku
WHERE vt.price_usd > 0;

-- Step 13: Insert into temp product_variant_price table (link variants to prices)
INSERT INTO product_variant_price_temp (
    variant_id,
    money_amount_id,
    price_list_id
)
SELECT 
    mat.variant_id,
    mat.id as money_amount_id,
    NULL as price_list_id  -- NULL for default price list
FROM money_amount_temp mat;

-- Note: These temp tables contain the pricing data
-- We'll need to figure out how to map this to actual Medusa pricing tables later

-- Clean up temp table
DROP TABLE product_variant_temp;
