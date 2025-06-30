
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, CheckCircle, XCircle, MessageSquare } from "lucide-react";

const ExtensionRequestStatus = () => {
  const [requests] = useState([
    {
      id: 1,
      taskTitle: "Configuration serveurs production",
      requestedExtension: "3 jours",
      reason: "Problèmes de compatibilité réseau imprévus nécessitant des ajustements supplémentaires.",
      status: "En attente",
      submittedAt: "2024-07-23",
      adminResponse: null
    },
    {
      id: 2,
      taskTitle: "Documentation technique",
      requestedExtension: "2 jours",
      reason: "Besoin de plus de temps pour finaliser les diagrammes techniques.",
      status: "Approuvée",
      submittedAt: "2024-07-20",
      adminResponse: "Extension accordée. Merci de respecter la nouvelle échéance."
    },
    {
      id: 3,
      taskTitle: "Tests unitaires",
      requestedExtension: "4 jours",
      reason: "Volume de tests plus important que prévu.",
      status: "Rejetée",
      submittedAt: "2024-07-18",
      adminResponse: "Merci de respecter l'échéance initiale. Des ressources supplémentaires ont été allouées."
    }
  ]);

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
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="p-4 bg-slate-50/50 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-slate-900">{request.taskTitle}</h4>
                      <Badge className={`text-xs flex items-center gap-1 ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {request.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="text-sm text-slate-600 mb-1">
                          <span className="font-medium">Extension demandée:</span> {request.requestedExtension}
                        </div>
                        <div className="text-sm text-slate-600">
                          <span className="font-medium">Soumise le:</span> {new Date(request.submittedAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-slate-700 mb-1">Justification:</h5>
                      <p className="text-sm text-slate-600 bg-white p-2 rounded border">
                        {request.reason}
                      </p>
                    </div>

                    {request.adminResponse && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <h5 className="text-sm font-medium text-blue-900 mb-1">Réponse de l'administrateur:</h5>
                        <p className="text-sm text-blue-800">{request.adminResponse}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {requests.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Aucune demande envoyée</h3>
          <p className="text-slate-600">Vos demandes de prolongation apparaîtront ici</p>
        </div>
      )}
    </div>
  );
};

export default ExtensionRequestStatus;
