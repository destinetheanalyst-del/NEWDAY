# Supabase Integration Examples
## How to Update Existing Components

This guide shows practical examples of updating your existing GTS components to use Supabase sync.

---

## 📝 Example 1: Update Driver Registration

### Before (localStorage only):

```typescript
// src/app/components/driver/DriverSignUp.tsx
const handleNext = async (e: React.FormEvent) => {
  e.preventDefault();
  
  setLoading(true);
  try {
    const result = await signUp({
      phone: formData.phone,
      password: formData.password,
      fullName: formData.fullName,
      role: 'driver',
      // ... other fields
    });
    
    toast.success('Registration successful!');
    navigate('/driver/otp');
  } catch (error) {
    toast.error(error.message);
    setLoading(false);
  }
};
```

### After (with Supabase sync):

```typescript
// src/app/components/driver/DriverSignUp.tsx
import { syncUser } from '@/lib/sync-service';

const handleNext = async (e: React.FormEvent) => {
  e.preventDefault();
  
  setLoading(true);
  try {
    const result = await signUp({
      phone: formData.phone,
      password: formData.password,
      fullName: formData.fullName,
      role: 'driver',
      vehicleNumber: formData.vehicleNumber,
      vinNumber: formData.vinNumber,
      companyName: formData.companyName,
      vehicleDescription: formData.vehicleDescription,
      vehicleInsuranceNumber: formData.vehicleInsuranceNumber,
      driverNIN: formData.driverNIN,
      driverPhoto,
      licensePhoto,
    });
    
    // Sync to Supabase (non-blocking)
    syncUser({
      id: result.user.id,
      phone: formData.phone,
      fullName: formData.fullName,
      role: 'driver',
      vehicleNumber: formData.vehicleNumber,
      vinNumber: formData.vinNumber,
      companyName: formData.companyName,
      vehicleDescription: formData.vehicleDescription,
      vehicleInsuranceNumber: formData.vehicleInsuranceNumber,
      driverNIN: formData.driverNIN,
      driverPhoto,
      licensePhoto,
    }).catch(err => console.error('Sync error:', err));
    // Note: We catch errors here so sync failures don't block user flow
    
    toast.success('Registration successful!');
    navigate('/driver/otp');
  } catch (error) {
    toast.error(error.message);
    setLoading(false);
  }
};
```

---

## 📦 Example 2: Update Parcel Creation

### Before (localStorage only):

```typescript
// src/lib/parcels.ts
export const createParcel = async (parcelData) => {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }
  
  const parcelId = generateUUID();
  const referenceNumber = generateReferenceNumber();
  const documents = await generateParcelDocuments(parcelData, referenceNumber);
  
  const newParcel = {
    id: parcelId,
    referenceNumber,
    ...parcelData,
    documents,
    status: 'registered',
    timestamp: new Date().toISOString(),
  };
  
  const parcels = getAllParcelsFromStorage();
  parcels.push(newParcel);
  saveParcelsToStorage(parcels);
  
  return { success: true, parcel: newParcel };
};
```

### After (with Supabase sync):

```typescript
// src/lib/parcels.ts
import { syncParcel } from './sync-service';

export const createParcel = async (parcelData) => {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }
  
  const parcelId = generateUUID();
  const referenceNumber = generateReferenceNumber();
  const documents = await generateParcelDocuments(parcelData, referenceNumber);
  
  const newParcel = {
    id: parcelId,
    referenceNumber,
    ...parcelData,
    documents,
    status: 'registered',
    timestamp: new Date().toISOString(),
  };
  
  // Save to localStorage (existing code)
  const parcels = getAllParcelsFromStorage();
  parcels.push(newParcel);
  saveParcelsToStorage(parcels);
  
  // Sync to Supabase (non-blocking)
  syncParcel(newParcel).catch(err => console.error('Sync error:', err));
  
  return { success: true, parcel: newParcel };
};
```

---

## 🔍 Example 3: Update Admin Dashboard

### Before (localStorage only):

```typescript
// src/app/components/admin/AdminDashboard.tsx
const loadStats = () => {
  try {
    const users = JSON.parse(localStorage.getItem('gts_users') || '[]');
    const drivers = users.filter((u: any) => u.role === 'driver').length;
    const officials = users.filter((u: any) => u.role === 'official').length;
    
    const parcels = JSON.parse(localStorage.getItem('gts_parcels') || '[]');
    const parcelCount = parcels.length;
    
    setStats({
      drivers,
      officials,
      parcels: parcelCount,
      documents: 0,
      qrCodes: 0,
    });
  } catch (error) {
    console.error('Error loading stats:', error);
  }
};
```

### After (with Supabase sync):

```typescript
// src/app/components/admin/AdminDashboard.tsx
import { getStats } from '@/lib/sync-service';

const loadStats = async () => {
  try {
    setLoading(true);
    const stats = await getStats(); // Gets from Supabase if available, falls back to localStorage
    
    setStats({
      drivers: stats.drivers,
      officials: stats.officials,
      parcels: stats.parcels,
      documents: stats.documents,
      qrCodes: stats.qrCodes,
    });
  } catch (error) {
    console.error('Error loading stats:', error);
    toast.error('Failed to load statistics');
  } finally {
    setLoading(false);
  }
};

// Change from regular function to async
useEffect(() => {
  loadStats();
}, []);
```

---

## 👥 Example 4: Update Admin Drivers List

### Before (localStorage only):

```typescript
// src/app/components/admin/AdminDrivers.tsx
const loadDrivers = () => {
  try {
    const users = JSON.parse(localStorage.getItem('gts_users') || '[]');
    const driverList = users.filter((u: any) => u.role === 'driver');
    setDrivers(driverList);
  } catch (error) {
    console.error('Error loading drivers:', error);
  }
};
```

### After (with Supabase sync):

```typescript
// src/app/components/admin/AdminDrivers.tsx
import { getUsersByRole } from '@/lib/sync-service';

const loadDrivers = async () => {
  try {
    setLoading(true);
    const driverList = await getUsersByRole('driver');
    setDrivers(driverList);
  } catch (error) {
    console.error('Error loading drivers:', error);
    toast.error('Failed to load drivers');
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadDrivers();
}, []);
```

---

## 📋 Example 5: Update Admin Items/Parcels List

### Before (localStorage only):

```typescript
// src/app/components/admin/AdminItems.tsx
const loadParcels = () => {
  try {
    const parcelList = JSON.parse(localStorage.getItem('gts_parcels') || '[]');
    setParcels(parcelList);
  } catch (error) {
    console.error('Error loading parcels:', error);
  }
};
```

### After (with Supabase sync):

```typescript
// src/app/components/admin/AdminItems.tsx
import { getAllParcels } from '@/lib/sync-service';

const loadParcels = async () => {
  try {
    setLoading(true);
    const parcelList = await getAllParcels();
    setParcels(parcelList);
  } catch (error) {
    console.error('Error loading parcels:', error);
    toast.error('Failed to load parcels');
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadParcels();
}, []);
```

---

## 🔄 Example 6: Update Parcel Status (Officials)

### Before (localStorage only):

```typescript
// src/app/components/official/TrackingResult.tsx
const handleVerify = () => {
  try {
    const parcels = JSON.parse(localStorage.getItem('gts_parcels') || '[]');
    const parcelIndex = parcels.findIndex((p: any) => p.referenceNumber === parcelData.referenceNumber);
    
    if (parcelIndex >= 0) {
      parcels[parcelIndex].status = 'verified';
      localStorage.setItem('gts_parcels', JSON.stringify(parcels));
      toast.success('Parcel verified successfully!');
    }
  } catch (error) {
    toast.error('Failed to verify parcel');
  }
};
```

### After (with Supabase sync):

```typescript
// src/app/components/official/TrackingResult.tsx
import { updateParcelStatus } from '@/lib/sync-service';

const handleVerify = async () => {
  try {
    setLoading(true);
    
    // Update both localStorage and Supabase
    await updateParcelStatus(parcelData.referenceNumber, 'verified');
    
    toast.success('Parcel verified successfully!');
    
    // Refresh the parcel data
    // ... your existing refresh logic
  } catch (error) {
    console.error('Error verifying parcel:', error);
    toast.error('Failed to verify parcel');
  } finally {
    setLoading(false);
  }
};
```

---

## 🔄 Example 7: Enable Auto-Sync in App Root

Add this to your main App.tsx or root component:

```typescript
// src/app/App.tsx
import { useEffect } from 'react';
import { configureSyncService, startAutoSync, stopAutoSync } from '@/lib/sync-service';
import { toast } from 'sonner';

function App() {
  // Auto-sync setup
  useEffect(() => {
    configureSyncService({
      autoSync: true,
      syncInterval: 30000, // Sync every 30 seconds
      onSyncComplete: () => {
        console.log('Background sync completed');
      },
      onSyncError: (error) => {
        console.error('Background sync failed:', error);
        // Optionally show a toast for critical errors
        // toast.error('Sync failed. Some data may not be up to date.');
      },
    });
    
    startAutoSync();
    
    // Cleanup on unmount
    return () => {
      stopAutoSync();
    };
  }, []);

  return (
    <RouterProvider router={router} />
  );
}
```

---

## 📤 Example 8: Manual Sync Button (Admin)

Add a manual sync button for admins:

```typescript
// src/app/components/admin/AdminDashboard.tsx
import { syncAll, pullFromSupabase } from '@/lib/sync-service';

const AdminDashboard = () => {
  const [syncing, setSyncing] = useState(false);

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      await syncAll(); // Push local data to Supabase
      await pullFromSupabase(); // Pull Supabase data to local
      toast.success('Manual sync completed!');
      
      // Reload data
      await loadStats();
      await loadRecentActivity();
    } catch (error) {
      console.error('Manual sync error:', error);
      toast.error('Manual sync failed');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <Button 
        onClick={handleManualSync} 
        disabled={syncing}
        className="mb-4"
      >
        {syncing ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Syncing...
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Now
          </>
        )}
      </Button>
      
      {/* Rest of dashboard */}
    </div>
  );
};
```

---

## 🌐 Example 9: Check Online Status

Add network status indicator:

```typescript
// src/app/components/NetworkStatus.tsx
import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/app/components/ui/alert';

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <Alert className="mb-4 bg-yellow-50 border-yellow-200">
      <WifiOff className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800 text-xs">
        You're offline. Data will sync when connection is restored.
      </AlertDescription>
    </Alert>
  );
}

// Add to your layouts:
// <NetworkStatus />
```

---

## 💡 Best Practices

### 1. **Non-blocking Sync**
Always catch sync errors to prevent blocking user operations:

```typescript
// Good ✅
syncParcel(data).catch(err => console.error('Sync error:', err));

// Bad ❌ - blocks user if sync fails
await syncParcel(data);
```

### 2. **Loading States**
Show loading indicators for async operations:

```typescript
const [loading, setLoading] = useState(false);

const loadData = async () => {
  setLoading(true);
  try {
    const data = await getAllParcels();
    setData(data);
  } finally {
    setLoading(false); // Always reset loading
  }
};
```

### 3. **Error Handling**
Provide user feedback for errors:

```typescript
try {
  await syncParcel(data);
  toast.success('Parcel saved successfully!');
} catch (error) {
  console.error('Error:', error);
  toast.error('Failed to save parcel. Data saved locally.');
}
```

### 4. **Optimistic Updates**
Update UI immediately, sync in background:

```typescript
// Update UI immediately
setParcels(prev => [...prev, newParcel]);
toast.success('Parcel created!');

// Sync in background
syncParcel(newParcel).catch(err => {
  console.error('Background sync failed:', err);
  // Data is still in localStorage, will sync later
});
```

---

## 🎯 Migration Checklist

Use this checklist when updating each component:

- [ ] Import sync functions from `@/lib/sync-service`
- [ ] Replace localStorage reads with sync service calls
- [ ] Add sync calls after localStorage writes
- [ ] Add loading states for async operations
- [ ] Add error handling with user feedback
- [ ] Test offline behavior
- [ ] Test online sync
- [ ] Verify data appears in Supabase dashboard

---

## 🧪 Testing Guide

### Test Offline Mode
1. Open DevTools → Network tab
2. Select "Offline"
3. Try creating parcels → should work
4. Go back "Online"
5. Wait for auto-sync or trigger manual sync
6. Check Supabase dashboard → data should appear

### Test Real-time Updates
1. Open admin dashboard
2. In another tab, open Supabase Table Editor
3. Update a parcel status manually
4. Refresh admin dashboard
5. Should see the update

### Test Conflict Resolution
1. Create same parcel offline on two devices
2. Bring both online
3. Both should sync (Supabase will handle conflicts)

---

Ready to integrate! 🚀
