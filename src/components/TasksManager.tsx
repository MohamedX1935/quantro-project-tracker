import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, MapPin, Search, Plus, Calendar as CalendarIcon } from "lucide-react";
import FilterDialog from "./FilterDialog";
import NewTaskDialog from "./NewTaskDialog";

const TasksManager = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const tasks = [
    {
      id: 1,
      title: "Configuration serveurs production",
      description: "Mise en place et configuration des serveurs de production",
      project: "Infrastructure Cloud",
      assignee: { name: "Bob Dupont", initials: "BD" },
      status: "En cours",
      priority: "Haute",
      deadline: "2024-07-25",
      progress: 60,
      location: "Paris Data Center",
      attachments: 3
    },
    {
      id: 2,
      title: "Migration données clients",
      description: "Transfert sécurisé des données clients vers la nouvelle base",
      project: "Migration BDD",
      assignee: { name: "David Chen", initials: "DC" },
      status: "En attente",
      priority: "Critique",
      deadline: "2024-07-22",
      progress: 25,
      location: "Lyon Office",
      attachments: 1
    },
    {
      id: 3,
      title: "Tests d'intégration API",
      description: "Validation des nouvelles API et tests de charge",
      project: "Infrastructure Cloud",
      assignee: { name: "Claire Rousseau", initials: "CR" },
      status: "Terminé",
      priority: "Moyenne",
      deadline: "2024-07-20",
      progress: 100,
      location: "Marseille Lab",
      attachments: 5
    },
  ];

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.project.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Terminé":
        return "bg-green-100 text-green-800 border-green-200";
      case "En cours":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "En attente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "En retard":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critique":
        return "bg-red-500";
      case "Haute":
        return "bg-orange-500";
      case "Moyenne":
        return "bg-yellow-500";
      case "Basse":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleViewTaskDetails = (task: any) => {
    console.log("Voir détails de la tâche:", task);
    // Ici on pourrait ouvrir un modal de détail
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Rechercher des tâches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200"
          />
        </div>
        
        <div className="flex gap-2">
          <FilterDialog type="tasks" />
          <NewTaskDialog />
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {task.title}
                    </h3>
                    <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                      {task.status}
                    </Badge>
                  </div>
                  <p className="text-slate-600 mb-2 line-clamp-2">{task.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-slate-500">
                    <span className="bg-slate-100 px-2 py-1 rounded text-xs font-medium">
                      {task.project}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {task.location}
                    </span>
                    <span className="flex items-center">
                      <CalendarIcon className="w-3 h-3 mr-1" />
                      {new Date(task.deadline).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <Avatar className="w-10 h-10 mx-auto mb-2">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm">
                        {task.assignee.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-xs text-slate-600 font-medium">
                      {task.assignee.name}
                    </div>
                  </div>

                  <div className="text-center min-w-[80px]">
                    <div className="text-2xl font-bold text-slate-900 mb-1">
                      {task.progress}%
                    </div>
                    <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          task.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-white/50 hover:bg-white border-slate-200"
                      onClick={() => handleViewTaskDetails(task)}
                    >
                      Détails
                    </Button>
                    {task.attachments > 0 && (
                      <div className="text-xs text-slate-500 text-center">
                        {task.attachments} fichier{task.attachments > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Aucune tâche trouvée</h3>
          <p className="text-slate-600 mb-4">Essayez de modifier vos critères de recherche</p>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Créer une nouvelle tâche
          </Button>
        </div>
      )}
    </div>
  );
};

export default TasksManager;
