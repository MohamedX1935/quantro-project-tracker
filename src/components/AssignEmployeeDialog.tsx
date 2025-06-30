
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AssignEmployeeDialog = () => {
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedProject, setSelectedProject] = useState("");

  // Simulated list of employees created by root
  const availableEmployees = [
    { id: "1", name: "Sophie Martin", role: "Développeur", initials: "SM", status: "Disponible" },
    { id: "2", name: "Marc Dubois", role: "Analyste", initials: "MD", status: "Disponible" },
    { id: "3", name: "Julie Chen", role: "Designer", initials: "JC", status: "Assigné" },
    { id: "4", name: "Pierre Wilson", role: "DevOps", initials: "PW", status: "Disponible" },
  ];

  const projects = [
    { id: "1", name: "Infrastructure Cloud" },
    { id: "2", name: "Migration BDD" },
    { id: "3", name: "Formation Utilisateurs" },
  ];

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
      description: `${employee?.name} a été assigné au projet "${project?.name}".`,
    });

    console.log("Assignation:", { employeeId: selectedEmployee, projectId: selectedProject });
    
    // Reset form
    setSelectedEmployee("");
    setSelectedProject("");
  };

  return (
    <Dialog>
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
                {availableEmployees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id} disabled={employee.status === "Assigné"}>
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                          {employee.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span>{employee.name}</span>
                      <Badge variant={employee.status === "Disponible" ? "default" : "secondary"} className="text-xs">
                        {employee.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
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
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
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
                        {employee.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{employee.name}</div>
                      <div className="text-xs text-slate-600">{employee.role}</div>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline">
            Annuler
          </Button>
          <Button onClick={handleAssignEmployee}>
            <Users className="w-4 h-4 mr-2" />
            Assigner
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignEmployeeDialog;
