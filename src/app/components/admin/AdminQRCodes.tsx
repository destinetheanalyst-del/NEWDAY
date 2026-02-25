import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { ChevronLeft, QrCode } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import QRCodeLib from 'qrcode';

interface Parcel {
  id: string;
  referenceNumber: string;
  qrCodeDataBOL: string;
  qrCodeDataManifest: string;
  item: {
    description: string;
  };
  created_at: string;
}

export function AdminQRCodes() {
  const navigate = useNavigate();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Check admin session
    const adminSession = localStorage.getItem('gts_admin_session');
    if (!adminSession) {
      navigate('/admin/login');
      return;
    }

    loadParcels();
  }, [navigate]);

  const loadParcels = async () => {
    try {
      const parcelList = JSON.parse(localStorage.getItem('gts_parcels') || '[]');
      setParcels(parcelList);

      // Generate QR codes for all parcels
      const codes: { [key: string]: string } = {};
      for (const parcel of parcelList) {
        try {
          const bolQR = await QRCodeLib.toDataURL(parcel.qrCodeDataBOL, { width: 200 });
          const manifestQR = await QRCodeLib.toDataURL(parcel.qrCodeDataManifest, { width: 200 });
          codes[`${parcel.id}_bol`] = bolQR;
          codes[`${parcel.id}_manifest`] = manifestQR;
        } catch (err) {
          console.error('Error generating QR code:', err);
        }
      }
      setQrCodes(codes);
    } catch (error) {
      console.error('Error loading parcels:', error);
    }
  };

  const downloadQRCode = (qrDataUrl: string, filename: string) => {
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = filename;
    a.click();
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
              <QrCode className="w-5 h-5" />
              All QR Codes ({parcels.length * 2})
            </CardTitle>
            <p className="text-xs text-gray-600 mt-1">
              Each parcel has 2 QR codes: Bill of Lading & Road Manifest
            </p>
          </CardHeader>
          <CardContent className="p-4">
            {parcels.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <QrCode className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No QR codes generated yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {parcels.map((parcel, index) => (
                  <Card key={parcel.id || index} className="bg-purple-50 border-purple-200">
                    <CardContent className="p-3 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm">{parcel.item.description}</p>
                          <p className="text-xs text-gray-600">Ref: {parcel.referenceNumber}</p>
                        </div>
                        <Badge className="text-xs bg-purple-200 text-purple-800">
                          2 QR Codes
                        </Badge>
                      </div>

                      {/* QR Codes */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Bill of Lading QR */}
                        <div className="bg-white p-3 rounded border border-purple-200 text-center">
                          <p className="text-xs font-semibold mb-2">Bill of Lading</p>
                          {qrCodes[`${parcel.id}_bol`] ? (
                            <>
                              <img 
                                src={qrCodes[`${parcel.id}_bol`]} 
                                alt="BOL QR Code" 
                                className="mx-auto mb-2 w-32 h-32"
                              />
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="h-8 text-xs w-full"
                                onClick={() => downloadQRCode(
                                  qrCodes[`${parcel.id}_bol`],
                                  `BOL_QR_${parcel.referenceNumber}.png`
                                )}
                              >
                                Download
                              </Button>
                            </>
                          ) : (
                            <div className="w-32 h-32 mx-auto bg-gray-100 flex items-center justify-center">
                              <QrCode className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Road Manifest QR */}
                        <div className="bg-white p-3 rounded border border-purple-200 text-center">
                          <p className="text-xs font-semibold mb-2">Road Manifest</p>
                          {qrCodes[`${parcel.id}_manifest`] ? (
                            <>
                              <img 
                                src={qrCodes[`${parcel.id}_manifest`]} 
                                alt="Manifest QR Code" 
                                className="mx-auto mb-2 w-32 h-32"
                              />
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="h-8 text-xs w-full"
                                onClick={() => downloadQRCode(
                                  qrCodes[`${parcel.id}_manifest`],
                                  `Manifest_QR_${parcel.referenceNumber}.png`
                                )}
                              >
                                Download
                              </Button>
                            </>
                          ) : (
                            <div className="w-32 h-32 mx-auto bg-gray-100 flex items-center justify-center">
                              <QrCode className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-purple-200">
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
