
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
          project_tasks (
            title,
            projects (
              name
            )
          )
        `);

      // Si c'est un employé, ne récupérer que ses demandes
      if (user?.role === 'employee') {
        query = query.eq('employee_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching extension requests:', error);
        setError('Erreur lors du chargement des demandes');
        return;
      }

      console.log('Extension requests fetched:', data);
      setRequests(data || []);
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

      await fetchExtensionRequests();
      return true;
    } catch (error) {
      console.error('Error updating extension request:', error);
      return false;
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
