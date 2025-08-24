
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Calendar, CheckSquare, Clock, User, FolderOpen, Timer } from "lucide-react";
import { useEmployeeStats } from "@/hooks/useEmployeeStats";
import ProjectListDialog from "./ProjectListDialog";
import TaskListDialog from "./TaskListDialog";
import { useState } from "react";

interface EmployeeDetailsDialogProps {
  employee: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EmployeeDetailsDialog = ({ employee, open, onOpenChange }: EmployeeDetailsDialogProps) => {
  const [showProjectsList, setShowProjectsList] = useState(false);
  const [showTasksList, setShowTasksList] = useState(false);
  
  if (!employee) return null;

  const { stats, isLoading } = useEmployeeStats(employee?.id);

  const getStatusColor = (status: string = "Actif") => {
    switch (status) {
      case "Actif":
        return "bg-green-100 text-green-800 border-green-200";
      case "En congé":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Indisponible":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const employeeDisplayName = employee.firstName && employee.lastName 
    ? `${employee.firstName} ${employee.lastName}` 
    : employee.username;

  const employeeInitials = employee.firstName && employee.lastName 
    ? `${employee.firstName[0]}${employee.lastName[0]}` 
    : employee.username.slice(0, 2).toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-lg font-semibold">
                {employeeInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl">{employeeDisplayName}</DialogTitle>
              <DialogDescription className="text-base">
                {employee.role === 'employee' ? 'Employé' : employee.role}
              </DialogDescription>
              {stats.isActive && (
                <Badge className={`mt-1 ${getStatusColor("Actif")}`}>
                  Actif
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Informations de contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm">
                <User className="w-4 h-4 mr-3 text-slate-500" />
                <span>@{employee.username}</span>
              </div>
              {employee.email && (
                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 mr-3 text-slate-500" />
                  <span>{employee.email}</span>
                </div>
              )}
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-3 text-slate-500" />
                <span>Créé le: {new Date(employee.createdAt || Date.now()).toLocaleDateString('fr-FR')}</span>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => stats.assignedProjects.length > 0 && setShowProjectsList(true)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projets Assignés</CardTitle>
                <FolderOpen className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : stats.assignedProjects.length}
                </div>
                <p className="text-xs text-slate-500">
                  {stats.assignedProjects.length > 0 ? 'Cliquez pour voir la liste' : 'Aucun projet assigné'}
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => stats.completedTasks.length > 0 && setShowTasksList(true)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tâches Terminées</CardTitle>
                <CheckSquare className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : stats.completedTasks.length}
                </div>
                <p className="text-xs text-slate-500">
                  {stats.completedTasks.length > 0 ? 'Cliquez pour voir la liste' : 'Aucune tâche terminée'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Heures Totales</CardTitle>
                <Timer className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : stats.totalHours.toFixed(1)}h
                </div>
                <p className="text-xs text-slate-500">Temps total passé</p>
              </CardContent>
            </Card>
          </div>

          {/* Aperçu des projets assignés */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Projets assignés</CardTitle>
                {stats.assignedProjects.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowProjectsList(true)}
                  >
                    Voir tous ({stats.assignedProjects.length})
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4 text-slate-500">Chargement...</div>
              ) : stats.assignedProjects.length > 0 ? (
                <div className="space-y-2">
                  {stats.assignedProjects.slice(0, 3).map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="font-medium text-sm">{project.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {project.priority}
                      </Badge>
                    </div>
                  ))}
                  {stats.assignedProjects.length > 3 && (
                    <div className="text-center text-sm text-slate-500">
                      Et {stats.assignedProjects.length - 3} autre{stats.assignedProjects.length - 3 > 1 ? 's' : ''}...
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  Aucun projet assigné pour le moment
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Statut</span>
                  {stats.isActive ? (
                    <Badge className={getStatusColor("Actif")}>
                      Actif
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      Inactif
                    </Badge>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Rôle</span>
                  <span className="text-sm font-medium">
                    {employee.role === 'employee' ? 'Employé' : employee.role}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tâches actives</span>
                  <span className="text-sm font-medium">
                    {isLoading ? '...' : stats.activeTasksCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Charge de travail</span>
                  <Badge variant="secondary">
                    {stats.activeTasksCount === 0 ? 'Aucune' : 
                     stats.activeTasksCount <= 2 ? 'Faible' : 
                     stats.activeTasksCount <= 5 ? 'Moyenne' : 'Élevée'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modales pour les listes détaillées */}
        <ProjectListDialog
          projects={stats.assignedProjects}
          employeeName={employeeDisplayName}
          open={showProjectsList}
          onOpenChange={setShowProjectsList}
        />

        <TaskListDialog
          tasks={stats.completedTasks}
          employeeName={employeeDisplayName}
          open={showTasksList}
          onOpenChange={setShowTasksList}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeDetailsDialog;
