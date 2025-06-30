
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Filter } from "lucide-react";

interface FilterDialogProps {
  type: 'projects' | 'tasks' | 'team';
}

const FilterDialog = ({ type }: FilterDialogProps) => {
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [location, setLocation] = useState("");

  const handleApplyFilters = () => {
    // Logique de filtrage à implémenter
    console.log(`Filtres appliqués pour ${type}:`, { status, priority, location });
  };

  const getFilterOptions = () => {
    switch (type) {
      case 'projects':
        return {
          title: "Filtrer les projets",
          statuses: ["En cours", "Presque fini", "En retard", "Terminé"],
          priorities: ["Haute", "Moyenne", "Basse"],
          locations: ["Paris", "Lyon", "Marseille", "Toulouse"]
        };
      case 'tasks':
        return {
          title: "Filtrer les tâches",
          statuses: ["À faire", "En cours", "Terminé", "En retard"],
          priorities: ["Critique", "Haute", "Moyenne", "Basse"],
          locations: ["Paris", "Lyon", "Marseille", "Toulouse"]
        };
      case 'team':
        return {
          title: "Filtrer l'équipe",
          statuses: ["Actif", "En congé", "Indisponible"],
          priorities: ["Chef de projet", "Développeur", "DevOps", "Analyste"],
          locations: ["Paris", "Lyon", "Marseille", "Toulouse"]
        };
      default:
        return { title: "Filtrer", statuses: [], priorities: [], locations: [] };
    }
  };

  const options = getFilterOptions();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-white/80 backdrop-blur-sm border-slate-200">
          <Filter className="w-4 h-4 mr-2" />
          Filtrer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{options.title}</DialogTitle>
          <DialogDescription>
            Appliquez des filtres pour affiner vos résultats
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Statut</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                {options.statuses.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{type === 'team' ? 'Rôle' : 'Priorité'}</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder={`Sélectionner ${type === 'team' ? 'un rôle' : 'une priorité'}`} />
              </SelectTrigger>
              <SelectContent>
                {options.priorities.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Localisation</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une localisation" />
              </SelectTrigger>
              <SelectContent>
                {options.locations.map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => {setStatus(""); setPriority(""); setLocation("");}}>
            Réinitialiser
          </Button>
          <Button onClick={handleApplyFilters}>
            Appliquer les filtres
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilterDialog;
