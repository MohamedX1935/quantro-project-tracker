
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Project {
  id: string;
  name: string;
  description: string;
  deadline: string;
  priority: string;
  location: string;
  created_at: string;
  created_by: string;
}

interface ProjectContextType {
  projects: Project[];
  createProject: (projectData: {
    name: string;
    description: string;
    deadline: string;
    priority?: string;
    location?: string;
  }) => Promise<boolean>;
  deleteProject: (projectId: string) => Promise<boolean>;
  refreshProjects: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshProjects = async () => {
    console.log('ProjectProvider: refreshProjects called');
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching projects from Supabase...');
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        setError('Erreur lors du chargement des projets: ' + error.message);
        return;
      }

      console.log('Projects fetched successfully:', data);
      setProjects(data || []);
    } catch (error) {
      console.error('Error refreshing projects:', error);
      setError('Erreur de connexion à la base de données.');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async (projectData: {
    name: string;
    description: string;
    deadline: string;
    priority?: string;
    location?: string;
  }): Promise<boolean> => {
    console.log('ProjectProvider: createProject called with:', projectData);
    
    try {
      // Pour l'instant, on utilise un ID mock puisque nous n'avons pas encore d'authentification
      const mockUserId = 'admin-' + Date.now();

      const newProject = {
        name: projectData.name,
        description: projectData.description,
        deadline: projectData.deadline,
        priority: projectData.priority || 'moyenne',
        location: projectData.location || '',
        created_by: mockUserId,
      };

      console.log('Inserting project:', newProject);

      const { data, error } = await supabase
        .from('projects')
        .insert([newProject])
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        setError('Erreur lors de la création du projet: ' + error.message);
        return false;
      }

      console.log('Project created successfully:', data);
      
      // Rafraîchir immédiatement la liste des projets
      await refreshProjects();
      return true;
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Erreur lors de la création du projet.');
      return false;
    }
  };

  const deleteProject = async (projectId: string): Promise<boolean> => {
    console.log('ProjectProvider: deleteProject called with:', projectId);
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        console.error('Error deleting project:', error);
        setError('Erreur lors de la suppression du projet: ' + error.message);
        return false;
      }

      console.log('Project deleted successfully');
      
      // Rafraîchir immédiatement la liste des projets
      await refreshProjects();
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Erreur lors de la suppression du projet.');
      return false;
    }
  };

  useEffect(() => {
    console.log('ProjectProvider: useEffect called - loading projects');
    refreshProjects();
  }, []);

  return (
    <ProjectContext.Provider value={{
      projects,
      createProject,
      deleteProject,
      refreshProjects,
      isLoading,
      error
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
