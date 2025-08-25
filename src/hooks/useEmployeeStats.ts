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
      // 1. Récupérer toutes les tâches de l'employé
      const { data: allTasks, error: tasksError } = await supabase
        .from('project_tasks')
        .select(`
          id,
          project_id,
          title,
          description,
          status,
          deadline,
          priority,
          closed_by_admin
        `)
        .eq('assignee_id', empId);

      if (tasksError) {
        throw new Error('Erreur lors de la récupération des tâches');
      }

      // 2. Extraire les project_id uniques et récupérer les projets
      const projectIds = [...new Set(allTasks?.map(task => task.project_id).filter(Boolean) || [])];
      let projects: any[] = [];
      
      if (projectIds.length > 0) {
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('id, name, description, deadline, priority, location')
          .in('id', projectIds);

        if (projectsError) {
          console.error('Erreur lors de la récupération des projets:', projectsError);
        } else {
          projects = projectsData || [];
        }
      }

      // 3. Construire la map des projets par ID
      const projectsById = new Map(projects.map(project => [project.id, project]));
      
      // 4. Construire les projets assignés (uniques)
      const uniqueProjectIds = new Set(allTasks?.map(task => task.project_id).filter(Boolean) || []);
      const assignedProjects = Array.from(uniqueProjectIds)
        .map(projectId => projectsById.get(projectId))
        .filter(Boolean);

      // 5. Construire les tâches terminées avec les noms des projets
      const completedTasks = allTasks?.filter(task => task.status === 'Terminé').map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        deadline: task.deadline,
        project_name: projectsById.get(task.project_id)?.name || 'Projet supprimé',
        project_id: task.project_id
      })) || [];

      // 6. Calculer les tâches actives
      const activeTasks = allTasks?.filter(task => 
        task.status !== 'Terminé' && !task.closed_by_admin
      ) || [];

      const activeTasksCount = activeTasks.length;
      const isActive = activeTasksCount > 0;

      // 7. Récupérer les heures totales depuis les rapports de tâches
      const { data: reportsData, error: reportsError } = await supabase
        .from('task_reports')
        .select('time_spent')
        .eq('employee_id', empId);

      if (reportsError) {
        console.error('Erreur lors de la récupération des rapports:', reportsError);
      }

      const totalHours = reportsData?.reduce((total, report) => {
        const timeSpent = parseFloat(report.time_spent?.toString() || '0');
        return total + (isNaN(timeSpent) ? 0 : timeSpent);
      }, 0) || 0;

      // 8. Construire l'objet des statistiques
      const stats: EmployeeStats = {
        isActive,
        assignedProjects,
        completedTasks,
        totalHours,
        activeTasksCount
      };

      setStats(stats);

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

      // Récupérer toutes les tâches
      const { data: allTasks, error: tasksError } = await supabase
        .from('project_tasks')
        .select(`
          id,
          project_id,
          assignee_id,
          title,
          description,
          status,
          deadline,
          priority,
          closed_by_admin
        `);

      if (tasksError) throw tasksError;

      // Récupérer tous les projets nécessaires
      const allProjectIds = [...new Set(allTasks?.map(task => task.project_id).filter(Boolean) || [])];
      let allProjects: any[] = [];
      
      if (allProjectIds.length > 0) {
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('id, name, description, deadline, priority, location')
          .in('id', allProjectIds);

        if (projectsError) {
          console.error('Erreur lors de la récupération des projets:', projectsError);
        } else {
          allProjects = projectsData || [];
        }
      }

      // Créer une map des projets par ID
      const projectsById = new Map(allProjects.map(project => [project.id, project]));

      // Récupérer tous les rapports de tâches
      const { data: allReports, error: reportsError } = await supabase
        .from('task_reports')
        .select('employee_id, time_spent');

      if (reportsError) {
        console.error('Erreur lors de la récupération des rapports:', reportsError);
      }

      // Construire les statistiques pour chaque employé
      const stats: Record<string, EmployeeStats> = {};
      
      for (const employee of employees) {
        // Tâches de cet employé
        const employeeTasks = allTasks?.filter(task => task.assignee_id === employee.id) || [];
        
        // Tâches actives (non terminées et non fermées par admin)
        const activeTasks = employeeTasks.filter(task => 
          task.status !== 'Terminé' && !task.closed_by_admin
        );
        
        // Projets uniques assignés à cet employé
        const uniqueProjectIds = new Set(employeeTasks.map(task => task.project_id).filter(Boolean));
        const assignedProjects = Array.from(uniqueProjectIds)
          .map(projectId => projectsById.get(projectId))
          .filter(Boolean);
        
        // Tâches terminées avec nom du projet
        const completedTasks = employeeTasks.filter(task => task.status === 'Terminé').map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          deadline: task.deadline,
          project_name: projectsById.get(task.project_id)?.name || 'Projet supprimé',
          project_id: task.project_id
        }));
        
        // Heures totales de cet employé
        const employeeReports = allReports?.filter(report => report.employee_id === employee.id) || [];
        const totalHours = employeeReports.reduce((total, report) => {
          const timeSpent = parseFloat(report.time_spent?.toString() || '0');
          return total + (isNaN(timeSpent) ? 0 : timeSpent);
        }, 0);

        stats[employee.id] = {
          isActive: activeTasks.length > 0,
          assignedProjects,
          completedTasks,
          totalHours,
          activeTasksCount: activeTasks.length
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