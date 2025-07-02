
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Download, Eye, Calendar } from "lucide-react";
import { useTaskReports } from "@/hooks/useTaskReports";
import { toast } from "@/hooks/use-toast";

const TaskReportsViewer = () => {
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const { reports, isLoading } = useTaskReports();

  const handleViewReport = (report: any) => {
    setSelectedReport(report);
    setIsReportDialogOpen(true);
  };

  const generateDocxFile = (report: any) => {
    const taskName = report.task?.title || 'Tache_Inconnue';
    const date = new Date(report.created_at).toISOString().split('T')[0];
    const fileName = `${taskName.replace(/[^a-zA-Z0-9]/g, '_')}_${date}.docx`;
    
    // Créer le contenu du document
    const content = `
RAPPORT DE TÂCHE
================

Tâche: ${report.task?.title || 'Non défini'}
Projet: ${report.task?.project?.name || 'Non défini'}
Date de création: ${new Date(report.created_at).toLocaleDateString('fr-FR')}
Temps passé: ${report.time_spent ? `${report.time_spent}h` : 'Non renseigné'}
Qualité: ${report.quality_rating || 'Non évaluée'}

RÉSUMÉ DES TRAVAUX
==================
${report.summary}

${report.difficulties ? `DIFFICULTÉS RENCONTRÉES
========================
${report.difficulties}` : ''}

${report.solutions ? `SOLUTIONS APPORTÉES
===================
${report.solutions}` : ''}

${report.recommendations ? `RECOMMANDATIONS
===============
${report.recommendations}` : ''}

${report.generated_report ? `RAPPORT GÉNÉRÉ PAR IA
=====================
${report.generated_report}` : ''}
    `;

    const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return fileName;
  };

  const generatePdfFile = (report: any) => {
    const taskName = report.task?.title || 'Tache_Inconnue';
    const date = new Date(report.created_at).toISOString().split('T')[0];
    const fileName = `${taskName.replace(/[^a-zA-Z0-9]/g, '_')}_${date}.pdf`;
    
    // Créer le contenu du document
    const content = `
RAPPORT DE TÂCHE
================

Tâche: ${report.task?.title || 'Non défini'}
Projet: ${report.task?.project?.name || 'Non défini'}
Date de création: ${new Date(report.created_at).toLocaleDateString('fr-FR')}
Temps passé: ${report.time_spent ? `${report.time_spent}h` : 'Non renseigné'}
Qualité: ${report.quality_rating || 'Non évaluée'}

RÉSUMÉ DES TRAVAUX
==================
${report.summary}

${report.difficulties ? `DIFFICULTÉS RENCONTRÉES
========================
${report.difficulties}` : ''}

${report.solutions ? `SOLUTIONS APPORTÉES
===================
${report.solutions}` : ''}

${report.recommendations ? `RECOMMANDATIONS
===============
${report.recommendations}` : ''}

${report.generated_report ? `RAPPORT GÉNÉRÉ PAR IA
=====================
${report.generated_report}` : ''}
    `;

    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return fileName;
  };

  const handleDownloadReport = async (report: any, format: 'doc' | 'pdf') => {
    try {
      let fileName = '';
      
      if (format === 'doc') {
        fileName = generateDocxFile(report);
      } else {
        fileName = generatePdfFile(report);
      }
      
      toast({
        title: "Téléchargement réussi",
        description: `Le rapport ${fileName} a été téléchargé.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le rapport.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Chargement des rapports...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Mes Rapports de Tâches ({reports.length})
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="p-4 bg-slate-50/50 rounded-lg border border-slate-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-slate-900">{report.task?.title || 'Titre non disponible'}</h4>
                        <Badge className="text-xs bg-blue-100 text-blue-800">
                          Rapport généré
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="space-y-1">
                          <div className="text-sm text-slate-600">
                            Projet: <strong>{report.task?.project?.name || 'Non défini'}</strong>
                          </div>
                          <div className="text-sm text-slate-600">
                            Temps passé: <strong>{report.time_spent ? `${report.time_spent}h` : 'Non renseigné'}</strong>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-sm text-slate-600">
                            Qualité: <strong>{report.quality_rating || 'Non évaluée'}</strong>
                          </div>
                          <div className="flex items-center text-sm text-slate-600">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(report.created_at).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <h5 className="text-sm font-medium text-slate-700 mb-1">Résumé:</h5>
                        <p className="text-sm text-slate-600 bg-white p-2 rounded border line-clamp-2">
                          {report.summary}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewReport(report)}
                      className="bg-white/50 hover:bg-white"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Voir le rapport
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadReport(report, 'doc')}
                      className="bg-white/50 hover:bg-white"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Télécharger DOC
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadReport(report, 'pdf')}
                      className="bg-white/50 hover:bg-white"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Télécharger PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Aucun rapport disponible</h3>
              <p className="text-slate-600">Vos rapports de fin de tâche apparaîtront ici</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rapport de Tâche</DialogTitle>
            <DialogDescription>
              {selectedReport?.task?.title} - {selectedReport && new Date(selectedReport.created_at).toLocaleDateString('fr-FR')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-medium mb-2">Résumé des travaux</h4>
              <p className="text-sm text-slate-700">{selectedReport?.summary}</p>
            </div>

            {selectedReport?.difficulties && (
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-medium mb-2">Difficultés rencontrées</h4>
                <p className="text-sm text-slate-700">{selectedReport.difficulties}</p>
              </div>
            )}

            {selectedReport?.solutions && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">Solutions apportées</h4>
                <p className="text-sm text-slate-700">{selectedReport.solutions}</p>
              </div>
            )}

            {selectedReport?.recommendations && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium mb-2">Recommandations</h4>
                <p className="text-sm text-slate-700">{selectedReport.recommendations}</p>
              </div>
            )}

            {selectedReport?.generated_report && (
              <div className="p-4 bg-white border rounded-lg">
                <h4 className="font-medium mb-2">Rapport généré par IA</h4>
                <div className="text-sm text-slate-700 whitespace-pre-line">
                  {selectedReport.generated_report}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskReportsViewer;
