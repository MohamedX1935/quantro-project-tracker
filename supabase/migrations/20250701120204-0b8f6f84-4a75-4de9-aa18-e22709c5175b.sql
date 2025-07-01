
-- Créer la table projects pour stocker les projets
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  deadline DATE NOT NULL,
  priority TEXT NOT NULL DEFAULT 'moyenne',
  location TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT NOT NULL
);

-- Activer RLS sur la table projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture des projets
CREATE POLICY "Allow authenticated users to read projects" ON public.projects
  FOR SELECT USING (auth.role() = 'authenticated');

-- Politique pour permettre l'insertion de projets
CREATE POLICY "Allow authenticated users to insert projects" ON public.projects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Politique pour permettre la mise à jour des projets
CREATE POLICY "Allow authenticated users to update projects" ON public.projects
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Politique pour permettre la suppression des projets
CREATE POLICY "Allow authenticated users to delete projects" ON public.projects
  FOR DELETE USING (auth.role() = 'authenticated');
