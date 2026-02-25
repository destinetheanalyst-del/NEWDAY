/**
 * Supabase Database Integration
 * This file contains all database operations for syncing with Supabase backend
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { ParcelItem } from './supabase';
import { ParcelDocuments } from './documents';

// ============================================
// DATABASE TYPES (matching Supabase schema)
// ============================================

export interface DbUser {
  id: string;
  phone: string;
  full_name: string;
  role: 'driver' | 'official';
  // Driver-specific fields
  company_name?: string;
  vehicle_number?: string;
  vin_number?: string;
  vehicle_description?: string;
  vehicle_insurance_number?: string;
  driver_nin?: string;
  driver_photo?: string;
  license_photo?: string;
  // Timestamps
  created_at: string;
  updated_at?: string;
}

export interface DbParcel {
  id: string;
  reference_number: string;
  driver_id: string;
  // Sender information
  sender_name: string;
  sender_address: string;
  sender_contact: string;
  // Receiver information
  receiver_name: string;
  receiver_contact: string;
  receiver_address: string;
  // Status
  status: 'registered' | 'verified' | 'delivered';
  // Items (stored as JSONB)
  items: ParcelItem[];
  // Documents (stored as JSONB)
  documents?: ParcelDocuments;
  // Timestamps
  created_at: string;
  updated_at?: string;
}

export interface DbQRCode {
  id: string;
  parcel_id: string;
  reference_number: string;
  qr_data: string; // JSON string containing encrypted document data
  created_at: string;
}

export interface DbDocument {
  id: string;
  parcel_id: string;
  document_type: 'bill_of_lading' | 'road_manifest' | 'other';
  file_name: string;
  file_data: string; // Base64 encoded document/image
  file_type: string; // MIME type
  created_at: string;
}

// ============================================
// USER OPERATIONS
// ============================================

/**
 * Create or update user profile in Supabase
 */
export const syncUserToSupabase = async (userData: {
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
}): Promise<DbUser | null> => {
  if (!isSupabaseConfigured) {
    console.log('Supabase not configured - skipping user sync');
    return null;
  }

  try {
    const dbUser: Omit<DbUser, 'created_at' | 'updated_at'> = {
      id: userData.id,
      phone: userData.phone,
      full_name: userData.fullName,
      role: userData.role,
      company_name: userData.companyName,
      vehicle_number: userData.vehicleNumber,
      vin_number: userData.vinNumber,
      vehicle_description: userData.vehicleDescription,
      vehicle_insurance_number: userData.vehicleInsuranceNumber,
      driver_nin: userData.driverNIN,
      driver_photo: userData.driverPhoto,
      license_photo: userData.licensePhoto,
    };

    const { data, error } = await supabase
      .from('users')
      .upsert(dbUser, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;

    console.log('✓ User synced to Supabase:', data.id);
    return data;
  } catch (error) {
    console.error('Error syncing user to Supabase:', error);
    return null;
  }
};

/**
 * Get user profile from Supabase
 */
export const getUserFromSupabase = async (userId: string): Promise<DbUser | null> => {
  if (!isSupabaseConfigured) {
    console.log('Supabase not configured - skipping user fetch');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error getting user from Supabase:', error);
    return null;
  }
};

/**
 * Get all users from Supabase (for admin)
 */
export const getAllUsersFromSupabase = async (): Promise<DbUser[]> => {
  if (!isSupabaseConfigured) {
    console.log('Supabase not configured - skipping users fetch');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting users from Supabase:', error);
    return [];
  }
};

/**
 * Get users by role from Supabase
 */
export const getUsersByRoleFromSupabase = async (role: 'driver' | 'official'): Promise<DbUser[]> => {
  if (!isSupabaseConfigured) {
    console.log('Supabase not configured - skipping users fetch');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting users by role from Supabase:', error);
    return [];
  }
};

// ============================================
// PARCEL OPERATIONS
// ============================================

/**
 * Create parcel in Supabase
 */
export const createParcelInSupabase = async (parcelData: {
  id: string;
  referenceNumber: string;
  driverId: string;
  sender: { name: string; address: string; contact: string };
  receiver: { name: string; contact: string; address: string };
  items: ParcelItem[];
  documents?: ParcelDocuments;
  status?: 'registered' | 'verified' | 'delivered';
}): Promise<DbParcel | null> => {
  if (!isSupabaseConfigured) {
    console.log('Supabase not configured - skipping parcel creation');
    return null;
  }

  try {
    const dbParcel: Omit<DbParcel, 'created_at' | 'updated_at'> = {
      id: parcelData.id,
      reference_number: parcelData.referenceNumber,
      driver_id: parcelData.driverId,
      sender_name: parcelData.sender.name,
      sender_address: parcelData.sender.address,
      sender_contact: parcelData.sender.contact,
      receiver_name: parcelData.receiver.name,
      receiver_contact: parcelData.receiver.contact,
      receiver_address: parcelData.receiver.address,
      status: parcelData.status || 'registered',
      items: parcelData.items,
      documents: parcelData.documents,
    };

    const { data, error } = await supabase
      .from('parcels')
      .insert(dbParcel)
      .select()
      .single();

    if (error) throw error;

    console.log('✓ Parcel created in Supabase:', data.id);
    return data;
  } catch (error) {
    console.error('Error creating parcel in Supabase:', error);
    return null;
  }
};

/**
 * Get parcel from Supabase by ID
 */
export const getParcelFromSupabase = async (parcelId: string): Promise<DbParcel | null> => {
  if (!isSupabaseConfigured) {
    console.log('Supabase not configured - skipping parcel fetch');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('parcels')
      .select('*')
      .eq('id', parcelId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error getting parcel from Supabase:', error);
    return null;
  }
};

/**
 * Get parcel from Supabase by reference number
 */
export const getParcelByReferenceFromSupabase = async (referenceNumber: string): Promise<DbParcel | null> => {
  if (!isSupabaseConfigured) {
    console.log('Supabase not configured - skipping parcel fetch');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('parcels')
      .select('*')
      .eq('reference_number', referenceNumber)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error getting parcel by reference from Supabase:', error);
    return null;
  }
};

/**
 * Get all parcels from Supabase
 */
export const getAllParcelsFromSupabase = async (): Promise<DbParcel[]> => {
  if (!isSupabaseConfigured) {
    console.log('Supabase not configured - skipping parcels fetch');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('parcels')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting parcels from Supabase:', error);
    return [];
  }
};

/**
 * Get parcels by driver from Supabase
 */
export const getParcelsByDriverFromSupabase = async (driverId: string): Promise<DbParcel[]> => {
  if (!isSupabaseConfigured) {
    console.log('Supabase not configured - skipping parcels fetch');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('parcels')
      .select('*')
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting parcels by driver from Supabase:', error);
    return [];
  }
};

/**
 * Update parcel status in Supabase
 */
export const updateParcelStatusInSupabase = async (
  parcelId: string,
  status: 'registered' | 'verified' | 'delivered'
): Promise<DbParcel | null> => {
  if (!isSupabaseConfigured) {
    console.log('Supabase not configured - skipping parcel update');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('parcels')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', parcelId)
      .select()
      .single();

    if (error) throw error;

    console.log('✓ Parcel status updated in Supabase:', data.id);
    return data;
  } catch (error) {
    console.error('Error updating parcel status in Supabase:', error);
    return null;
  }
};

// ============================================
// QR CODE OPERATIONS
// ============================================

/**
 * Save QR code data to Supabase
 */
export const saveQRCodeToSupabase = async (qrData: {
  id: string;
  parcelId: string;
  referenceNumber: string;
  qrData: string;
}): Promise<DbQRCode | null> => {
  if (!isSupabaseConfigured) {
    console.log('Supabase not configured - skipping QR code save');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .insert({
        id: qrData.id,
        parcel_id: qrData.parcelId,
        reference_number: qrData.referenceNumber,
        qr_data: qrData.qrData,
      })
      .select()
      .single();

    if (error) throw error;

    console.log('✓ QR code saved to Supabase:', data.id);
    return data;
  } catch (error) {
    console.error('Error saving QR code to Supabase:', error);
    return null;
  }
};

/**
 * Get QR code from Supabase
 */
export const getQRCodeFromSupabase = async (referenceNumber: string): Promise<DbQRCode | null> => {
  if (!isSupabaseConfigured) {
    console.log('Supabase not configured - skipping QR code fetch');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('reference_number', referenceNumber)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error getting QR code from Supabase:', error);
    return null;
  }
};

// ============================================
// DOCUMENT OPERATIONS
// ============================================

/**
 * Save document to Supabase
 */
export const saveDocumentToSupabase = async (documentData: {
  id: string;
  parcelId: string;
  documentType: 'bill_of_lading' | 'road_manifest' | 'other';
  fileName: string;
  fileData: string;
  fileType: string;
}): Promise<DbDocument | null> => {
  if (!isSupabaseConfigured) {
    console.log('Supabase not configured - skipping document save');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('documents')
      .insert({
        id: documentData.id,
        parcel_id: documentData.parcelId,
        document_type: documentData.documentType,
        file_name: documentData.fileName,
        file_data: documentData.fileData,
        file_type: documentData.fileType,
      })
      .select()
      .single();

    if (error) throw error;

    console.log('✓ Document saved to Supabase:', data.id);
    return data;
  } catch (error) {
    console.error('Error saving document to Supabase:', error);
    return null;
  }
};

/**
 * Get documents by parcel from Supabase
 */
export const getDocumentsByParcelFromSupabase = async (parcelId: string): Promise<DbDocument[]> => {
  if (!isSupabaseConfigured) {
    console.log('Supabase not configured - skipping documents fetch');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('parcel_id', parcelId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting documents from Supabase:', error);
    return [];
  }
};

// ============================================
// STATISTICS & ANALYTICS
// ============================================

/**
 * Get statistics from Supabase
 */
export const getStatsFromSupabase = async (): Promise<{
  totalDrivers: number;
  totalOfficials: number;
  totalParcels: number;
  totalDocuments: number;
  totalQRCodes: number;
} | null> => {
  if (!isSupabaseConfigured) {
    console.log('Supabase not configured - skipping stats fetch');
    return null;
  }

  try {
    // Get driver count
    const { count: driverCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'driver');

    // Get official count
    const { count: officialCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'official');

    // Get parcel count
    const { count: parcelCount } = await supabase
      .from('parcels')
      .select('*', { count: 'exact', head: true });

    // Get document count
    const { count: documentCount } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true });

    // Get QR code count
    const { count: qrCount } = await supabase
      .from('qr_codes')
      .select('*', { count: 'exact', head: true });

    return {
      totalDrivers: driverCount || 0,
      totalOfficials: officialCount || 0,
      totalParcels: parcelCount || 0,
      totalDocuments: documentCount || 0,
      totalQRCodes: qrCount || 0,
    };
  } catch (error) {
    console.error('Error getting stats from Supabase:', error);
    return null;
  }
};
