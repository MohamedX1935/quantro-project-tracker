
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

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
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  createUser: (userData: {
    username: string;
    password: string;
    role: 'admin' | 'employee';
    email?: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { users, loginUser, createUser: createUserInDB, deleteUser: deleteUserFromDB, refreshUsers } = useSupabaseAuth();

  console.log('AuthProvider: Initializing...');

  // Charger l'utilisateur connecté depuis localStorage au démarrage
  useEffect(() => {
    console.log('AuthProvider: Loading current user from localStorage');
    try {
      const savedUser = localStorage.getItem('quantro_current_user');
      if (savedUser) {
        console.log('AuthProvider: Found saved current user');
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sauvegarder l'utilisateur connecté dans localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('quantro_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('quantro_current_user');
    }
  }, [user]);

  const login = async (username: string, password: string): Promise<boolean> => {
    console.log('AuthProvider: Login attempt for:', username);
    const loggedUser = await loginUser(username, password);
    if (loggedUser) {
      console.log('AuthProvider: Login successful');
      setUser(loggedUser);
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

  const createUser = async (userData: {
    username: string;
    password: string;
    role: 'admin' | 'employee';
    email?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<boolean> => {
    const success = await createUserInDB(userData);
    if (success) {
      await refreshUsers();
    }
    return success;
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    const success = await deleteUserFromDB(userId);
    if (success) {
      await refreshUsers();
    }
    return success;
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
