import { supabase, isSupabaseConfigured } from './supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import {
  clientSignUp,
  clientSignIn,
  clientSignOut,
  getCurrentClientUser,
  getClientSession,
  enableClientAuthMode,
  isClientAuthMode,
} from './client-auth';

export interface SignUpData {
  phone: string;
  password: string;
  fullName: string;
  role: 'driver' | 'official';
  vehicleNumber?: string;
  vinNumber?: string;
  companyName?: string;
  vehicleDescription?: string;
  vehicleInsuranceNumber?: string;
  driverNIN?: string;
  mNumber?: string;
  nxpNumber?: string;
  driverPhoto?: string;
  licensePhoto?: string;
}

export interface LoginData {
  phone: string;
  password: string;
}

/**
 * Convert phone number to email format for Supabase auth
 * Since phone auth is disabled, we use email auth with phone-based emails
 */
const phoneToEmail = (phone: string): string => {
  // Remove any non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  // Convert to valid email format with a proper domain
  return `user${cleanPhone}@gtsapp.com`;
};

/**
 * Sign up a new user with phone and password
 * Automatically falls back to client-side auth if Supabase email confirmation is required
 */
export const signUp = async (data: SignUpData) => {
  // If already in client auth mode, use client-side auth
  if (isClientAuthMode()) {
    console.log('Using client-side authentication (fallback mode)');
    const result = clientSignUp(data);
    const user = getCurrentClientUser();
    
    // Store extended profile data for client-side access
    if (user) {
      const extendedProfile = {
        userId: result.userId,
        phone: data.phone,
        fullName: data.fullName,
        role: data.role,
        vehicleNumber: data.vehicleNumber,
        vinNumber: data.vinNumber,
        companyName: data.companyName,
        vehicleDescription: data.vehicleDescription,
        vehicleInsuranceNumber: data.vehicleInsuranceNumber,
        driverNIN: data.driverNIN,
        mNumber: data.mNumber,
        nxpNumber: data.nxpNumber,
        driverPhoto: data.driverPhoto,
        licensePhoto: data.licensePhoto,
        createdAt: new Date().toISOString(),
      };
      
      // Store in localStorage with phone as key
      const cleanPhone = data.phone.replace(/\D/g, '');
      localStorage.setItem(`driver_profile_${cleanPhone}`, JSON.stringify(extendedProfile));
      
      // Also store by user ID for easy lookup
      localStorage.setItem(`driver_profile_id_${result.userId}`, JSON.stringify(extendedProfile));
      console.log('✓ Driver profile saved with key: driver_profile_id_' + result.userId);
    }
    
    return { success: true, user: { id: result.userId, user_metadata: data } };
  }

  if (!isSupabaseConfigured) {
    console.log('Supabase not configured, enabling client-side auth fallback');
    enableClientAuthMode();
    const result = clientSignUp(data);
    const user = getCurrentClientUser();
    
    // Store extended profile data for client-side access
    if (user) {
      const extendedProfile = {
        userId: result.userId,
        phone: data.phone,
        fullName: data.fullName,
        role: data.role,
        vehicleNumber: data.vehicleNumber,
        vinNumber: data.vinNumber,
        companyName: data.companyName,
        vehicleDescription: data.vehicleDescription,
        vehicleInsuranceNumber: data.vehicleInsuranceNumber,
        driverNIN: data.driverNIN,
        mNumber: data.mNumber,
        nxpNumber: data.nxpNumber,
        driverPhoto: data.driverPhoto,
        licensePhoto: data.licensePhoto,
        createdAt: new Date().toISOString(),
      };
      
      // Store in localStorage with phone as key
      const cleanPhone = data.phone.replace(/\D/g, '');
      localStorage.setItem(`driver_profile_${cleanPhone}`, JSON.stringify(extendedProfile));
      
      // Also store by user ID for easy lookup
      localStorage.setItem(`driver_profile_id_${result.userId}`, JSON.stringify(extendedProfile));
      console.log('✓ Driver profile saved with key: driver_profile_id_' + result.userId);
    }
    
    return { success: true, user: { id: result.userId, user_metadata: data } };
  }
  
  try {
    const email = phoneToEmail(data.phone);
    
    // Try Supabase Auth first
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          phone: data.phone,
          role: data.role,
          vehicle_number: data.vehicleNumber,
        },
        emailRedirectTo: undefined,
      },
    });

    if (signUpError) {
      // If email confirmation is required, fall back to client-side auth
      if (signUpError.message?.includes('email') || signUpError.message?.includes('confirm')) {
        console.warn('Supabase requires email confirmation, switching to client-side auth');
        enableClientAuthMode();
        const result = clientSignUp(data);
        const user = getCurrentClientUser();
        
        // Store extended profile data for client-side access
        if (user) {
          const extendedProfile = {
            userId: result.userId,
            phone: data.phone,
            fullName: data.fullName,
            role: data.role,
            vehicleNumber: data.vehicleNumber,
            vinNumber: data.vinNumber,
            companyName: data.companyName,
            vehicleDescription: data.vehicleDescription,
            vehicleInsuranceNumber: data.vehicleInsuranceNumber,
            driverNIN: data.driverNIN,
            mNumber: data.mNumber,
            nxpNumber: data.nxpNumber,
            driverPhoto: data.driverPhoto,
            licensePhoto: data.licensePhoto,
            createdAt: new Date().toISOString(),
          };
          
          // Store in localStorage with phone as key
          const cleanPhone = data.phone.replace(/\D/g, '');
          localStorage.setItem(`driver_profile_${cleanPhone}`, JSON.stringify(extendedProfile));
          
          // Also store by user ID for easy lookup
          localStorage.setItem(`driver_profile_id_${result.userId}`, JSON.stringify(extendedProfile));
          console.log('✓ Driver profile saved with key: driver_profile_id_' + result.userId);
        }
        
        return { success: true, user: { id: result.userId, user_metadata: data } };
      }
      
      // Check if user already exists
      if (signUpError.message?.includes('already registered') || signUpError.message?.includes('already been registered')) {
        throw new Error('An account with this phone number already exists. Please login instead.');
      }
      throw signUpError;
    }

    if (!authData.user) {
      throw new Error('Failed to create user account');
    }

    // If user is created but no session (email confirmation required), fall back
    if (authData.user && !authData.session) {
      console.log('User created but email confirmation required, attempting fallback...');
      try {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password: data.password,
        });
        
        if (loginError?.message?.includes('Email not confirmed')) {
          console.warn('Email confirmation required, switching to client-side auth');
          enableClientAuthMode();
          const result = clientSignUp(data);
          const user = getCurrentClientUser();
          
          // Store extended profile data for client-side access
          if (user) {
            const extendedProfile = {
              userId: result.userId,
              phone: data.phone,
              fullName: data.fullName,
              role: data.role,
              vehicleNumber: data.vehicleNumber,
              vinNumber: data.vinNumber,
              companyName: data.companyName,
              vehicleDescription: data.vehicleDescription,
              vehicleInsuranceNumber: data.vehicleInsuranceNumber,
              driverNIN: data.driverNIN,
              mNumber: data.mNumber,
              nxpNumber: data.nxpNumber,
              driverPhoto: data.driverPhoto,
              licensePhoto: data.licensePhoto,
              createdAt: new Date().toISOString(),
            };
            
            // Store in localStorage with phone as key
            const cleanPhone = data.phone.replace(/\D/g, '');
            localStorage.setItem(`driver_profile_${cleanPhone}`, JSON.stringify(extendedProfile));
            
            // Also store by user ID for easy lookup
            localStorage.setItem(`driver_profile_id_${result.userId}`, JSON.stringify(extendedProfile));
            console.log('✓ Driver profile saved with key: driver_profile_id_' + result.userId);
          }
          
          return { success: true, user: { id: result.userId, user_metadata: data } };
        }
        
        if (!loginError && loginData.session) {
          console.log('✓ Auto-login successful after signup');
          authData.session = loginData.session;
        }
      } catch (autoLoginError) {
        console.warn('Auto-login failed, falling back to client-side auth');
        enableClientAuthMode();
        const result = clientSignUp(data);
        const user = getCurrentClientUser();
        
        // Store extended profile data for client-side access
        if (user) {
          const extendedProfile = {
            userId: result.userId,
            phone: data.phone,
            fullName: data.fullName,
            role: data.role,
            vehicleNumber: data.vehicleNumber,
            vinNumber: data.vinNumber,
            companyName: data.companyName,
            vehicleDescription: data.vehicleDescription,
            vehicleInsuranceNumber: data.vehicleInsuranceNumber,
            driverNIN: data.driverNIN,
            mNumber: data.mNumber,
            nxpNumber: data.nxpNumber,
            driverPhoto: data.driverPhoto,
            licensePhoto: data.licensePhoto,
            createdAt: new Date().toISOString(),
          };
          
          // Store in localStorage with phone as key
          const cleanPhone = data.phone.replace(/\D/g, '');
          localStorage.setItem(`driver_profile_${cleanPhone}`, JSON.stringify(extendedProfile));
          
          // Also store by user ID for easy lookup
          localStorage.setItem(`driver_profile_id_${result.userId}`, JSON.stringify(extendedProfile));
          console.log('✓ Driver profile saved with key: driver_profile_id_' + result.userId);
        }
        
        return { success: true, user: { id: result.userId, user_metadata: data } };
      }
    }

    // Store extended profile data in localStorage for client-side access
    const extendedProfile = {
      userId: authData.user.id,
      phone: data.phone,
      fullName: data.fullName,
      role: data.role,
      vehicleNumber: data.vehicleNumber,
      vinNumber: data.vinNumber,
      companyName: data.companyName,
      vehicleDescription: data.vehicleDescription,
      vehicleInsuranceNumber: data.vehicleInsuranceNumber,
      driverNIN: data.driverNIN,
      mNumber: data.mNumber,
      nxpNumber: data.nxpNumber,
      driverPhoto: data.driverPhoto,
      licensePhoto: data.licensePhoto,
      createdAt: new Date().toISOString(),
    };
    
    // Store in localStorage with phone as key
    const cleanPhone = data.phone.replace(/\D/g, '');
    localStorage.setItem(`driver_profile_${cleanPhone}`, JSON.stringify(extendedProfile));
    
    // Also store by user ID for easy lookup
    localStorage.setItem(`driver_profile_id_${authData.user.id}`, JSON.stringify(extendedProfile));

    console.log('✓ User registered successfully with client-side profile storage');
    return { success: true, user: authData.user };
  } catch (error: any) {
    console.error('Sign up error:', error);
    throw error;
  }
};

/**
 * Sign in with phone and password
 * Automatically falls back to client-side auth if needed
 */
export const signIn = async (data: LoginData) => {
  // If in client auth mode, use client-side auth
  if (isClientAuthMode()) {
    console.log('Using client-side authentication (fallback mode)');
    const result = clientSignIn(data);
    return {
      user: {
        id: result.userId,
        user_metadata: {
          full_name: result.user.fullName,
          phone: result.user.phone,
          role: result.user.role,
          vehicle_number: result.user.vehicleNumber,
        },
      },
      session: { user: { id: result.userId } },
    };
  }

  if (!isSupabaseConfigured) {
    console.log('Supabase not configured, using client-side auth');
    enableClientAuthMode();
    const result = clientSignIn(data);
    return {
      user: {
        id: result.userId,
        user_metadata: {
          full_name: result.user.fullName,
          phone: result.user.phone,
          role: result.user.role,
          vehicle_number: result.user.vehicleNumber,
        },
      },
      session: { user: { id: result.userId } },
    };
  }
  
  try {
    const email = phoneToEmail(data.phone);
    
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password: data.password,
    });

    if (error) {
      // Handle email not confirmed error - fall back to client auth
      if (error.message.includes('Email not confirmed') || error.message.includes('email')) {
        console.warn('Email confirmation issue detected, switching to client-side auth');
        enableClientAuthMode();
        const result = clientSignIn(data);
        return {
          user: {
            id: result.userId,
            user_metadata: {
              full_name: result.user.fullName,
              phone: result.user.phone,
              role: result.user.role,
              vehicle_number: result.user.vehicleNumber,
            },
          },
          session: { user: { id: result.userId } },
        };
      }
      throw error;
    }
    
    return authData;
  } catch (error: any) {
    // If it's an auth error, try client-side auth as fallback
    if (error?.message?.includes('Invalid') || error?.message?.includes('not found')) {
      try {
        console.log('Supabase auth failed, trying client-side auth...');
        const result = clientSignIn(data);
        return {
          user: {
            id: result.userId,
            user_metadata: {
              full_name: result.user.fullName,
              phone: result.user.phone,
              role: result.user.role,
              vehicle_number: result.user.vehicleNumber,
            },
          },
          session: { user: { id: result.userId } },
        };
      } catch (clientError) {
        // If client auth also fails, throw the original error
        console.error('Sign in error:', error);
        throw error;
      }
    }
    console.error('Sign in error:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  try {
    // Sign out from client auth if enabled
    if (isClientAuthMode()) {
      clientSignOut();
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Sign out error:', error);
    // Always try client signout as well
    clientSignOut();
    throw error;
  }
};

/**
 * Get the current user session
 */
export const getSession = async () => {
  // Check client auth first
  if (isClientAuthMode()) {
    const clientSession = getClientSession();
    if (clientSession) {
      const user = getCurrentClientUser();
      if (user) {
        return {
          user: {
            id: user.id,
            user_metadata: {
              full_name: user.fullName,
              phone: user.phone,
              role: user.role,
              vehicle_number: user.vehicleNumber,
            },
          },
        };
      }
    }
    return null;
  }

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error('Get session error:', error);
    // Try client auth as fallback
    const clientSession = getClientSession();
    if (clientSession) {
      const user = getCurrentClientUser();
      if (user) {
        return {
          user: {
            id: user.id,
            user_metadata: {
              full_name: user.fullName,
              phone: user.phone,
              role: user.role,
              vehicle_number: user.vehicleNumber,
            },
          },
        };
      }
    }
    return null;
  }
};

/**
 * Get the current user
 */
export const getCurrentUser = async () => {
  // Check client auth first
  if (isClientAuthMode()) {
    const user = getCurrentClientUser();
    if (user) {
      return {
        id: user.id,
        user_metadata: {
          full_name: user.fullName,
          phone: user.phone,
          role: user.role,
          vehicle_number: user.vehicleNumber,
        },
      };
    }
    return null;
  }

  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('Get user error:', error);
    // Try client auth as fallback
    const user = getCurrentClientUser();
    if (user) {
      return {
        id: user.id,
        user_metadata: {
          full_name: user.fullName,
          phone: user.phone,
          role: user.role,
          vehicle_number: user.vehicleNumber,
        },
      };
    }
    return null;
  }
};

/**
 * Get user profile from user metadata
 * Since we're using metadata instead of database tables, this returns the profile from the current user
 */
export const getUserProfile = async (userId?: string) => {
  if (!isSupabaseConfigured) {
    console.warn('Supabase is not configured - skipping profile fetch');
    return null;
  }
  
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.warn('Session error when getting profile:', sessionError.message);
      return null;
    }
    
    if (!session || !session.user) {
      console.warn('No session or user found when getting profile');
      return null;
    }

    // Return profile directly from user metadata
    const user = session.user;
    const metadata = user.user_metadata;
    
    if (!metadata) {
      console.warn('No user metadata found');
      return null;
    }

    const profile = {
      id: user.id,
      user_id: user.id,
      full_name: metadata.full_name || metadata.name || 'Unknown User',
      phone: metadata.phone || '',
      role: (metadata.role || 'driver') as 'driver' | 'official',
      vehicle_number: metadata.vehicle_number || undefined,
    };

    console.log('✓ Profile retrieved from user metadata');
    return profile;
  } catch (error: any) {
    console.warn('Get user profile error:', error.message);
    return null;
  }
};

/**
 * Get extended driver profile from localStorage
 */
export const getExtendedDriverProfile = (phone: string) => {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    const profileData = localStorage.getItem(`driver_profile_${cleanPhone}`);
    
    if (!profileData) {
      return null;
    }
    
    return JSON.parse(profileData);
  } catch (error) {
    console.error('Error getting extended driver profile:', error);
    return null;
  }
};

/**
 * Verify OTP
 */
export const verifyOTP = async (phone: string, token: string) => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Verify OTP error:', error);
    throw error;
  }
};

/**
 * Resend OTP
 */
export const resendOTP = async (phone: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Resend OTP error:', error);
    throw error;
  }
};