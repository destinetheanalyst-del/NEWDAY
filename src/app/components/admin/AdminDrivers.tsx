import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { ChevronLeft, User, Phone, Mail, Truck } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';

interface Driver {
  id: string;
  phone: string;
  full_name: string;
  email: string;
  company_name: string;
  vehicle_number: string;
  role: string;
  created_at: string;
}

export function AdminDrivers() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    // Check admin session
    const adminSession = localStorage.getItem('gts_admin_session');
    if (!adminSession) {
      navigate('/admin/login');
      return;
    }

    loadDrivers();
  }, [navigate]);

  const loadDrivers = () => {
    try {
      const users = JSON.parse(localStorage.getItem('gts_users') || '[]');
      const driverList = users.filter((u: any) => u.role === 'driver');
      setDrivers(driverList);
    } catch (error) {
      console.error('Error loading drivers:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-3">
      <div className="max-w-4xl mx-auto">
        <div className="mb-3">
          <Button variant="ghost" onClick={() => navigate('/admin/dashboard')} className="h-9">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              All Drivers ({drivers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {drivers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No drivers registered yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {drivers.map((driver, index) => (
                  <Card key={driver.id || index} className="bg-blue-50 border-blue-200">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{driver.full_name}</p>
                            <Badge variant="secondary" className="text-xs">Driver</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{driver.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail className="w-3.5 h-3.5" />
                          <span>{driver.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Truck className="w-3.5 h-3.5" />
                          <span>{driver.company_name} - {driver.vehicle_number}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-blue-300">
                        <p className="text-xs text-gray-600">
                          Registered: {new Date(driver.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
