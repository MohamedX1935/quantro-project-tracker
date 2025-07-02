
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import Index from "./pages/Index";
import ProjectDetails from "./pages/ProjectDetails";
import NotFound from "./pages/NotFound";
import LoginPage from "./components/LoginPage";
import UserManagement from "./components/UserManagement";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Si l'utilisateur est root, afficher uniquement la gestion des utilisateurs
  if (user?.role === 'root') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="w-5 h-5 text-white font-bold">Q</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Quantro - Administration
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-600">
                  Connecté en tant que <strong>{user.username}</strong>
                </span>
                <button
                  onClick={logout}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <UserManagement />
        </main>
      </div>
    );
  }

  // Pour les autres utilisateurs (admin/employee), afficher l'interface normale avec ProjectProvider
  return (
    <ProjectProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/project/:projectId" element={<ProjectDetails />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ProjectProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
