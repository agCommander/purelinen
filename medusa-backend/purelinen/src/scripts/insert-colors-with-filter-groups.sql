-- Insert colors into the color table with filter_group assignments
-- IDs are generated using a hash of the color name for consistency

INSERT INTO public.color (id, name, hex_code, filter_group, created_at, updated_at, deleted_at)
VALUES
  -- Shades of Pink
  (substring(md5('Pink') from 1 for 8), 'Pink', '#fbd2d4', 'Shades of Pink', now(), now(), NULL),
  (substring(md5('Shades of Pink') from 1 for 8), 'Shades of Pink', '#fbd2d4', 'Shades of Pink', now(), now(), NULL),
  (substring(md5('Dusty Rose') from 1 for 8), 'Dusty Rose', '#b38c91', 'Shades of Pink', now(), now(), NULL),
  (substring(md5('Nude') from 1 for 8), 'Nude', '#FFC0CB', 'Shades of Pink', now(), now(), NULL),
  
  -- Shades of Red
  (substring(md5('Red') from 1 for 8), 'Red', '#FF0000', 'Shades of Red', now(), now(), NULL),
  
  -- Shades of Grey
  (substring(md5('Grey') from 1 for 8), 'Grey', '#cacaca', 'Shades of Grey', now(), now(), NULL),
  (substring(md5('Shades of Grey') from 1 for 8), 'Shades of Grey', '#cacaca', 'Shades of Grey', now(), now(), NULL),
  (substring(md5('Steel Grey') from 1 for 8), 'Steel Grey', '#808080', 'Shades of Grey', now(), now(), NULL),
  (substring(md5('Gray') from 1 for 8), 'Gray', '#808080', 'Shades of Grey', now(), now(), NULL),
  (substring(md5('Charcoal') from 1 for 8), 'Charcoal', '#36454F', 'Shades of Grey', now(), now(), NULL),
  (substring(md5('Stone Grey') from 1 for 8), 'Stone Grey', '#8B8680', 'Shades of Grey', now(), now(), NULL),
  (substring(md5('Taupe') from 1 for 8), 'Taupe', '#483C32', 'Shades of Grey', now(), now(), NULL),
  
  -- Shades of Blue
  (substring(md5('Shades of Blue') from 1 for 8), 'Shades of Blue', '#ade0e5', 'Shades of Blue', now(), now(), NULL),
  (substring(md5('Blue') from 1 for 8), 'Blue', '#ade0e5', 'Shades of Blue', now(), now(), NULL),
  (substring(md5('Navy') from 1 for 8), 'Navy', '#000080', 'Shades of Blue', now(), now(), NULL),
  (substring(md5('Tiffany') from 1 for 8), 'Tiffany', '#83ccd4', 'Shades of Blue', now(), now(), NULL),
  (substring(md5('FrenchNavy') from 1 for 8), 'FrenchNavy', '#000080', 'Shades of Blue', now(), now(), NULL),
  (substring(md5('Sky Blue') from 1 for 8), 'Sky Blue', '#e0e8ea', 'Shades of Blue', now(), now(), NULL),
  (substring(md5('Pearl Blue') from 1 for 8), 'Pearl Blue', '#cfd1dd', 'Shades of Blue', now(), now(), NULL),
  
  -- Shades of Brown
  (substring(md5('Brown') from 1 for 8), 'Brown', '#8B4513', 'Shades of Brown', now(), now(), NULL),
  (substring(md5('Tobacco') from 1 for 8), 'Tobacco', '#514542', 'Shades of Brown', now(), now(), NULL),
  (substring(md5('Natural Brown') from 1 for 8), 'Natural Brown', '#A0522D', 'Shades of Brown', now(), now(), NULL),
  (substring(md5('Camel') from 1 for 8), 'Camel', '#C19A6B', 'Shades of Brown', now(), now(), NULL),
  
  -- Shades of Yellow
  (substring(md5('Yellow') from 1 for 8), 'Yellow', '#FFFF00', 'Shades of Yellow', now(), now(), NULL),
  
  -- Shades of Orange (empty for now, but ready for when you add orange colors)
  -- Add orange colors here when available
  
  -- Shades of Green
  (substring(md5('Green') from 1 for 8), 'Green', '#008000', 'Shades of Green', now(), now(), NULL),
  
  -- White
  (substring(md5('Optical White') from 1 for 8), 'Optical White', '#FFFFFF', 'White', now(), now(), NULL),
  (substring(md5('White') from 1 for 8), 'White', '#FFFFFF', 'White', now(), now(), NULL),
  (substring(md5('Off White') from 1 for 8), 'Off White', '#FAF0E6', 'White', now(), now(), NULL),
  (substring(md5('Cream') from 1 for 8), 'Cream', '#FFFDD0', 'White', now(), now(), NULL),
  (substring(md5('Ivory') from 1 for 8), 'Ivory', '#FFFFF0', 'White', now(), now(), NULL),
  (substring(md5('Beige') from 1 for 8), 'Beige', '#F5F5DC', 'White', now(), now(), NULL),
  
  -- Black
  (substring(md5('Black') from 1 for 8), 'Black', '#000000', 'Black', now(), now(), NULL),
  
  -- Natural Flax
  (substring(md5('Natural') from 1 for 8), 'Natural', '#b7b3a7', 'Natural Flax', now(), now(), NULL),
  (substring(md5('Natural Flax') from 1 for 8), 'Natural Flax', '#d7ccb8', 'Natural Flax', now(), now(), NULL)
ON CONFLICT (id) DO UPDATE
SET 
  name = EXCLUDED.name,
  hex_code = EXCLUDED.hex_code,
  filter_group = EXCLUDED.filter_group,
  updated_at = now();
