
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, Search, Plus, Calendar as CalendarIcon, Trash2, Lock, Eye } from "lucide-react";
import { useAdminTasks } from "@/hooks/useAdminTasks";
import { useTaskReports } from "@/hooks/useTaskReports";
import { toast } from "@/hooks/use-toast";
import FilterDialog from "./FilterDialog";
import NewTaskDialog from "./NewTaskDialog";

const TasksManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { tasks, deleteTask, closeTask, refreshTasks } = useAdminTasks();
  const { reports } = useTaskReports();

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.project?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Terminé":
        return "bg-green-100 text-green-800 border-green-200";
      case "En cours":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "À faire":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "En retard":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "haute":
        return "bg-red-500";
      case "moyenne":
        return "bg-yellow-500";
      case "basse":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
      try {
        await deleteTask(taskId);
        toast({
          title: "Tâche supprimée",
          description: "La tâche a été supprimée avec succès.",
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer la tâche.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCloseTask = async (taskId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir clôturer cette tâche ?")) {
      try {
        await closeTask(taskId);
        toast({
          title: "Tâche clôturée",
          description: "La tâche a été clôturée par l'administrateur.",
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de clôturer la tâche.",
          variant: "destructive",
        });
      }
    }
  };

  const handleViewReport = (taskId: string) => {
    const taskReport = getTaskReport(taskId);
    if (taskReport) {
      // Ouvrir le rapport dans une nouvelle fenêtre ou modal
      window.open(`data:text/html,<pre>${taskReport.generated_report || 'Rapport non disponible'}</pre>`, '_blank');
    }
  };

  const getTaskReport = (taskId: string) => {
    return reports.find(report => report.task_id === taskId);
  };

  const calculateProgress = (task: any) => {
    if (task.status === "Terminé") return 100;
    if (task.status === "En cours") return 60;
    if (task.status === "À faire") return 0;
    return 25;
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Rechercher des tâches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200"
          />
        </div>
        
        <div className="flex gap-2">
          <FilterDialog type="tasks" />
          <NewTaskDialog />
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => {
          const progress = calculateProgress(task);
          const taskReport = getTaskReport(task.id);
          
          return (
            <Card key={task.id} className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {task.title}
                      </h3>
                      <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                        {task.status}
                      </Badge>
                      {task.closed_by_admin && (
                        <Badge className="text-xs bg-gray-100 text-gray-800">
                          Clôturée
                        </Badge>
                      )}
                    </div>
                    <p className="text-slate-600 mb-2 line-clamp-2">{task.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <span className="bg-slate-100 px-2 py-1 rounded text-xs font-medium">
                        {task.project?.name}
                      </span>
                      {task.deadline && (
                        <span className="flex items-center">
                          <CalendarIcon className="w-3 h-3 mr-1" />
                          {new Date(task.deadline).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                      {task.assignee && (
                        <span className="text-xs">
                          Assigné à: {task.assignee.first_name} {task.assignee.last_name}
                        </span>
                      )}
                      {task.created_by_user && (
                        <span className="text-xs">
                          Créé par: {task.created_by_user.first_name} {task.created_by_user.last_name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-center min-w-[80px]">
                      <div className="text-2xl font-bold text-slate-900 mb-1">
                        {progress}%
                      </div>
                      <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      {task.status === "Terminé" && !task.closed_by_admin && (
                        <>
                          {taskReport && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                              onClick={() => handleViewReport(task.id)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Voir rapport
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCloseTask(task.id)}
                            className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                          >
                            <Lock className="w-4 h-4 mr-2" />
                            Clôturer
                          </Button>
                        </>
                      )}
                      
                      {!task.closed_by_admin && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Aucune tâche trouvée</h3>
          <p className="text-slate-600 mb-4">Essayez de modifier vos critères de recherche</p>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Créer une nouvelle tâche
          </Button>
        </div>
      )}
    </div>
  );
};

export default TasksManager;
