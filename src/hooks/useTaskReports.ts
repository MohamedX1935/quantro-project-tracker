
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
  employee?: {
    first_name: string | null;
    last_name: string | null;
    username: string;
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
      
      // Récupérer les informations des employés pour chaque rapport
      const employeeIds = [...new Set(data?.map(report => report.employee_id))];
      const { data: employees } = await supabase
        .from('app_users')
        .select('id, first_name, last_name, username')
        .in('id', employeeIds);

      // Transformer les données pour correspondre à l'interface TaskReport
      const transformedReports = data?.map(report => {
        const employee = employees?.find(emp => emp.id === report.employee_id);
        return {
          ...report,
          task: {
            title: report.project_tasks?.title || 'Titre non disponible',
            project: {
              name: report.project_tasks?.projects?.name || 'Projet non défini'
            }
          },
          employee: employee ? {
            first_name: employee.first_name,
            last_name: employee.last_name,
            username: employee.username
          } : null
        };
      }) || [];

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
    task_title?: string;
    project_name?: string;
    summary: string;
    difficulties?: string;
    solutions?: string;
    recommendations?: string;
    time_spent?: string | number;
    quality_rating?: string;
    location?: string;
    attachments?: any[];
  }) => {
    if (!user) return null;

    try {
      console.log('Creating task report with data:', reportData);
      
      // Récupérer les informations de l'employé
      const { data: employeeData } = await supabase
        .from('app_users')
        .select('first_name, last_name, username')
        .eq('id', user.id)
        .single();

      const employeeName = employeeData 
        ? `${employeeData.first_name || ''} ${employeeData.last_name || ''}`.trim() || employeeData.username
        : 'Employé non identifié';
      
      // Générer le rapport avec l'IA
      const generatedReport = await generateAIReport({
        ...reportData,
        task_title: reportData.task_title,
        project_name: reportData.project_name,
        employee_name: employeeName
      });

      console.log('Generated AI report successfully, inserting into database...');

      // Préparer les données pour l'insertion avec gestion des valeurs obligatoires
      const insertData = {
        task_id: reportData.task_id,
        employee_id: user.id,
        summary: reportData.summary,
        difficulties: reportData.difficulties || null,
        solutions: reportData.solutions || null,
        recommendations: reportData.recommendations || null,
        time_spent: reportData.time_spent && reportData.time_spent.toString().trim() !== '' && !isNaN(parseFloat(reportData.time_spent.toString())) 
          ? parseFloat(reportData.time_spent.toString()) 
          : null,
        quality_rating: reportData.quality_rating && reportData.quality_rating.trim() !== '' ? reportData.quality_rating : null,
        location: reportData.location || null,
        attachments: reportData.attachments || [],
        generated_report: generatedReport
      };

      console.log('Données à insérer en base:', insertData);

      const { data, error } = await supabase
        .from('task_reports')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating task report in database:', error);
        throw error;
      }

      console.log('Task report created successfully:', data);
      await fetchTaskReports();
      return data;
    } catch (error) {
      console.error('Error in createTaskReport:', error);
      throw error;
    }
  };

  const generateAIReport = async (reportData: any): Promise<string> => {
    try {
      console.log('Calling generate-report function with data:', reportData);
      
       const response = await supabase.functions.invoke('generate-report', {
        body: {
          summary: reportData.summary,
          difficulties: reportData.difficulties,
          solutions: reportData.solutions,
          recommendations: reportData.recommendations,
          time_spent: reportData.time_spent,
          quality_rating: reportData.quality_rating,
          location: reportData.location,
          task_title: reportData.task_title,
          project_name: reportData.project_name,
          employee_name: reportData.employee_name
        }
      });

      console.log('Generate-report response:', response);

      if (response.error) {
        console.error('Error calling generate-report function:', response.error);
        return `Erreur lors de la génération du rapport IA: ${response.error.message}`;
      }

      if (response.data?.warning) {
        console.warn('Warning from generate-report:', response.data.warning);
      }

      const generatedReport = response.data?.generatedReport;
      if (!generatedReport) {
        console.error('No generatedReport in response:', response);
        return 'Rapport IA non disponible - réponse vide du serveur.';
      }

      console.log('Successfully generated AI report, length:', generatedReport.length);
      return generatedReport;
    } catch (error) {
      console.error('Error generating AI report:', error);
      return `Erreur technique lors de la génération du rapport IA: ${error.message}`;
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
