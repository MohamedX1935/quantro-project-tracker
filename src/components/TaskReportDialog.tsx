
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Paperclip, MapPin, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TaskReportDialogProps {
  task: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: any) => void;
}

const TaskReportDialog = ({ task, open, onOpenChange, onComplete }: TaskReportDialogProps) => {
  const [summary, setSummary] = useState("");
  const [difficulties, setDifficulties] = useState("");
  const [solutions, setSolutions] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [timeSpent, setTimeSpent] = useState("");
  const [quality, setQuality] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [location, setLocation] = useState("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handleSubmitReport = async () => {
    if (!summary || !timeSpent) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir au minimum le résumé et le temps passé.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingReport(true);

    try {
      const reportData = {
        task_id: task.id,
        task_title: task.title,
        project_name: task.project?.name,
        summary,
        difficulties,
        solutions,
        recommendations,
        time_spent: timeSpent ? parseFloat(timeSpent) : undefined,
        quality_rating: quality,
        location,
        attachments: attachments.map(f => f.name)
      };

      console.log("Création du rapport avec IA:", reportData);

      await onComplete(reportData);

      toast({
        title: "Rapport généré",
        description: "Votre rapport de fin de tâche a été généré et sauvegardé avec succès.",
      });

      onOpenChange(false);
      
      // Réinitialiser le formulaire
      setSummary("");
      setDifficulties("");
      setSolutions("");
      setRecommendations("");
      setTimeSpent("");
      setQuality("");
      setAttachments([]);
      setLocation("");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la génération du rapport.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rapport de fin de tâche</DialogTitle>
          <DialogDescription>
            Tâche: <strong>{task?.title}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="summary">Résumé des travaux réalisés *</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Décrivez brièvement les travaux effectués..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulties">Difficultés rencontrées</Label>
            <Textarea
              id="difficulties"
              value={difficulties}
              onChange={(e) => setDifficulties(e.target.value)}
              placeholder="Décrivez les principales difficultés..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="solutions">Solutions apportées</Label>
            <Textarea
              id="solutions"
              value={solutions}
              onChange={(e) => setSolutions(e.target.value)}
              placeholder="Décrivez les solutions mises en place..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommendations">Recommandations</Label>
            <Textarea
              id="recommendations"
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              placeholder="Vos recommandations pour l'avenir..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeSpent">Temps passé (heures) *</Label>
              <Input
                id="timeSpent"
                type="number"
                value={timeSpent}
                onChange={(e) => setTimeSpent(e.target.value)}
                placeholder="8"
                min="0"
                step="0.5"
              />
            </div>

            <div className="space-y-2">
              <Label>Qualité du travail</Label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger>
                  <SelectValue placeholder="Auto-évaluation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="tres-bon">Très bon</SelectItem>
                  <SelectItem value="bon">Bon</SelectItem>
                  <SelectItem value="satisfaisant">Satisfaisant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Localisation de travail</Label>
            <div className="flex gap-2">
              <MapPin className="w-4 h-4 mt-3 text-slate-500" />
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Bureau, domicile, site client..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachments">Fichiers joints</Label>
            <div className="flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-slate-500" />
              <Input
                id="attachments"
                type="file"
                multiple
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>
            {attachments.length > 0 && (
              <div className="text-sm text-slate-600">
                {attachments.length} fichier(s) sélectionné(s)
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmitReport} disabled={isGeneratingReport}>
            {isGeneratingReport ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                Génération du rapport...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Terminer la tâche
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskReportDialog;
