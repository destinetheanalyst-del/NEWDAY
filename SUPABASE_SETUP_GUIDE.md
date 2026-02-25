# Supabase Integration Setup Guide
## Goods Tracking System (NEWDAY)

This guide will help you integrate your GTS mobile app with Supabase backend.

---

## 📋 Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. Your app is already using localStorage (which we'll sync with Supabase)
3. The app already has `@supabase/supabase-js` installed

---

## 🚀 Step 1: Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - **Project Name**: `gts-newday` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users (e.g., Nigeria - use closest available)
4. Click "Create new project"
5. Wait for the project to be ready (~2 minutes)

---

## 🗄️ Step 2: Set Up Database Schema

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy the entire contents of `/supabase-schema.sql` file
4. Paste it into the SQL Editor
5. Click **"Run"** to execute the script

This will create:
- ✅ `users` table - stores driver and official profiles
- ✅ `parcels` table - stores all parcel information
- ✅ `qr_codes` table - stores QR code data
- ✅ `documents` table - stores uploaded documents
- ✅ Indexes for fast queries
- ✅ Row Level Security (RLS) policies
- ✅ Triggers for auto-updating timestamps
- ✅ Helper functions and views

---

## 🔑 Step 3: Get Your Supabase Credentials

1. In your Supabase project dashboard, click **Settings** (gear icon) → **API**
2. Find these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (a long JWT token)
3. Keep these handy for the next step

---

## 🔧 Step 4: Configure Supabase in Figma Make

### Option A: Using Figma Make's Supabase Connect Tool

If you're in Figma Make environment, there should be a Supabase connection tool. Use it to connect with:
- Project URL: `your-project-url`
- Public Anon Key: `your-anon-key`

### Option B: Manual Configuration

If you need to configure manually:

1. Go to `/utils/supabase/info.ts` or create it if it doesn't exist
2. Add your credentials:

```typescript
export const projectId = 'your-project-id'; // from URL: https://your-project-id.supabase.co
export const publicAnonKey = 'your-anon-public-key';
```

---

## 📱 Step 5: Authentication Setup in Supabase

Since the app uses phone-based authentication but Supabase's phone auth requires paid SMS, we use email-based auth with phone-formatted emails.

### Disable Email Confirmation (for development)

1. Go to **Authentication** → **Providers** → **Email**
2. Scroll down to **Email Settings**
3. **Disable** "Confirm email"
4. Click **Save**

This allows instant signup without email confirmation.

### For Production (Recommended)

Enable phone authentication:
1. Go to **Authentication** → **Providers** → **Phone**
2. Enable phone authentication
3. Configure an SMS provider (Twilio, MessageBird, etc.)

---

## 🔄 Step 6: Update App Code to Use Supabase

The sync service is already created and ready! Here's how to use it:

### For Driver/Official Registration

Update your signup code to sync with Supabase:

```typescript
import { syncUser } from '@/lib/sync-service';
import { signUp } from '@/lib/auth';

// After successful signup
const result = await signUp({
  phone: formData.phone,
  password: formData.password,
  fullName: formData.fullName,
  role: 'driver',
  // ... other fields
});

// Sync to Supabase
await syncUser({
  id: result.user.id,
  phone: formData.phone,
  fullName: formData.fullName,
  role: 'driver',
  // ... other fields
});
```

### For Parcel Registration

Update your parcel creation code:

```typescript
import { syncParcel } from '@/lib/sync-service';

// After creating parcel locally
const parcelData = {
  id: parcelId,
  referenceNumber: referenceNumber,
  driverId: userId,
  sender: { ... },
  receiver: { ... },
  items: [ ... ],
  documents: { ... },
  status: 'registered',
};

// Save locally (existing code)
// ... your existing localStorage code ...

// Sync to Supabase
await syncParcel(parcelData);
```

### For Admin Dashboard

Update admin dashboard to fetch from Supabase:

```typescript
import { getAllUsers, getAllParcels, getStats } from '@/lib/sync-service';

// In your admin components
const loadData = async () => {
  const users = await getAllUsers(); // Gets from Supabase if available
  const parcels = await getAllParcels(); // Gets from Supabase if available
  const stats = await getStats(); // Gets from Supabase if available
  
  // Use the data...
};
```

---

## 🔄 Step 7: Enable Auto-Sync (Optional)

To automatically sync data in the background:

```typescript
import { configureSyncService, startAutoSync } from '@/lib/sync-service';

// In your App.tsx or main component
useEffect(() => {
  configureSyncService({
    autoSync: true,
    syncInterval: 30000, // 30 seconds
    onSyncComplete: () => {
      console.log('Sync completed successfully');
    },
    onSyncError: (error) => {
      console.error('Sync error:', error);
    },
  });
  
  startAutoSync();
  
  return () => {
    stopAutoSync();
  };
}, []);
```

---

## 📊 Step 8: Verify Everything is Working

### Test User Registration

1. Register a new driver or official in your app
2. Go to Supabase dashboard → **Table Editor** → **users**
3. You should see the new user appear!

### Test Parcel Creation

1. Create a new parcel in the driver app
2. Go to **Table Editor** → **parcels**
3. Verify the parcel data is there

### Test Real-time Updates

1. Open your admin dashboard
2. In another tab, open Supabase **Table Editor**
3. Manually update a parcel status in Supabase
4. Refresh your admin dashboard - the change should appear!

---

## 🔐 Step 9: Row Level Security (RLS)

The schema already includes basic RLS policies:

- ✅ Anyone can read users, parcels, QR codes, documents
- ✅ Users can insert/update their own data
- ✅ Admin can view all data

### To customize RLS policies:

1. Go to **Authentication** → **Policies**
2. Select a table (e.g., `parcels`)
3. Edit existing policies or create new ones
4. Example policy for "Officials can update any parcel":

```sql
CREATE POLICY "Officials can update parcels"
  ON parcels FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role = 'official'
    )
  );
```

---

## 💾 Step 10: Data Migration (Existing Users)

If you already have data in localStorage:

```typescript
import { syncAll } from '@/lib/sync-service';

// Run once to migrate all existing data
const migrateData = async () => {
  try {
    await syncAll();
    toast.success('All data migrated to Supabase!');
  } catch (error) {
    toast.error('Migration failed: ' + error.message);
  }
};
```

---

## 🎯 Key Features

### ✅ Offline-First Architecture
- App works without internet
- Data syncs when connection is available
- localStorage as primary cache

### ✅ Automatic Fallback
- If Supabase fails, uses localStorage
- No disruption to user experience
- Automatic retry on reconnection

### ✅ Real-time Sync
- Data updates across all devices
- Admin sees changes immediately
- QR codes work across multiple officials

---

## 📱 API Reference

### Sync Service Functions

```typescript
// User operations
await syncUser(userData);
const users = await getAllUsers();
const drivers = await getUsersByRole('driver');

// Parcel operations
await syncParcel(parcelData);
const parcels = await getAllParcels();
const parcel = await getParcelByReference('GTS-20260224-1001');
await updateParcelStatus('GTS-20260224-1001', 'verified');

// Statistics
const stats = await getStats();

// Sync operations
await syncAll(); // Push all localStorage data to Supabase
await pullFromSupabase(); // Pull all Supabase data to localStorage
```

### Direct Database Operations

```typescript
import {
  syncUserToSupabase,
  createParcelInSupabase,
  getParcelFromSupabase,
  getAllUsersFromSupabase,
  // ... other functions
} from '@/lib/supabase-db';

// Use these for more control over Supabase operations
```

---

## 🐛 Troubleshooting

### Issue: "Supabase not configured"
**Solution**: Make sure you've set up `/utils/supabase/info.ts` with correct credentials

### Issue: "Email confirmation required"
**Solution**: Disable email confirmation in Supabase dashboard (Step 5)

### Issue: "Row Level Security" errors
**Solution**: Check RLS policies in Supabase dashboard, ensure they allow your operations

### Issue: Data not syncing
**Solution**: 
1. Check browser console for errors
2. Verify Supabase project is active
3. Check API keys are correct
4. Ensure `isSupabaseConfigured` returns true

### Issue: "Invalid JWT" or "anon key" errors
**Solution**: 
1. Regenerate API keys in Supabase dashboard
2. Update `/utils/supabase/info.ts`
3. Clear browser cache and localStorage

---

## 🔒 Security Best Practices

1. **Never commit API keys** to public repositories
2. **Use environment variables** in production
3. **Review RLS policies** before going live
4. **Enable email confirmation** in production
5. **Use phone authentication** for production (requires SMS provider)
6. **Regularly backup** your Supabase database
7. **Monitor usage** in Supabase dashboard

---

## 📈 Production Checklist

- [ ] Supabase project created
- [ ] Database schema applied
- [ ] Email confirmation configured
- [ ] RLS policies reviewed and tested
- [ ] API keys secured (not in code)
- [ ] Auto-sync configured
- [ ] Data migration completed
- [ ] All features tested with Supabase
- [ ] Error handling tested (offline mode)
- [ ] Performance tested with real data
- [ ] Backup strategy in place

---

## 🆘 Support

- **Supabase Docs**: https://supabase.com/docs
- **GTS Issue**: Check browser console for detailed error messages
- **Database Issues**: Use Supabase SQL Editor to inspect data directly

---

## 📝 Notes

- The app will continue to work with localStorage even if Supabase is not configured
- All sync operations are non-blocking - failures won't crash the app
- Data is stored both locally and in Supabase for redundancy
- Currency is Nigerian Naira (₦) throughout the system
- App is optimized for Android Compact screens

---

**Ready to deploy!** 🚀

Your GTS app now has full Supabase backend integration while maintaining offline-first functionality.
