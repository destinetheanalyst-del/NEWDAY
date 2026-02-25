/**
 * Sync Service
 * Handles synchronization between localStorage and Supabase
 * Provides a unified interface that works both online and offline
 */

import { isSupabaseConfigured } from './supabase';
import {
  syncUserToSupabase,
  createParcelInSupabase,
  saveQRCodeToSupabase,
  saveDocumentToSupabase,
  getAllUsersFromSupabase,
  getUsersByRoleFromSupabase,
  getAllParcelsFromSupabase,
  getParcelByReferenceFromSupabase,
  updateParcelStatusInSupabase,
  getStatsFromSupabase,
  DbUser,
  DbParcel,
} from './supabase-db';
import { ParcelItem } from './supabase';
import { ParcelDocuments } from './documents';

// ============================================
// SYNC CONFIGURATION
// ============================================

interface SyncConfig {
  autoSync: boolean;
  syncInterval: number; // milliseconds
  onSyncComplete?: () => void;
  onSyncError?: (error: Error) => void;
}

const defaultConfig: SyncConfig = {
  autoSync: true,
  syncInterval: 30000, // 30 seconds
};

let syncConfig: SyncConfig = { ...defaultConfig };
let syncIntervalId: NodeJS.Timeout | null = null;

/**
 * Configure sync behavior
 */
export const configureSyncService = (config: Partial<SyncConfig>) => {
  syncConfig = { ...syncConfig, ...config };
  
  if (config.autoSync !== undefined) {
    if (config.autoSync && !syncIntervalId) {
      startAutoSync();
    } else if (!config.autoSync && syncIntervalId) {
      stopAutoSync();
    }
  }
};

/**
 * Start automatic synchronization
 */
export const startAutoSync = () => {
  if (syncIntervalId) return;
  
  syncIntervalId = setInterval(async () => {
    try {
      await syncAll();
      syncConfig.onSyncComplete?.();
    } catch (error) {
      console.error('Auto-sync error:', error);
      syncConfig.onSyncError?.(error as Error);
    }
  }, syncConfig.syncInterval);
  
  console.log('✓ Auto-sync started');
};

/**
 * Stop automatic synchronization
 */
export const stopAutoSync = () => {
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
    console.log('✓ Auto-sync stopped');
  }
};

// ============================================
// USER SYNC
// ============================================

/**
 * Sync user data to Supabase
 */
export const syncUser = async (userData: {
  id: string;
  phone: string;
  fullName: string;
  role: 'driver' | 'official';
  companyName?: string;
  vehicleNumber?: string;
  vinNumber?: string;
  vehicleDescription?: string;
  vehicleInsuranceNumber?: string;
  driverNIN?: string;
  driverPhoto?: string;
  licensePhoto?: string;
}): Promise<void> => {
  if (!isSupabaseConfigured) {
    console.log('Supabase not configured - data stored locally only');
    return;
  }

  try {
    await syncUserToSupabase(userData);
    
    // Also keep in localStorage for offline access
    const users = JSON.parse(localStorage.getItem('gts_users') || '[]');
    const existingIndex = users.findIndex((u: any) => u.id === userData.id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = userData;
    } else {
      users.push(userData);
    }
    
    localStorage.setItem('gts_users', JSON.stringify(users));
  } catch (error) {
    console.error('Error syncing user:', error);
    throw error;
  }
};

/**
 * Get all users (from Supabase or localStorage)
 */
export const getAllUsers = async (): Promise<any[]> => {
  if (isSupabaseConfigured) {
    try {
      const supabaseUsers = await getAllUsersFromSupabase();
      
      // Sync to localStorage for offline access
      if (supabaseUsers.length > 0) {
        const localUsers = supabaseUsers.map((u: DbUser) => ({
          id: u.id,
          phone: u.phone,
          fullName: u.full_name,
          role: u.role,
          companyName: u.company_name,
          vehicleNumber: u.vehicle_number,
          vinNumber: u.vin_number,
          vehicleDescription: u.vehicle_description,
          vehicleInsuranceNumber: u.vehicle_insurance_number,
          driverNIN: u.driver_nin,
          driverPhoto: u.driver_photo,
          licensePhoto: u.license_photo,
          createdAt: u.created_at,
        }));
        localStorage.setItem('gts_users', JSON.stringify(localUsers));
        return localUsers;
      }
    } catch (error) {
      console.error('Error fetching users from Supabase, falling back to localStorage:', error);
    }
  }
  
  // Fallback to localStorage
  return JSON.parse(localStorage.getItem('gts_users') || '[]');
};

/**
 * Get users by role (from Supabase or localStorage)
 */
export const getUsersByRole = async (role: 'driver' | 'official'): Promise<any[]> => {
  if (isSupabaseConfigured) {
    try {
      const supabaseUsers = await getUsersByRoleFromSupabase(role);
      
      if (supabaseUsers.length > 0) {
        return supabaseUsers.map((u: DbUser) => ({
          id: u.id,
          phone: u.phone,
          fullName: u.full_name,
          role: u.role,
          companyName: u.company_name,
          vehicleNumber: u.vehicle_number,
          vinNumber: u.vin_number,
          vehicleDescription: u.vehicle_description,
          vehicleInsuranceNumber: u.vehicle_insurance_number,
          driverNIN: u.driver_nin,
          driverPhoto: u.driver_photo,
          licensePhoto: u.license_photo,
          createdAt: u.created_at,
        }));
      }
    } catch (error) {
      console.error('Error fetching users by role from Supabase:', error);
    }
  }
  
  // Fallback to localStorage
  const allUsers = JSON.parse(localStorage.getItem('gts_users') || '[]');
  return allUsers.filter((u: any) => u.role === role);
};

// ============================================
// PARCEL SYNC
// ============================================

/**
 * Sync parcel to Supabase
 */
export const syncParcel = async (parcelData: {
  id: string;
  referenceNumber: string;
  driverId: string;
  sender: { name: string; address: string; contact: string };
  receiver: { name: string; contact: string; address: string };
  items: ParcelItem[];
  documents?: ParcelDocuments;
  status?: 'registered' | 'verified' | 'delivered';
  timestamp?: string;
}): Promise<void> => {
  if (!isSupabaseConfigured) {
    console.log('Supabase not configured - parcel stored locally only');
    return;
  }

  try {
    await createParcelInSupabase(parcelData);
    
    // Also keep in localStorage
    const parcels = JSON.parse(localStorage.getItem('gts_parcels') || '[]');
    const existingIndex = parcels.findIndex((p: any) => p.id === parcelData.id);
    
    const localParcel = {
      id: parcelData.id,
      referenceNumber: parcelData.referenceNumber,
      driverId: parcelData.driverId,
      sender: parcelData.sender,
      receiver: parcelData.receiver,
      items: parcelData.items,
      documents: parcelData.documents,
      status: parcelData.status || 'registered',
      timestamp: parcelData.timestamp || new Date().toISOString(),
    };
    
    if (existingIndex >= 0) {
      parcels[existingIndex] = localParcel;
    } else {
      parcels.push(localParcel);
    }
    
    localStorage.setItem('gts_parcels', JSON.stringify(parcels));
  } catch (error) {
    console.error('Error syncing parcel:', error);
    throw error;
  }
};

/**
 * Get all parcels (from Supabase or localStorage)
 */
export const getAllParcels = async (): Promise<any[]> => {
  if (isSupabaseConfigured) {
    try {
      const supabaseParcels = await getAllParcelsFromSupabase();
      
      if (supabaseParcels.length > 0) {
        const localParcels = supabaseParcels.map((p: DbParcel) => ({
          id: p.id,
          referenceNumber: p.reference_number,
          driverId: p.driver_id,
          sender: {
            name: p.sender_name,
            address: p.sender_address,
            contact: p.sender_contact,
          },
          receiver: {
            name: p.receiver_name,
            contact: p.receiver_contact,
            address: p.receiver_address,
          },
          items: p.items,
          documents: p.documents,
          status: p.status,
          timestamp: p.created_at,
        }));
        localStorage.setItem('gts_parcels', JSON.stringify(localParcels));
        return localParcels;
      }
    } catch (error) {
      console.error('Error fetching parcels from Supabase:', error);
    }
  }
  
  // Fallback to localStorage
  return JSON.parse(localStorage.getItem('gts_parcels') || '[]');
};

/**
 * Get parcel by reference number
 */
export const getParcelByReference = async (referenceNumber: string): Promise<any | null> => {
  if (isSupabaseConfigured) {
    try {
      const supabaseParcel = await getParcelByReferenceFromSupabase(referenceNumber);
      
      if (supabaseParcel) {
        return {
          id: supabaseParcel.id,
          referenceNumber: supabaseParcel.reference_number,
          driverId: supabaseParcel.driver_id,
          sender: {
            name: supabaseParcel.sender_name,
            address: supabaseParcel.sender_address,
            contact: supabaseParcel.sender_contact,
          },
          receiver: {
            name: supabaseParcel.receiver_name,
            contact: supabaseParcel.receiver_contact,
            address: supabaseParcel.receiver_address,
          },
          items: supabaseParcel.items,
          documents: supabaseParcel.documents,
          status: supabaseParcel.status,
          timestamp: supabaseParcel.created_at,
        };
      }
    } catch (error) {
      console.error('Error fetching parcel from Supabase:', error);
    }
  }
  
  // Fallback to localStorage
  const parcels = JSON.parse(localStorage.getItem('gts_parcels') || '[]');
  return parcels.find((p: any) => p.referenceNumber === referenceNumber) || null;
};

/**
 * Update parcel status
 */
export const updateParcelStatus = async (
  referenceNumber: string,
  status: 'registered' | 'verified' | 'delivered'
): Promise<void> => {
  // Update in localStorage
  const parcels = JSON.parse(localStorage.getItem('gts_parcels') || '[]');
  const parcelIndex = parcels.findIndex((p: any) => p.referenceNumber === referenceNumber);
  
  if (parcelIndex >= 0) {
    parcels[parcelIndex].status = status;
    localStorage.setItem('gts_parcels', JSON.stringify(parcels));
    
    // Sync to Supabase
    if (isSupabaseConfigured) {
      try {
        await updateParcelStatusInSupabase(parcels[parcelIndex].id, status);
      } catch (error) {
        console.error('Error syncing parcel status to Supabase:', error);
      }
    }
  }
};

// ============================================
// QR CODE SYNC
// ============================================

/**
 * Sync QR code to Supabase
 */
export const syncQRCode = async (qrData: {
  id: string;
  parcelId: string;
  referenceNumber: string;
  qrData: string;
}): Promise<void> => {
  if (!isSupabaseConfigured) {
    console.log('Supabase not configured - QR code stored locally only');
    return;
  }

  try {
    await saveQRCodeToSupabase(qrData);
  } catch (error) {
    console.error('Error syncing QR code:', error);
    // Don't throw - QR codes are also embedded in parcels
  }
};

// ============================================
// DOCUMENT SYNC
// ============================================

/**
 * Sync document to Supabase
 */
export const syncDocument = async (documentData: {
  id: string;
  parcelId: string;
  documentType: 'bill_of_lading' | 'road_manifest' | 'other';
  fileName: string;
  fileData: string;
  fileType: string;
}): Promise<void> => {
  if (!isSupabaseConfigured) {
    console.log('Supabase not configured - document stored locally only');
    return;
  }

  try {
    await saveDocumentToSupabase(documentData);
  } catch (error) {
    console.error('Error syncing document:', error);
    // Don't throw - documents are also embedded in parcels
  }
};

// ============================================
// STATISTICS
// ============================================

/**
 * Get statistics
 */
export const getStats = async (): Promise<{
  drivers: number;
  officials: number;
  parcels: number;
  documents: number;
  qrCodes: number;
}> => {
  if (isSupabaseConfigured) {
    try {
      const supabaseStats = await getStatsFromSupabase();
      if (supabaseStats) {
        return {
          drivers: supabaseStats.totalDrivers,
          officials: supabaseStats.totalOfficials,
          parcels: supabaseStats.totalParcels,
          documents: supabaseStats.totalDocuments,
          qrCodes: supabaseStats.totalQRCodes,
        };
      }
    } catch (error) {
      console.error('Error fetching stats from Supabase:', error);
    }
  }
  
  // Fallback to localStorage
  const users = JSON.parse(localStorage.getItem('gts_users') || '[]');
  const parcels = JSON.parse(localStorage.getItem('gts_parcels') || '[]');
  
  return {
    drivers: users.filter((u: any) => u.role === 'driver').length,
    officials: users.filter((u: any) => u.role === 'official').length,
    parcels: parcels.length,
    documents: 0, // Would need to count from parcels
    qrCodes: 0, // Would need to count from parcels
  };
};

// ============================================
// FULL SYNC
// ============================================

/**
 * Sync all data from localStorage to Supabase
 */
export const syncAll = async (): Promise<void> => {
  if (!isSupabaseConfigured) {
    console.log('Supabase not configured - skipping full sync');
    return;
  }

  try {
    console.log('Starting full sync...');
    
    // Sync users
    const users = JSON.parse(localStorage.getItem('gts_users') || '[]');
    for (const user of users) {
      await syncUserToSupabase(user);
    }
    
    // Sync parcels
    const parcels = JSON.parse(localStorage.getItem('gts_parcels') || '[]');
    for (const parcel of parcels) {
      await createParcelInSupabase({
        id: parcel.id,
        referenceNumber: parcel.referenceNumber,
        driverId: parcel.driverId,
        sender: parcel.sender,
        receiver: parcel.receiver,
        items: parcel.items,
        documents: parcel.documents,
        status: parcel.status,
      });
    }
    
    console.log('✓ Full sync completed');
  } catch (error) {
    console.error('Error during full sync:', error);
    throw error;
  }
};

/**
 * Pull all data from Supabase to localStorage
 */
export const pullFromSupabase = async (): Promise<void> => {
  if (!isSupabaseConfigured) {
    console.log('Supabase not configured - skipping pull');
    return;
  }

  try {
    console.log('Pulling data from Supabase...');
    
    // Pull users
    await getAllUsers();
    
    // Pull parcels
    await getAllParcels();
    
    console.log('✓ Data pulled from Supabase');
  } catch (error) {
    console.error('Error pulling from Supabase:', error);
    throw error;
  }
};
