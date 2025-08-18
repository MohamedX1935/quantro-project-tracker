import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EmployeeProject {
  id: string;
  name: string;
  description: string;
  deadline: string;
  priority: string;
  location?: string;
}

export interface EmployeeTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  deadline: string;
  project_name: string;
  project_id: string;
}

export interface EmployeeStats {
  isActive: boolean;
  assignedProjects: EmployeeProject[];
  completedTasks: EmployeeTask[];
  totalHours: number;
  activeTasksCount: number;
}

export const useEmployeeStats = (employeeId?: string) => {
  const [stats, setStats] = useState<EmployeeStats>({
    isActive: false,
    assignedProjects: [],
    completedTasks: [],
    totalHours: 0,
    activeTasksCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployeeStats = async (empId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Vérifier si l'employé a des tâches actives pour déterminer son statut
      const { data: activeTasks, error: activeTasksError } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('assignee_id', empId)
        .neq('status', 'Terminé')
        .neq('closed_by_admin', true);

      if (activeTasksError) throw activeTasksError;

      const isActive = (activeTasks?.length || 0) > 0;
      const activeTasksCount = activeTasks?.length || 0;

      // 2. Récupérer les projets assignés à l'employé
      const { data: assignedProjectsData, error: projectsError } = await supabase
        .from('project_tasks')
        .select(`
          project_id,
          projects!inner (
            id,
            name,
            description,
            deadline,
            priority,
            location
          )
        `)
        .eq('assignee_id', empId);

      if (projectsError) throw projectsError;

      // Extraire les projets uniques
      const uniqueProjects = new Map();
      assignedProjectsData?.forEach(item => {
        const project = item.projects;
        if (project && !uniqueProjects.has(project.id)) {
          uniqueProjects.set(project.id, {
            id: project.id,
            name: project.name,
            description: project.description,
            deadline: project.deadline,
            priority: project.priority,
            location: project.location
          });
        }
      });
      const assignedProjects = Array.from(uniqueProjects.values());

      // 3. Récupérer les tâches terminées
      const { data: completedTasksData, error: completedTasksError } = await supabase
        .from('project_tasks')
        .select(`
          id,
          title,
          description,
          status,
          deadline,
          project_id,
          projects!inner (
            name
          )
        `)
        .eq('assignee_id', empId)
        .eq('status', 'Terminé');

      if (completedTasksError) throw completedTasksError;

      const completedTasks = completedTasksData?.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        deadline: task.deadline,
        project_name: task.projects?.name || 'Projet supprimé',
        project_id: task.project_id
      })) || [];

      // 4. Calculer le total des heures passées
      const { data: reportsData, error: reportsError } = await supabase
        .from('task_reports')
        .select('time_spent')
        .eq('employee_id', empId);

      if (reportsError) throw reportsError;

      const totalHours = reportsData?.reduce((total, report) => {
        const timeSpent = parseFloat(report.time_spent?.toString() || '0');
        return total + (isNaN(timeSpent) ? 0 : timeSpent);
      }, 0) || 0;

      setStats({
        isActive,
        assignedProjects,
        completedTasks,
        totalHours,
        activeTasksCount
      });

    } catch (error) {
      console.error('Error fetching employee stats:', error);
      setError('Erreur lors du chargement des statistiques de l\'employé');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeStats(employeeId);
    } else {
      setStats({
        isActive: false,
        assignedProjects: [],
        completedTasks: [],
        totalHours: 0,
        activeTasksCount: 0
      });
      setIsLoading(false);
    }
  }, [employeeId]);

  return {
    stats,
    isLoading,
    error,
    refreshStats: () => employeeId && fetchEmployeeStats(employeeId)
  };
};

// Hook pour obtenir les statistiques de tous les employés (pour TeamDashboard)
export const useAllEmployeesStats = () => {
  const [employeesStats, setEmployeesStats] = useState<Record<string, EmployeeStats>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllEmployeesStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Récupérer tous les employés
      const { data: employees, error: employeesError } = await supabase
        .from('app_users')
        .select('id, username')
        .eq('role', 'employee');

      if (employeesError) throw employeesError;

      if (!employees) return;

      // Récupérer les tâches actives pour déterminer quels employés sont actifs
      const { data: activeTasks, error: activeTasksError } = await supabase
        .from('project_tasks')
        .select('assignee_id')
        .neq('status', 'Terminé')
        .neq('closed_by_admin', true);

      if (activeTasksError) throw activeTasksError;

      // Créer un Set des employés actifs
      const activeEmployeeIds = new Set(
        activeTasks?.map(task => task.assignee_id).filter(Boolean)
      );

      // Construire les statistiques pour chaque employé
      const stats: Record<string, EmployeeStats> = {};
      
      for (const employee of employees) {
        const isActive = activeEmployeeIds.has(employee.username);
        stats[employee.username] = {
          isActive,
          assignedProjects: [],
          completedTasks: [],
          totalHours: 0,
          activeTasksCount: 0
        };
      }

      setEmployeesStats(stats);

    } catch (error) {
      console.error('Error fetching all employees stats:', error);
      setError('Erreur lors du chargement des statistiques des employés');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEmployeesStats();
  }, []);

  return {
    employeesStats,
    isLoading,
    error,
    refreshStats: fetchAllEmployeesStats
  };
};