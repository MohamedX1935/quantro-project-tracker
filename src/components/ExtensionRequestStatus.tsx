
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { useExtensionRequests } from "@/hooks/useExtensionRequests";

const ExtensionRequestStatus = () => {
  const { requests, isLoading } = useExtensionRequests();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "En attente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Approuvée":
        return "bg-green-100 text-green-800 border-green-200";
      case "Rejetée":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "En attente":
        return <Clock className="w-4 h-4" />;
      case "Approuvée":
        return <CheckCircle className="w-4 h-4" />;
      case "Rejetée":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Chargement des demandes...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Mes Demandes de Prolongation ({requests.length})
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="p-4 bg-slate-50/50 rounded-lg border border-slate-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-slate-900">
                          {request.task?.title || 'Tâche non trouvée'}
                        </h4>
                        <Badge className={`text-xs flex items-center gap-1 ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          {request.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="text-sm text-slate-600 mb-1">
                            <span className="font-medium">Extension demandée:</span> {request.requested_extension}
                          </div>
                          <div className="text-sm text-slate-600">
                            <span className="font-medium">Soumise le:</span> {new Date(request.created_at).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-600">
                            <span className="font-medium">Projet:</span> {request.task?.project?.name || 'Non défini'}
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <h5 className="text-sm font-medium text-slate-700 mb-1">Justification:</h5>
                        <p className="text-sm text-slate-600 bg-white p-2 rounded border">
                          {request.reason}
                        </p>
                      </div>

                      {request.admin_response && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <h5 className="text-sm font-medium text-blue-900 mb-1">Réponse de l'administrateur:</h5>
                          <p className="text-sm text-blue-800">{request.admin_response}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Aucune demande envoyée</h3>
              <p className="text-slate-600">Vos demandes de prolongation apparaîtront ici</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExtensionRequestStatus;
