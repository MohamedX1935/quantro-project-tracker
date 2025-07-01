
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
      // Check if supabase is properly configured
      if (!supabase || typeof supabase.from !== 'function') {
        console.warn('Supabase not properly configured, using empty projects list');
        setProjects([]);
        return;
      }

      console.log('Fetching projects from Supabase...');
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        setError('Erreur lors du chargement des projets. Vérifiez votre connexion Supabase.');
        return;
      }

      console.log('Projects fetched:', data);
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
      // Check if supabase is properly configured
      if (!supabase || typeof supabase.from !== 'function') {
        console.warn('Supabase not properly configured, cannot create project');
        setError('Supabase n\'est pas configuré correctement.');
        return false;
      }

      // For now, use a mock user ID since we're not using Supabase auth yet
      const mockUserId = 'user-' + Date.now();

      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            name: projectData.name,
            description: projectData.description,
            deadline: projectData.deadline,
            priority: projectData.priority || 'moyenne',
            location: projectData.location || '',
            created_by: mockUserId,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        setError('Erreur lors de la création du projet: ' + error.message);
        return false;
      }

      console.log('Project created successfully:', data);
      await refreshProjects();
      return true;
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Erreur lors de la création du projet.');
      return false;
    }
  };

  // Only try to load projects if we're not in the initial render
  useEffect(() => {
    console.log('ProjectProvider: useEffect called');
    refreshProjects();
  }, []);

  return (
    <ProjectContext.Provider value={{
      projects,
      createProject,
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
