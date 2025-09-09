-- Add primary_color column to sales_pages table
ALTER TABLE public.sales_pages 
ADD COLUMN primary_color TEXT DEFAULT '#3b82f6';