
-- Créer la table pour les assignations d'employés aux projets
CREATE TABLE public.project_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  employee_id TEXT NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, employee_id)
);

-- Créer la table pour les tâches des projets
CREATE TABLE public.project_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id TEXT,
  status TEXT NOT NULL DEFAULT 'En cours',
  priority TEXT NOT NULL DEFAULT 'moyenne',
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS pour project_assignments
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS pour project_assignments
CREATE POLICY "Allow all users to read project_assignments" ON public.project_assignments
  FOR SELECT USING (true);

CREATE POLICY "Allow all users to insert project_assignments" ON public.project_assignments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all users to update project_assignments" ON public.project_assignments
  FOR UPDATE USING (true);

CREATE POLICY "Allow all users to delete project_assignments" ON public.project_assignments
  FOR DELETE USING (true);

-- Activer RLS pour project_tasks
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS pour project_tasks
CREATE POLICY "Allow all users to read project_tasks" ON public.project_tasks
  FOR SELECT USING (true);

CREATE POLICY "Allow all users to insert project_tasks" ON public.project_tasks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all users to update project_tasks" ON public.project_tasks
  FOR UPDATE USING (true);

CREATE POLICY "Allow all users to delete project_tasks" ON public.project_tasks
  FOR DELETE USING (true);
