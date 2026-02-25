import { useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { 
  Users, 
  ShieldCheck, 
  Package, 
  FileText, 
  QrCode, 
  Hash,
  LogOut,
  BarChart3,
  Shield
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

interface AdminStats {
  drivers: number;
  officials: number;
  parcels: number;
  qrCodes: number;
  referenceNumbers: number;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats>({
    drivers: 0,
    officials: 0,
    parcels: 0,
    qrCodes: 0,
    referenceNumbers: 0
  });

  useEffect(() => {
    // Check admin session
    const adminSession = localStorage.getItem('gts_admin_session');
    if (!adminSession) {
      navigate('/admin/login');
      return;
    }

    // Load statistics
    loadStats();
  }, [navigate]);

  const loadStats = () => {
    try {
      // Count drivers
      const users = JSON.parse(localStorage.getItem('gts_users') || '[]');
      const drivers = users.filter((u: any) => u.role === 'driver').length;
      const officials = users.filter((u: any) => u.role === 'official').length;

      // Count parcels
      const parcels = JSON.parse(localStorage.getItem('gts_parcels') || '[]');
      const parcelCount = parcels.length;

      setStats({
        drivers,
        officials,
        parcels: parcelCount,
        qrCodes: parcelCount * 2, // Each parcel has 2 QR codes
        referenceNumbers: parcelCount * 2 // Each parcel has 2 reference numbers
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('gts_admin_session');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const menuItems = [
    { icon: Users, label: 'All Drivers', path: '/admin/drivers', color: 'bg-blue-500' },
    { icon: ShieldCheck, label: 'All Officials', path: '/admin/officials', color: 'bg-green-500' },
    { icon: Package, label: 'All Items/Goods', path: '/admin/items', color: 'bg-orange-500' },
    { icon: FileText, label: 'All Documents', path: '/admin/documents', color: 'bg-red-500' },
    { icon: QrCode, label: 'All QR Codes', path: '/admin/qrcodes', color: 'bg-purple-500' },
    { icon: Hash, label: 'All Reference Numbers', path: '/admin/references', color: 'bg-pink-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="bg-purple-600 text-white p-3 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold">NEWDAY Admin</h1>
          <p className="text-xs text-purple-100">System Management Dashboard</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-purple-700 h-9 w-9">
              <Shield className="w-5 h-5" />
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

      <div className="p-3 space-y-4">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Drivers</p>
                <p className="text-2xl font-bold text-blue-600">{stats.drivers}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Officials</p>
                <p className="text-2xl font-bold text-green-600">{stats.officials}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Parcels</p>
                <p className="text-2xl font-bold text-orange-600">{stats.parcels}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">QR Codes</p>
                <p className="text-2xl font-bold text-purple-600">{stats.qrCodes}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <QrCode className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Access Menu */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700 px-1">Quick Access</h2>
          {menuItems.map((item, index) => (
            <Card 
              key={index}
              className="p-3 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(item.path)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center`}>
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <BarChart3 className="w-4 h-4 text-gray-400" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}