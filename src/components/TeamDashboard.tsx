
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Search, Download, Plus, Eye, Grid, List, Mail, Phone, MapPin, Calendar, Filter } from "lucide-react";
import FilterDialog from "./FilterDialog";
import AssignEmployeeDialog from "./AssignEmployeeDialog";
import EmployeeDetailsDialog from "./EmployeeDetailsDialog";

const TeamDashboard = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showAssignEmployee, setShowAssignEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);

  const employees: any[] = []; // Tableau vide - plus d'exemples

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || employee.role.toLowerCase() === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleExport = () => {
    console.log("Exporter les données de l'équipe");
  };

  const handleViewEmployeeDetails = (employee: any) => {
    setSelectedEmployee(employee);
    setShowEmployeeDetails(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Actif":
        return "bg-green-100 text-green-800 border-green-200";
      case "Absent":
        return "bg-red-100 text-red-800 border-red-200";
      case "En congé":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Employés</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{employees.length}</div>
            <p className="text-xs text-slate-500">Tous départements</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Actifs</CardTitle>
            <div className="h-4 w-4 bg-green-100 rounded-full flex items-center justify-center">
              <div className="h-2 w-2 bg-green-600 rounded-full"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {employees.filter(emp => emp.status === 'Actif').length}
            </div>
            <p className="text-xs text-slate-500">En service</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Développeurs</CardTitle>
            <div className="h-4 w-4 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {employees.filter(emp => emp.role === 'Développeur').length}
            </div>
            <p className="text-xs text-slate-500">Tech team</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Projets Actifs</CardTitle>
            <div className="h-4 w-4 bg-indigo-100 rounded-full flex items-center justify-center">
              <div className="h-2 w-2 bg-indigo-600 rounded-full"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">0</div>
            <p className="text-xs text-slate-500">Avec équipes</p>
          </CardContent>
        </Card>
      </div>

      {/* Contrôles */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Rechercher un employé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200"
            />
          </div>
          
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-48 bg-white/80 backdrop-blur-sm border-slate-200">
              <SelectValue placeholder="Filtrer par rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              <SelectItem value="développeur">Développeur</SelectItem>
              <SelectItem value="designer">Designer</SelectItem>
              <SelectItem value="chef de projet">Chef de projet</SelectItem>
              <SelectItem value="devops">DevOps</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/60 backdrop-blur-sm border border-slate-200 rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="border-0"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="border-0"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          
          <FilterDialog type="team" />
          
          <Button 
            variant="outline"
            onClick={handleExport}
            className="bg-white/80 backdrop-blur-sm border-slate-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          
          <Button 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            onClick={() => setShowAssignEmployee(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Assigner Employé
          </Button>
        </div>
      </div>

      {/* Liste des employés */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Équipe ({filteredEmployees.length})
          </CardTitle>
          <CardDescription className="text-slate-600">
            Gérez votre équipe et suivez leurs performances
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {filteredEmployees.length > 0 ? (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEmployees.map((employee) => (
                    <div key={employee.id} className="p-4 bg-slate-50/50 rounded-lg border border-slate-200 hover:shadow-sm transition-shadow">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={employee.avatar} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                            {employee.initials}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-slate-900 truncate">{employee.name}</h4>
                            <Badge className={`text-xs ${getStatusColor(employee.status)}`}>
                              {employee.status}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-slate-600 mb-1">{employee.role}</p>
                          <p className="text-xs text-slate-500 mb-2">{employee.department}</p>
                          
                          <div className="flex items-center text-xs text-slate-500 mb-3">
                            <Mail className="w-3 h-3 mr-1" />
                            <span className="truncate">{employee.email}</span>
                          </div>
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => handleViewEmployeeDetails(employee)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Voir le profil
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredEmployees.map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg border border-slate-200 hover:shadow-sm transition-shadow">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={employee.avatar} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm">
                            {employee.initials}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-slate-900">{employee.name}</h4>
                            <Badge className={`text-xs ${getStatusColor(employee.status)}`}>
                              {employee.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span>{employee.role}</span>
                            <span>{employee.department}</span>
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {employee.email}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewEmployeeDetails(employee)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Détails
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Aucun employé trouvé</h3>
              <p className="text-slate-600 mb-4">Commencez par assigner des employés à votre équipe</p>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                onClick={() => setShowAssignEmployee(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Assigner un employé
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AssignEmployeeDialog 
        open={showAssignEmployee}
        onOpenChange={setShowAssignEmployee}
      />

      <EmployeeDetailsDialog 
        employee={selectedEmployee}
        open={showEmployeeDetails}
        onOpenChange={setShowEmployeeDetails}
      />
    </div>
  );
};

export default TeamDashboard;
