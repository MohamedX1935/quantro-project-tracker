
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  FolderOpen, 
  CheckSquare, 
  TrendingUp, 
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminStats } from "@/hooks/useAdminStats";
import TasksManager from "@/components/TasksManager";
import ProjectsOverview from "@/components/ProjectsOverview";
import TeamDashboard from "@/components/TeamDashboard";
import UserManagement from "@/components/UserManagement";
import ExtensionRequestsManager from "@/components/ExtensionRequestsManager";
import TaskReportsViewer from "@/components/TaskReportsViewer";
import EmployeeTasks from "@/components/EmployeeTasks";

const Index = () => {
  const { user } = useAuth();
  const { stats, isLoading: statsLoading, refreshStats } = useAdminStats();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshStats]);

  if (!user) {
    return <div>Chargement...</div>;
  }

  const isAdmin = user.role === 'admin' || user.role === 'root';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    TaskFlow
                  </h1>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-600">
                  Bonjour, {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user.username}
                </span>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Employé
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmployeeTasks />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  TaskFlow Admin
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshStats}
                disabled={statsLoading}
                className="bg-white/80 backdrop-blur-sm border-slate-200"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              <span className="text-sm text-slate-600">
                Bonjour, {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user.username}
              </span>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                {user.role === 'root' ? 'Root' : 'Admin'}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-7 bg-white/60 backdrop-blur-sm border border-slate-200 shadow-sm">
            <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
            <TabsTrigger value="projects">Projets</TabsTrigger>
            <TabsTrigger value="tasks">Tâches</TabsTrigger>
            <TabsTrigger value="team">Équipe</TabsTrigger>
            <TabsTrigger value="extensions">Prolongations</TabsTrigger>
            <TabsTrigger value="reports">Rapports</TabsTrigger>
            {user.role === 'root' && <TabsTrigger value="users">Utilisateurs</TabsTrigger>}
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Statistiques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Projets Actifs</CardTitle>
                  <FolderOpen className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{stats.activeProjects}</div>
                  <p className="text-xs text-slate-500">
                    sur {stats.totalProjects} projets au total
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Tâches Terminées</CardTitle>
                  <CheckSquare className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{stats.completedTasks}</div>
                  <p className="text-xs text-slate-500">
                    sur {stats.totalTasks} tâches au total
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Employés Actifs</CardTitle>
                  <Users className="h-4 w-4 text-indigo-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{stats.activeEmployees}</div>
                  <p className="text-xs text-slate-500">
                    sur {stats.totalEmployees} employés
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Taux de Réussite</CardTitle>
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{stats.successRate}%</div>
                  <p className="text-xs text-slate-500">Tâches terminées</p>
                </CardContent>
              </Card>
            </div>

            {/* Statistiques secondaires */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Demandes de Prolongation</CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{stats.pendingExtensionRequests}</div>
                  <p className="text-xs text-slate-500">En attente de traitement</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Rapports Générés</CardTitle>
                  <FileText className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{stats.reportsGenerated}</div>
                  <p className="text-xs text-slate-500">Rapports de tâches</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Dernière Mise à Jour</CardTitle>
                  <RefreshCw className="h-4 w-4 text-slate-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-slate-900">
                    {new Date().toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                  <p className="text-xs text-slate-500">
                    {new Date().toLocaleDateString('fr-FR')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Aperçu rapide */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    Résumé des Activités
                  </CardTitle>
                  <CardDescription>
                    Vue d'ensemble des activités récentes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Projets en cours</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {stats.activeProjects}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Tâches à traiter</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {stats.totalTasks - stats.completedTasks}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Demandes en attente</span>
                    <Badge className="bg-orange-100 text-orange-800">
                      {stats.pendingExtensionRequests}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    Actions Rapides
                  </CardTitle>
                  <CardDescription>
                    Accès rapide aux fonctionnalités principales
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab("projects")}
                  >
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Gérer les projets
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab("tasks")}
                  >
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Gérer les tâches
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab("extensions")}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Demandes de prolongation
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects">
            <ProjectsOverview />
          </TabsContent>

          <TabsContent value="tasks">
            <TasksManager />
          </TabsContent>

          <TabsContent value="team">
            <TeamDashboard />
          </TabsContent>

          <TabsContent value="extensions">
            <ExtensionRequestsManager />
          </TabsContent>

          <TabsContent value="reports">
            <TaskReportsViewer />
          </TabsContent>

          {user.role === 'root' && (
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
