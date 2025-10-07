-- Create bucket for equipment images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('equipment-images', 'equipment-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
CREATE POLICY IF NOT EXISTS "Allow authenticated users to upload equipment images" 
ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'equipment-images' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Allow public access to equipment images" 
ON storage.objects
FOR SELECT 
USING (bucket_id = 'equipment-images');

CREATE POLICY IF NOT EXISTS "Allow authenticated users to update their equipment images" 
ON storage.objects
FOR UPDATE 
USING (bucket_id = 'equipment-images' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Allow authenticated users to delete their equipment images" 
ON storage.objects
FOR DELETE 
USING (bucket_id = 'equipment-images' AND auth.role() = 'authenticated');
