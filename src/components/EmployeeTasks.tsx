
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckSquare, Clock, FileText, Send, Calendar, AlertTriangle, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import TaskReportDialog from "./TaskReportDialog";
import TaskDetailsDialog from "./TaskDetailsDialog";
import ExtensionRequestStatus from "./ExtensionRequestStatus";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EmployeeTasks = () => {
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<any>(null);
  const [extensionRequest, setExtensionRequest] = useState("");
  const [isExtensionDialogOpen, setIsExtensionDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [myTasks, setMyTasks] = useState<any[]>([]); // Tableau vide - plus d'exemples

  const handleCompleteTask = (task: any) => {
    setSelectedTask(task);
    setIsReportDialogOpen(true);
  };

  const handleTaskCompleted = () => {
    // Marquer la tâche comme terminée
    setMyTasks(prev => prev.map(task => 
      task.id === selectedTask?.id 
        ? { ...task, status: "Terminé" }
        : task
    ));

    toast({
      title: "Tâche terminée",
      description: "La tâche a été marquée comme terminée et le rapport a été généré avec succès.",
    });
  };

  const handleViewTaskDetails = (task: any) => {
    setSelectedTaskForDetails(task);
    setIsTaskDetailsOpen(true);
  };

  const handleSendExtensionRequest = () => {
    if (!extensionRequest.trim()) return;
    
    toast({
      title: "Demande envoyée",
      description: "Votre demande de prolongation a été envoyée à l'administrateur.",
    });
    setExtensionRequest("");
    setIsExtensionDialogOpen(false);
  };

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
      case "Haute":
        return "text-red-600";
      case "Moyenne":
        return "text-orange-600";
      case "Normale":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Tabs defaultValue="tasks" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 bg-white/60 backdrop-blur-sm border border-slate-200">
        <TabsTrigger value="tasks">Mes Tâches</TabsTrigger>
        <TabsTrigger value="requests">Demandes de Prolongation</TabsTrigger>
      </TabsList>

      <TabsContent value="tasks" className="space-y-6">
        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Mes Tâches</CardTitle>
              <CheckSquare className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{myTasks.length}</div>
              <p className="text-xs text-slate-500">Total assignées</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">En Cours</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {myTasks.filter(task => task.status === 'En cours').length}
              </div>
              <p className="text-xs text-slate-500">Tâches actives</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Terminées</CardTitle>
              <div className="h-4 w-4 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-2 w-2 bg-green-600 rounded-full"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {myTasks.filter(task => task.status === 'Terminé').length}
              </div>
              <p className="text-xs text-slate-500">Cette semaine</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">À faire</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {myTasks.filter(task => task.status === 'À faire').length}
              </div>
              <p className="text-xs text-slate-500">En attente</p>
            </CardContent>
          </Card>
        </div>

        {/* Liste des tâches */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Mes Tâches Assignées
            </CardTitle>
            <CardDescription className="text-slate-600">
              Gérez vos tâches et suivez votre progression
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {myTasks.length > 0 ? (
              <div className="space-y-4">
                {myTasks.map((task) => (
                  <div key={task.id} className="p-4 bg-slate-50/50 rounded-lg border border-slate-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-slate-900">{task.title}</h4>
                          <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                            {task.status}
                          </Badge>
                          <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{task.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>Projet: <strong>{task.project}</strong></span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Échéance: {new Date(task.deadline).toLocaleDateString('fr-FR')}
                          </span>
                          <span>Assigné par: <strong>{task.assignedBy}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {task.status !== 'Terminé' && (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteTask(task)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckSquare className="w-4 h-4 mr-1" />
                          Marquer terminé
                        </Button>
                      )}
                      
                      <Dialog open={isExtensionDialogOpen} onOpenChange={setIsExtensionDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedTask(task)}>
                            <Clock className="w-4 h-4 mr-1" />
                            Demander prolongation
                          </Button>
                        </DialogTrigger>
                        
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Demande de Prolongation</DialogTitle>
                            <DialogDescription>
                              Expliquez pourquoi vous avez besoin de plus de temps pour cette tâche
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div>
                              <strong>Tâche:</strong> {selectedTask?.title}
                            </div>
                            <Textarea
                              placeholder="Expliquez les raisons de votre demande de prolongation..."
                              value={extensionRequest}
                              onChange={(e) => setExtensionRequest(e.target.value)}
                              rows={4}
                            />
                          </div>
                          
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsExtensionDialogOpen(false)}>
                              Annuler
                            </Button>
                            <Button onClick={handleSendExtensionRequest}>
                              <Send className="w-4 h-4 mr-2" />
                              Envoyer la demande
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewTaskDetails(task)}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Voir détails
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckSquare className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">Aucune tâche assignée</h3>
                <p className="text-slate-600">Vos tâches assignées apparaîtront ici</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="requests">
        <ExtensionRequestStatus />
      </TabsContent>

      <TaskReportDialog
        task={selectedTask}
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        onComplete={handleTaskCompleted}
      />

      <TaskDetailsDialog
        task={selectedTaskForDetails}
        open={isTaskDetailsOpen}
        onOpenChange={setIsTaskDetailsOpen}
      />
    </Tabs>
  );
};

export default EmployeeTasks;
