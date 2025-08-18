import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Flag } from "lucide-react";
import { EmployeeProject } from "@/hooks/useEmployeeStats";

interface ProjectListDialogProps {
  projects: EmployeeProject[];
  employeeName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProjectListDialog = ({ projects, employeeName, open, onOpenChange }: ProjectListDialogProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'haute':
        return "bg-red-100 text-red-800 border-red-200";
      case 'moyenne':
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'basse':
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Projets assignés à {employeeName}</DialogTitle>
          <DialogDescription>
            Liste des {projects.length} projet{projects.length > 1 ? 's' : ''} assigné{projects.length > 1 ? 's' : ''} à cet employé
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {projects.length > 0 ? (
            projects.map((project) => (
              <Card key={project.id} className="border border-slate-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <p className="text-sm text-slate-600 mt-1">{project.description}</p>
                    </div>
                    <Badge className={getPriorityColor(project.priority)}>
                      <Flag className="w-3 h-3 mr-1" />
                      {project.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Échéance: {formatDate(project.deadline)}</span>
                    </div>
                    {project.location && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{project.location}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flag className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Aucun projet assigné</h3>
              <p className="text-slate-600">Cet employé n'est assigné à aucun projet pour le moment.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectListDialog;