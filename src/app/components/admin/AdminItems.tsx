import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { ChevronLeft, Package, User, MapPin, DollarSign, Box, Weight } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';

interface Parcel {
  id: string;
  referenceNumber: string;
  sender: {
    name: string;
    phone: string;
    address: string;
  };
  receiver: {
    name: string;
    phone: string;
    address: string;
  };
  item: {
    description: string;
    category: string;
    quantity: number;
    weight: number;
    value: number;
    hsCode?: string;
    formM?: string;
  };
  status: string;
  created_at: string;
}

export function AdminItems() {
  const navigate = useNavigate();
  const [parcels, setParcels] = useState<Parcel[]>([]);

  useEffect(() => {
    // Check admin session
    const adminSession = localStorage.getItem('gts_admin_session');
    if (!adminSession) {
      navigate('/admin/login');
      return;
    }

    loadParcels();
  }, [navigate]);

  const loadParcels = () => {
    try {
      const parcelList = JSON.parse(localStorage.getItem('gts_parcels') || '[]');
      setParcels(parcelList);
    } catch (error) {
      console.error('Error loading parcels:', error);
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
              <Package className="w-5 h-5" />
              All Registered Items ({parcels.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {parcels.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No items registered yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {parcels.map((parcel, index) => (
                  <Card key={parcel.id || index} className="bg-orange-50 border-orange-200">
                    <CardContent className="p-3 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{parcel.item.description}</p>
                            <p className="text-xs text-gray-600">Ref: {parcel.referenceNumber}</p>
                          </div>
                        </div>
                        <Badge className="text-xs bg-orange-200 text-orange-800">
                          {parcel.status}
                        </Badge>
                      </div>

                      {/* Item Details */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <Box className="w-3.5 h-3.5" />
                          <span>{parcel.item.category}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <Weight className="w-3.5 h-3.5" />
                          <span>{parcel.item.weight} kg</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <Package className="w-3.5 h-3.5" />
                          <span>Qty: {parcel.item.quantity}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>₦{parcel.item.value.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Additional Codes */}
                      {(parcel.item.hsCode || parcel.item.formM) && (
                        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-orange-200">
                          {parcel.item.hsCode && (
                            <div>
                              <span className="text-gray-600">HS Code: </span>
                              <span className="font-mono font-semibold">{parcel.item.hsCode}</span>
                            </div>
                          )}
                          {parcel.item.formM && (
                            <div>
                              <span className="text-gray-600">Form M: </span>
                              <span className="font-mono font-semibold">{parcel.item.formM}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Sender & Receiver */}
                      <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-orange-200">
                        <div>
                          <p className="font-semibold text-gray-700 mb-1">Sender</p>
                          <div className="flex items-start gap-1.5 text-gray-600">
                            <User className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <div>
                              <p>{parcel.sender.name}</p>
                              <p className="text-xs">{parcel.sender.phone}</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-700 mb-1">Receiver</p>
                          <div className="flex items-start gap-1.5 text-gray-600">
                            <User className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <div>
                              <p>{parcel.receiver.name}</p>
                              <p className="text-xs">{parcel.receiver.phone}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-orange-200">
                        <p className="text-xs text-gray-600">
                          Registered: {new Date(parcel.created_at).toLocaleDateString()} at {new Date(parcel.created_at).toLocaleTimeString()}
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
