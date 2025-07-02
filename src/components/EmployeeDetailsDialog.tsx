
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, Calendar, CheckSquare, Clock, User } from "lucide-react";

interface EmployeeDetailsDialogProps {
  employee: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EmployeeDetailsDialog = ({ employee, open, onOpenChange }: EmployeeDetailsDialogProps) => {
  if (!employee) return null;

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
              <Badge className={`mt-1 ${getStatusColor("Actif")}`}>
                Actif
              </Badge>
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
                <span>Créé le: {new Date(employee.created_at || Date.now()).toLocaleDateString('fr-FR')}</span>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tâches Actives</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-slate-500">En cours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tâches Terminées</CardTitle>
                <CheckSquare className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-slate-500">Au total</p>
              </CardContent>
            </Card>
          </div>

          {/* Projets assignés */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Projets assignés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-500">
                Aucun projet assigné pour le moment
              </div>
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
                  <Badge className={getStatusColor("Actif")}>
                    Actif
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Rôle</span>
                  <span className="text-sm font-medium">
                    {employee.role === 'employee' ? 'Employé' : employee.role}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Projets actifs</span>
                  <span className="text-sm font-medium">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Charge de travail</span>
                  <Badge variant="secondary">
                    Faible
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeDetailsDialog;
