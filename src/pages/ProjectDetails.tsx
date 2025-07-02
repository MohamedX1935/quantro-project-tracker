import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, CheckSquare, Clock, User, Plus, X, ArrowLeft, Save, LogOut } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useProjects } from "@/contexts/ProjectContext";
import { supabase } from "@/integrations/supabase/client";
import ProjectTaskActions from "@/components/ProjectTaskActions";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [assignedEmployees, setAssignedEmployees] = useState<any[]>([]);
  const [projectTasks, setProjectTasks] = useState<any[]>([]);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { users } = useAuth();
  const { projects, isLoading: projectsLoading } = useProjects();

  const project = projects.find(p => p.id === projectId);

  // Filtrer les employés disponibles pour assignation
  const availableEmployees = users.filter(user => 
    user.role === 'employee' && 
    !assignedEmployees.find(emp => emp.id === user.id)
  );

  // Charger les données du projet
  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  const loadProjectData = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      // Charger les employés assignés
      const { data: assignments, error: assignmentsError } = await supabase
        .from('project_assignments')
        .select('employee_id')
        .eq('project_id', projectId);

      if (assignmentsError) {
        console.error('Error loading assignments:', assignmentsError);
      } else if (assignments) {
        const assignedEmployeeIds = assignments.map(a => a.employee_id);
        const assignedEmps = users.filter(user => assignedEmployeeIds.includes(user.id));
        setAssignedEmployees(assignedEmps);
      }

      // Charger les tâches
      const { data: tasks, error: tasksError } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId);

      if (tasksError) {
        console.error('Error loading tasks:', tasksError);
      } else if (tasks) {
        const tasksWithAssignees = tasks.map(task => ({
          ...task,
          assignee: task.assignee_id ? users.find(u => u.id === task.assignee_id) : null
        }));
        setProjectTasks(tasksWithAssignees);
      }
    } catch (error) {
      console.error('Error loading project data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du projet.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignEmployee = (employee: any) => {
    setAssignedEmployees(prev => [...prev, employee]);
    setHasUnsavedChanges(true);
    toast({
      title: "Employé assigné temporairement",
      description: `${employee.firstName && employee.lastName 
        ? `${employee.firstName} ${employee.lastName}` 
        : employee.username
      } sera assigné au projet après sauvegarde.`,
    });
  };

  const handleRemoveEmployee = (employeeId: string) => {
    const employee = assignedEmployees.find(emp => emp.id === employeeId);
    setAssignedEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    setHasUnsavedChanges(true);
    toast({
      title: "Employé retiré temporairement",
      description: `${employee?.firstName && employee?.lastName 
        ? `${employee.firstName} ${employee.lastName}` 
        : employee?.username
      } sera retiré du projet après sauvegarde.`,
    });
  };

  const handleCreateTask = (taskData: any) => {
    const newTask = {
      id: `temp_${Date.now()}`,
      title: taskData.title,
      description: taskData.description,
      assignee: taskData.assignee,
      assignee_id: taskData.assignee?.id || null,
      status: "En cours",
      priority: taskData.priority,
      deadline: taskData.deadline,
      project_id: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setProjectTasks(prev => [...prev, newTask]);
    setShowCreateTask(false);
    setHasUnsavedChanges(true);
    toast({
      title: "Tâche créée temporairement",
      description: "La nouvelle tâche sera sauvegardée après enregistrement.",
    });
  };

  const handleTaskDeleted = (taskId: string) => {
    setProjectTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleTaskClosed = (taskId: string) => {
    setProjectTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, closed_by_admin: true, updated_at: new Date().toISOString() }
          : task
      )
    );
  };

  const handleSaveChanges = async () => {
    if (!projectId) return;
    
    setIsSaving(true);
    try {
      // Sauvegarder les assignations d'employés
      // D'abord supprimer les anciennes assignations
      const { error: deleteAssignmentsError } = await supabase
        .from('project_assignments')
        .delete()
        .eq('project_id', projectId);

      if (deleteAssignmentsError) {
        throw deleteAssignmentsError;
      }

      // Ajouter les nouvelles assignations
      if (assignedEmployees.length > 0) {
        const assignmentsToInsert = assignedEmployees.map(emp => ({
          project_id: projectId,
          employee_id: emp.id,
          assigned_at: new Date().toISOString()
        }));

        const { error: insertAssignmentsError } = await supabase
          .from('project_assignments')
          .insert(assignmentsToInsert);

        if (insertAssignmentsError) {
          throw insertAssignmentsError;
        }
      }

      // Sauvegarder les tâches
      // D'abord supprimer les anciennes tâches
      const { error: deleteTasksError } = await supabase
        .from('project_tasks')
        .delete()
        .eq('project_id', projectId);

      if (deleteTasksError) {
        throw deleteTasksError;
      }

      // Ajouter les nouvelles tâches
      if (projectTasks.length > 0) {
        const tasksToInsert = projectTasks.map(task => ({
          project_id: projectId,
          title: task.title,
          description: task.description,
          assignee_id: task.assignee_id,
          status: task.status,
          priority: task.priority,
          deadline: task.deadline,
          created_at: task.created_at,
          updated_at: new Date().toISOString()
        }));

        const { error: insertTasksError } = await supabase
          .from('project_tasks')
          .insert(tasksToInsert);

        if (insertTasksError) {
          throw insertTasksError;
        }
      }

      setHasUnsavedChanges(false);
      toast({
        title: "Modifications sauvegardées",
        description: "Toutes les modifications ont été enregistrées avec succès.",
      });
      
      // Recharger les données pour s'assurer de la cohérence
      await loadProjectData();
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder les modifications.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoBack = () => {
    if (hasUnsavedChanges) {
      if (confirm("Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter sans sauvegarder ?")) {
        navigate('/');
      }
    } else {
      navigate('/');
    }
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

  if (projectsLoading || isLoading) {
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
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={handleGoBack}
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
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">
                  {users.find(u => u.id === project.created_by)?.first_name && users.find(u => u.id === project.created_by)?.last_name 
                    ? `${users.find(u => u.id === project.created_by)?.first_name} ${users.find(u => u.id === project.created_by)?.last_name}` 
                    : users.find(u => u.id === project.created_by)?.username || 'Admin'}
                </p>
                <p className="text-xs text-slate-600">Administrateur</p>
              </div>
              {hasUnsavedChanges && (
                <span className="text-sm text-orange-600 font-medium">
                  Modifications non sauvegardées
                </span>
              )}
              <Button
                onClick={handleSaveChanges}
                disabled={!hasUnsavedChanges || isSaving}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Sauvegarde..." : "Enregistrer"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
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
                          {task.closed_by_admin && (
                            <Badge className="text-xs bg-gray-100 text-gray-800">
                              Clôturée
                            </Badge>
                          )}
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
                            {task.deadline ? new Date(task.deadline).toLocaleDateString('fr-FR') : 'Pas de date limite'}
                          </span>
                        </div>
                      </div>
                      
                      <ProjectTaskActions
                        task={task}
                        onTaskDeleted={handleTaskDeleted}
                        onTaskClosed={handleTaskClosed}
                      />
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
                    <input name="deadline" type="date" className="w-full p-2 border border-slate-200 rounded" />
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
