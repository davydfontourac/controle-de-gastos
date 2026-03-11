import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';

export interface ProfileData {
  full_name: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: ProfileData | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setProfile: (data: ProfileData | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', userId)
        .maybeSingle(); // Usar maybeSingle para evitar erro caso não exista
      
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.warn('Erro ao buscar perfil:', error);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Failsafe: Força o fim do loading após 5 segundos, independente de qualquer erro
    const timeout = setTimeout(() => {
      if (isMounted && isLoading) {
        console.warn('Auth initialization timed out, forcing loading to false');
        setIsLoading(false);
      }
    }, 5000);

    const fetchSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!isMounted) return;

        setSession(currentSession);
        setUser(currentSession?.user || null);
        
        if (currentSession?.user) {
          fetchProfile(currentSession.user.id);
        }
      } catch (error) {
        console.error('Erro ao buscar sessão:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          clearTimeout(timeout);
        }
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        if (!isMounted) return;

        const previousUser = user;
        setSession(currentSession);
        setUser(currentSession?.user || null);

        if (currentSession?.user && (!previousUser || previousUser.id !== currentSession.user.id)) {
          fetchProfile(currentSession.user.id);
        } else if (!currentSession) {
          setProfile(null);
        }
        
        setIsLoading(false);
        clearTimeout(timeout);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const contextValue = useMemo(
    () => ({ user, session, profile, isLoading, signOut, refreshProfile, setProfile }),
    [user, session, profile, isLoading, signOut, refreshProfile, setProfile]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook customizado para usar o contexto mais facilmente
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
