
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, User, Clock, FileText } from "lucide-react";

interface TaskDetailsDialogProps {
  task: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TaskDetailsDialog = ({ task, open, onOpenChange }: TaskDetailsDialogProps) => {
  if (!task) return null;

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-2">
            <DialogTitle className="text-xl">{task.title}</DialogTitle>
            <Badge className={`${getStatusColor(task.status)}`}>
              {task.status}
            </Badge>
            <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
              Priorité {task.priority}
            </span>
          </div>
          <DialogDescription className="text-base">{task.description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Détails de la tâche</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm">
                <User className="w-4 h-4 mr-3 text-slate-500" />
                <span>Assigné par: <strong>{task.assignedBy}</strong></span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-3 text-slate-500" />
                <span>Échéance: <strong>{new Date(task.deadline).toLocaleDateString('fr-FR')}</strong></span>
              </div>
              <div className="flex items-center text-sm">
                <FileText className="w-4 h-4 mr-3 text-slate-500" />
                <span>Projet: <strong>{task.project}</strong></span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 mr-3 text-slate-500" />
                <span>Créé le: <strong>{new Date(task.createdAt).toLocaleDateString('fr-FR')}</strong></span>
              </div>
            </CardContent>
          </Card>

          {/* Instructions détaillées */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-700">Description complète:</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{task.description}</p>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h5 className="text-sm font-medium text-blue-900 mb-2">Objectifs à atteindre:</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Respecter les spécifications techniques</li>
                    <li>• Documenter les étapes importantes</li>
                    <li>• Effectuer les tests nécessaires</li>
                    <li>• Signaler tout problème rencontré</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Critères d'acceptation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Critères d'acceptation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span className="text-sm text-slate-600">La tâche doit être complètement fonctionnelle</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span className="text-sm text-slate-600">Les tests doivent être réalisés et validés</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span className="text-sm text-slate-600">La documentation doit être mise à jour</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span className="text-sm text-slate-600">Le rapport de fin de tâche doit être soumis</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ressources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Ressources et contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium text-slate-700">Contact projet:</span>
                  <span className="ml-2 text-slate-600">{task.assignedBy}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-slate-700">Environnement:</span>
                  <span className="ml-2 text-slate-600">Production/Test</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-slate-700">Accès requis:</span>
                  <span className="ml-2 text-slate-600">Serveurs, Base de données</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailsDialog;
