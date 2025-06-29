
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckSquare, Clock, FileText, MapPin, Paperclip, Send, Calendar, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const EmployeeTasks = () => {
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [extensionRequest, setExtensionRequest] = useState("");
  const [isExtensionDialogOpen, setIsExtensionDialogOpen] = useState(false);

  // Données simulées des tâches pour l'employé connecté
  const myTasks = [
    {
      id: 1,
      title: "Configuration du serveur de base de données",
      description: "Installer et configurer PostgreSQL avec les paramètres de sécurité requis",
      project: "Déploiement Infrastructure Cloud",
      deadline: "2024-07-25",
      status: "En cours",
      priority: "Haute",
      progress: 60,
      assignedBy: "Alice Martin",
      createdAt: "2024-07-15"
    },
    {
      id: 2,
      title: "Tests de performance réseau",
      description: "Effectuer des tests de latence et de débit sur l'infrastructure cloud",
      project: "Déploiement Infrastructure Cloud",
      deadline: "2024-07-22",
      status: "À faire",
      priority: "Moyenne",
      progress: 0,
      assignedBy: "Alice Martin",
      createdAt: "2024-07-16"
    },
    {
      id: 3,
      title: "Documentation technique",
      description: "Rédiger la documentation pour les procédures de déploiement",
      project: "Formation Utilisateurs",
      deadline: "2024-07-28",
      status: "En cours",
      priority: "Normale",
      progress: 80,
      assignedBy: "Frank Miller",
      createdAt: "2024-07-10"
    }
  ];

  const handleCompleteTask = (taskId: number) => {
    toast({
      title: "Tâche terminée",
      description: "La tâche a été marquée comme terminée avec succès.",
    });
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
    <div className="space-y-6">
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
            <CardTitle className="text-sm font-medium text-slate-600">Progression</CardTitle>
            <FileText className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {Math.round(myTasks.reduce((acc, task) => acc + task.progress, 0) / myTasks.length)}%
            </div>
            <p className="text-xs text-slate-500">Moyenne globale</p>
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

                {/* Progression */}
                <div className="mb-4">
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-slate-600">Progression</span>
                    <span className="font-medium text-slate-900">{task.progress}%</span>
                  </div>
                  <Progress value={task.progress} className="h-2" />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {task.status !== 'Terminé' && (
                    <Button
                      size="sm"
                      onClick={() => handleCompleteTask(task.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckSquare className="w-4 h-4 mr-1" />
                      Marquer terminé
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm">
                    <Paperclip className="w-4 h-4 mr-1" />
                    Joindre fichier
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    Localisation
                  </Button>
                  
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
                  
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-1" />
                    Rapport
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeTasks;
