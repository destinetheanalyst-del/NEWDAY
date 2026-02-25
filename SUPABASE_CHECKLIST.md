# Supabase Integration Checklist

Use this checklist to track your Supabase integration progress.

---

## 📋 Phase 1: Initial Setup (15 minutes)

### Step 1: Create Supabase Project
- [ ] Go to [supabase.com](https://supabase.com) and sign up/login
- [ ] Click "New Project"
- [ ] Enter project details:
  - [ ] Project name: `gts-newday` (or your choice)
  - [ ] Database password: _____________ (save this!)
  - [ ] Region: _____________ (closest to Nigeria)
- [ ] Wait for project to be created (~2 minutes)
- [ ] Project is ready ✅

### Step 2: Run Database Schema
- [ ] In Supabase dashboard, go to "SQL Editor" (left sidebar)
- [ ] Click "New Query"
- [ ] Open `/supabase-schema.sql` from your project
- [ ] Copy ALL contents (entire file)
- [ ] Paste into SQL Editor
- [ ] Click "Run" button
- [ ] Verify: No errors shown ✅
- [ ] Go to "Table Editor" and confirm these tables exist:
  - [ ] `users`
  - [ ] `parcels`
  - [ ] `qr_codes`
  - [ ] `documents`

### Step 3: Get API Credentials
- [ ] In Supabase dashboard, click Settings (gear icon)
- [ ] Click "API" in sidebar
- [ ] Copy these values:
  - [ ] Project URL: `https://____________.supabase.co`
  - [ ] anon public key: `eyJ_______________...`
- [ ] Save these credentials somewhere safe

### Step 4: Configure App
- [ ] If using Figma Make Supabase connect tool:
  - [ ] Run the tool
  - [ ] Enter Project URL
  - [ ] Enter anon public key
  - [ ] Verify connection
- [ ] OR manually:
  - [ ] Open/create `/utils/supabase/info.ts`
  - [ ] Add credentials:
    ```typescript
    export const projectId = 'your-project-id';
    export const publicAnonKey = 'your-anon-key';
    ```

### Step 5: Configure Authentication
- [ ] In Supabase dashboard, go to Authentication → Providers
- [ ] Click on "Email" provider
- [ ] Scroll down to "Email Settings"
- [ ] **DISABLE** "Confirm email" (for development)
- [ ] Click "Save"
- [ ] For production (optional, requires SMS provider):
  - [ ] Enable "Phone" provider
  - [ ] Configure SMS provider (Twilio, etc.)

---

## 🧪 Phase 2: Testing (10 minutes)

### Test 1: Verify Supabase Connection
- [ ] Open browser console (F12)
- [ ] In console, type:
  ```javascript
  import { isSupabaseConfigured } from '/src/lib/supabase';
  console.log('Configured:', isSupabaseConfigured);
  ```
- [ ] Should show: `Configured: true` ✅

### Test 2: Test User Registration
- [ ] Open your app
- [ ] Go to Driver registration
- [ ] Fill in all fields with test data:
  - [ ] Full name: Test Driver
  - [ ] Phone: 08012345678
  - [ ] Password: test123
  - [ ] Other fields...
- [ ] Click Register
- [ ] Should see success message ✅
- [ ] Go to Supabase dashboard → Table Editor → `users`
- [ ] Should see the new user ✅

### Test 3: Test Parcel Creation
- [ ] Login as the test driver
- [ ] Create a new parcel
- [ ] Fill in all details
- [ ] Submit parcel
- [ ] Should see success message ✅
- [ ] Go to Supabase dashboard → Table Editor → `parcels`
- [ ] Should see the new parcel ✅
- [ ] Click on the parcel to view details
- [ ] Verify all data is correct ✅

### Test 4: Test Admin Dashboard
- [ ] Navigate to `/admin` (tap title 7 times if hidden)
- [ ] Login with: admin / SecureAdmin@2026
- [ ] Should see admin dashboard ✅
- [ ] Verify statistics show correct numbers ✅
- [ ] Check Supabase Status widget shows "Connected" ✅

### Test 5: Test Offline Mode
- [ ] Open DevTools (F12) → Network tab
- [ ] Select "Offline" from dropdown
- [ ] Try creating a parcel
- [ ] Should work offline ✅
- [ ] Check localStorage has the data ✅
- [ ] Go back "Online"
- [ ] Wait 30 seconds OR click "Push Local" in admin
- [ ] Check Supabase → should see the parcel ✅

---

## 🎨 Phase 3: UI Integration (Optional, 20 minutes)

### Add Supabase Status Widget
- [ ] Open `/src/app/components/admin/AdminDashboard.tsx`
- [ ] Import component:
  ```typescript
  import { SupabaseStatus } from './SupabaseStatus';
  ```
- [ ] Add to dashboard (at top):
  ```typescript
  <SupabaseStatus />
  ```
- [ ] Save and refresh
- [ ] Should see status widget in admin dashboard ✅

### Update Data Loading (Examples in INTEGRATION_EXAMPLES.md)
- [ ] Update AdminDashboard.tsx to use `getStats()`
- [ ] Update AdminDrivers.tsx to use `getUsersByRole('driver')`
- [ ] Update AdminOfficials.tsx to use `getUsersByRole('official')`
- [ ] Update AdminItems.tsx to use `getAllParcels()`
- [ ] Test each page loads correctly ✅

---

## 🔄 Phase 4: Auto-Sync Setup (Optional, 5 minutes)

### Enable Auto-Sync
- [ ] Open `/src/app/App.tsx`
- [ ] Import sync functions:
  ```typescript
  import { 
    configureSyncService, 
    startAutoSync, 
    stopAutoSync 
  } from '@/lib/sync-service';
  ```
- [ ] Add useEffect:
  ```typescript
  useEffect(() => {
    configureSyncService({
      autoSync: true,
      syncInterval: 30000, // 30 seconds
      onSyncComplete: () => {
        console.log('Background sync completed');
      },
      onSyncError: (error) => {
        console.error('Background sync failed:', error);
      },
    });
    
    startAutoSync();
    
    return () => {
      stopAutoSync();
    };
  }, []);
  ```
- [ ] Save and test
- [ ] Check console every 30 seconds for sync messages ✅

---

## 📊 Phase 5: Data Migration (If you have existing data)

### Migrate Existing LocalStorage Data
- [ ] Open browser console in your app
- [ ] Run migration:
  ```javascript
  import { syncAll } from '/src/lib/sync-service';
  syncAll().then(() => console.log('Migration complete!'));
  ```
- [ ] Wait for completion
- [ ] Go to Supabase dashboard
- [ ] Check all tables for migrated data:
  - [ ] Users migrated ✅
  - [ ] Parcels migrated ✅
  - [ ] All data intact ✅

---

## 🔒 Phase 6: Security Review (Production)

### Review Row Level Security
- [ ] Go to Supabase → Authentication → Policies
- [ ] Review policies for `users` table:
  - [ ] SELECT policy exists (public read)
  - [ ] INSERT policy exists (own profile)
  - [ ] UPDATE policy exists (own profile)
- [ ] Review policies for `parcels` table:
  - [ ] SELECT policy exists (public read for tracking)
  - [ ] INSERT policy exists (authenticated users)
  - [ ] UPDATE policy exists (own parcels)
- [ ] Review policies for `qr_codes` and `documents`
- [ ] Customize if needed for your security requirements

### Secure API Keys
- [ ] Verify anon key is used (not service_role key)
- [ ] For production:
  - [ ] Move credentials to environment variables
  - [ ] Never commit credentials to git
  - [ ] Use .env file for local development

---

## 🚀 Phase 7: Production Deployment

### Pre-Deployment Checklist
- [ ] All tests passing ✅
- [ ] Supabase configured and working ✅
- [ ] Auto-sync enabled ✅
- [ ] RLS policies reviewed ✅
- [ ] API keys secured ✅
- [ ] Email confirmation configured (for production)
- [ ] OR Phone auth configured (recommended)
- [ ] Backup strategy in place
- [ ] Monitoring set up

### Enable Production Auth
- [ ] Option A: Email confirmation
  - [ ] Supabase → Authentication → Providers → Email
  - [ ] Enable "Confirm email"
  - [ ] Configure email templates
  - [ ] Test email flow
- [ ] Option B: Phone auth (recommended)
  - [ ] Enable Phone provider
  - [ ] Configure SMS provider (Twilio, MessageBird, etc.)
  - [ ] Add billing info for SMS
  - [ ] Test phone verification

### Set Up Monitoring
- [ ] Supabase dashboard → Database → Settings
- [ ] Enable connection pooling if needed
- [ ] Set up alerts for:
  - [ ] High database usage
  - [ ] Failed queries
  - [ ] Auth failures

### Backup Strategy
- [ ] Go to Supabase → Database → Backups
- [ ] Verify automatic backups are enabled ✅
- [ ] Set backup frequency (daily recommended)
- [ ] Test backup restoration procedure

---

## ✅ Final Verification

### Functionality Tests
- [ ] Driver registration works (online & offline)
- [ ] Driver login works
- [ ] Parcel creation works (online & offline)
- [ ] QR code generation works
- [ ] Official scanning works
- [ ] Parcel verification works
- [ ] Admin dashboard shows all data
- [ ] Manual sync works (Push & Pull)
- [ ] Auto-sync works in background
- [ ] Offline mode works completely
- [ ] Online sync works when reconnected

### Data Integrity
- [ ] All users visible in Supabase
- [ ] All parcels visible in Supabase
- [ ] QR codes stored correctly
- [ ] Documents stored correctly
- [ ] No data loss during sync
- [ ] Conflicts resolved properly

### Performance
- [ ] App loads quickly
- [ ] Sync doesn't freeze UI
- [ ] Offline mode is instant
- [ ] Database queries are fast (<100ms)
- [ ] No console errors

### Security
- [ ] RLS policies active on all tables
- [ ] Users can't access other users' data (test this!)
- [ ] Anon key used (not service role)
- [ ] Auth works correctly
- [ ] No credentials exposed in code

---

## 📝 Documentation

### Team Documentation
- [ ] Share SUPABASE_SETUP_GUIDE.md with team
- [ ] Share admin credentials securely
- [ ] Document any custom RLS policies
- [ ] Create troubleshooting guide for common issues

### User Documentation
- [ ] Update user manual with new features
- [ ] Document offline capabilities
- [ ] Explain sync behavior to users

---

## 🎉 Completion

### All Done!
- [ ] Supabase integrated ✅
- [ ] All tests passing ✅
- [ ] Production ready ✅
- [ ] Team trained ✅
- [ ] Documentation complete ✅

**Congratulations! Your GTS app now has enterprise-grade cloud infrastructure!** 🚀

---

## 📞 Support Contacts

If you need help:
- **Supabase Docs**: https://supabase.com/docs
- **Supabase Community**: https://github.com/supabase/supabase/discussions
- **GTS Documentation**: See all SUPABASE_*.md files in project root

---

## 🔄 Maintenance Schedule

### Daily
- [ ] Check Supabase dashboard for errors
- [ ] Monitor sync success rate

### Weekly
- [ ] Review database size and performance
- [ ] Check for failed syncs
- [ ] Review auth logs

### Monthly
- [ ] Review and optimize RLS policies
- [ ] Update dependencies if needed
- [ ] Test backup restoration
- [ ] Review usage and costs

---

*Last updated: February 24, 2026*
*GTS (NEWDAY) - Goods Tracking System*
