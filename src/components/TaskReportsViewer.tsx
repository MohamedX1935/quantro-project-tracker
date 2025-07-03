
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

  const generateDocxFile = async (report: any) => {
    const taskName = report.task?.title || 'Tache_Inconnue';
    const date = new Date(report.created_at).toISOString().split('T')[0];
    const fileName = `rapport_${taskName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${date}.doc`;
    
    try {
      // Importer la bibliothèque docx dynamiquement
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx');
      
      // Créer les paragraphes du document
      const paragraphs = [
        // Titre principal
        new Paragraph({
          children: [
            new TextRun({
              text: "RAPPORT DE FIN DE TÂCHE",
              bold: true,
              size: 32,
            }),
          ],
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        
        // Section informations générales avec emoji
        new Paragraph({
          children: [
            new TextRun({
              text: "🔹 INFORMATIONS GÉNÉRALES",
              bold: true,
              size: 20,
            }),
          ],
          spacing: { before: 300, after: 200 },
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: "Date d'émission : ", bold: true }),
            new TextRun({ text: new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) }),
          ],
          spacing: { after: 100 },
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: "Tâche : ", bold: true }),
            new TextRun({ text: report.task?.title || 'Non spécifiée' }),
          ],
          spacing: { after: 100 },
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: "Projet : ", bold: true }),
            new TextRun({ text: report.task?.project?.name || 'Non spécifié' }),
          ],
          spacing: { after: 100 },
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: "Employé : ", bold: true }),
            new TextRun({ text: report.employee ? 
              `${report.employee.first_name || ''} ${report.employee.last_name || ''}`.trim() || report.employee.username :
              'Employé non identifié' }),
          ],
          spacing: { after: 100 },
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: "Localisation : ", bold: true }),
            new TextRun({ text: report.location || 'Non spécifiée' }),
          ],
          spacing: { after: 100 },
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: "Temps consacré : ", bold: true }),
            new TextRun({ text: report.time_spent ? `${report.time_spent} heures` : 'Non renseigné' }),
          ],
          spacing: { after: 100 },
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: "Auto-évaluation : ", bold: true }),
            new TextRun({ text: report.quality_rating || 'Non renseignée' }),
          ],
          spacing: { after: 300 },
        }),
        
        // Section résumé
        new Paragraph({
          children: [
            new TextRun({
              text: "🔹 RÉSUMÉ DES TRAVAUX",
              bold: true,
              size: 20,
            }),
          ],
          spacing: { before: 300, after: 200 },
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: report.summary }),
          ],
          spacing: { after: 300 },
        }),
      ];
      
      // Ajouter les sections optionnelles
      if (report.difficulties) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "🔹 DIFFICULTÉS RENCONTRÉES",
                bold: true,
                size: 20,
              }),
            ],
            spacing: { before: 300, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: report.difficulties }),
            ],
            spacing: { after: 300 },
          })
        );
      }
      
      if (report.solutions) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "🔹 SOLUTIONS APPORTÉES",
                bold: true,
                size: 20,
              }),
            ],
            spacing: { before: 300, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: report.solutions }),
            ],
            spacing: { after: 300 },
          })
        );
      }
      
      if (report.recommendations) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "🔹 RECOMMANDATIONS",
                bold: true,
                size: 20,
              }),
            ],
            spacing: { before: 300, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: report.recommendations }),
            ],
            spacing: { after: 300 },
          })
        );
      }
      
      if (report.generated_report && report.generated_report.trim() && 
          !report.generated_report.includes('non disponible') && 
          !report.generated_report.includes('Erreur')) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "RAPPORT DÉTAILLÉ GÉNÉRÉ PAR IA",
                bold: true,
                size: 24,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: report.generated_report }),
            ],
            spacing: { after: 300 },
          })
        );
      }
      
      // Pied de page
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Document généré automatiquement le ${new Date().toLocaleString('fr-FR')}`,
              italics: true,
              size: 18,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 400 },
        })
      );
      
      // Créer le document
      const doc = new Document({
        sections: [
          {
            children: paragraphs,
          },
        ],
      });
      
      // Générer le blob
      const blob = await Packer.toBlob(doc);
      
      // Télécharger le fichier
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return fileName;
    } catch (error) {
      console.error('Error generating DOCX:', error);
      
      // Fallback vers un fichier RTF qui est compatible avec Word
      const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
\\f0\\fs24 
{\\b\\fs32\\qc RAPPORT DE FIN DE TÂCHE\\par}
\\par
{\\b\\fs28 INFORMATIONS GÉNÉRALES\\par}
\\par
{\\b Tâche :} ${report.task?.title || 'Non défini'}\\par
{\\b Projet :} ${report.task?.project?.name || 'Non défini'}\\par
{\\b Date :} ${new Date(report.created_at).toLocaleDateString('fr-FR')}\\par
{\\b Temps passé :} ${report.time_spent ? `${report.time_spent} heures` : 'Non renseigné'}\\par
{\\b Qualité :} ${report.quality_rating || 'Non évaluée'}\\par
{\\b Localisation :} ${report.location || 'Non spécifiée'}\\par
\\par
{\\b\\fs28 RÉSUMÉ DES TRAVAUX EFFECTUÉS\\par}
\\par
${report.summary.replace(/\n/g, '\\par ')}\\par
\\par
${report.difficulties ? `{\\b\\fs28 DIFFICULTÉS RENCONTRÉES\\par}
\\par
${report.difficulties.replace(/\n/g, '\\par ')}\\par
\\par` : ''}
${report.solutions ? `{\\b\\fs28 SOLUTIONS MISES EN ŒUVRE\\par}
\\par
${report.solutions.replace(/\n/g, '\\par ')}\\par
\\par` : ''}
${report.recommendations ? `{\\b\\fs28 RECOMMANDATIONS\\par}
\\par
${report.recommendations.replace(/\n/g, '\\par ')}\\par
\\par` : ''}
${report.generated_report && report.generated_report.trim() && 
  !report.generated_report.includes('non disponible') && 
  !report.generated_report.includes('Erreur') ? 
  `{\\b\\fs28 RAPPORT DÉTAILLÉ GÉNÉRÉ PAR IA\\par}
\\par
${report.generated_report.replace(/\n/g, '\\par ')}\\par
\\par` : ''}
{\\i\\qc Document généré automatiquement le ${new Date().toLocaleString('fr-FR')}\\par}
}`;
      
      const blob = new Blob([rtfContent], { type: 'application/rtf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName.replace('.docx', '.rtf');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return fileName.replace('.docx', '.rtf');
    }
  };

  const handleDownloadReport = async (report: any) => {
    try {
      const fileName = await generateDocxFile(report);
      
      toast({
        title: "Téléchargement réussi",
        description: `Le rapport ${fileName} a été téléchargé avec succès.`,
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "Erreur de téléchargement",
        description: "Impossible de télécharger le rapport. Veuillez réessayer.",
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
                      onClick={() => handleDownloadReport(report)}
                      className="bg-white/50 hover:bg-white"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Télécharger DOC
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

            {selectedReport?.generated_report && selectedReport.generated_report.trim() && 
             !selectedReport.generated_report.includes('non disponible') && 
             !selectedReport.generated_report.includes('Erreur') && (
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
