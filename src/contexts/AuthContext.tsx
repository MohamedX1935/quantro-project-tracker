
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  username: string;
  role: 'root' | 'admin' | 'employee';
  email?: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  createUser: (userData: {
    username: string;
    password: string;
    role: 'admin' | 'employee';
    email?: string;
    firstName?: string;
    lastName?: string;
  }) => boolean;
  deleteUser: (userId: string) => boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Données par défaut avec le compte root
const defaultUsers: User[] = [
  {
    id: 'root',
    username: 'root',
    role: 'root',
    createdAt: new Date().toISOString(),
  }
];

const defaultPasswords: Record<string, string> = {
  'root': 'p@$$w0rd'
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(defaultUsers);
  const [passwords, setPasswords] = useState<Record<string, string>>(defaultPasswords);
  const [isLoading, setIsLoading] = useState(true);

  console.log('AuthProvider: Initializing...');

  // Charger les données depuis localStorage au démarrage
  useEffect(() => {
    console.log('AuthProvider: Loading data from localStorage');
    try {
      const savedUsers = localStorage.getItem('quantro_users');
      const savedPasswords = localStorage.getItem('quantro_passwords');
      const savedUser = localStorage.getItem('quantro_current_user');

      if (savedUsers) {
        console.log('AuthProvider: Found saved users');
        setUsers(JSON.parse(savedUsers));
      }
      if (savedPasswords) {
        console.log('AuthProvider: Found saved passwords');
        setPasswords(JSON.parse(savedPasswords));
      }
      if (savedUser) {
        console.log('AuthProvider: Found saved current user');
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      console.log('AuthProvider: Finished loading');
      setIsLoading(false);
    }
  }, []);

  // Sauvegarder dans localStorage quand les données changent
  useEffect(() => {
    localStorage.setItem('quantro_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('quantro_passwords', JSON.stringify(passwords));
  }, [passwords]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('quantro_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('quantro_current_user');
    }
  }, [user]);

  const login = (username: string, password: string): boolean => {
    console.log('AuthProvider: Login attempt for:', username);
    const foundUser = users.find(u => u.username === username);
    if (foundUser && passwords[username] === password) {
      console.log('AuthProvider: Login successful');
      setUser(foundUser);
      return true;
    }
    console.log('AuthProvider: Login failed');
    return false;
  };

  const logout = () => {
    console.log('AuthProvider: Logout');
    setUser(null);
    localStorage.removeItem('quantro_current_user');
  };

  const createUser = (userData: {
    username: string;
    password: string;
    role: 'admin' | 'employee';
    email?: string;
    firstName?: string;
    lastName?: string;
  }): boolean => {
    // Vérifier si l'utilisateur existe déjà
    if (users.find(u => u.username === userData.username)) {
      return false;
    }

    const newUser: User = {
      id: Date.now().toString(),
      username: userData.username,
      role: userData.role,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      createdAt: new Date().toISOString(),
    };

    setUsers(prev => [...prev, newUser]);
    setPasswords(prev => ({ ...prev, [userData.username]: userData.password }));
    return true;
  };

  const deleteUser = (userId: string): boolean => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete || userToDelete.role === 'root') {
      return false;
    }

    setUsers(prev => prev.filter(u => u.id !== userId));
    setPasswords(prev => {
      const newPasswords = { ...prev };
      delete newPasswords[userToDelete.username];
      return newPasswords;
    });
    return true;
  };

  if (isLoading) {
    console.log('AuthProvider: Showing loading screen');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="w-5 h-5 text-white font-bold">Q</span>
          </div>
          <div className="text-lg text-slate-600">Chargement...</div>
        </div>
      </div>
    );
  }

  console.log('AuthProvider: Rendering main app, user:', user);

  return (
    <AuthContext.Provider value={{
      user,
      users,
      login,
      logout,
      createUser,
      deleteUser,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
