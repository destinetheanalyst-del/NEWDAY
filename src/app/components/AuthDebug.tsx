import { useAuth } from '@/app/context/AuthContext';
import { Card } from '@/app/components/ui/card';
import { useState } from 'react';

export function AuthDebug() {
  // Call all hooks first before any conditional logic
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Use a try-catch to handle cases where context isn't available during hot reload
  let authData;
  try {
    authData = useAuth();
  } catch (error) {
    console.warn('AuthDebug: Context not available yet', error);
    return null;
  }

  // Only show in development (check if env is not production)
  const isProduction = typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';
  if (isProduction) {
    return null;
  }

  const { user, session, profile, loading } = authData;

  return (
    <Card className="fixed bottom-4 right-4 p-4 max-w-sm bg-black/80 text-white text-xs z-50">
      <h3 
        className="font-bold mb-2 cursor-pointer flex justify-between items-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>Auth Debug</span>
        <span>{isExpanded ? '▼' : '▶'}</span>
      </h3>
      <div className="space-y-1">
        <div>Loading: {loading ? 'Yes' : 'No'}</div>
        <div>User: {user ? '✓' : '✗'} {user && `(${user.id.substring(0, 8)}...)`}</div>
        <div>Session: {session ? '✓' : '✗'}</div>
        <div>Profile: {profile ? '✓' : '✗'} {profile && `(${profile.full_name})`}</div>
        <div>Role: {profile?.role || 'null'}</div>
        {isExpanded && session && (
          <div className="mt-2 pt-2 border-t border-white/20">
            <div className="break-all">Token: {session.access_token?.substring(0, 30)}...</div>
            <div>Expires: {session.expires_at ? new Date(session.expires_at * 1000).toLocaleTimeString() : 'N/A'}</div>
          </div>
        )}
      </div>
    </Card>
  );
}