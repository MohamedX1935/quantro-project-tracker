
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ExtensionRequest {
  id: string;
  task_id: string;
  employee_id: string;
  reason: string;
  requested_extension: string | null;
  status: string;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
  task?: {
    title: string;
    project: {
      name: string;
    };
  };
  employee?: {
    first_name: string;
    last_name: string;
    username: string;
  };
}

export const useExtensionRequests = () => {
  const [requests, setRequests] = useState<ExtensionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchExtensionRequests = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('extension_requests')
        .select(`
          *,
          project_tasks!extension_requests_task_id_fkey (
            title,
            projects!project_tasks_project_id_fkey (
              name
            )
          )
        `);

      // Si c'est un employé, ne récupérer que ses demandes
      if (user?.role === 'employee') {
        query = query.eq('employee_id', user.id);
      }

      const { data: requestsData, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching extension requests:', error);
        setError('Erreur lors du chargement des demandes');
        return;
      }

      // Récupérer les informations des employés pour les demandes (côté admin)
      const employeeIds = [...new Set(requestsData?.map(req => req.employee_id) || [])];
      let employeesData: any[] = [];

      if (employeeIds.length > 0 && user?.role === 'admin') {
        const { data: employees, error: employeesError } = await supabase
          .from('app_users')
          .select('id, first_name, last_name, username')
          .in('id', employeeIds);

        if (!employeesError && employees) {
          employeesData = employees;
          console.log('Employees data fetched:', employees);
        } else {
          console.error('Error fetching employees:', employeesError);
        }
      }

      // Transformer les données pour correspondre à l'interface
      const transformedRequests = requestsData?.map(request => {
        const employee = employeesData.find(emp => emp.id === request.employee_id);
        
        return {
          ...request,
          task: {
            title: request.project_tasks?.title || 'Tâche non trouvée',
            project: {
              name: request.project_tasks?.projects?.name || 'Projet non défini'
            }
          },
          employee: employee ? {
            first_name: employee.first_name || '',
            last_name: employee.last_name || '',
            username: employee.username || ''
          } : undefined
        };
      }) || [];

      console.log('Extension requests fetched:', transformedRequests);
      setRequests(transformedRequests);
    } catch (error) {
      console.error('Error fetching extension requests:', error);
      setError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const createExtensionRequest = async (requestData: {
    task_id: string;
    reason: string;
    requested_extension: string;
  }) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('extension_requests')
        .insert({
          task_id: requestData.task_id,
          employee_id: user.id,
          reason: requestData.reason,
          requested_extension: requestData.requested_extension
        });

      if (error) {
        console.error('Error creating extension request:', error);
        return false;
      }

      await fetchExtensionRequests();
      return true;
    } catch (error) {
      console.error('Error creating extension request:', error);
      return false;
    }
  };

  const updateExtensionRequest = async (requestId: string, status: string, adminResponse?: string) => {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (adminResponse) {
        updateData.admin_response = adminResponse;
      }

      const { error } = await supabase
        .from('extension_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) {
        console.error('Error updating extension request:', error);
        return false;
      }

      // Si la demande est approuvée, mettre à jour la deadline de la tâche
      if (status === 'Approuvée') {
        const request = requests.find(r => r.id === requestId);
        if (request) {
          await updateTaskDeadline(request.task_id, request.requested_extension);
        }
      }

      await fetchExtensionRequests();
      return true;
    } catch (error) {
      console.error('Error updating extension request:', error);
      return false;
    }
  };

  const updateTaskDeadline = async (taskId: string, extension: string | null) => {
    if (!extension) return;

    try {
      // Récupérer la deadline actuelle de la tâche
      const { data: task, error: fetchError } = await supabase
        .from('project_tasks')
        .select('deadline')
        .eq('id', taskId)
        .single();

      if (fetchError || !task) {
        console.error('Error fetching task deadline:', fetchError);
        return;
      }

      // Calculer la nouvelle deadline
      const currentDeadline = new Date(task.deadline);
      let newDeadline = new Date(currentDeadline);

      // Parser l'extension demandée
      if (extension.includes('jour')) {
        const days = parseInt(extension);
        newDeadline.setDate(currentDeadline.getDate() + days);
      } else if (extension.includes('semaine')) {
        const weeks = parseInt(extension);
        newDeadline.setDate(currentDeadline.getDate() + (weeks * 7));
      }

      // Mettre à jour la deadline de la tâche
      const { error: updateError } = await supabase
        .from('project_tasks')
        .update({ deadline: newDeadline.toISOString().split('T')[0] })
        .eq('id', taskId);

      if (updateError) {
        console.error('Error updating task deadline:', updateError);
      } else {
        console.log('Task deadline updated successfully');
      }
    } catch (error) {
      console.error('Error updating task deadline:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchExtensionRequests();
    }
  }, [user]);

  return {
    requests,
    isLoading,
    error,
    createExtensionRequest,
    updateExtensionRequest,
    refreshRequests: fetchExtensionRequests
  };
};
