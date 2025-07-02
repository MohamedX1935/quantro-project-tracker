
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/contexts/AuthContext';

export const useSupabaseAuth = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    console.log('Fetching users from Supabase...');
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      console.log('Users fetched from Supabase:', data);
      const mappedUsers: User[] = data.map(user => ({
        id: user.id,
        username: user.username,
        role: user.role as 'root' | 'admin' | 'employee',
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        createdAt: user.created_at
      }));

      setUsers(mappedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loginUser = async (username: string, password: string): Promise<User | null> => {
    console.log('Attempting login for:', username);
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !data) {
        console.log('User not found:', username);
        return null;
      }

      // Vérifier le mot de passe - pour le root, on garde la logique existante
      // Pour les autres utilisateurs, on compare directement avec le password_hash stocké
      let validPassword = false;
      
      if (data.role === 'root') {
        // Pour le root, on accepte les anciens mots de passe de test
        validPassword = password === 'p@$$w0rd' || password === 'password';
      } else {
        // Pour les autres utilisateurs, on compare avec le password_hash stocké
        validPassword = password === data.password_hash;
      }
      
      if (!validPassword) {
        console.log('Invalid password for:', username);
        return null;
      }

      console.log('Login successful for:', username);
      return {
        id: data.id,
        username: data.username,
        role: data.role as 'root' | 'admin' | 'employee',
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  };

  const createUser = async (userData: {
    username: string;
    password: string;
    role: 'admin' | 'employee';
    email?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<boolean> => {
    console.log('Creating user:', userData.username);
    try {
      const { error } = await supabase
        .from('app_users')
        .insert({
          username: userData.username,
          password_hash: userData.password, // On stocke le mot de passe tel quel pour l'instant
          role: userData.role,
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          created_by: 'root'
        });

      if (error) {
        console.error('Error creating user:', error);
        return false;
      }

      console.log('User created successfully:', userData.username);
      await fetchUsers(); // Recharger la liste
      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      return false;
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    console.log('Deleting user:', userId);
    try {
      const { error } = await supabase
        .from('app_users')
        .delete()
        .eq('id', userId)
        .neq('role', 'root'); // Empêcher la suppression du root

      if (error) {
        console.error('Error deleting user:', error);
        return false;
      }

      console.log('User deleted successfully:', userId);
      await fetchUsers(); // Recharger la liste
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    isLoading,
    loginUser,
    createUser,
    deleteUser,
    refreshUsers: fetchUsers
  };
};
