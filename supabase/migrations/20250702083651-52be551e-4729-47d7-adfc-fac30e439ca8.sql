
-- Supprimer les anciennes politiques qui nécessitent l'authentification Supabase
DROP POLICY IF EXISTS "Allow authenticated users to read projects" ON public.projects;
DROP POLICY IF EXISTS "Allow authenticated users to insert projects" ON public.projects;
DROP POLICY IF EXISTS "Allow authenticated users to update projects" ON public.projects;
DROP POLICY IF EXISTS "Allow authenticated users to delete projects" ON public.projects;

-- Créer de nouvelles politiques qui permettent l'accès à tous les utilisateurs
-- (puisque vous gérez l'authentification côté client)
CREATE POLICY "Allow all users to read projects" ON public.projects
  FOR SELECT USING (true);

CREATE POLICY "Allow all users to insert projects" ON public.projects
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all users to update projects" ON public.projects
  FOR UPDATE USING (true);

CREATE POLICY "Allow all users to delete projects" ON public.projects
  FOR DELETE USING (true);
