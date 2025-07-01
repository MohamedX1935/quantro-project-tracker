
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useProjects } from "@/contexts/ProjectContext";

interface AssignEmployeeDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const AssignEmployeeDialog = ({ open, onOpenChange }: AssignEmployeeDialogProps) => {
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedProject, setSelectedProject] = useState("");

  const { users } = useAuth();
  const { projects } = useProjects();

  // Filtrer uniquement les employés créés par root
  const availableEmployees = users.filter(user => user.role === 'employee');

  const handleAssignEmployee = () => {
    if (!selectedEmployee || !selectedProject) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un employé et un projet.",
        variant: "destructive"
      });
      return;
    }

    const employee = availableEmployees.find(emp => emp.id === selectedEmployee);
    const project = projects.find(proj => proj.id === selectedProject);

    toast({
      title: "Employé assigné",
      description: `${employee?.firstName && employee?.lastName ? `${employee.firstName} ${employee.lastName}` : employee?.username} a été assigné au projet "${project?.name}".`,
    });

    console.log("Assignation:", { employeeId: selectedEmployee, projectId: selectedProject });
    
    // Reset form
    setSelectedEmployee("");
    setSelectedProject("");
    
    // Close dialog if controlled
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          <UserPlus className="w-4 h-4 mr-2" />
          Assigner Employé
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assigner un employé</DialogTitle>
          <DialogDescription>
            Sélectionnez un employé existant et assignez-le à un projet
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Employé disponible</Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un employé" />
              </SelectTrigger>
              <SelectContent>
                {availableEmployees.length > 0 ? (
                  availableEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                            {employee.firstName && employee.lastName 
                              ? `${employee.firstName[0]}${employee.lastName[0]}` 
                              : employee.username.slice(0, 2).toUpperCase()
                            }
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          {employee.firstName && employee.lastName 
                            ? `${employee.firstName} ${employee.lastName}` 
                            : employee.username
                          }
                        </span>
                        <Badge variant="default" className="text-xs">
                          Disponible
                        </Badge>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    Aucun employé disponible
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Projet</Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un projet" />
              </SelectTrigger>
              <SelectContent>
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    Aucun projet disponible
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedEmployee && (
            <div className="p-3 bg-slate-50 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Employé sélectionné:</h4>
              {(() => {
                const employee = availableEmployees.find(emp => emp.id === selectedEmployee);
                return employee ? (
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs">
                        {employee.firstName && employee.lastName 
                          ? `${employee.firstName[0]}${employee.lastName[0]}` 
                          : employee.username.slice(0, 2).toUpperCase()
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">
                        {employee.firstName && employee.lastName 
                          ? `${employee.firstName} ${employee.lastName}` 
                          : employee.username
                        }
                      </div>
                      <div className="text-xs text-slate-600">Employé</div>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>
            Annuler
          </Button>
          <Button onClick={handleAssignEmployee} disabled={!projects.length || !availableEmployees.length}>
            <Users className="w-4 h-4 mr-2" />
            Assigner
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignEmployeeDialog;
