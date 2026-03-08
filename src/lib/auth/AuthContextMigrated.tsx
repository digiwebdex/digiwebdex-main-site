import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api/client';

interface User {
  id: string;
  email: string;
  full_name?: string;
  [key: string]: unknown;
}

interface Session {
  user: User;
  access_token: string;
}

type AppRole = 'admin' | 'staff' | 'client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: AppRole[];
  isAdmin: boolean;
  isStaff: boolean;
  isClient: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshRoles: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);

  const fetchRoles = async (userId: string): Promise<AppRole[]> => {
    try {
      const { data, error } = await api.from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching roles:', error);
        return [];
      }

      return ((data || []) as Array<{ role: string }>).map(r => r.role as AppRole);
    } catch (err) {
      console.error('Error in fetchRoles:', err);
      return [];
    }
  };

  const refreshRoles = async () => {
    if (user) {
      const userRoles = await fetchRoles(user.id);
      setRoles(userRoles);
    }
  };

  useEffect(() => {
    // Check for existing session
    const initAuth = async () => {
      const { data } = await api.auth.getSession();
      
      if (data?.session) {
        const sessionData = data.session as Session;
        setSession(sessionData);
        setUser(sessionData.user);
        
        const userRoles = await fetchRoles(sessionData.user.id);
        setRoles(userRoles);
      }
      
      setLoading(false);
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = api.auth.onAuthStateChange(
      async (event: string, sessionData: unknown) => {
        if (event === 'SIGNED_IN' && sessionData) {
          const sess = sessionData as Session;
          setSession(sess);
          setUser(sess.user);
          
          const userRoles = await fetchRoles(sess.user.id);
          setRoles(userRoles);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setRoles([]);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe?.();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await api.auth.signUp(email, password, fullName);
      return { error: error as Error | null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await api.auth.signIn(email, password);
      if (error) {
        return { error: new Error(error.message) };
      }
      
      if (data) {
        const userData = data as { user: User; token: string };
        setUser(userData.user);
        setSession({ user: userData.user, access_token: userData.token });
        
        const userRoles = await fetchRoles(userData.user.id);
        setRoles(userRoles);
      }
      
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await api.auth.signOut();
    setUser(null);
    setSession(null);
    setRoles([]);
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await api.auth.resetPasswordForEmail(email);
      return { error: error ? new Error(error.message) : null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await api.auth.updateUser({ password: newPassword });
      return { error: error ? new Error(error.message) : null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const isAdmin = roles.includes('admin');
  const isStaff = roles.includes('staff');
  const isClient = roles.includes('client') || roles.length === 0;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        roles,
        isAdmin,
        isStaff,
        isClient,
        signUp,
        signIn,
        signOut,
        refreshRoles,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
