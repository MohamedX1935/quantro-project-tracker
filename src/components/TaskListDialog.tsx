import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckSquare, FileText } from "lucide-react";
import { EmployeeTask } from "@/hooks/useEmployeeStats";

interface TaskListDialogProps {
  tasks: EmployeeTask[];
  employeeName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TaskListDialog = ({ tasks, employeeName, open, onOpenChange }: TaskListDialogProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tâches terminées par {employeeName}</DialogTitle>
          <DialogDescription>
            Liste des {tasks.length} tâche{tasks.length > 1 ? 's' : ''} terminée{tasks.length > 1 ? 's' : ''} par cet employé
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <Card key={task.id} className="border border-slate-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      {task.description && (
                        <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                      )}
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckSquare className="w-3 h-3 mr-1" />
                      {task.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      <span className="font-medium">Projet: {task.project_name}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Échéance: {formatDate(task.deadline)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckSquare className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Aucune tâche terminée</h3>
              <p className="text-slate-600">Cet employé n'a encore terminé aucune tâche.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskListDialog;