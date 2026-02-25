-- ============================================
-- Supabase Database Schema for GTS (NEWDAY)
-- Goods Tracking System
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('driver', 'official')),
  
  -- Driver-specific fields
  company_name TEXT,
  vehicle_number TEXT,
  vin_number TEXT,
  vehicle_description TEXT,
  vehicle_insurance_number TEXT,
  driver_nin TEXT,
  driver_photo TEXT, -- Base64 encoded image
  license_photo TEXT, -- Base64 encoded image
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on phone for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Users can read all user profiles
CREATE POLICY "Users can read all profiles"
  ON users FOR SELECT
  USING (true);

-- Users can insert their own profile (matches auth.uid())
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid()::text = id::text);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text);

-- ============================================
-- PARCELS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS parcels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number TEXT NOT NULL UNIQUE,
  driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Sender information
  sender_name TEXT NOT NULL,
  sender_address TEXT NOT NULL,
  sender_contact TEXT NOT NULL,
  
  -- Receiver information
  receiver_name TEXT NOT NULL,
  receiver_contact TEXT NOT NULL,
  receiver_address TEXT NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'verified', 'delivered')),
  
  -- Items stored as JSONB array
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Documents stored as JSONB
  documents JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_parcels_reference ON parcels(reference_number);
CREATE INDEX IF NOT EXISTS idx_parcels_driver ON parcels(driver_id);
CREATE INDEX IF NOT EXISTS idx_parcels_status ON parcels(status);
CREATE INDEX IF NOT EXISTS idx_parcels_created ON parcels(created_at DESC);

-- Enable RLS
ALTER TABLE parcels ENABLE ROW LEVEL SECURITY;

-- RLS Policies for parcels table
-- Anyone can read parcels
CREATE POLICY "Anyone can read parcels"
  ON parcels FOR SELECT
  USING (true);

-- Authenticated users can insert parcels
CREATE POLICY "Authenticated users can insert parcels"
  ON parcels FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own parcels
CREATE POLICY "Users can update own parcels"
  ON parcels FOR UPDATE
  USING (auth.uid()::text = driver_id::text);

-- ============================================
-- QR CODES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parcel_id UUID NOT NULL REFERENCES parcels(id) ON DELETE CASCADE,
  reference_number TEXT NOT NULL,
  qr_data TEXT NOT NULL, -- JSON string with encrypted document data
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_qr_codes_parcel ON qr_codes(parcel_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_reference ON qr_codes(reference_number);

-- Enable RLS
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for qr_codes table
-- Anyone can read QR codes
CREATE POLICY "Anyone can read qr_codes"
  ON qr_codes FOR SELECT
  USING (true);

-- Authenticated users can insert QR codes
CREATE POLICY "Authenticated users can insert qr_codes"
  ON qr_codes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parcel_id UUID NOT NULL REFERENCES parcels(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('bill_of_lading', 'road_manifest', 'other')),
  file_name TEXT NOT NULL,
  file_data TEXT NOT NULL, -- Base64 encoded file
  file_type TEXT NOT NULL, -- MIME type (e.g., 'image/jpeg', 'application/pdf')
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_documents_parcel ON documents(parcel_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for documents table
-- Anyone can read documents
CREATE POLICY "Anyone can read documents"
  ON documents FOR SELECT
  USING (true);

-- Authenticated users can insert documents
CREATE POLICY "Authenticated users can insert documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for parcels table
DROP TRIGGER IF EXISTS update_parcels_updated_at ON parcels;
CREATE TRIGGER update_parcels_updated_at
  BEFORE UPDATE ON parcels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- View for parcel statistics by driver
CREATE OR REPLACE VIEW parcel_stats_by_driver AS
SELECT 
  u.id as driver_id,
  u.full_name as driver_name,
  u.phone as driver_phone,
  COUNT(p.id) as total_parcels,
  COUNT(CASE WHEN p.status = 'registered' THEN 1 END) as registered_count,
  COUNT(CASE WHEN p.status = 'verified' THEN 1 END) as verified_count,
  COUNT(CASE WHEN p.status = 'delivered' THEN 1 END) as delivered_count
FROM users u
LEFT JOIN parcels p ON u.id = p.driver_id
WHERE u.role = 'driver'
GROUP BY u.id, u.full_name, u.phone;

-- View for recent parcels with driver info
CREATE OR REPLACE VIEW recent_parcels_with_driver AS
SELECT 
  p.*,
  u.full_name as driver_name,
  u.phone as driver_phone,
  u.vehicle_number
FROM parcels p
JOIN users u ON p.driver_id = u.id
ORDER BY p.created_at DESC;

-- ============================================
-- FUNCTIONS FOR COMMON QUERIES
-- ============================================

-- Function to search parcels by reference number
CREATE OR REPLACE FUNCTION search_parcel_by_reference(ref_num TEXT)
RETURNS TABLE (
  parcel_id UUID,
  reference_number TEXT,
  driver_name TEXT,
  sender_name TEXT,
  receiver_name TEXT,
  status TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.reference_number,
    u.full_name,
    p.sender_name,
    p.receiver_name,
    p.status,
    p.created_at
  FROM parcels p
  JOIN users u ON p.driver_id = u.id
  WHERE p.reference_number ILIKE '%' || ref_num || '%';
END;
$$ LANGUAGE plpgsql;

-- Function to get parcel with all related data
CREATE OR REPLACE FUNCTION get_parcel_complete(parcel_ref TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'parcel', row_to_json(p.*),
    'driver', row_to_json(u.*),
    'qr_codes', (
      SELECT json_agg(row_to_json(q.*))
      FROM qr_codes q
      WHERE q.parcel_id = p.id
    ),
    'documents', (
      SELECT json_agg(row_to_json(d.*))
      FROM documents d
      WHERE d.parcel_id = p.id
    )
  ) INTO result
  FROM parcels p
  JOIN users u ON p.driver_id = u.id
  WHERE p.reference_number = parcel_ref;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE DATA (for testing - OPTIONAL)
-- ============================================

-- Uncomment to insert sample data
/*
-- Insert sample driver
INSERT INTO users (id, phone, full_name, role, company_name, vehicle_number)
VALUES (
  uuid_generate_v4(),
  '08012345678',
  'John Doe',
  'driver',
  'Swift Logistics',
  'ABC-123-XY'
) ON CONFLICT DO NOTHING;

-- Insert sample official
INSERT INTO users (id, phone, full_name, role)
VALUES (
  uuid_generate_v4(),
  '08098765432',
  'Jane Smith',
  'official'
) ON CONFLICT DO NOTHING;
*/

-- ============================================
-- NOTES
-- ============================================
-- 1. Make sure to run this script in your Supabase SQL Editor
-- 2. The auth.users table is automatically managed by Supabase Auth
-- 3. The users.id should match auth.uid() for authenticated users
-- 4. All tables have RLS enabled for security
-- 5. Adjust RLS policies based on your security requirements
-- 6. For file storage (images/PDFs), consider using Supabase Storage instead of base64 in production
