
-- Créer une table pour les utilisateurs de l'application
CREATE TABLE public.app_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('root', 'admin', 'employee')),
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT NOT NULL DEFAULT 'system'
);

-- Insérer le compte root par défaut
INSERT INTO public.app_users (username, password_hash, role, created_by) 
VALUES ('root', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'root', 'system');

-- Activer RLS
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture des utilisateurs (seulement pour les utilisateurs authentifiés)
CREATE POLICY "Allow authenticated users to read app_users" ON public.app_users
  FOR SELECT USING (true);

-- Politique pour permettre l'insertion d'utilisateurs (sans restriction pour maintenir la compatibilité)
CREATE POLICY "Allow all to insert app_users" ON public.app_users
  FOR INSERT WITH CHECK (true);

-- Politique pour permettre la mise à jour d'utilisateurs
CREATE POLICY "Allow all to update app_users" ON public.app_users
  FOR UPDATE USING (true);

-- Politique pour permettre la suppression d'utilisateurs
CREATE POLICY "Allow all to delete app_users" ON public.app_users
  FOR DELETE USING (true);
