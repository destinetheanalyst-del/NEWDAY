import { useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Search, LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';

export function OfficialHome() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/official/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="bg-green-600 text-white p-3 flex justify-between items-center">
        <h1 className="text-lg font-semibold">NEWDAY Official</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-green-700 h-9 w-9">
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
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold">Welcome, Official!</h2>
            <p className="text-sm text-gray-600">Click below to track a parcel</p>
            <Button onClick={() => navigate('/official/track')} size="lg" className="w-full h-12">
              <Search className="w-4 h-4 mr-2" />
              Track Parcel
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}