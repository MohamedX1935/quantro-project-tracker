
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface EmployeeTask {
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
  project?: {
    name: string;
  };
}

export const useEmployeeTasks = () => {
  const [tasks, setTasks] = useState<EmployeeTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchTasks = async () => {
    if (!user) return;

    console.log('Fetching tasks for employee:', user.id);
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
        .eq('assignee_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching employee tasks:', error);
        setError('Erreur lors du chargement des tâches');
        return;
      }

      console.log('Employee tasks fetched successfully:', data);
      
      const tasksWithProject = data?.map(task => ({
        ...task,
        project: task.projects
      })) || [];

      setTasks(tasksWithProject);
    } catch (error) {
      console.error('Error fetching employee tasks:', error);
      setError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) {
        console.error('Error updating task status:', error);
        throw error;
      }

      // Mettre à jour l'état local
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status, updated_at: new Date().toISOString() }
            : task
        )
      );

      console.log('Task status updated successfully');
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  return {
    tasks,
    isLoading,
    error,
    refreshTasks: fetchTasks,
    updateTaskStatus
  };
};
