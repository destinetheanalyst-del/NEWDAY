import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, getSession, getUserProfile, signIn } from '@/lib/auth';
import { isClientAuthMode, getClientSession, getCurrentClientUser } from '@/lib/client-auth';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  role: 'driver' | 'official';
  vehicle_number?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (phone: string, password: string, role: 'driver' | 'official') => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async (userId: string, user?: User) => {
    // Get profile from user metadata (primary and only source)
    if (user?.user_metadata) {
      const metadata = user.user_metadata;
      const metadataProfile: UserProfile = {
        id: user.id,
        user_id: user.id,
        full_name: metadata.full_name || metadata.name || 'Unknown User',
        phone: metadata.phone || '',
        role: metadata.role || 'driver',
        vehicle_number: metadata.vehicle_number || undefined,
      };
      setProfile(metadataProfile);
      console.log('✓ Profile loaded successfully');
    } else {
      console.warn('No user metadata available');
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id, user);
    }
  };

  const handleLogin = async (phone: string, password: string, role: 'driver' | 'official') => {
    try {
      console.log('=== LOGIN ATTEMPT ===');
      const authData = await signIn({ phone, password });
      console.log('✓ Auth data received');
      
      if (authData.user && authData.session) {
        console.log('✓ User authenticated:', authData.user.id);
        setUser(authData.user);
        setSession(authData.session);
        
        // Create profile from user metadata
        const actualProfile = {
          id: authData.user.id,
          user_id: authData.user.id,
          full_name: authData.user.user_metadata?.full_name || 'Unknown User',
          phone: authData.user.user_metadata?.phone || phone,
          role: (authData.user.user_metadata?.role || 'driver') as 'driver' | 'official',
          vehicle_number: authData.user.user_metadata?.vehicle_number || undefined,
        };
        
        // Verify role matches
        if (actualProfile.role !== role) {
          console.error(`Role mismatch: expected ${role}, got ${actualProfile.role}`);
          await supabase.auth.signOut();
          throw new Error(`This account is registered as a ${actualProfile.role}, not a ${role}`);
        }
        
        // Set profile from metadata
        setProfile(actualProfile);
        console.log('✓ Login complete - profile set from metadata');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Check active session
    const initAuth = async () => {
      try {
        console.log('=== INITIALIZING AUTH ===');
        
        // Check if we're in client auth mode first
        if (isClientAuthMode()) {
          console.log('Client auth mode detected');
          const clientSession = getClientSession();
          if (clientSession) {
            const clientUser = getCurrentClientUser();
            if (clientUser) {
              console.log('Client user found:', clientUser.id);
              // Create a mock user object
              const mockUser: any = {
                id: clientUser.id,
                user_metadata: {
                  full_name: clientUser.fullName,
                  phone: clientUser.phone,
                  role: clientUser.role,
                  vehicle_number: clientUser.vehicleNumber,
                },
              };
              setUser(mockUser);
              setSession({ user: mockUser } as any);
              
              const profile: UserProfile = {
                id: clientUser.id,
                user_id: clientUser.id,
                full_name: clientUser.fullName,
                phone: clientUser.phone,
                role: clientUser.role,
                vehicle_number: clientUser.vehicleNumber,
              };
              setProfile(profile);
              setLoading(false);
              console.log('=== AUTH INITIALIZED (CLIENT MODE) ===');
              return;
            }
          }
          console.log('No client session found');
          setLoading(false);
          return;
        }
        
        // Get session directly from Supabase to ensure freshness
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
        }
        
        console.log('Initial session:', currentSession ? 'Found' : 'None');
        
        setSession(currentSession);

        if (currentSession?.user) {
          console.log('User found in session:', currentSession.user.id);
          setUser(currentSession.user);
          await loadUserProfile(currentSession.user.id, currentSession.user);
        } else {
          console.log('No user in session');
        }
        
        console.log('=== AUTH INITIALIZED ===');
      } catch (error) {
        console.error('Init auth error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes (only for Supabase)
    if (!isClientAuthMode()) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        console.log('=== AUTH STATE CHANGE ===');
        console.log('Event:', event);
        console.log('Current session:', currentSession);
        console.log('Session user:', currentSession?.user);
        console.log('========================');
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await loadUserProfile(currentSession.user.id, currentSession.user);
        } else {
          setProfile(null);
        }

        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const handleSignOut = async () => {
    try {
      console.log('=== SIGN OUT ===');
      
      // Check if we're in client auth mode
      if (isClientAuthMode()) {
        console.log('Signing out (client mode)');
        const { clientSignOut } = await import('@/lib/client-auth');
        clientSignOut();
      } else {
        console.log('Signing out (Supabase mode)');
        await supabase.auth.signOut();
      }
      
      // Clear state
      setUser(null);
      setSession(null);
      setProfile(null);
      
      console.log('✓ Sign out complete');
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if there's an error, clear the state
      setUser(null);
      setSession(null);
      setProfile(null);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        login: handleLogin,
        signOut: handleSignOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // During development hot reloads, the context might temporarily be unavailable
    if (import.meta.env.DEV) {
      console.warn('useAuth: AuthProvider not found in component tree. This can happen during hot module reloading.');
    }
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}