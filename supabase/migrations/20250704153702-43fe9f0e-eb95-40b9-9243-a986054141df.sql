-- Mettre à jour le bucket pour le rendre public
UPDATE storage.buckets SET public = true WHERE id = 'task-reports';