
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
  };
  assignee?: {
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
          projects (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching admin tasks:', error);
        setError('Erreur lors du chargement des tâches');
        return;
      }

      console.log('Admin tasks fetched successfully:', data);
      setTasks(data || []);
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
