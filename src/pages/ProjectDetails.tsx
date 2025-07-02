
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, CheckSquare, Clock, User, Plus, X, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useProjects } from "@/contexts/ProjectContext";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [assignedEmployees, setAssignedEmployees] = useState<any[]>([]);
  const [projectTasks, setProjectTasks] = useState<any[]>([]);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const { users } = useAuth();
  const { projects, isLoading } = useProjects();

  const project = projects.find(p => p.id === projectId);

  // Filtrer les employés disponibles pour assignation
  const availableEmployees = users.filter(user => 
    user.role === 'employee' && 
    !assignedEmployees.find(emp => emp.id === user.id)
  );

  const handleAssignEmployee = (employee: any) => {
    setAssignedEmployees(prev => [...prev, employee]);
    toast({
      title: "Employé assigné",
      description: `${employee.firstName && employee.lastName 
        ? `${employee.firstName} ${employee.lastName}` 
        : employee.username
      } a été assigné au projet.`,
    });
  };

  const handleRemoveEmployee = (employeeId: string) => {
    const employee = assignedEmployees.find(emp => emp.id === employeeId);
    setAssignedEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    toast({
      title: "Employé retiré",
      description: `${employee?.firstName && employee?.lastName 
        ? `${employee.firstName} ${employee.lastName}` 
        : employee?.username
      } a été retiré du projet.`,
    });
  };

  const handleCreateTask = (taskData: any) => {
    const newTask = {
      id: Date.now().toString(),
      title: taskData.title,
      description: taskData.description,
      assignee: taskData.assignee,
      status: "En cours",
      priority: taskData.priority,
      deadline: taskData.deadline,
      reportSubmitted: false
    };
    setProjectTasks(prev => [...prev, newTask]);
    setShowCreateTask(false);
    toast({
      title: "Tâche créée",
      description: "La nouvelle tâche a été ajoutée au projet.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Terminé":
        return "bg-green-100 text-green-800 border-green-200";
      case "En cours":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Rapport soumis":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-slate-600">Chargement du projet...</div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-slate-600">Projet non trouvé</div>
        </div>
      </div>
    );
  }

  const completedTasks = projectTasks.filter(task => task.status === "Terminé").length;
  const progress = projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mr-4 text-slate-600 hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{project.name}</h1>
              <p className="text-sm text-slate-600">{project.description}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-sm border border-slate-200 shadow-sm">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="team">Équipe ({assignedEmployees.length})</TabsTrigger>
            <TabsTrigger value="tasks">Tâches ({projectTasks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Progression</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Progress value={progress} className="h-3" />
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>{completedTasks}/{projectTasks.length} tâches</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Informations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Priorité:</span>
                    <Badge className={`text-xs ${getPriorityColor(project.priority)}`}>
                      {project.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                    <span>Échéance: {new Date(project.deadline).toLocaleDateString('fr-FR')}</span>
                  </div>
                  {project.location && (
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-slate-500" />
                      <span>{project.location}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2 text-slate-500" />
                    <span>{assignedEmployees.length} membres d'équipe</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Équipe assignée</h3>
              {availableEmployees.length > 0 && (
                <div className="flex gap-2">
                  <select 
                    onChange={(e) => {
                      const employee = availableEmployees.find(emp => emp.id === e.target.value);
                      if (employee) handleAssignEmployee(employee);
                      e.target.value = '';
                    }}
                    className="px-3 py-1 border border-slate-200 rounded text-sm bg-white"
                    defaultValue=""
                  >
                    <option value="">Assigner un employé</option>
                    {availableEmployees.map(employee => (
                      <option key={employee.id} value={employee.id}>
                        {employee.firstName && employee.lastName 
                          ? `${employee.firstName} ${employee.lastName}` 
                          : employee.username}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignedEmployees.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {employee.firstName && employee.lastName 
                        ? `${employee.firstName[0]}${employee.lastName[0]}` 
                        : employee.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        {employee.firstName && employee.lastName 
                          ? `${employee.firstName} ${employee.lastName}` 
                          : employee.username}
                      </div>
                      <div className="text-xs text-slate-600">Employé</div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveEmployee(employee.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              
              {assignedEmployees.length === 0 && (
                <div className="col-span-2 text-center py-8 text-slate-500">
                  Aucun employé assigné à ce projet
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Tâches du projet</h3>
              <Button onClick={() => setShowCreateTask(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer une tâche
              </Button>
            </div>

            <div className="space-y-3">
              {projectTasks.map((task) => (
                <Card key={task.id} className="bg-white/80 backdrop-blur-sm border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-sm font-semibold text-slate-900">{task.title}</h4>
                          <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                            {task.status}
                          </Badge>
                          <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{task.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {task.assignee?.firstName && task.assignee?.lastName 
                              ? `${task.assignee.firstName} ${task.assignee.lastName}` 
                              : task.assignee?.username || 'Non assigné'}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(task.deadline).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {projectTasks.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  Aucune tâche créée pour ce projet
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {showCreateTask && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Créer une nouvelle tâche</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const assigneeId = formData.get('assignee') as string;
                const assignee = assignedEmployees.find(emp => emp.id === assigneeId) || null;
                handleCreateTask({
                  title: formData.get('title'),
                  description: formData.get('description'),
                  assignee,
                  priority: formData.get('priority'),
                  deadline: formData.get('deadline')
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Titre</label>
                    <input name="title" required className="w-full p-2 border border-slate-200 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea name="description" className="w-full p-2 border border-slate-200 rounded" rows={3} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Assigné à</label>
                    <select name="assignee" className="w-full p-2 border border-slate-200 rounded">
                      <option value="">Non assigné</option>
                      {assignedEmployees.map(employee => (
                        <option key={employee.id} value={employee.id}>
                          {employee.firstName && employee.lastName 
                            ? `${employee.firstName} ${employee.lastName}` 
                            : employee.username}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Priorité</label>
                    <select name="priority" className="w-full p-2 border border-slate-200 rounded">
                      <option value="basse">Basse</option>
                      <option value="moyenne">Moyenne</option>
                      <option value="haute">Haute</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Échéance</label>
                    <input name="deadline" type="date" required className="w-full p-2 border border-slate-200 rounded" />
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button type="button" variant="outline" onClick={() => setShowCreateTask(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    Créer la tâche
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectDetails;
