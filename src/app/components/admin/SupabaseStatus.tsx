/**
 * Supabase Status Component
 * Shows connection status and provides manual sync controls
 */

import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  Database, 
  CheckCircle2, 
  AlertCircle,
  Upload,
  Download
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { syncAll, pullFromSupabase } from '@/lib/sync-service';
import { toast } from 'sonner';

export function SupabaseStatus() {
  const [supabaseEnabled, setSupabaseEnabled] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    setSupabaseEnabled(isSupabaseConfigured);
    
    // Check last sync time from localStorage
    const lastSync = localStorage.getItem('gts_last_sync_time');
    if (lastSync) {
      setLastSyncTime(lastSync);
    }
  }, []);

  const handlePushSync = async () => {
    setSyncing(true);
    try {
      await syncAll();
      const now = new Date().toISOString();
      localStorage.setItem('gts_last_sync_time', now);
      setLastSyncTime(now);
      toast.success('Data pushed to Supabase successfully!');
    } catch (error: any) {
      console.error('Push sync error:', error);
      toast.error('Failed to push data to Supabase');
    } finally {
      setSyncing(false);
    }
  };

  const handlePullSync = async () => {
    setPulling(true);
    try {
      await pullFromSupabase();
      toast.success('Data pulled from Supabase successfully!');
    } catch (error: any) {
      console.error('Pull sync error:', error);
      toast.error('Failed to pull data from Supabase');
    } finally {
      setPulling(false);
    }
  };

  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-600" />
            <CardTitle className="text-base">Supabase Backend</CardTitle>
          </div>
          {supabaseEnabled ? (
            <Badge className="bg-green-100 text-green-700 border-green-300">
              <Cloud className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
              <CloudOff className="w-3 h-3 mr-1" />
              Local Only
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2 space-y-3">
        {supabaseEnabled ? (
          <>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Last sync:</span>
              <span className="font-medium text-gray-900">
                {formatLastSync(lastSyncTime)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handlePushSync}
                disabled={syncing || pulling}
                size="sm"
                variant="outline"
                className="h-9 text-xs"
              >
                {syncing ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Pushing...
                  </>
                ) : (
                  <>
                    <Upload className="w-3 h-3 mr-1" />
                    Push Local
                  </>
                )}
              </Button>

              <Button
                onClick={handlePullSync}
                disabled={syncing || pulling}
                size="sm"
                variant="outline"
                className="h-9 text-xs"
              >
                {pulling ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Pulling...
                  </>
                ) : (
                  <>
                    <Download className="w-3 h-3 mr-1" />
                    Pull Cloud
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-start gap-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-green-800">
                <div className="font-medium">Auto-sync enabled</div>
                <div className="text-green-700 mt-0.5">
                  Data syncs automatically every 30 seconds
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-yellow-800">
              <div className="font-medium">Supabase not configured</div>
              <div className="text-yellow-700 mt-0.5">
                All data is stored locally only. See SUPABASE_SETUP_GUIDE.md to enable cloud sync.
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-purple-200">
          <details className="text-xs">
            <summary className="cursor-pointer text-purple-700 font-medium hover:text-purple-900">
              Technical Info
            </summary>
            <div className="mt-2 space-y-1 text-gray-600 pl-3">
              <div>• Storage: localStorage (offline-first)</div>
              <div>• Backend: {supabaseEnabled ? 'Supabase PostgreSQL' : 'Not connected'}</div>
              <div>• Sync Mode: {supabaseEnabled ? 'Auto + Manual' : 'N/A'}</div>
              <div>• Status: {navigator.onLine ? 'Online' : 'Offline'}</div>
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  );
}
