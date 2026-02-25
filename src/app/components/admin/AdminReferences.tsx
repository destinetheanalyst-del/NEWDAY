import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { ChevronLeft, Hash, Copy, Check } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';

interface Parcel {
  id: string;
  referenceNumber: string;
  bolReferenceNumber: string;
  manifestReferenceNumber: string;
  item: {
    description: string;
  };
  created_at: string;
}

export function AdminReferences() {
  const navigate = useNavigate();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

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

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedRef(text);
      toast.success(`${label} copied!`);
      setTimeout(() => setCopiedRef(null), 2000);
    } catch (err) {
      toast.error('Failed to copy');
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
              <Hash className="w-5 h-5" />
              All Reference Numbers ({parcels.length * 2})
            </CardTitle>
            <p className="text-xs text-gray-600 mt-1">
              Each parcel has 2 reference numbers: Bill of Lading & Road Manifest
            </p>
          </CardHeader>
          <CardContent className="p-4">
            {parcels.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Hash className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No reference numbers generated yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {parcels.map((parcel, index) => (
                  <Card key={parcel.id || index} className="bg-pink-50 border-pink-200">
                    <CardContent className="p-3 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm">{parcel.item.description}</p>
                          <p className="text-xs text-gray-600">Main Ref: {parcel.referenceNumber}</p>
                        </div>
                        <Badge className="text-xs bg-pink-200 text-pink-800">
                          2 Refs
                        </Badge>
                      </div>

                      {/* Reference Numbers */}
                      <div className="space-y-2">
                        {/* Bill of Lading Reference */}
                        <div className="bg-white p-2 rounded border border-pink-200">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-semibold text-gray-700">Bill of Lading Reference</p>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="h-7 px-2"
                              onClick={() => copyToClipboard(parcel.bolReferenceNumber, 'BOL Reference')}
                            >
                              {copiedRef === parcel.bolReferenceNumber ? (
                                <Check className="w-3.5 h-3.5 text-green-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <p className="text-xs font-mono break-all">{parcel.bolReferenceNumber}</p>
                          </div>
                        </div>

                        {/* Road Manifest Reference */}
                        <div className="bg-white p-2 rounded border border-pink-200">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-semibold text-gray-700">Road Manifest Reference</p>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="h-7 px-2"
                              onClick={() => copyToClipboard(parcel.manifestReferenceNumber, 'Manifest Reference')}
                            >
                              {copiedRef === parcel.manifestReferenceNumber ? (
                                <Check className="w-3.5 h-3.5 text-green-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <p className="text-xs font-mono break-all">{parcel.manifestReferenceNumber}</p>
                          </div>
                        </div>
                      </div>

                      {/* Decryption Info */}
                      <div className="bg-blue-50 p-2 rounded border border-blue-200">
                        <p className="text-xs text-gray-700">
                          <span className="font-semibold">Note:</span> Reference numbers contain encrypted document data. 
                          Scanning or entering these will instantly retrieve the full document.
                        </p>
                      </div>

                      <div className="pt-2 border-t border-pink-200">
                        <p className="text-xs text-gray-600">
                          Generated: {new Date(parcel.created_at).toLocaleDateString()}
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
