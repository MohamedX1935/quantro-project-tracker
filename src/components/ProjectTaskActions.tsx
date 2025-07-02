
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Trash2, Lock, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTaskReports } from "@/hooks/useTaskReports";

interface ProjectTaskActionsProps {
  task: any;
  onTaskDeleted: (taskId: string) => void;
  onTaskClosed: (taskId: string) => void;
}

const ProjectTaskActions = ({ task, onTaskDeleted, onTaskClosed }: ProjectTaskActionsProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const { reports } = useTaskReports();

  const taskReport = reports.find(report => report.task_id === task.id);

  const handleDeleteTask = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', task.id);

      if (error) {
        throw error;
      }

      onTaskDeleted(task.id);
      toast({
        title: "Tâche supprimée",
        description: "La tâche a été supprimée avec succès.",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la tâche.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseTask = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir clôturer cette tâche ?")) {
      return;
    }

    setIsClosing(true);
    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({ 
          closed_by_admin: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id);

      if (error) {
        throw error;
      }

      onTaskClosed(task.id);
      toast({
        title: "Tâche clôturée",
        description: "La tâche a été clôturée par l'administrateur.",
      });
    } catch (error) {
      console.error('Error closing task:', error);
      toast({
        title: "Erreur",
        description: "Impossible de clôturer la tâche.",
        variant: "destructive",
      });
    } finally {
      setIsClosing(false);
    }
  };

  const handleViewReport = () => {
    if (!taskReport) return;
    
    setSelectedReport(taskReport);
    setIsReportDialogOpen(true);
  };

  const handleDownloadReport = (format: 'pdf' | 'doc') => {
    if (!taskReport) return;

    const taskName = task.title.replace(/[^a-zA-Z0-9]/g, '_');
    const date = new Date().toISOString().split('T')[0];
    const fileName = `${taskName}_${date}.${format === 'pdf' ? 'pdf' : 'doc'}`;

    const reportContent = `
RAPPORT DE TÂCHE
================

Tâche: ${task.title}
Projet: ${task.project?.name || 'N/A'}
Date de création: ${new Date(taskReport.created_at).toLocaleDateString('fr-FR')}
Temps passé: ${taskReport.time_spent ? `${taskReport.time_spent}h` : 'Non renseigné'}
Qualité: ${taskReport.quality_rating || 'Non évaluée'}

RÉSUMÉ DES TRAVAUX
==================
${taskReport.summary}

${taskReport.difficulties ? `DIFFICULTÉS RENCONTRÉES
========================
${taskReport.difficulties}` : ''}

${taskReport.solutions ? `SOLUTIONS APPORTÉES
===================
${taskReport.solutions}` : ''}

${taskReport.recommendations ? `RECOMMANDATIONS
===============
${taskReport.recommendations}` : ''}

${taskReport.generated_report ? `RAPPORT GÉNÉRÉ PAR IA
=====================
${taskReport.generated_report}` : ''}
    `;

    const mimeType = format === 'pdf' ? 'application/pdf' : 'application/msword';
    const blob = new Blob([reportContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Téléchargement",
      description: `Rapport téléchargé en format ${format.toUpperCase()}`,
    });
  };

  return (
    <>
      <div className="flex flex-col space-y-2">
        {task.status === "Terminé" && !task.closed_by_admin && (
          <>
            {taskReport && (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                  onClick={handleViewReport}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Voir rapport
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                  onClick={() => handleDownloadReport('pdf')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                  onClick={() => handleDownloadReport('doc')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  DOC
                </Button>
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCloseTask}
              disabled={isClosing}
              className="bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700"
            >
              <Lock className="w-4 h-4 mr-2" />
              {isClosing ? "Clôture..." : "Clôturer"}
            </Button>
          </>
        )}
        
        {!task.closed_by_admin && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDeleteTask}
            disabled={isDeleting}
            className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeleting ? "Suppression..." : "Supprimer"}
          </Button>
        )}
      </div>

      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rapport de Tâche</DialogTitle>
            <DialogDescription>
              {selectedReport?.task?.title || task.title} - {selectedReport && new Date(selectedReport.created_at).toLocaleDateString('fr-FR')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-sm text-slate-600">Temps passé</h4>
                  <p className="text-sm">{selectedReport.time_spent ? `${selectedReport.time_spent}h` : 'Non renseigné'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-slate-600">Qualité</h4>
                  <p className="text-sm">{selectedReport.quality_rating || 'Non évaluée'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-slate-600">Lieu</h4>
                  <p className="text-sm">{selectedReport.location || 'Non spécifié'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-slate-600">Date</h4>
                  <p className="text-sm">{new Date(selectedReport.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium mb-2">Résumé des travaux</h4>
                <p className="text-sm text-slate-700">{selectedReport.summary}</p>
              </div>

              {selectedReport.difficulties && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-medium mb-2">Difficultés rencontrées</h4>
                  <p className="text-sm text-slate-700">{selectedReport.difficulties}</p>
                </div>
              )}

              {selectedReport.solutions && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Solutions apportées</h4>
                  <p className="text-sm text-slate-700">{selectedReport.solutions}</p>
                </div>
              )}

              {selectedReport.recommendations && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium mb-2">Recommandations</h4>
                  <p className="text-sm text-slate-700">{selectedReport.recommendations}</p>
                </div>
              )}

              {selectedReport.generated_report && (
                <div className="p-4 bg-white border rounded-lg">
                  <h4 className="font-medium mb-2">Rapport généré par IA</h4>
                  <div className="text-sm text-slate-700 whitespace-pre-line">
                    {selectedReport.generated_report}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button 
                  variant="outline"
                  onClick={() => handleDownloadReport('doc')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger DOC
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleDownloadReport('pdf')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectTaskActions;
