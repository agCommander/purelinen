-- Add filter_group column to color table for grouping colors for filtering
ALTER TABLE public.color 
ADD COLUMN IF NOT EXISTS filter_group text COLLATE pg_catalog."default";

-- Create index on filter_group for faster filtering
CREATE INDEX IF NOT EXISTS idx_color_filter_group ON public.color(filter_group) WHERE deleted_at IS NULL;

COMMENT ON COLUMN public.color.filter_group IS 'Group name for filtering colors (e.g., "Shades of Pink", "Shades of Red", etc.)';
