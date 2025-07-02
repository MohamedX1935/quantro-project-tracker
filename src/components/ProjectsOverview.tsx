
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, Calendar, MapPin, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import FilterDialog from "./FilterDialog";
import CreateProjectDialog from "./CreateProjectDialog";
import { useProjects } from "@/contexts/ProjectContext";
import { useToast } from "@/hooks/use-toast";

const ProjectsOverview = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateProject, setShowCreateProject] = useState(false);
  const navigate = useNavigate();

  const { projects, isLoading, deleteProject } = useProjects();
  const { toast } = useToast();

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "haute":
        return "bg-red-100 text-red-800 border-red-200";
      case "moyenne":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "basse":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleViewDetails = (project: any) => {
    navigate(`/project/${project.id}`);
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    const success = await deleteProject(projectId);
    if (success) {
      toast({
        title: "Projet supprimé",
        description: `Le projet "${projectName}" a été supprimé avec succès.`,
      });
    } else {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du projet.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-slate-600">Chargement des projets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Rechercher des projets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200"
          />
        </div>
        
        <div className="flex gap-2">
          <FilterDialog type="projects" />
          <Button 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            onClick={() => setShowCreateProject(true)}
          >
            Nouveau Projet
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="text-slate-600 line-clamp-2 mt-1">
                    {project.description}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <Badge className={`text-xs ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </Badge>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer le projet</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer le projet "{project.name}" ? Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteProject(project.id, project.name)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Info */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="flex items-center text-sm text-slate-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="truncate">{new Date(project.deadline).toLocaleDateString('fr-FR')}</span>
                </div>
                {project.location && (
                  <div className="flex items-center text-sm text-slate-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="truncate">{project.location}</span>
                  </div>
                )}
              </div>

              <Button 
                variant="outline" 
                className="w-full mt-4 bg-white/50 hover:bg-white border-slate-200 hover:border-blue-300 hover:text-blue-600 transition-colors"
                onClick={() => handleViewDetails(project)}
              >
                Voir les détails
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateProjectDialog 
        open={showCreateProject}
        onOpenChange={setShowCreateProject}
      />

      {filteredProjects.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Aucun projet trouvé</h3>
          <p className="text-slate-600 mb-4">Commencez par créer votre premier projet</p>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            onClick={() => setShowCreateProject(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Créer un nouveau projet
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProjectsOverview;
