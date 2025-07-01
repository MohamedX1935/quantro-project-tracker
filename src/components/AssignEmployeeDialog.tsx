
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useProjects } from "@/contexts/ProjectContext";

interface AssignEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AssignEmployeeDialog = ({ open, onOpenChange }: AssignEmployeeDialogProps) => {
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  const { users } = useAuth();
  const { projects } = useProjects();

  // Filtrer uniquement les employés (rôle 'employee')
  const employees = users.filter(user => user.role === 'employee');

  const handleAssignEmployee = async () => {
    if (!selectedEmployee || !selectedProject) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un employé et un projet.",
        variant: "destructive"
      });
      return;
    }

    setIsAssigning(true);

    try {
      // Pour l'instant, on simule l'assignation
      // Dans le futur, on pourrait créer une table 'project_assignments' pour gérer cela
      const employee = employees.find(emp => emp.id === selectedEmployee);
      const project = projects.find(proj => proj.id === selectedProject);

      toast({
        title: "Employé assigné",
        description: `${employee?.firstName && employee?.lastName 
          ? `${employee.firstName} ${employee.lastName}` 
          : employee?.username
        } a été assigné au projet "${project?.name}".`,
      });

      // Réinitialiser le formulaire
      setSelectedEmployee("");
      setSelectedProject("");
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'assigner l'employé. Veuillez réessayer.",
        variant: "destructive"
      });
    }

    setIsAssigning(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assigner un employé</DialogTitle>
          <DialogDescription>
            Sélectionnez un employé et un projet pour l'assignation
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Employé</Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un employé" />
              </SelectTrigger>
              <SelectContent>
                {employees.length > 0 ? (
                  employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.firstName && employee.lastName 
                        ? `${employee.firstName} ${employee.lastName} (@${employee.username})` 
                        : employee.username
                      }
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
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
                  <SelectItem value="none" disabled>
                    Aucun projet disponible
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isAssigning}>
            Annuler
          </Button>
          <Button 
            onClick={handleAssignEmployee} 
            disabled={isAssigning || !selectedEmployee || !selectedProject || employees.length === 0 || projects.length === 0}
          >
            {isAssigning ? "Assignation..." : "Assigner"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignEmployeeDialog;
