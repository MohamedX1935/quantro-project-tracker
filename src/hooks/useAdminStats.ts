
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminStats {
  totalProjects: number;
  activeProjects: number;
  completedTasks: number;
  totalTasks: number;
  activeEmployees: number;
  totalEmployees: number;
  successRate: number;
  pendingExtensionRequests: number;
  reportsGenerated: number;
}

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedTasks: 0,
    totalTasks: 0,
    activeEmployees: 0,
    totalEmployees: 0,
    successRate: 0,
    pendingExtensionRequests: 0,
    reportsGenerated: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Récupérer les statistiques des projets
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*');

      if (projectsError) throw projectsError;

      // Récupérer les statistiques des tâches
      const { data: tasks, error: tasksError } = await supabase
        .from('project_tasks')
        .select('*');

      if (tasksError) throw tasksError;

      // Récupérer les employés
      const { data: employees, error: employeesError } = await supabase
        .from('app_users')
        .select('*')
        .eq('role', 'employee');

      if (employeesError) throw employeesError;

      // Récupérer les demandes de prolongation en attente
      const { data: extensionRequests, error: extensionError } = await supabase
        .from('extension_requests')
        .select('*')
        .eq('status', 'En attente');

      if (extensionError) throw extensionError;

      // Récupérer les rapports générés
      const { data: reports, error: reportsError } = await supabase
        .from('task_reports')
        .select('*');

      if (reportsError) throw reportsError;

      // Calculer les statistiques
      const totalProjects = projects?.length || 0;
      const activeProjects = projects?.filter(p => {
        // Un projet est actif s'il a des tâches non terminées
        const projectTasks = tasks?.filter(t => t.project_id === p.id) || [];
        return projectTasks.some(t => t.status !== 'Terminé' && !t.closed_by_admin);
      }).length || 0;

      const totalTasks = tasks?.length || 0;
      const completedTasks = tasks?.filter(t => t.status === 'Terminé').length || 0;
      const totalEmployees = employees?.length || 0;
      
      // Calculer les employés actifs (ceux qui ont des tâches assignées)
      const activeEmployees = new Set(
        tasks?.filter(t => t.assignee_id && t.status !== 'Terminé' && !t.closed_by_admin)
          .map(t => t.assignee_id)
      ).size;

      const successRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const pendingExtensionRequests = extensionRequests?.length || 0;
      const reportsGenerated = reports?.length || 0;

      setStats({
        totalProjects,
        activeProjects,
        completedTasks,
        totalTasks,
        activeEmployees,
        totalEmployees,
        successRate,
        pendingExtensionRequests,
        reportsGenerated
      });

      console.log('Admin stats loaded:', {
        totalProjects,
        activeProjects,
        completedTasks,
        totalTasks,
        activeEmployees,
        totalEmployees,
        successRate,
        pendingExtensionRequests,
        reportsGenerated
      });

    } catch (error) {
      console.error('Error fetching admin stats:', error);
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    isLoading,
    error,
    refreshStats: fetchStats
  };
};
