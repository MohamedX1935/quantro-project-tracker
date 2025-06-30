
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Users, Calendar, MapPin, Plus, Settings, LogOut, CheckSquare, FileText, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ProjectsOverview from "@/components/ProjectsOverview";
import TeamDashboard from "@/components/TeamDashboard";
import CreateProjectDialog from "@/components/CreateProjectDialog";
import EmployeeTasks from "@/components/EmployeeTasks";
import ExtensionRequestsManager from "@/components/ExtensionRequestsManager";

const Index = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(user?.role === 'admin' ? "dashboard" : "tasks");
  const [showCreateProject, setShowCreateProject] = useState(false);

  // Interface pour les employés
  if (user?.role === 'employee') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Header pour employé */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                  <CheckSquare className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Quantro - Mes Tâches
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <span>Connecté en tant que <strong>{user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username}</strong></span>
                  <Badge variant="secondary">Employé</Badge>
                </div>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={logout}
                  className="text-slate-600 hover:bg-slate-100"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Interface employé */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmployeeTasks />
        </main>
      </div>
    );
  }

  // Interface pour les administrateurs
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Quantro - Administration
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowCreateProject(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Projet
              </Button>
              
              <Button variant="ghost" size="icon" className="text-slate-600 hover:bg-slate-100">
                <Settings className="w-5 h-5" />
              </Button>

              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <span>Connecté en tant que <strong>{user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username}</strong></span>
                <Badge variant="default">Admin</Badge>
              </div>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={logout}
                className="text-slate-600 hover:bg-slate-100"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content pour admin */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-sm border border-slate-200 shadow-sm">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <BarChart3 className="w-4 h-4" />
              Tableau de bord
            </TabsTrigger>
            <TabsTrigger 
              value="projects" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Calendar className="w-4 h-4" />
              Projets
            </TabsTrigger>
            <TabsTrigger 
              value="team" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Users className="w-4 h-4" />
              Équipe
            </TabsTrigger>
            <TabsTrigger 
              value="extensions" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Clock className="w-4 h-4" />
              Prolongations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stats Cards */}
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Projets Actifs
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">0</div>
                  <p className="text-xs text-slate-500">
                    Aucun projet créé
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Tâches Terminées
                  </CardTitle>
                  <div className="h-4 w-4 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">0</div>
                  <p className="text-xs text-slate-500">
                    Aucune tâche terminée
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Employés Actifs
                  </CardTitle>
                  <Users className="h-4 w-4 text-indigo-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">0</div>
                  <p className="text-xs text-slate-500">
                    Aucun employé assigné
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Taux de Réussite
                  </CardTitle>
                  <div className="h-4 w-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="h-3 w-3 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">-</div>
                  <p className="text-xs text-slate-500">
                    Pas de données
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Projects */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Projets Récents
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Vue d'ensemble de vos projets en cours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Aucun projet récent</h3>
                  <p className="text-slate-600 mb-4">Créez votre premier projet pour commencer</p>
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    onClick={() => setShowCreateProject(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Créer un projet
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <ProjectsOverview />
          </TabsContent>

          <TabsContent value="team">
            <TeamDashboard />
          </TabsContent>

          <TabsContent value="extensions">
            <ExtensionRequestsManager />
          </TabsContent>
        </Tabs>
      </main>

      <CreateProjectDialog 
        open={showCreateProject}
        onOpenChange={setShowCreateProject}
      />
    </div>
  );
};

export default Index;
