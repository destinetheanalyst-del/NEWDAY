/**
 * Client-side authentication fallback
 * Used when Supabase email confirmation is required but not accessible
 */

interface ClientUser {
  id: string;
  phone: string;
  password: string; // Hashed
  fullName: string;
  role: 'driver' | 'official';
  vehicleNumber?: string;
  companyName?: string;
  vehicleDescription?: string;
  vehicleInsuranceNumber?: string;
  driverNIN?: string;
  mNumber?: string;
  nxpNumber?: string;
  driverPhoto?: string;
  licensePhoto?: string;
  createdAt: string;
}

interface ClientSession {
  userId: string;
  token: string;
  expiresAt: number;
}

const USERS_KEY = 'gts_client_users';
const SESSION_KEY = 'gts_client_session';

/**
 * Simple hash function for passwords
 * Note: This is NOT cryptographically secure, only for demo purposes
 */
const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

/**
 * Generate a simple session token
 */
const generateToken = (): string => {
  return 'gts_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
};

/**
 * Get all users from localStorage
 */
const getAllUsers = (): ClientUser[] => {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
};

/**
 * Save users to localStorage
 */
const saveUsers = (users: ClientUser[]): void => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users:', error);
  }
};

/**
 * Get current session
 */
export const getClientSession = (): ClientSession | null => {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;
    
    const session: ClientSession = JSON.parse(data);
    
    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error reading session:', error);
    return null;
  }
};

/**
 * Save session to localStorage
 */
const saveSession = (session: ClientSession): void => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Error saving session:', error);
  }
};

/**
 * Client-side signup
 */
export const clientSignUp = (data: {
  phone: string;
  password: string;
  fullName: string;
  role: 'driver' | 'official';
  vehicleNumber?: string;
  companyName?: string;
  vehicleDescription?: string;
  vehicleInsuranceNumber?: string;
  driverNIN?: string;
  mNumber?: string;
  nxpNumber?: string;
  driverPhoto?: string;
  licensePhoto?: string;
}): { success: boolean; userId: string } => {
  const users = getAllUsers();
  
  // Check if phone already exists
  const existingUser = users.find(u => u.phone === data.phone);
  if (existingUser) {
    throw new Error('An account with this phone number already exists. Please login instead.');
  }
  
  // Create new user
  const newUser: ClientUser = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2),
    phone: data.phone,
    password: hashPassword(data.password),
    fullName: data.fullName,
    role: data.role,
    vehicleNumber: data.vehicleNumber,
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
  
  users.push(newUser);
  saveUsers(users);
  
  // Create session automatically
  const session: ClientSession = {
    userId: newUser.id,
    token: generateToken(),
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
  };
  saveSession(session);
  
  console.log('✓ Client-side user registered and logged in');
  return { success: true, userId: newUser.id };
};

/**
 * Client-side signin
 */
export const clientSignIn = (data: {
  phone: string;
  password: string;
}): { success: boolean; userId: string; user: ClientUser } => {
  const users = getAllUsers();
  
  // Find user by phone
  const user = users.find(u => u.phone === data.phone);
  if (!user) {
    throw new Error('Invalid phone number or password');
  }
  
  // Verify password
  const hashedPassword = hashPassword(data.password);
  if (user.password !== hashedPassword) {
    throw new Error('Invalid phone number or password');
  }
  
  // Create session
  const session: ClientSession = {
    userId: user.id,
    token: generateToken(),
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
  };
  saveSession(session);
  
  console.log('✓ Client-side user logged in');
  return { success: true, userId: user.id, user };
};

/**
 * Get user by ID
 */
export const getClientUser = (userId: string): ClientUser | null => {
  const users = getAllUsers();
  return users.find(u => u.id === userId) || null;
};

/**
 * Get current user from session
 */
export const getCurrentClientUser = (): ClientUser | null => {
  const session = getClientSession();
  if (!session) return null;
  
  return getClientUser(session.userId);
};

/**
 * Client-side signout
 */
export const clientSignOut = (): void => {
  localStorage.removeItem(SESSION_KEY);
  console.log('✓ Client-side user logged out');
};

/**
 * Check if client auth is enabled (fallback mode)
 */
export const isClientAuthMode = (): boolean => {
  // Check if we have a marker indicating client-only mode
  return localStorage.getItem('gts_use_client_auth') === 'true';
};

/**
 * Enable client auth mode
 */
export const enableClientAuthMode = (): void => {
  localStorage.setItem('gts_use_client_auth', 'true');
  console.log('✓ Client-only authentication mode enabled');
};
