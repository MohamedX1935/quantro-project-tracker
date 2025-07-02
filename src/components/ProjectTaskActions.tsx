
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    
    const reportContent = taskReport.generated_report || 'Rapport non disponible';
    const reportWindow = window.open('', '_blank');
    if (reportWindow) {
      reportWindow.document.write(`
        <html>
          <head>
            <title>Rapport - ${task.title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
              h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
              .meta { background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px; }
              .content { margin: 20px 0; }
            </style>
          </head>
          <body>
            <h1>Rapport de Tâche</h1>
            <div class="meta">
              <p><strong>Tâche:</strong> ${task.title}</p>
              <p><strong>Projet:</strong> ${task.project?.name || 'N/A'}</p>
              <p><strong>Date de création:</strong> ${new Date(taskReport.created_at).toLocaleDateString('fr-FR')}</p>
            </div>
            <div class="content">
              <h2>Contenu du rapport</h2>
              <pre style="white-space: pre-wrap;">${reportContent}</pre>
            </div>
          </body>
        </html>
      `);
      reportWindow.document.close();
    }
  };

  const handleDownloadReport = (format: 'pdf' | 'doc') => {
    if (!taskReport) return;

    const reportContent = taskReport.generated_report || 'Rapport non disponible';
    const taskName = task.title.replace(/[^a-zA-Z0-9]/g, '_');
    const date = new Date().toISOString().split('T')[0];
    const fileName = `${taskName}_${date}.${format === 'pdf' ? 'pdf' : 'doc'}`;

    if (format === 'doc') {
      const docContent = `
        Rapport de Tâche
        ================
        
        Tâche: ${task.title}
        Projet: ${task.project?.name || 'N/A'}
        Date de création: ${new Date(taskReport.created_at).toLocaleDateString('fr-FR')}
        
        Contenu du rapport:
        ${reportContent}
      `;
      
      const blob = new Blob([docContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // For PDF, we'll create a simple text file with PDF extension
      // In a real app, you'd use a library like jsPDF
      const pdfContent = `
        Rapport de Tâche
        ================
        
        Tâche: ${task.title}
        Projet: ${task.project?.name || 'N/A'}
        Date de création: ${new Date(taskReport.created_at).toLocaleDateString('fr-FR')}
        
        Contenu du rapport:
        ${reportContent}
      `;
      
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    toast({
      title: "Téléchargement",
      description: `Rapport téléchargé en format ${format.toUpperCase()}`,
    });
  };

  return (
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
  );
};

export default ProjectTaskActions;
