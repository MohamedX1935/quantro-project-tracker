
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Json } from '@/integrations/supabase/types';

export interface TaskReport {
  id: string;
  task_id: string;
  employee_id: string;
  summary: string;
  difficulties: string | null;
  solutions: string | null;
  recommendations: string | null;
  time_spent: number | null;
  quality_rating: string | null;
  location: string | null;
  attachments: Json | null;
  generated_report: string | null;
  created_at: string;
  task?: {
    title: string;
    project: {
      name: string;
    };
  };
}

export const useTaskReports = () => {
  const [reports, setReports] = useState<TaskReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchTaskReports = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('task_reports')
        .select(`
          *,
          project_tasks!task_reports_task_id_fkey (
            title,
            projects!project_tasks_project_id_fkey (
              name
            )
          )
        `);

      // Si c'est un employé, ne récupérer que ses rapports
      if (user?.role === 'employee') {
        query = query.eq('employee_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching task reports:', error);
        setError('Erreur lors du chargement des rapports');
        return;
      }

      console.log('Task reports fetched:', data);
      
      // Transformer les données pour correspondre à l'interface TaskReport
      const transformedReports = data?.map(report => ({
        ...report,
        task: {
          title: report.project_tasks?.title || 'Titre non disponible',
          project: {
            name: report.project_tasks?.projects?.name || 'Projet non défini'
          }
        }
      })) || [];

      setReports(transformedReports);
    } catch (error) {
      console.error('Error fetching task reports:', error);
      setError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const createTaskReport = async (reportData: {
    task_id: string;
    summary: string;
    difficulties?: string;
    solutions?: string;
    recommendations?: string;
    time_spent?: number;
    quality_rating?: string;
    location?: string;
    attachments?: any[];
  }) => {
    if (!user) return null;

    try {
      // Générer le rapport avec l'IA
      const generatedReport = await generateAIReport(reportData);

      const { data, error } = await supabase
        .from('task_reports')
        .insert({
          task_id: reportData.task_id,
          employee_id: user.id,
          summary: reportData.summary,
          difficulties: reportData.difficulties,
          solutions: reportData.solutions,
          recommendations: reportData.recommendations,
          time_spent: reportData.time_spent,
          quality_rating: reportData.quality_rating,
          location: reportData.location,
          attachments: reportData.attachments || [],
          generated_report: generatedReport
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating task report:', error);
        return null;
      }

      await fetchTaskReports();
      return data;
    } catch (error) {
      console.error('Error creating task report:', error);
      return null;
    }
  };

  const generateAIReport = async (reportData: any): Promise<string> => {
    try {
      const response = await supabase.functions.invoke('generate-report', {
        body: {
          summary: reportData.summary,
          difficulties: reportData.difficulties,
          solutions: reportData.solutions,
          recommendations: reportData.recommendations,
          time_spent: reportData.time_spent,
          quality_rating: reportData.quality_rating,
          location: reportData.location
        }
      });

      if (response.error) {
        console.error('Error calling generate-report function:', response.error);
        return 'Rapport généré automatiquement non disponible.';
      }

      return response.data?.generatedReport || 'Rapport généré automatiquement non disponible.';
    } catch (error) {
      console.error('Error generating AI report:', error);
      return 'Rapport généré automatiquement non disponible.';
    }
  };

  useEffect(() => {
    if (user) {
      fetchTaskReports();
    }
  }, [user]);

  return {
    reports,
    isLoading,
    error,
    createTaskReport,
    refreshReports: fetchTaskReports
  };
};
