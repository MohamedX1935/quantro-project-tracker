
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Calendar, User, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { useExtensionRequests } from "@/hooks/useExtensionRequests";
import { toast } from "@/hooks/use-toast";

const ExtensionRequestsManager = () => {
  const { requests, updateExtensionRequest } = useExtensionRequests();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [adminResponse, setAdminResponse] = useState("");

  const handleApprove = async (requestId: string) => {
    try {
      const success = await updateExtensionRequest(requestId, 'Approuvée', 'Demande de prolongation approuvée.');
      if (success) {
        toast({
          title: "Demande approuvée",
          description: "La demande de prolongation a été approuvée.",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'approuver la demande.",
        variant: "destructive",
      });
    }
  };

  const handleReject = (request: any) => {
    setSelectedRequest(request);
    setIsResponseDialogOpen(true);
  };

  const handleSendResponse = async () => {
    if (!adminResponse.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une réponse.",
        variant: "destructive"
      });
      return;
    }

    try {
      const success = await updateExtensionRequest(selectedRequest.id, 'Rejetée', adminResponse);
      if (success) {
        toast({
          title: "Demande rejetée",
          description: "La demande a été rejetée avec une réponse explicative.",
        });
        
        setAdminResponse("");
        setIsResponseDialogOpen(false);
        setSelectedRequest(null);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de rejeter la demande.",
        variant: "destructive",
      });
    }
  };

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

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Demandes de Prolongation ({requests.length})
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="p-4 bg-slate-50/50 rounded-lg border border-slate-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-slate-900">
                          {request.task?.title || 'Tâche non trouvée'}
                        </h4>
                        <Badge className={`text-xs ${getStatusColor(request.status)}`}>
                          {request.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="space-y-1">
                          <div className="text-sm text-slate-600">
                            Employé: <strong>ID {request.employee_id}</strong>
                          </div>
                          <div className="text-sm text-slate-600">
                            Projet: <strong>{request.task?.project?.name || 'Non défini'}</strong>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-sm text-slate-600">
                            Extension demandée: <strong>{request.requested_extension}</strong>
                          </div>
                          <div className="flex items-center text-sm text-slate-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            Soumise le: <strong>{new Date(request.created_at).toLocaleDateString('fr-FR')}</strong>
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
                        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                          <h5 className="text-sm font-medium text-blue-900 mb-1">Votre réponse:</h5>
                          <p className="text-sm text-blue-800">{request.admin_response}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {request.status === "En attente" && (
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(request)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Rejeter
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Aucune demande de prolongation</h3>
              <p className="text-slate-600">Les nouvelles demandes apparaîtront ici</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rejeter la demande</DialogTitle>
            <DialogDescription>
              Expliquez pourquoi cette demande de prolongation est rejetée
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <strong>Tâche:</strong> {selectedRequest?.task?.title}
            </div>
            <div>
              <strong>Employé:</strong> ID {selectedRequest?.employee_id}
            </div>
            <Textarea
              placeholder="Expliquez les raisons du rejet et donnez des conseils..."
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              rows={4}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResponseDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleSendResponse}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Envoyer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExtensionRequestsManager;
