# NEWDAY Admin Section

## Overview
The Admin Section provides comprehensive system management capabilities for viewing all data in the NEWDAY Goods Tracking System.

## Access

### Login Credentials
- **URL**: Navigate to `/admin` from the landing page or go directly to `/admin/login`
- **Username**: `admin`
- **Password**: `admin123`

## Features

### 1. Admin Dashboard (`/admin/dashboard`)
- **Statistics Overview**: Real-time counts of:
  - Total Drivers registered
  - Total Officials registered
  - Total Parcels/Items registered
  - Total QR Codes generated (2 per parcel)
  - Total Reference Numbers generated (2 per parcel)
- **Quick Access Menu**: One-tap navigation to all admin sections

### 2. All Drivers (`/admin/drivers`)
- View complete list of all registered drivers
- Information displayed:
  - Full name
  - Phone number
  - Email address
  - Company name
  - Vehicle number
  - Registration date
- Color-coded with blue theme

### 3. All Officials (`/admin/officials`)
- View complete list of all registered officials
- Information displayed:
  - Full name
  - Phone number
  - Email address
  - Department
  - Staff ID
  - Registration date
- Color-coded with green theme

### 4. All Items/Goods (`/admin/items`)
- View all registered parcels and items
- Information displayed:
  - Item description
  - Reference number
  - Category
  - Quantity
  - Weight
  - Value (in ₦)
  - HS Code (if available)
  - Form M (if available)
  - Sender details (name, phone)
  - Receiver details (name, phone)
  - Registration date and time
  - Status
- Color-coded with orange theme

### 5. All Documents (`/admin/documents`)
- View all generated documents (2 per parcel)
- Features:
  - **Bill of Lading** for each parcel
  - **Road Manifest** for each parcel
  - **View** documents in modal viewer
  - **Download** documents as text files
  - Complete document preview with all encrypted data
- Color-coded with red theme

### 6. All QR Codes (`/admin/qrcodes`)
- View all generated QR codes (2 per parcel)
- Features:
  - **Bill of Lading QR Code** - visual display
  - **Road Manifest QR Code** - visual display
  - **Download** individual QR codes as PNG images
  - Each QR code is 200x200 pixels
  - QR codes contain encrypted document data
- Color-coded with purple theme

### 7. All Reference Numbers (`/admin/references`)
- View all reference numbers (2 per parcel)
- Features:
  - **Bill of Lading Reference Number**
  - **Road Manifest Reference Number**
  - **Copy to Clipboard** functionality
  - Reference numbers contain encrypted document data
  - Visual feedback when copied
- Color-coded with pink theme

## Design Features

### Android Compact Optimized
- Base font size: 14px
- Compact padding: 3 units (12px)
- Touch-friendly buttons: minimum 44px height
- Responsive card layouts
- Optimized for 360x640px screens

### Color Themes
- **Admin System**: Purple gradient (purple-50 to pink-100)
- **Drivers Section**: Blue accents
- **Officials Section**: Green accents
- **Items Section**: Orange accents
- **Documents Section**: Red accents
- **QR Codes Section**: Purple accents
- **References Section**: Pink accents

### Navigation
- Consistent back buttons on all pages
- Dashboard hub with quick access cards
- Dropdown menu for logout
- Session management via localStorage

## Technical Details

### Data Sources
All data is read from localStorage:
- `gts_users` - Contains all drivers and officials
- `gts_parcels` - Contains all registered items/parcels
- `gts_admin_session` - Admin authentication session

### Security
- Simple authentication (username/password)
- Session stored in localStorage
- All pages check for valid admin session
- Auto-redirect to login if session missing

### Document Generation
- Uses existing `generateBillOfLading()` and `generateRoadManifest()` functions
- Documents contain all encrypted data
- QR codes generated using `qrcode` library
- Reference numbers are encrypted strings containing full document data

## Usage Flow

1. **Landing Page** → Click "Admin Panel"
2. **Admin Splash** → Auto-redirect after 2 seconds
3. **Admin Login** → Enter credentials (admin/admin123)
4. **Admin Dashboard** → View statistics and navigate to sections
5. **Specific Sections** → View detailed information
6. **Logout** → Click user icon → Logout

## Statistics Calculation

- **Drivers**: Filtered from `gts_users` where `role === 'driver'`
- **Officials**: Filtered from `gts_users` where `role === 'official'`
- **Parcels**: Total count from `gts_parcels`
- **QR Codes**: Parcels × 2 (BOL + Manifest)
- **Reference Numbers**: Parcels × 2 (BOL + Manifest)

## Routes

```
/admin                     → Admin Splash Screen
/admin/login              → Admin Login
/admin/dashboard          → Main Dashboard
/admin/drivers            → All Drivers
/admin/officials          → All Officials
/admin/items              → All Items/Goods
/admin/documents          → All Documents
/admin/qrcodes            → All QR Codes
/admin/references         → All Reference Numbers
```

## Notes

- Admin section is read-only (no edit/delete capabilities)
- All timestamps shown in local timezone
- Empty states shown when no data available
- All monetary values displayed in Nigerian Naira (₦)
- HS Codes and Form M numbers displayed when available
- Documents and QR codes generated on-demand
