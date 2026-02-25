import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { CheckCircle, Copy, FileText, Truck, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ParcelData } from '@/app/context/ParcelContext';
import { BillOfLadingView } from '@/app/components/documents/BillOfLadingView';
import { RoadManifestView } from '@/app/components/documents/RoadManifestView';
import { toast } from 'sonner';

export function DriverParcelConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [latestParcel, setLatestParcel] = useState<ParcelData | null>(null);

  useEffect(() => {
    // Get parcel from location state (passed from previous page) - only run once on mount
    const parcel = location.state?.parcel as ParcelData;
    if (parcel) {
      setLatestParcel(parcel);
    } else {
      // If no parcel in state, redirect to home
      navigate('/driver/home');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  const handleCopy = async () => {
    if (latestParcel) {
      try {
        // Try clipboard API first
        await navigator.clipboard.writeText(latestParcel.referenceNumber);
        toast.success('Reference number copied!');
      } catch (err) {
        // Fallback: Create a temporary textarea element
        const textarea = document.createElement('textarea');
        textarea.value = latestParcel.referenceNumber;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          toast.success('Reference number copied!');
        } catch (e) {
          toast.error('Could not copy to clipboard');
        }
        document.body.removeChild(textarea);
      }
    }
  };

  const handleFinish = () => {
    navigate('/driver/home');
  };

  if (!latestParcel) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Parcel Registered Successfully</CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Your shipment has been registered with full documentation
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <QRCodeSVG value={latestParcel.referenceNumber} size={200} />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">Reference Number</p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-lg font-mono font-bold">{latestParcel.referenceNumber}</p>
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Scan the QR code or enter this reference number to view shipment details and documents
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Documents Section */}
        <Card>
          <CardHeader>
            <CardTitle>Shipment Documents</CardTitle>
            <p className="text-sm text-gray-600">
              These documents are encrypted in the QR code and reference number
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="qr-info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="qr-info">
                  <QrCode className="mr-2 h-4 w-4" />
                  QR Info
                </TabsTrigger>
                <TabsTrigger value="bill-of-lading">
                  <FileText className="mr-2 h-4 w-4" />
                  Bill of Lading
                </TabsTrigger>
                <TabsTrigger value="road-manifest">
                  <Truck className="mr-2 h-4 w-4" />
                  Road Manifest
                </TabsTrigger>
              </TabsList>
              <TabsContent value="qr-info" className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold">About This QR Code</h4>
                  <p className="text-sm text-gray-700">
                    The QR code contains the reference number <span className="font-mono font-bold">{latestParcel.referenceNumber}</span> which links to:
                  </p>
                  <ul className="text-sm text-gray-700 space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <FileText className="w-4 h-4 mt-0.5 text-blue-600" />
                      <span><strong>Bill of Lading</strong> - Legal transport document with shipper, consignee, carrier details, and terms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Truck className="w-4 h-4 mt-0.5 text-green-600" />
                      <span><strong>Road Manifest</strong> - Transportation manifest with route, cargo, and compliance information</span>
                    </li>
                  </ul>
                  <p className="text-sm text-gray-700 mt-3">
                    Officials can scan this QR code or enter the reference number to instantly view both documents.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="bill-of-lading">
                <div className="max-h-[600px] overflow-y-auto">
                  <BillOfLadingView parcel={latestParcel} />
                </div>
              </TabsContent>
              <TabsContent value="road-manifest">
                <div className="max-h-[600px] overflow-y-auto">
                  <RoadManifestView parcel={latestParcel} />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Button onClick={handleFinish} className="w-full" size="lg">
          Finish
        </Button>
      </div>
    </div>
  );
}