import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, endOfWeek, addWeeks, isSameDay } from 'date-fns';

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

interface Employee {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
}

interface Project {
  id: string;
  name: string;
}

export const useWeeklyPlanning = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [tasksByDay, setTasksByDay] = useState<TasksByDay>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);

  // Dates calculées avec useMemo pour éviter les recalculs
  const weekEnd = useMemo(() => endOfWeek(currentWeekStart, { weekStartsOn: 1 }), [currentWeekStart]);
  
  const weekDates = useMemo(() => {
    return {
      start: format(currentWeekStart, 'yyyy-MM-dd'),
      end: format(weekEnd, 'yyyy-MM-dd')
    };
  }, [currentWeekStart, weekEnd]);

  // Fonction pour initialiser la grille de la semaine
  const initializeWeekGrid = useMemo(() => {
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

  // Fonction de récupération des tâches avec retry automatique
  const fetchWeeklyTasks = useCallback(async () => {
    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    setIsLoading(true);
    setError(null);

    const maxRetries = 2;

    const attemptFetch = async (retryCount = 0): Promise<void> => {
      try {
        if (signal.aborted) return;

        // Requête simplifiée pour les tâches sans jointure complexe
        let tasksQuery = supabase
          .from('project_tasks')
          .select('id, title, status, priority, deadline, assignee_id, project_id')
          .gte('deadline', weekDates.start)
          .lte('deadline', weekDates.end)
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

        if (signal.aborted) return;
        if (tasksError) throw tasksError;

        // Récupérer les données des projets et assignés séparément si nécessaire
        const weekGrid = { ...initializeWeekGrid };

        if (tasks && tasks.length > 0) {
          // Récupérer les informations des projets
          const projectIds = [...new Set(tasks.map(task => task.project_id))];
          const projectsMap = new Map();
          
          if (projectIds.length > 0) {
            const { data: projectsData, error: projectsError } = await supabase
              .from('projects')
              .select('id, name')
              .in('id', projectIds);

            if (projectsError) throw projectsError;
            
            projectsData?.forEach(project => {
              projectsMap.set(project.id, project);
            });
          }

          // Récupérer les informations des assignés
          const assigneeIds = [...new Set(tasks.map(task => task.assignee_id).filter(Boolean))];
          const assigneesMap = new Map();
          
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
                  project: projectsMap.get(task.project_id)
                };
                weekGrid[taskDate].push(enrichedTask);
              }
            }
          });
        }

        if (!signal.aborted) {
          setTasksByDay(weekGrid);
          retryCountRef.current = 0; // Reset retry count on success
        }

      } catch (err: any) {
        if (signal.aborted) return;
        
        console.error('Erreur lors du chargement des tâches (tentative', retryCount + 1, '):', err);
        
        if (retryCount < maxRetries && !signal.aborted) {
          // Retry après un délai progressif
          const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s...
          setTimeout(() => {
            if (!signal.aborted) {
              attemptFetch(retryCount + 1);
            }
          }, delay);
        } else {
          // Toutes les tentatives ont échoué
          if (!signal.aborted) {
            setError('Impossible de charger les tâches. Vérifiez votre connexion.');
            setTasksByDay(initializeWeekGrid);
          }
        }
      }
    };

    try {
      await attemptFetch();
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [weekDates.start, weekDates.end, selectedEmployee, selectedProject, initializeWeekGrid]);

  // Charger les tâches quand la semaine ou les filtres changent
  useEffect(() => {
    fetchWeeklyTasks();
    
    // Cleanup function pour annuler les requêtes en cours
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
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