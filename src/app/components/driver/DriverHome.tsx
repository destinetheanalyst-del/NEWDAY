import { useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Package, LogOut, User, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { useParcel } from '@/app/context/ParcelContext';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';

export function DriverHome() {
  const navigate = useNavigate();
  const { resetCurrentParcel } = useParcel();
  const { profile, signOut } = useAuth();

  const handleRegisterParcel = () => {
    resetCurrentParcel();
    navigate('/driver/register/sender');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/driver/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold">NEWDAY Driver</h1>
          {profile && (
            <p className="text-xs text-blue-100">Welcome, {profile.full_name}</p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-blue-700 h-9 w-9">
              <User className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-56px)] p-3">
        <Card className="p-6 max-w-md w-full">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold">Welcome, Driver!</h2>
            <p className="text-sm text-gray-600">Manage your parcels and view reports</p>
            <div className="space-y-2.5">
              <Button onClick={handleRegisterParcel} size="lg" className="w-full h-12">
                <Package className="w-4 h-4 mr-2" />
                Register Parcel
              </Button>
              <Button 
                onClick={() => navigate('/driver/reports')} 
                variant="outline" 
                size="lg" 
                className="w-full h-12"
              >
                <FileText className="w-4 h-4 mr-2" />
                View My Reports
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}