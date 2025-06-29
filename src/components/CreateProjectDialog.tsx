
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarIcon, Users, MapPin, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateProjectDialog = ({ open, onOpenChange }: CreateProjectDialogProps) => {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState<Date>();
  const [location, setLocation] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const availableMembers = [
    { id: "1", name: "Alice Martin", role: "Chef de projet", initials: "AM" },
    { id: "2", name: "Bob Dupont", role: "DevOps", initials: "BD" },
    { id: "3", name: "Claire Rousseau", role: "Développeur", initials: "CR" },
    { id: "4", name: "David Chen", role: "DBA", initials: "DC" },
    { id: "5", name: "Emma Wilson", role: "Analyste", initials: "EW" },
  ];

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = () => {
    // Ici, vous ajouteriez la logique pour créer le projet
    console.log({
      projectName,
      description,
      deadline,
      location,
      selectedMembers
    });
    
    // Réinitialiser le formulaire
    setProjectName("");
    setDescription("");
    setDeadline(undefined);
    setLocation("");
    setSelectedMembers([]);
    
    onOpenChange(false);
  };

  const selectedMemberDetails = availableMembers.filter(member => 
    selectedMembers.includes(member.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Créer un nouveau projet</DialogTitle>
          <DialogDescription>
            Définissez les détails de votre projet et assignez une équipe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informations générales */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="project-name" className="text-sm font-medium">
                Nom du projet *
              </Label>
              <Input
                id="project-name"
                placeholder="Ex: Migration infrastructure cloud"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Décrivez les objectifs et le contexte du projet..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Date limite</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !deadline && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deadline ? (
                        format(deadline, "d MMMM yyyy", { locale: fr })
                      ) : (
                        "Sélectionner une date"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={deadline}
                      onSelect={setDeadline}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="location" className="text-sm font-medium">
                  Localisation
                </Label>
                <Input
                  id="location"
                  placeholder="Ex: Paris, France"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Assignation d'équipe */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Équipe assignée ({selectedMembers.length})
              </Label>
              <p className="text-xs text-slate-500 mt-1">
                Sélectionnez les membres qui travailleront sur ce projet
              </p>
            </div>

            {/* Membres sélectionnés */}
            {selectedMemberDetails.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg">
                {selectedMemberDetails.map(member => (
                  <Badge
                    key={member.id}
                    variant="secondary"
                    className="flex items-center gap-2 py-1 px-3"
                  >
                    <Avatar className="w-5 h-5">
                      <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{member.name}</span>
                    <button
                      onClick={() => handleMemberToggle(member.id)}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Liste des membres disponibles */}
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {availableMembers.map(member => (
                <div
                  key={member.id}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    selectedMembers.includes(member.id)
                      ? "bg-blue-50 border-blue-200"
                      : "bg-white hover:bg-slate-50 border-slate-200"
                  )}
                  onClick={() => handleMemberToggle(member.id)}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{member.name}</div>
                    <div className="text-xs text-slate-500">{member.role}</div>
                  </div>
                  {selectedMembers.includes(member.id) && (
                    <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="mr-2"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!projectName.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Créer le projet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
