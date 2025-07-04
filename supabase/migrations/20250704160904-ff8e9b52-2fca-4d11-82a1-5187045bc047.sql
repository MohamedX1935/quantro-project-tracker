-- Supprimer les anciennes politiques restrictives
DROP POLICY IF EXISTS "Users can upload their own task report files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own task report files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all task report files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own task report files" ON storage.objects;

-- Créer des politiques plus permissives pour le bucket task-reports
CREATE POLICY "Allow all authenticated users to upload task reports" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'task-reports');

CREATE POLICY "Allow all users to view task reports" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'task-reports');

CREATE POLICY "Allow all authenticated users to delete task reports" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'task-reports');

CREATE POLICY "Allow all authenticated users to update task reports" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'task-reports');