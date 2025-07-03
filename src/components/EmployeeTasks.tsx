
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Search, Clock, FileText, AlertCircle, CheckCircle, Play, Pause } from "lucide-react";
import { useEmployeeTasks } from "@/hooks/useEmployeeTasks";
import { useExtensionRequests } from "@/hooks/useExtensionRequests";
import { useTaskReports } from "@/hooks/useTaskReports";
import { toast } from "@/hooks/use-toast";
import TaskDetailsDialog from "./TaskDetailsDialog";
import TaskReportDialog from "./TaskReportDialog";
import ExtensionRequestDialog from "./ExtensionRequestDialog";
import ExtensionRequestStatus from "./ExtensionRequestStatus";
import TaskReportsViewer from "./TaskReportsViewer";

const EmployeeTasks = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isExtensionDialogOpen, setIsExtensionDialogOpen] = useState(false);

  const { tasks, isLoading, updateTaskStatus, refreshTasks } = useEmployeeTasks();
  const { createExtensionRequest } = useExtensionRequests();
  const { createTaskReport } = useTaskReports();

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

  const handleViewDetails = (task: any) => {
    const assignedByName = task.assigned_by_user 
      ? (task.assigned_by_user.first_name && task.assigned_by_user.last_name
          ? `${task.assigned_by_user.first_name} ${task.assigned_by_user.last_name}`
          : task.assigned_by_user.username)
      : "Administrateur";

    const taskDetails = {
      ...task,
      project: task.project?.name || "Projet non défini",
      assignedBy: assignedByName,
      createdAt: task.created_at
    };
    setSelectedTask(taskDetails);
    setIsDetailsDialogOpen(true);
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      if (newStatus === "Terminé") {
        // Ouvrir le dialogue de rapport
        const task = tasks.find(t => t.id === taskId);
        setSelectedTask(task);
        setIsReportDialogOpen(true);
      } else {
        await updateTaskStatus(taskId, newStatus);
        toast({
          title: "Statut mis à jour",
          description: `La tâche a été marquée comme "${newStatus}".`,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de la tâche.",
        variant: "destructive",
      });
    }
  };

  const handleCompleteTask = async (reportData: any) => {
    try {
      // Créer le rapport
      const report = await createTaskReport({
        task_id: selectedTask.id,
        summary: reportData.summary,
        difficulties: reportData.difficulties,
        solutions: reportData.solutions,
        recommendations: reportData.recommendations,
        time_spent: parseFloat(reportData.timeSpent),
        quality_rating: reportData.quality,
        location: reportData.location,
        attachments: reportData.attachments
      });

      if (report) {
        // Mettre à jour le statut de la tâche
        await updateTaskStatus(selectedTask.id, "Terminé");
        
        toast({
          title: "Tâche terminée",
          description: "La tâche a été marquée comme terminée et le rapport a été généré.",
        });

        refreshTasks();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de terminer la tâche.",
        variant: "destructive",
      });
    }
  };

  const handleExtensionRequest = (task: any) => {
    setSelectedTask(task);
    setIsExtensionDialogOpen(true);
  };

  const handleSubmitExtensionRequest = async (requestData: any) => {
    try {
      const success = await createExtensionRequest({
        task_id: selectedTask.id,
        reason: requestData.reason,
        requested_extension: requestData.extension
      });

      if (success) {
        toast({
          title: "Demande envoyée",
          description: "Votre demande de prolongation a été envoyée à l'administrateur.",
        });
      } else {
        throw new Error("Échec de la création de la demande");
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande de prolongation.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Chargement des tâches...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mes Tâches</h1>
          <p className="text-slate-600">Gérez vos tâches assignées</p>
        </div>
        
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Rechercher des tâches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200"
          />
        </div>
      </div>

      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tasks">Mes Tâches ({filteredTasks.length})</TabsTrigger>
          <TabsTrigger value="extensions">Demandes de Prolongation</TabsTrigger>
          <TabsTrigger value="reports">Mes Rapports</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                      <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>
                      <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                        {task.status}
                      </Badge>
                      {task.closed_by_admin && (
                        <Badge className="text-xs bg-gray-100 text-gray-800">
                          Clôturée par admin
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
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(task.deadline).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(task)}
                      className="bg-white/50 hover:bg-white border-slate-200"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Voir détails
                    </Button>
                    
                    {task.status !== "Terminé" && !task.closed_by_admin && (
                      <>
                        {task.status === "À faire" && (
                          <Button 
                            size="sm"
                            onClick={() => handleStatusChange(task.id, "En cours")}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Commencer
                          </Button>
                        )}
                        
                        {task.status === "En cours" && (
                          <>
                            <Button 
                              size="sm"
                              onClick={() => handleStatusChange(task.id, "Terminé")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Terminer
                            </Button>
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleExtensionRequest(task)}
                              className="bg-white/50 hover:bg-white border-slate-200"
                            >
                              <Clock className="w-4 h-4 mr-2" />
                              Prolongation
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Aucune tâche trouvée</h3>
              <p className="text-slate-600">Aucune tâche ne correspond à vos critères de recherche</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="extensions">
          <ExtensionRequestStatus />
        </TabsContent>

        <TabsContent value="reports">
          <TaskReportsViewer />
        </TabsContent>
      </Tabs>

      <TaskDetailsDialog
        task={selectedTask}
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
      />

      <TaskReportDialog
        task={selectedTask}
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        onComplete={handleCompleteTask}
      />

      <ExtensionRequestDialog
        task={selectedTask}
        open={isExtensionDialogOpen}
        onOpenChange={setIsExtensionDialogOpen}
        onSubmit={handleSubmitExtensionRequest}
      />
    </div>
  );
};

export default EmployeeTasks;
