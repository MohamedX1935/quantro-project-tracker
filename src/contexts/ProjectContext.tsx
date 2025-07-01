
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
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshProjects = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        return;
      }

      setProjects(data || []);
    } catch (error) {
      console.error('Error refreshing projects:', error);
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('User not authenticated');
        return false;
      }

      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            name: projectData.name,
            description: projectData.description,
            deadline: projectData.deadline,
            priority: projectData.priority || 'moyenne',
            location: projectData.location || '',
            created_by: user.id,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        return false;
      }

      // Rafraîchir la liste des projets
      await refreshProjects();
      return true;
    } catch (error) {
      console.error('Error creating project:', error);
      return false;
    }
  };

  // Charger les projets au démarrage
  useEffect(() => {
    refreshProjects();
  }, []);

  return (
    <ProjectContext.Provider value={{
      projects,
      createProject,
      refreshProjects,
      isLoading
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
