import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, endOfWeek, addWeeks, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WeeklyTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  deadline: string;
  assignee_id: string | null;
  project_id: string;
  assignee?: {
    username: string;
    first_name?: string;
    last_name?: string;
  };
  project?: {
    name: string;
  };
}

interface TasksByDay {
  [key: string]: WeeklyTask[];
}

export const useWeeklyPlanning = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [tasksByDay, setTasksByDay] = useState<TasksByDay>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

  // Fonction pour initialiser la grille de la semaine
  const initializeWeekGrid = useCallback(() => {
    const grid: TasksByDay = {};
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(currentWeekStart);
      dayDate.setDate(dayDate.getDate() + i);
      const dayKey = format(dayDate, 'yyyy-MM-dd');
      grid[dayKey] = [];
    }
    return grid;
  }, [currentWeekStart]);

  // Charger les employés et projets une seule fois
  useEffect(() => {
    const loadStaticData = async () => {
      try {
        const [employeesResult, projectsResult] = await Promise.all([
          supabase
            .from('app_users')
            .select('id, username, first_name, last_name')
            .eq('role', 'employee'),
          supabase
            .from('projects')
            .select('id, name')
        ]);

        if (employeesResult.error) throw employeesResult.error;
        if (projectsResult.error) throw projectsResult.error;

        setEmployees(employeesResult.data || []);
        setProjects(projectsResult.data || []);
      } catch (err) {
        console.error('Erreur lors du chargement des données statiques:', err);
      }
    };

    loadStaticData();
  }, []);

  // Charger les tâches de la semaine
  const fetchWeeklyTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Initialiser la grille avec des jours vides
      const weekGrid = initializeWeekGrid();

      // Construire la requête pour les tâches
      let tasksQuery = supabase
        .from('project_tasks')
        .select(`
          id,
          title,
          status,
          priority,
          deadline,
          assignee_id,
          project_id,
          projects!inner (
            name
          )
        `)
        .gte('deadline', format(currentWeekStart, 'yyyy-MM-dd'))
        .lte('deadline', format(weekEnd, 'yyyy-MM-dd'))
        .not('deadline', 'is', null)
        .order('deadline', { ascending: true });

      // Appliquer les filtres
      if (selectedEmployee) {
        tasksQuery = tasksQuery.eq('assignee_id', selectedEmployee);
      }
      if (selectedProject) {
        tasksQuery = tasksQuery.eq('project_id', selectedProject);
      }

      const { data: tasks, error: tasksError } = await tasksQuery;

      if (tasksError) throw tasksError;

      // Enrichir les tâches avec les données des assignés
      if (tasks && tasks.length > 0) {
        const assigneeIds = [...new Set(tasks.map(task => task.assignee_id).filter(Boolean))];
        
        let assigneesMap = new Map();
        if (assigneeIds.length > 0) {
          const { data: assignees, error: assigneesError } = await supabase
            .from('app_users')
            .select('id, username, first_name, last_name')
            .in('id', assigneeIds);

          if (assigneesError) throw assigneesError;
          
          assignees?.forEach(assignee => {
            assigneesMap.set(assignee.id, assignee);
          });
        }

        // Distribuer les tâches par jour
        tasks.forEach(task => {
          if (task.deadline) {
            const taskDate = format(new Date(task.deadline), 'yyyy-MM-dd');
            if (weekGrid[taskDate]) {
              const enrichedTask: WeeklyTask = {
                ...task,
                assignee: task.assignee_id ? assigneesMap.get(task.assignee_id) : undefined,
                project: task.projects
              };
              weekGrid[taskDate].push(enrichedTask);
            }
          }
        });
      }

      setTasksByDay(weekGrid);
    } catch (err) {
      console.error('Erreur lors du chargement des tâches:', err);
      setError('Erreur lors du chargement des tâches');
      // En cas d'erreur, afficher quand même la grille vide
      setTasksByDay(initializeWeekGrid());
    } finally {
      setIsLoading(false);
    }
  }, [currentWeekStart, weekEnd, selectedEmployee, selectedProject, initializeWeekGrid]);

  // Charger les tâches quand la semaine ou les filtres changent
  useEffect(() => {
    fetchWeeklyTasks();
  }, [fetchWeeklyTasks]);

  // Navigation entre les semaines
  const goToPreviousWeek = useCallback(() => {
    setCurrentWeekStart(prev => addWeeks(prev, -1));
  }, []);

  const goToNextWeek = useCallback(() => {
    setCurrentWeekStart(prev => addWeeks(prev, 1));
  }, []);

  const goToCurrentWeek = useCallback(() => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  }, []);

  // Utilitaires
  const isCurrentWeek = useCallback(() => {
    const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    return isSameDay(currentWeekStart, thisWeekStart);
  }, [currentWeekStart]);

  const isToday = useCallback((date: Date) => {
    return isSameDay(date, new Date());
  }, []);

  return {
    currentWeekStart,
    weekEnd,
    tasksByDay,
    isLoading,
    error,
    employees,
    projects,
    selectedEmployee,
    selectedProject,
    setSelectedEmployee,
    setSelectedProject,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    isCurrentWeek,
    isToday,
    refreshTasks: fetchWeeklyTasks
  };
};