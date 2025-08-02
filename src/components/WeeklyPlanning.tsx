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
  Eye
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
    isToday,
    refreshTasks
  } = useWeeklyPlanning();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Terminé':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'En cours':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'En attente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Reporté':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'haute':
        return 'bg-red-100 text-red-700';
      case 'moyenne':
        return 'bg-yellow-100 text-yellow-700';
      case 'basse':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getDayAbbreviation = (dayIndex: number) => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    return days[dayIndex];
  };

  const clearFilters = () => {
    setSelectedEmployee('');
    setSelectedProject('');
  };

  const handleTaskClick = (taskId: string, projectId: string) => {
    navigate(`/project/${projectId}?taskId=${taskId}`);
  };

  if (error) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Erreur: {error}</p>
            <Button onClick={refreshTasks} className="mt-2">
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec navigation et filtres */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl text-slate-900">Planning Hebdomadaire</CardTitle>
                <p className="text-sm text-slate-600 mt-1">
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
                  className="h-9"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Précédente</span>
                </Button>
                
                {!isCurrentWeek() && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={goToCurrentWeek}
                    className="h-9"
                  >
                    Aujourd'hui
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={goToNextWeek}
                  className="h-9"
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
                className="h-9"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtres
                {(selectedEmployee || selectedProject) && (
                  <Badge className="ml-2 h-4 px-1.5 text-xs bg-blue-100 text-blue-700">
                    {[selectedEmployee, selectedProject].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Filtres dépliables */}
          {showFilters && (
            <>
              <Separator className="my-4" />
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
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
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
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
      {isLoading ? (
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="text-center">
              <Clock className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-slate-600">Chargement du planning...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {Array.from({ length: 7 }, (_, dayIndex) => {
            const dayDate = addDays(currentWeekStart, dayIndex);
            const dayKey = format(dayDate, 'yyyy-MM-dd');
            const dayTasks = tasksByDay[dayKey] || [];
            const isCurrentDay = isToday(dayDate);

            return (
              <Card
                key={dayKey}
                className={cn(
                  "bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm transition-all duration-200",
                  isCurrentDay && "ring-2 ring-blue-500 bg-blue-50/50"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="text-center">
                    <div className={cn(
                      "text-sm font-medium",
                      isCurrentDay ? "text-blue-700" : "text-slate-600"
                    )}>
                      {getDayAbbreviation(dayIndex)}
                    </div>
                    <div className={cn(
                      "text-lg font-bold",
                      isCurrentDay ? "text-blue-700" : "text-slate-900"
                    )}>
                      {format(dayDate, 'd')}
                    </div>
                    <div className="text-xs text-slate-500">
                      {format(dayDate, 'MMM', { locale: fr })}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 space-y-2">
                  {dayTasks.length === 0 ? (
                    <div className="text-center py-4">
                      <div className="text-slate-400 text-xs">
                        Aucune tâche
                      </div>
                    </div>
                  ) : (
                    dayTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 bg-white rounded-lg border border-slate-200 hover:shadow-sm transition-shadow cursor-pointer group"
                        onClick={() => handleTaskClick(task.id, task.project_id)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className="text-sm font-medium text-slate-900 line-clamp-2 group-hover:text-blue-700 transition-colors">
                              {task.title}
                            </h4>
                            <Eye className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            <Badge className={cn("text-xs", getStatusColor(task.status))}>
                              {task.status}
                            </Badge>
                            <Badge className={cn("text-xs", getPriorityColor(task.priority))}>
                              {task.priority}
                            </Badge>
                          </div>

                          {task.project && (
                            <div className="flex items-center text-xs text-slate-600">
                              <FolderOpen className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{task.project.name}</span>
                            </div>
                          )}

                          {task.assignee && (
                            <div className="flex items-center text-xs text-slate-600">
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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WeeklyPlanning;