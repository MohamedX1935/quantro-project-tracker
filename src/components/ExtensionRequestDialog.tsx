
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Calendar } from "lucide-react";

interface ExtensionRequestDialogProps {
  task: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

const ExtensionRequestDialog = ({ task, open, onOpenChange, onSubmit }: ExtensionRequestDialogProps) => {
  const [extension, setExtension] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!extension || !reason) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ extension, reason });
      setExtension("");
      setReason("");
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting extension request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Demande de Prolongation
          </DialogTitle>
          <DialogDescription>
            Tâche: <strong>{task?.title}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Extension demandée</Label>
            <Select value={extension} onValueChange={setExtension}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir la durée" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1 jour">1 jour</SelectItem>
                <SelectItem value="2 jours">2 jours</SelectItem>
                <SelectItem value="3 jours">3 jours</SelectItem>
                <SelectItem value="1 semaine">1 semaine</SelectItem>
                <SelectItem value="2 semaines">2 semaines</SelectItem>
                <SelectItem value="Autre">Autre (préciser dans la justification)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Justification *</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Expliquez pourquoi vous avez besoin de cette prolongation..."
              rows={4}
            />
          </div>

          {task?.deadline && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center text-sm text-blue-800">
                <Calendar className="w-4 h-4 mr-2" />
                Échéance actuelle: {new Date(task.deadline).toLocaleDateString('fr-FR')}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!extension || !reason || isSubmitting}
          >
            {isSubmitting ? 'Envoi...' : 'Envoyer la demande'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExtensionRequestDialog;
