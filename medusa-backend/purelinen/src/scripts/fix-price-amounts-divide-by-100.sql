-- Fix prices that are 100x too high
-- This script divides both 'amount' and 'raw_amount.value' by 100
-- The 'precision' field doesn't need to change (it's just decimal precision)

-- First, let's see what we're working with
SELECT 
    COUNT(*) as total_prices,
    MIN(amount) as min_amount,
    MAX(amount) as max_amount,
    AVG(amount) as avg_amount
FROM price 
WHERE deleted_at IS NULL;

-- Update the amount field (divide by 100)
UPDATE price
SET 
    amount = amount / 100,
    updated_at = NOW()
WHERE deleted_at IS NULL
    AND amount > 0;

-- Update the raw_amount JSONB field
-- This is trickier because we need to update the JSON value
UPDATE price
SET 
    raw_amount = jsonb_set(
        raw_amount,
        '{value}',
        to_jsonb(ROUND((raw_amount->>'value')::numeric / 100, 2)::text),
        true
    ),
    updated_at = NOW()
WHERE deleted_at IS NULL
    AND raw_amount IS NOT NULL
    AND raw_amount->>'value' IS NOT NULL
    AND (raw_amount->>'value')::numeric > 0;

-- Verify the changes
SELECT 
    COUNT(*) as total_prices,
    MIN(amount) as min_amount,
    MAX(amount) as max_amount,
    AVG(amount) as avg_amount,
    MIN((raw_amount->>'value')::numeric) as min_raw_value,
    MAX((raw_amount->>'value')::numeric) as max_raw_value
FROM price 
WHERE deleted_at IS NULL;

-- Show a few sample records to verify
SELECT 
    id,
    currency_code,
    amount,
    raw_amount,
    price_set_id
FROM price 
WHERE deleted_at IS NULL
ORDER BY updated_at DESC
LIMIT 5;
