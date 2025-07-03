-- Ajouter un champ pour traquer qui a assigné la tâche
ALTER TABLE public.project_tasks 
ADD COLUMN assigned_by TEXT REFERENCES public.app_users(id);

-- Mettre à jour les tâches existantes avec un assigneur par défaut (premier admin trouvé)
UPDATE public.project_tasks 
SET assigned_by = (
  SELECT id 
  FROM public.app_users 
  WHERE role IN ('admin', 'root') 
  LIMIT 1
)
WHERE assigned_by IS NULL;