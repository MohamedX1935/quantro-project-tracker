-- Créer un bucket pour les fichiers de rapports de tâches
INSERT INTO storage.buckets (id, name, public) VALUES ('task-reports', 'task-reports', false);

-- Créer les politiques pour permettre aux utilisateurs d'uploader leurs propres fichiers
CREATE POLICY "Users can upload their own task report files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'task-reports' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Permettre aux utilisateurs de voir leurs propres fichiers
CREATE POLICY "Users can view their own task report files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'task-reports' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Permettre aux administrateurs de voir tous les fichiers de rapports
CREATE POLICY "Admins can view all task report files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'task-reports');

-- Permettre de supprimer ses propres fichiers
CREATE POLICY "Users can delete their own task report files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'task-reports' AND auth.uid()::text = (storage.foldername(name))[1]);