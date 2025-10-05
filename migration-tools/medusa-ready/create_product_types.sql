-- Create product types based on product handle prefixes
-- This will serve as the main categories for the frontend

INSERT INTO product_type (id, value, metadata) VALUES 
('pt_na', 'Table Linen', '{"description": "Napkins, tablecloths, placemats, runners", "prefix": "na", "product_count": 83}'),
('pt_bl', 'Bed Linen', '{"description": "Doona covers, pillow cases, bed runners", "prefix": "bl", "product_count": 32}'),
('pt_hd', 'Home Decor', '{"description": "Curtains, cushions, throws", "prefix": "hd", "product_count": 25}'),
('pt_kl', 'Kitchen Linen', '{"description": "Tea towels, aprons, kitchen accessories", "prefix": "kl", "product_count": 16}'),
('pt_ba', 'Bathroom Linen', '{"description": "Towels, bath accessories", "prefix": "ba", "product_count": 1}');

-- Show the created product types
SELECT id, value, metadata FROM product_type ORDER BY value;
