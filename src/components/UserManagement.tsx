
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Plus, Trash2, UserPlus, Shield, User, Upload, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const UserManagement = () => {
  const { users, createUser, deleteUser } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'employee' as 'admin' | 'employee',
    email: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [importError, setImportError] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateUser = () => {
    setError('');
    
    if (!newUser.username || !newUser.password) {
      setError('L\'identifiant et le mot de passe sont obligatoires');
      return;
    }

    const success = createUser(newUser);
    if (success) {
      toast({
        title: "Utilisateur créé",
        description: `L'utilisateur ${newUser.username} a été créé avec succès.`,
      });
      setNewUser({
        username: '',
        password: '',
        role: 'employee',
        email: '',
        firstName: '',
        lastName: ''
      });
      setIsCreateDialogOpen(false);
    } else {
      setError('Cet identifiant existe déjà');
    }
  };

  const handleDeleteUser = (userId: string, username: string) => {
    const success = deleteUser(userId);
    if (success) {
      toast({
        title: "Utilisateur supprimé",
        description: `L'utilisateur ${username} a été supprimé.`,
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'root':
        return <Shield className="w-4 h-4" />;
      case 'admin':
        return <UserPlus className="w-4 h-4" />;
      case 'employee':
        return <User className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'root':
        return 'destructive';
      case 'admin':
        return 'default';
      case 'employee':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const parseCSVFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csvText = e.target?.result as string;
          const lines = csvText.trim().split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          
          const expectedHeaders = ['username', 'password', 'role', 'firstName', 'lastName', 'email'];
          const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
          if (missingHeaders.length > 0) {
            reject(new Error(`Colonnes manquantes: ${missingHeaders.join(', ')}`));
            return;
          }

          const users = [];
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length !== headers.length) continue;
            
            const user: any = {};
            headers.forEach((header, index) => {
              user[header] = values[index];
            });
            
            if (user.username && user.password && user.role) {
              users.push(user);
            }
          }
          
          resolve(users);
        } catch (error) {
          reject(new Error('Erreur lors de la lecture du fichier CSV'));
        }
      };
      reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
      reader.readAsText(file);
    });
  };

  const handleImportCSV = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      setImportError('Veuillez sélectionner un fichier CSV');
      return;
    }

    setIsImporting(true);
    setImportError('');

    try {
      const file = fileInputRef.current.files[0];
      const users = await parseCSVFile(file);
      
      if (users.length === 0) {
        setImportError('Aucun utilisateur valide trouvé dans le fichier');
        return;
      }

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const userData of users) {
        if (!['admin', 'employee'].includes(userData.role)) {
          errors.push(`Rôle invalide pour ${userData.username}: ${userData.role}`);
          errorCount++;
          continue;
        }

        const success = createUser({
          username: userData.username,
          password: userData.password,
          role: userData.role as 'admin' | 'employee',
          email: userData.email || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || ''
        });

        if (success) {
          successCount++;
        } else {
          errors.push(`Échec de création pour ${userData.username} (identifiant existant)`);
          errorCount++;
        }
      }

      toast({
        title: "Import terminé",
        description: `${successCount} utilisateurs créés avec succès${errorCount > 0 ? `, ${errorCount} erreurs` : '.'}`,
      });

      if (errors.length > 0) {
        setImportError(`Erreurs: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? '...' : ''}`);
      }

      setIsImportDialogOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Erreur lors de l\'import');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des utilisateurs</h1>
          <p className="text-slate-600">Créez et gérez les comptes administrateurs et employés</p>
        </div>
        
        <div className="flex gap-3">
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                <Upload className="w-4 h-4 mr-2" />
                Importer CSV
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Importer des utilisateurs</DialogTitle>
                <DialogDescription>
                  Importez plusieurs utilisateurs à partir d'un fichier CSV
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="csvFile">Fichier CSV</Label>
                  <Input
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    onChange={() => setImportError('')}
                  />
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Format CSV requis:</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Les colonnes suivantes sont obligatoires dans cet ordre:
                      </p>
                      <code className="text-xs bg-white px-2 py-1 rounded mt-2 block">
                        username,password,role,firstName,lastName,email
                      </code>
                      <p className="text-xs text-blue-600 mt-2">
                        • <strong>username</strong>: Identifiant unique (obligatoire)<br/>
                        • <strong>password</strong>: Mot de passe (obligatoire)<br/>
                        • <strong>role</strong>: admin ou employee (obligatoire)<br/>
                        • <strong>firstName</strong>: Prénom (optionnel)<br/>
                        • <strong>lastName</strong>: Nom (optionnel)<br/>
                        • <strong>email</strong>: Adresse email (optionnel)
                      </p>
                    </div>
                  </div>
                </div>
                
                {importError && (
                  <Alert variant="destructive">
                    <AlertDescription>{importError}</AlertDescription>
                  </Alert>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleImportCSV} disabled={isImporting}>
                  {isImporting ? 'Import en cours...' : 'Importer'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Nouvel utilisateur
              </Button>
            </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
              <DialogDescription>
                Créez un compte administrateur ou employé
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Prénom"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Nom"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Identifiant *</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Identifiant de connexion"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Mot de passe"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="adresse@email.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Rôle *</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value as 'admin' | 'employee' }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="employee">Employé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateUser}>
                Créer l'utilisateur
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Liste des utilisateurs ({users.length})
          </CardTitle>
          <CardDescription>
            Gérez les comptes utilisateurs de votre organisation
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-lg border border-slate-200">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                    {getRoleIcon(user.role)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-slate-900">
                        {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
                      </h4>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role === 'root' ? 'Root' : user.role === 'admin' ? 'Admin' : 'Employé'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">@{user.username}</p>
                    {user.email && (
                      <p className="text-sm text-slate-500">{user.email}</p>
                    )}
                  </div>
                </div>
                
                {user.role !== 'root' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id, user.username)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
