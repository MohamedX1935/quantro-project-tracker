
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminTask {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  deadline: string | null;
  project_id: string;
  assignee_id: string | null;
  created_at: string;
  updated_at: string;
  closed_by_admin: boolean | null;
  project?: {
    name: string;
    created_by: string;
  };
  assignee?: {
    first_name: string;
    last_name: string;
  };
  created_by_user?: {
    first_name: string;
    last_name: string;
  };
}

export const useAdminTasks = () => {
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('project_tasks')
        .select(`
          *,
          projects!project_tasks_project_id_fkey (
            name,
            created_by
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching admin tasks:', error);
        setError('Erreur lors du chargement des tâches');
        return;
      }

      // Récupérer les informations des créateurs de projets
      const creatorIds = [...new Set(data?.map(task => task.projects?.created_by).filter(Boolean) || [])];
      let creatorsData: any[] = [];

      if (creatorIds.length > 0) {
        const { data: creators, error: creatorsError } = await supabase
          .from('app_users')
          .select('id, first_name, last_name')
          .in('id', creatorIds);

        if (!creatorsError) {
          creatorsData = creators || [];
        }
      }

      // Récupérer les informations des assignés
      const assigneeIds = [...new Set(data?.map(task => task.assignee_id).filter(Boolean) || [])];
      let assigneesData: any[] = [];

      if (assigneeIds.length > 0) {
        const { data: assignees, error: assigneesError } = await supabase
          .from('app_users')
          .select('id, first_name, last_name')
          .in('id', assigneeIds);

        if (!assigneesError) {
          assigneesData = assignees || [];
        }
      }

      // Transformer les données
      const transformedTasks = data?.map(task => {
        const creator = creatorsData.find(c => c.id === task.projects?.created_by);
        const assignee = assigneesData.find(a => a.id === task.assignee_id);

        return {
          ...task,
          project: task.projects ? {
            name: task.projects.name,
            created_by: task.projects.created_by
          } : undefined,
          created_by_user: creator ? {
            first_name: creator.first_name || '',
            last_name: creator.last_name || ''
          } : undefined,
          assignee: assignee ? {
            first_name: assignee.first_name || '',
            last_name: assignee.last_name || ''
          } : undefined
        };
      }) || [];

      console.log('Admin tasks fetched successfully:', transformedTasks);
      setTasks(transformedTasks);
    } catch (error) {
      console.error('Error fetching admin tasks:', error);
      setError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Error deleting task:', error);
        throw error;
      }

      // Mettre à jour l'état local
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      console.log('Task deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  const closeTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({ 
          closed_by_admin: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) {
        console.error('Error closing task:', error);
        throw error;
      }

      // Mettre à jour l'état local
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, closed_by_admin: true, updated_at: new Date().toISOString() }
            : task
        )
      );

      console.log('Task closed successfully');
      return true;
    } catch (error) {
      console.error('Error closing task:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    isLoading,
    error,
    deleteTask,
    closeTask,
    refreshTasks: fetchTasks
  };
};
