# Driver Information Enhancement

## Overview
Enhanced the Bill of Lading and Road Manifest documents to include comprehensive driver information including photos, NIN, and insurance details.

## Changes Made

### 1. Document Interfaces Updated (`/src/lib/documents.ts`)

#### Bill of Lading - Carrier Section
Added fields:
- `driverName?: string` - Driver's full name
- `driverNIN?: string` - Driver's National Identification Number
- `insuranceNumber?: string` - Vehicle Insurance Number

#### Road Manifest - Driver Section
Added fields:
- `name?: string` - Driver's full name
- `driverNIN?: string` - Driver's National Identification Number
- `insuranceNumber?: string` - Vehicle Insurance Number
- `driverPhoto?: string` - Base64 encoded driver photo
- `licensePhoto?: string` - Base64 encoded driver's license photo

### 2. Document Generation Functions Updated

#### `generateBillOfLading()`
Now accepts `driverInfo` object instead of just `driverVehicleNumber`:
```typescript
driverInfo?: {
  name?: string;
  vehicleNumber?: string;
  driverNIN?: string;
  insuranceNumber?: string;
}
```

#### `generateRoadManifest()`
Now accepts comprehensive `driverInfo` object:
```typescript
driverInfo?: {
  name?: string;
  vehicleNumber?: string;
  driverNIN?: string;
  insuranceNumber?: string;
  driverPhoto?: string;
  licensePhoto?: string;
}
```

### 3. Parcel Creation Process (`/src/lib/parcels.ts`)

Enhanced driver information retrieval:
- Retrieves driver data from localStorage using `driver_profile_{driverId}` key
- Falls back to user metadata if profile not found
- Extracts all driver information:
  - Full name
  - Vehicle number
  - Driver NIN
  - Vehicle insurance number
  - Driver photo (base64)
  - License photo (base64)

### 4. Bill of Lading View Component (`/src/app/components/documents/BillOfLadingView.tsx`)

#### Carrier Information Section Now Displays:
- ✅ Driver Name (if available)
- ✅ Driver ID
- ✅ Driver NIN (if available)
- ✅ Vehicle Number (if available)
- ✅ Vehicle Insurance Number (if available)

### 5. Road Manifest View Component (`/src/app/components/documents/RoadManifestView.tsx`)

#### Enhanced Driver & Vehicle Section:

**Driver Photos (Top Section)**
- Driver Photo - Displayed in bordered card (w-full h-48 object-cover)
- Driver's License Photo - Displayed in bordered card (w-full h-48 object-cover)
- Photos are shown side-by-side in a 2-column grid

**Driver Information**
- ✅ Driver Name
- ✅ Driver ID
- ✅ Driver NIN
- ✅ Vehicle Number
- ✅ Vehicle Insurance Number

## Data Flow

### Registration Flow (Driver App)
1. Driver signs up with all information:
   - Personal info (name, phone, NIN)
   - Vehicle info (number, insurance number)
   - Photos (driver photo, license photo)
2. Data stored in:
   - Supabase auth user_metadata
   - Client-side localStorage (`gts_client_users`)

### Parcel Creation
1. When driver creates parcel:
   - System retrieves driver info from localStorage/metadata
   - Driver info passed to document generation functions
   - Bill of Lading and Road Manifest are generated with full driver details
2. Documents stored with parcel data in localStorage

### Document Viewing
1. Official scans QR code or enters reference number
2. Parcel with embedded documents retrieved
3. Documents display:
   - **Bill of Lading**: Driver name, NIN, insurance number in Carrier section
   - **Road Manifest**: Driver photos + driver name, NIN, insurance number

## Technical Details

### Photo Storage
- Photos are stored as **base64 encoded strings**
- Maximum size: **5MB per photo**
- Stored in:
  - User metadata (Supabase auth)
  - Client-side localStorage
  - Embedded in parcel documents

### Display Format
- **Driver Photo**: 
  - Size: w-full h-48
  - Object-fit: cover
  - Border: 2px gray-200
  - Rounded corners
  
- **License Photo**: 
  - Same styling as driver photo
  - Displayed side-by-side with driver photo

### Data Validation
- Driver NIN: Displayed with `font-mono` for readability
- Insurance Number: Displayed with `font-mono font-semibold`
- All fields are optional (displayed only if available)

## Benefits

### For Officials
✅ **Instant Driver Verification** - View driver photo immediately  
✅ **License Validation** - Check license photo during inspections  
✅ **Identity Confirmation** - Verify driver NIN  
✅ **Insurance Verification** - Confirm vehicle insurance number  
✅ **Complete Audit Trail** - All driver details in one document  

### For Compliance
✅ **Regulatory Requirements** - Meet documentation standards  
✅ **Legal Protection** - Complete driver information recorded  
✅ **Accountability** - Clear driver identification  
✅ **Dispute Resolution** - Full driver details available  

## Testing Checklist

### Driver Registration
- [ ] Upload driver photo (< 5MB)
- [ ] Upload license photo (< 5MB)
- [ ] Enter Driver NIN
- [ ] Enter Vehicle Insurance Number
- [ ] Verify all data is saved

### Parcel Creation
- [ ] Create new parcel
- [ ] Verify documents are generated
- [ ] Check Bill of Lading shows driver NIN & insurance
- [ ] Check Road Manifest shows photos, NIN & insurance

### Document Viewing
- [ ] View Bill of Lading
  - [ ] Driver name displayed
  - [ ] Driver NIN displayed
  - [ ] Insurance number displayed
- [ ] View Road Manifest
  - [ ] Driver photo displayed correctly
  - [ ] License photo displayed correctly
  - [ ] Driver name displayed
  - [ ] Driver NIN displayed
  - [ ] Insurance number displayed

## Files Modified

1. `/src/lib/documents.ts` - Document interfaces and generation functions
2. `/src/lib/parcels.ts` - Driver information retrieval and parcel creation
3. `/src/app/components/documents/BillOfLadingView.tsx` - Display driver info
4. `/src/app/components/documents/RoadManifestView.tsx` - Display photos and driver info

## Notes

- Driver signup form already collected all necessary information
- No changes needed to driver registration process
- Photos are stored as base64 to avoid external file hosting
- All fields are optional for backward compatibility
- Existing parcels without driver info will still display correctly
