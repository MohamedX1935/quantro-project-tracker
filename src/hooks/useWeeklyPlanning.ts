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
    startOfWeek(new Date(), { weekStartsOn: 1 }) // Lundi = 1
  );
  const [tasksByDay, setTasksByDay] = useState<TasksByDay>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

  const fetchEmployees = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('id, username, first_name, last_name')
        .eq('role', 'employee');
      
      if (error) throw error;
      setEmployees(data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des employés:', err);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name');
      
      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des projets:', err);
    }
  }, []);

  const fetchWeeklyTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('project_tasks')
        .select(`
          id,
          title,
          status,
          priority,
          deadline,
          assignee_id,
          project_id,
          projects (
            name
          )
        `)
        .gte('deadline', format(currentWeekStart, 'yyyy-MM-dd'))
        .lte('deadline', format(weekEnd, 'yyyy-MM-dd'))
        .order('deadline', { ascending: true });

      // Filtrer par employé si sélectionné
      if (selectedEmployee) {
        query = query.eq('assignee_id', selectedEmployee);
      }

      // Filtrer par projet si sélectionné
      if (selectedProject) {
        query = query.eq('project_id', selectedProject);
      }

      const { data: tasks, error: tasksError } = await query;

      if (tasksError) throw tasksError;

      // Récupérer les informations des assignés
      const assigneeIds = [...new Set(tasks?.map(task => task.assignee_id).filter(Boolean))];
      let assignees = [];
      
      if (assigneeIds.length > 0) {
        const { data: assigneesData, error: assigneesError } = await supabase
          .from('app_users')
          .select('id, username, first_name, last_name')
          .in('id', assigneeIds);

        if (assigneesError) throw assigneesError;
        assignees = assigneesData || [];
      }

      // Mapper les assignés aux tâches
      const tasksWithAssignees = tasks?.map(task => ({
        ...task,
        assignee: assignees?.find(assignee => assignee.id === task.assignee_id),
        project: task.projects
      })) || [];

      // Grouper les tâches par jour
      const grouped: TasksByDay = {};
      
      // Initialiser tous les jours de la semaine
      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(currentWeekStart);
        dayDate.setDate(dayDate.getDate() + i);
        const dayKey = format(dayDate, 'yyyy-MM-dd');
        grouped[dayKey] = [];
      }

      // Répartir les tâches par jour
      tasksWithAssignees.forEach(task => {
        if (task.deadline) {
          const taskDate = format(new Date(task.deadline), 'yyyy-MM-dd');
          if (grouped[taskDate]) {
            grouped[taskDate].push(task);
          }
        }
      });

      setTasksByDay(grouped);
    } catch (err) {
      console.error('Erreur lors du chargement des tâches:', err);
      setError('Erreur lors du chargement des tâches');
    } finally {
      setIsLoading(false);
    }
  }, [currentWeekStart, weekEnd, selectedEmployee, selectedProject]);

  const goToPreviousWeek = useCallback(() => {
    setCurrentWeekStart(prev => addWeeks(prev, -1));
  }, []);

  const goToNextWeek = useCallback(() => {
    setCurrentWeekStart(prev => addWeeks(prev, 1));
  }, []);

  const goToCurrentWeek = useCallback(() => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  }, []);

  const isCurrentWeek = useCallback(() => {
    const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    return isSameDay(currentWeekStart, thisWeekStart);
  }, [currentWeekStart]);

  const isToday = useCallback((date: Date) => {
    return isSameDay(date, new Date());
  }, []);

  useEffect(() => {
    fetchEmployees();
    fetchProjects();
  }, [fetchEmployees, fetchProjects]);

  useEffect(() => {
    fetchWeeklyTasks();
  }, [fetchWeeklyTasks]);

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