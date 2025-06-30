import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Calendar, Users, MapPin, Search } from "lucide-react";
import FilterDialog from "./FilterDialog";
import CreateProjectDialog from "./CreateProjectDialog";
import ProjectDetailsDialog from "./ProjectDetailsDialog";

const ProjectsOverview = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);

  const projects = [
    {
      id: 1,
      name: "Déploiement Infrastructure Cloud",
      description: "Migration complète vers l'infrastructure cloud avec haute disponibilité",
      progress: 75,
      status: "En cours",
      deadline: "2024-08-15",
      team: [
        { name: "Alice Martin", role: "Chef de projet", initials: "AM" },
        { name: "Bob Dupont", role: "DevOps", initials: "BD" },
        { name: "Claire Rousseau", role: "Développeur", initials: "CR" },
      ],
      tasks: { total: 24, completed: 18 },
      location: "Paris, France"
    },
    {
      id: 2,
      name: "Migration Base de Données",
      description: "Modernisation et optimisation de l'architecture de données",
      progress: 45,
      status: "En cours",
      deadline: "2024-07-30",
      team: [
        { name: "David Chen", role: "DBA", initials: "DC" },
        { name: "Emma Wilson", role: "Analyste", initials: "EW" },
      ],
      tasks: { total: 16, completed: 7 },
      location: "Lyon, France"
    },
    {
      id: 3,
      name: "Formation Utilisateurs",
      description: "Programme de formation complet pour les nouveaux outils",
      progress: 90,
      status: "Presque fini",
      deadline: "2024-07-20",
      team: [
        { name: "Frank Miller", role: "Formateur", initials: "FM" },
        { name: "Grace Lee", role: "Support", initials: "GL" },
        { name: "Henri Dubois", role: "Documentation", initials: "HD" },
      ],
      tasks: { total: 12, completed: 11 },
      location: "Marseille, France"
    },
  ];

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Presque fini":
        return "bg-green-100 text-green-800 border-green-200";
      case "En cours":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "En retard":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleViewDetails = (project: any) => {
    setSelectedProject(project);
    setShowProjectDetails(true);
  };

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
                <Badge className={`ml-2 text-xs ${getStatusColor(project.status)}`}>
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Progression</span>
                  <span className="font-medium text-slate-900">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>{project.tasks.completed}/{project.tasks.total} tâches</span>
                  <span>complétées</span>
                </div>
              </div>

              {/* Team */}
              <div className="space-y-2">
                <div className="flex items-center text-sm text-slate-600">
                  <Users className="w-4 h-4 mr-2" />
                  Équipe ({project.team.length})
                </div>
                <div className="flex -space-x-2">
                  {project.team.slice(0, 3).map((member, index) => (
                    <Avatar key={index} className="w-8 h-8 border-2 border-white">
                      <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {project.team.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs text-slate-600">
                      +{project.team.length - 3}
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="flex items-center text-sm text-slate-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="truncate">{new Date(project.deadline).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="truncate">{project.location}</span>
                </div>
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

      <ProjectDetailsDialog 
        project={selectedProject}
        open={showProjectDetails}
        onOpenChange={setShowProjectDetails}
      />

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Aucun projet trouvé</h3>
          <p className="text-slate-600 mb-4">Essayez de modifier vos critères de recherche</p>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Créer un nouveau projet
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProjectsOverview;
