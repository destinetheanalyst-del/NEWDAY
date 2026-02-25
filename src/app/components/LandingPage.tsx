import { useNavigate } from 'react-router';
import { useState, useRef } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Truck, UserCheck, Shield } from 'lucide-react';
import { toast } from 'sonner';

export function LandingPage() {
  const navigate = useNavigate();
  const [tapCount, setTapCount] = useState(0);
  const [showAdmin, setShowAdmin] = useState(false);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSecretTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);

    // Clear existing timer
    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
    }

    // Reset tap count after 2 seconds of inactivity
    tapTimerRef.current = setTimeout(() => {
      setTapCount(0);
    }, 2000);

    // Show admin panel after 7 taps
    if (newCount === 7) {
      setShowAdmin(true);
      toast.success('Admin panel unlocked!');
      setTapCount(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-3">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 
            className="text-3xl mb-3 font-semibold select-none" 
            onClick={handleSecretTap}
          >
            Goods Tracking System
          </h1>
          <p className="text-base text-gray-600">Select your role to continue</p>
        </div>

        <div className={`grid ${showAdmin ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4 max-w-3xl mx-auto`}>
          <Card className="p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate('/driver')}>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold">Driver App</h2>
              <p className="text-sm text-gray-600">Register and manage parcel deliveries</p>
              <Button size="lg" className="w-full mt-3 h-11">
                Enter as Driver
              </Button>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate('/official')}>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <UserCheck className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold">Official App</h2>
              <p className="text-sm text-gray-600">Track and verify parcel information</p>
              <Button size="lg" className="w-full mt-3 h-11" variant="outline">
                Enter as Official
              </Button>
            </div>
          </Card>

          {showAdmin && (
            <Card className="p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate('/admin')}>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold">Admin Panel</h2>
                <p className="text-sm text-gray-600">System administration and management</p>
                <Button size="lg" className="w-full mt-3 h-11" variant="secondary">
                  Enter as Admin
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}