import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Users, Search, Mail, MapPin, Calendar, Plus, Download } from "lucide-react";
import FilterDialog from "./FilterDialog";
import AssignEmployeeDialog from "./AssignEmployeeDialog";
import EmployeeDetailsDialog from "./EmployeeDetailsDialog";
import { toast } from "@/hooks/use-toast";

const TeamDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);

  const employees = [
    {
      id: 1,
      name: "Alice Martin",
      role: "Chef de projet",
      email: "alice.martin@quantro.com",
      initials: "AM",
      status: "Actif",
      currentTasks: 8,
      completedTasks: 45,
      projects: ["Infrastructure Cloud", "Formation"],
      location: "Paris",
      lastActivity: "Il y a 2 heures"
    },
    {
      id: 2,
      name: "Bob Dupont",
      role: "DevOps Engineer",
      email: "bob.dupont@quantro.com",
      initials: "BD",
      status: "Actif",
      currentTasks: 5,
      completedTasks: 32,
      projects: ["Infrastructure Cloud"],
      location: "Lyon",
      lastActivity: "Il y a 30 minutes"
    },
    {
      id: 3,
      name: "Claire Rousseau",
      role: "Développeur Full-Stack",
      email: "claire.rousseau@quantro.com",
      initials: "CR",
      status: "En congé",
      currentTasks: 3,
      completedTasks: 28,
      projects: ["Migration BDD"],
      location: "Marseille",
      lastActivity: "Il y a 2 jours"
    },
    {
      id: 4,
      name: "David Chen",
      role: "Database Administrator",
      email: "david.chen@quantro.com",
      initials: "DC",
      status: "Actif",
      currentTasks: 6,
      completedTasks: 38,
      projects: ["Migration BDD", "Infrastructure"],
      location: "Toulouse",
      lastActivity: "Il y a 1 heure"
    },
  ];

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.projects.some(project => 
      project.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Actif":
        return "bg-green-100 text-green-800 border-green-200";
      case "En congé":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Indisponible":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleViewEmployeeDetails = (employee: any) => {
    setSelectedEmployee(employee);
    setShowEmployeeDetails(true);
  };

  const handleExportTeam = () => {
    // Simuler l'export des données
    const csvData = employees.map(emp => ({
      Nom: emp.name,
      Role: emp.role,
      Email: emp.email,
      Statut: emp.status,
      TachesActives: emp.currentTasks,
      TachesTerminees: emp.completedTasks,
      Localisation: emp.location
    }));

    console.log("Export des données de l'équipe:", csvData);
    
    toast({
      title: "Export réussi",
      description: "Les données de l'équipe ont été exportées avec succès.",
    });
  };

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.status === "Actif").length;
  const totalTasks = employees.reduce((sum, emp) => sum + emp.currentTasks, 0);
  const avgTasksPerEmployee = Math.round(totalTasks / activeEmployees);

  return (
    <div className="space-y-6">
      {/* Team Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Team Statistics */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Employés
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalEmployees}</div>
            <p className="text-xs text-slate-500">
              {activeEmployees} actifs
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Tâches Actives
            </CardTitle>
            <Calendar className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalTasks}</div>
            <p className="text-xs text-slate-500">
              {avgTasksPerEmployee} en moyenne
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Taux d'Activité
            </CardTitle>
            <div className="h-4 w-4 bg-green-100 rounded-full flex items-center justify-center">
              <div className="h-2 w-2 bg-green-600 rounded-full"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {Math.round((activeEmployees / totalEmployees) * 100)}%
            </div>
            <p className="text-xs text-slate-500">
              Équipe disponible
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Productivité
            </CardTitle>
            <div className="h-4 w-4 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">87%</div>
            <p className="text-xs text-slate-500">
              Objectifs atteints
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Rechercher un employé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200"
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="bg-white/80 backdrop-blur-sm border-slate-200"
            onClick={handleExportTeam}
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <AssignEmployeeDialog />
        </div>
      </div>

      {/* Team List */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList className="bg-white/60 backdrop-blur-sm border border-slate-200">
          <TabsTrigger value="list">Vue Liste</TabsTrigger>
          <TabsTrigger value="cards">Vue Cartes</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">
                Équipe ({filteredEmployees.length})
              </CardTitle>
              <CardDescription className="text-slate-600">
                Gestion et suivi de votre équipe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEmployees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium">
                          {employee.initials}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-1">
                          <h4 className="text-sm font-semibold text-slate-900">
                            {employee.name}
                          </h4>
                          <Badge className={`text-xs ${getStatusColor(employee.status)}`}>
                            {employee.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">{employee.role}</p>
                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                          <span className="flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {employee.email}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {employee.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-slate-900">{employee.currentTasks}</div>
                        <div className="text-xs text-slate-500">Tâches actives</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-slate-900">{employee.completedTasks}</div>
                        <div className="text-xs text-slate-500">Terminées</div>
                      </div>
                      <div className="text-center min-w-[100px]">
                        <div className="text-xs text-slate-500 mb-1">Projets</div>
                        <div className="flex flex-wrap gap-1">
                          {employee.projects.slice(0, 2).map((project, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {project}
                            </Badge>
                          ))}
                          {employee.projects.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{employee.projects.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-white/50 hover:bg-white"
                        onClick={() => handleViewEmployeeDetails(employee)}
                      >
                        Détails
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((employee) => (
              <Card key={employee.id} className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="text-center pb-3">
                  <Avatar className="w-16 h-16 mx-auto mb-3">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-lg font-semibold">
                      {employee.initials}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    {employee.name}
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    {employee.role}
                  </CardDescription>
                  <Badge className={`self-center ${getStatusColor(employee.status)}`}>
                    {employee.status}
                  </Badge>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-slate-900">{employee.currentTasks}</div>
                      <div className="text-xs text-slate-500">Tâches actives</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900">{employee.completedTasks}</div>
                      <div className="text-xs text-slate-500">Terminées</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-slate-600">Projets assignés</div>
                    <div className="flex flex-wrap gap-1">
                      {employee.projects.map((project, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {project}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-2" />
                      {employee.location}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-2" />
                      {employee.lastActivity}
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full bg-white/50 hover:bg-white"
                    onClick={() => handleViewEmployeeDetails(employee)}
                  >
                    Voir le profil
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <EmployeeDetailsDialog 
        employee={selectedEmployee}
        open={showEmployeeDetails}
        onOpenChange={setShowEmployeeDetails}
      />

      {filteredEmployees.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Aucun employé trouvé</h3>
          <p className="text-slate-600 mb-4">Essayez de modifier vos critères de recherche</p>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un employé
          </Button>
        </div>
      )}
    </div>
  );
};

export default TeamDashboard;
