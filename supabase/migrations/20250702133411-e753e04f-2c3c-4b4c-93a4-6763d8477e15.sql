
-- Créer la table pour les demandes de prolongation
CREATE TABLE public.extension_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.project_tasks(id) ON DELETE CASCADE,
  employee_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  requested_extension TEXT,
  status TEXT NOT NULL DEFAULT 'En attente' CHECK (status IN ('En attente', 'Approuvée', 'Rejetée')),
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table pour les rapports de tâches
CREATE TABLE public.task_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.project_tasks(id) ON DELETE CASCADE,
  employee_id TEXT NOT NULL,
  summary TEXT NOT NULL,
  difficulties TEXT,
  solutions TEXT,
  recommendations TEXT,
  time_spent NUMERIC,
  quality_rating TEXT,
  location TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  generated_report TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ajouter une colonne pour marquer les tâches comme clôturées par l'admin
ALTER TABLE public.project_tasks ADD COLUMN closed_by_admin BOOLEAN DEFAULT FALSE;

-- Activer RLS pour les nouvelles tables
ALTER TABLE public.extension_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_reports ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour extension_requests
CREATE POLICY "Allow all users to read extension_requests" ON public.extension_requests
  FOR SELECT USING (true);

CREATE POLICY "Allow all users to insert extension_requests" ON public.extension_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all users to update extension_requests" ON public.extension_requests
  FOR UPDATE USING (true);

CREATE POLICY "Allow all users to delete extension_requests" ON public.extension_requests
  FOR DELETE USING (true);

-- Politiques RLS pour task_reports
CREATE POLICY "Allow all users to read task_reports" ON public.task_reports
  FOR SELECT USING (true);

CREATE POLICY "Allow all users to insert task_reports" ON public.task_reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all users to update task_reports" ON public.task_reports
  FOR UPDATE USING (true);

CREATE POLICY "Allow all users to delete task_reports" ON public.task_reports
  FOR DELETE USING (true);
