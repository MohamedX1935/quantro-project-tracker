
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, CheckSquare, Clock, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ProjectDetailsDialogProps {
  project: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProjectDetailsDialog = ({ project, open, onOpenChange }: ProjectDetailsDialogProps) => {
  const [tasks] = useState([
    {
      id: 1,
      title: "Configuration serveurs production",
      description: "Mise en place et configuration des serveurs de production",
      assignee: { name: "Bob Dupont", initials: "BD" },
      status: "En cours",
      priority: "Haute",
      deadline: "2024-07-25",
      reportSubmitted: false
    },
    {
      id: 2,
      title: "Migration données clients",
      description: "Transfert sécurisé des données clients vers la nouvelle base",
      assignee: { name: "David Chen", initials: "DC" },
      status: "Rapport soumis",
      priority: "Critique",
      deadline: "2024-07-22",
      reportSubmitted: true
    },
    {
      id: 3,
      title: "Tests d'intégration API",
      description: "Validation des nouvelles API et tests de charge",
      assignee: { name: "Claire Rousseau", initials: "CR" },
      status: "Terminé",
      priority: "Moyenne",
      deadline: "2024-07-20",
      reportSubmitted: true
    }
  ]);

  const handleCloseTask = (taskId: number) => {
    toast({
      title: "Tâche clôturée",
      description: "La tâche a été définitivement clôturée.",
    });
    console.log("Clôture de la tâche:", taskId);
  };

  const handleReviewReport = (taskId: number) => {
    toast({
      title: "Rapport en cours de révision",
      description: "Le rapport de fin de tâche est en cours de révision.",
    });
    console.log("Révision du rapport pour la tâche:", taskId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Terminé":
        return "bg-green-100 text-green-800 border-green-200";
      case "En cours":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Rapport soumis":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critique":
        return "text-red-600";
      case "Haute":
        return "text-orange-600";
      case "Moyenne":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{project.name}</DialogTitle>
          <DialogDescription>{project.description}</DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="tasks">Tâches ({tasks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Progression</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Progress value={project.progress} className="h-3" />
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>{project.tasks.completed}/{project.tasks.total} tâches</span>
                      <span>{project.progress}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Informations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                    <span>Échéance: {new Date(project.deadline).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-slate-500" />
                    <span>{project.location}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2 text-slate-500" />
                    <span>{project.team.length} membres d'équipe</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Équipe du projet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {project.team.map((member: any, index: number) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-slate-50 rounded">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {member.initials}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{member.name}</div>
                        <div className="text-xs text-slate-600">{member.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <div className="space-y-3">
              {tasks.map((task) => (
                <Card key={task.id} className="border border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-sm font-semibold text-slate-900">{task.title}</h4>
                          <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                            {task.status}
                          </Badge>
                          <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{task.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {task.assignee.name}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(task.deadline).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2">
                        {task.status === "Rapport soumis" && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleReviewReport(task.id)}
                            >
                              Réviser rapport
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => handleCloseTask(task.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckSquare className="w-3 h-3 mr-1" />
                              Clôturer
                            </Button>
                          </>
                        )}
                        {task.status === "En cours" && (
                          <Button size="sm" variant="outline" disabled>
                            <Clock className="w-3 h-3 mr-1" />
                            En attente
                          </Button>
                        )}
                        {task.status === "Terminé" && (
                          <Badge className="bg-green-100 text-green-800 justify-center">
                            Terminé
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailsDialog;
