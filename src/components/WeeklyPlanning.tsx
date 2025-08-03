import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useWeeklyPlanning } from '@/hooks/useWeeklyPlanning';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  User,
  FolderOpen,
  Clock,
  Filter,
  RotateCcw,
  Eye,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const WeeklyPlanning = () => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  
  const {
    currentWeekStart,
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
    isToday
  } = useWeeklyPlanning();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Terminé':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'En cours':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'En attente':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Reporté':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'haute':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'moyenne':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'basse':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getDayName = (dayIndex: number) => {
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    return days[dayIndex];
  };

  const clearFilters = () => {
    setSelectedEmployee('');
    setSelectedProject('');
  };

  const handleTaskClick = (taskId: string, projectId: string) => {
    navigate(`/project/${projectId}?taskId=${taskId}`);
  };

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(currentWeekStart, index);
    const dayKey = format(date, 'yyyy-MM-dd');
    const tasks = tasksByDay[dayKey] || [];
    return {
      date,
      dayKey,
      tasks,
      isToday: isToday(date)
    };
  });

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-red-600 mb-2">
                <Clock className="h-8 w-8 mx-auto mb-2" />
                <p className="font-medium">Erreur de chargement</p>
                <p className="text-sm text-red-500 mt-1">{error}</p>
              </div>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="mt-3 border-red-200 text-red-600 hover:bg-red-100"
              >
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec navigation et filtres */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-xl">Planning Hebdomadaire</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Du {format(currentWeekStart, 'dd MMMM', { locale: fr })} au{' '}
                  {format(addDays(currentWeekStart, 6), 'dd MMMM yyyy', { locale: fr })}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Navigation entre semaines */}
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={goToPreviousWeek}
                  disabled={isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Précédente</span>
                </Button>
                
                {!isCurrentWeek() && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={goToCurrentWeek}
                    disabled={isLoading}
                  >
                    Aujourd'hui
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={goToNextWeek}
                  disabled={isLoading}
                >
                  <span className="hidden sm:inline mr-1">Suivante</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Bouton filtres */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                disabled={isLoading}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtres
                {(selectedEmployee || selectedProject) && (
                  <Badge variant="secondary" className="ml-2 h-4 px-1.5 text-xs">
                    {[selectedEmployee, selectedProject].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Section filtres */}
          {showFilters && (
            <>
              <Separator className="my-4" />
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    Employé
                  </label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les employés" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tous les employés</SelectItem>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.first_name && employee.last_name
                            ? `${employee.first_name} ${employee.last_name}`
                            : employee.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    Projet
                  </label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les projets" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tous les projets</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    disabled={!selectedEmployee && !selectedProject}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardHeader>
      </Card>

      {/* Grille du planning */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Chargement du planning...</span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {weekDays.map((day, index) => (
            <Card
              key={day.dayKey}
              className={cn(
                "transition-all duration-200",
                day.isToday && "ring-2 ring-primary bg-primary/5"
              )}
            >
              <CardHeader className="pb-3">
                <div className="text-center">
                  <div className={cn(
                    "text-sm font-medium",
                    day.isToday ? "text-primary" : "text-muted-foreground"
                  )}>
                    {getDayName(index)}
                  </div>
                  <div className={cn(
                    "text-lg font-bold",
                    day.isToday ? "text-primary" : "text-foreground"
                  )}>
                    {format(day.date, 'd')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(day.date, 'MMM', { locale: fr })}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-2">
                {day.tasks.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="text-muted-foreground text-xs">
                      Aucune tâche
                    </div>
                  </div>
                ) : (
                  day.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 bg-background rounded-lg border hover:shadow-sm transition-all cursor-pointer group"
                      onClick={() => handleTaskClick(task.id, task.project_id)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                            {task.title}
                          </h4>
                          <Eye className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className={cn("text-xs", getStatusVariant(task.status))}>
                            {task.status}
                          </Badge>
                          <Badge variant="outline" className={cn("text-xs", getPriorityVariant(task.priority))}>
                            {task.priority}
                          </Badge>
                        </div>

                        {task.project && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <FolderOpen className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{task.project.name}</span>
                          </div>
                        )}

                        {task.assignee && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <User className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">
                              {task.assignee.first_name && task.assignee.last_name
                                ? `${task.assignee.first_name} ${task.assignee.last_name}`
                                : task.assignee.username}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyPlanning;