
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { User, UserRole } from '../types';

interface LoginResult {
    success: boolean;
    message?: string;
}

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (identifier: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  register: (userData: Partial<User>, password: string) => Promise<boolean>;
  verifyEmail: (email: string) => void;
  checkAvailability: (field: 'username' | 'email', value: string) => boolean;
  updateUserProfile: (id: string, data: Partial<User>) => Promise<void>;
  updateUserRole: (id: string, role: UserRole) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  requestPasswordReset: (identifier: string) => Promise<boolean>;
  changePassword: (oldPw: string, newPw: string) => Promise<boolean>;
  isAuthenticated: boolean;
  canAccessAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ALLOWED_ADMIN_ROLES: UserRole[] = ['admin', 'it', 'editor', 'author', 'moderator'];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Add version signal
  const [authVersion, setAuthVersion] = useState(0);
  const forceUpdate = () => setAuthVersion(v => v + 1);

  const users = useLiveQuery(() => db.users.toArray(), [authVersion]) || [];
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
      const initSession = async () => {
          const storedId = localStorage.getItem('pp_userId');
          if (storedId) {
              const user = await db.users.get(storedId);
              if (user) setCurrentUser(user);
          }
          setLoadingSession(false);
      };
      initSession();
  }, []);

  const login = async (identifier: string, password: string): Promise<LoginResult> => {
      // Mock delay to simulate network
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const user = await db.users
        .filter(u => u.email.toLowerCase() === identifier.toLowerCase() || u.username.toLowerCase() === identifier.toLowerCase())
        .first();

      if (!user) {
          return { success: false, message: 'Benutzer nicht gefunden.' };
      }

      if (user.isBanned) {
          return { success: false, message: 'Account gesperrt.' };
      }

      if (user.isVerified === false) {
          return { success: false, message: 'Bitte bestätigen Sie zuerst Ihre E-Mail Adresse.' };
      }

      // Password check mocked
      
      setCurrentUser(user);
      localStorage.setItem('pp_userId', user.id);
      return { success: true };
  };

  const logout = () => {
      setCurrentUser(null);
      localStorage.removeItem('pp_userId');
  };

  const register = async (userData: Partial<User>, password: string): Promise<boolean> => {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const allUsers = await db.users.toArray();
      // Generate simple ID
      const maxId = allUsers.reduce((max, u) => Math.max(max, parseInt(u.id) || 0), 0);
      const newId = (maxId + 1).toString();

      const newUser: User = {
          id: newId,
          username: userData.username!,
          email: userData.email!,
          firstName: '',
          lastName: '',
          avatar: '',
          role: 'user', 
          joinedDate: new Date().toISOString().split('T')[0],
          socials: {},
          isVerified: false, 
          ...userData
      };

      await db.users.add(newUser);
      forceUpdate();
      return true;
  };

  const verifyEmail = async (email: string) => {
      const user = await db.users.where({ email }).first();
      if (user) {
          await db.users.update(user.id, { isVerified: true });
          forceUpdate();
      }
  };

  const checkAvailability = (field: 'username' | 'email', value: string): boolean => {
      return !users.some(u => u[field].toLowerCase() === value.toLowerCase());
  };

  const updateUserProfile = async (id: string, data: Partial<User>) => {
      await db.users.update(id, data);
      if (currentUser && currentUser.id === id) {
          const fresh = await db.users.get(id);
          if (fresh) setCurrentUser(fresh);
      }
      forceUpdate();
  };

  const updateUserRole = async (id: string, role: UserRole) => {
      await db.users.update(id, { role });
      if (currentUser && currentUser.id === id) {
          setCurrentUser(prev => prev ? { ...prev, role } : null);
      }
      forceUpdate();
  };

  const deleteUser = async (id: string) => {
      await db.users.delete(id);
      if (currentUser && currentUser.id === id) {
          logout();
      }
      forceUpdate();
  };

  const requestPasswordReset = async (identifier: string): Promise<boolean> => {
      const user = await db.users
        .filter(u => u.email.toLowerCase() === identifier.toLowerCase() || u.username.toLowerCase() === identifier.toLowerCase())
        .first();
      return !!user;
  };

  const changePassword = async (oldPw: string, newPw: string): Promise<boolean> => {
      return true;
  };

  if (loadingSession) {
      return null;
  }

  // Access Control Logic
  const canAccessAdmin = !!currentUser && ALLOWED_ADMIN_ROLES.includes(currentUser.role);

  return (
    <AuthContext.Provider value={{
        currentUser,
        users,
        login,
        logout,
        register,
        verifyEmail,
        checkAvailability,
        updateUserProfile,
        updateUserRole,
        deleteUser,
        requestPasswordReset,
        changePassword,
        isAuthenticated: !!currentUser,
        canAccessAdmin
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
