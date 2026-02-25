import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import { Input } from '@/app/components/ui/input';
import { 
  ChevronLeft, 
  FileText, 
  Search, 
  Package, 
  Calendar,
  CheckCircle,
  Clock,
  Truck,
  Download,
  Printer,
  Copy
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { getParcelsByDriver, ParcelData } from '@/lib/parcels';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

export function DriverReports() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [parcels, setParcels] = useState<ParcelData[]>([]);
  const [filteredParcels, setFilteredParcels] = useState<ParcelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadParcels = async () => {
      if (!profile?.id) {
        navigate('/driver/login');
        return;
      }

      setLoading(true);
      try {
        const driverParcels = await getParcelsByDriver(profile.id);
        // Sort by most recent first
        const sortedParcels = driverParcels.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setParcels(sortedParcels);
        setFilteredParcels(sortedParcels);
      } catch (error) {
        console.error('Error loading parcels:', error);
      } finally {
        setLoading(false);
      }
    };

    loadParcels();
  }, [profile, navigate]);

  // Filter parcels based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredParcels(parcels);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = parcels.filter(parcel => 
      parcel.referenceNumber.toLowerCase().includes(query) ||
      parcel.sender.name.toLowerCase().includes(query) ||
      parcel.receiver.name.toLowerCase().includes(query) ||
      parcel.items.some(item => item.name.toLowerCase().includes(query))
    );
    setFilteredParcels(filtered);
  }, [searchQuery, parcels]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered':
        return 'bg-blue-100 text-blue-800';
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'registered':
        return <Clock className="w-3 h-3" />;
      case 'verified':
        return <CheckCircle className="w-3 h-3" />;
      case 'delivered':
        return <Truck className="w-3 h-3" />;
      default:
        return <Package className="w-3 h-3" />;
    }
  };

  // Download QR code as image
  const downloadQRCode = (referenceNumber: string) => {
    const svg = document.getElementById(`qr-${referenceNumber}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `QR_${referenceNumber}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      
      toast.success('QR Code downloaded!');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  // Copy reference number to clipboard
  const copyReferenceNumber = async (referenceNumber: string) => {
    try {
      // Try clipboard API first
      await navigator.clipboard.writeText(referenceNumber);
      toast.success('Reference number copied to clipboard!');
    } catch (err) {
      // Fallback: Create a temporary textarea element
      const textarea = document.createElement('textarea');
      textarea.value = referenceNumber;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        toast.success('Reference number copied to clipboard!');
      } catch (e) {
        toast.error('Could not copy to clipboard');
      }
      document.body.removeChild(textarea);
    }
  };

  // Print parcel details
  const printParcel = (parcel: ParcelData) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Parcel ${parcel.referenceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .qr-section { text-align: center; margin: 20px 0; }
            .details { margin: 20px 0; }
            .section { margin: 15px 0; padding: 10px; border: 1px solid #ddd; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>NEWDAY Goods Tracking System</h1>
            <h2>Parcel Report</h2>
          </div>
          <div class="section">
            <h3>Reference Number: ${parcel.referenceNumber}</h3>
            <p>Status: ${parcel.status.toUpperCase()}</p>
            <p>Date: ${new Date(parcel.timestamp).toLocaleString()}</p>
          </div>
          <div class="section">
            <h3>Sender Information</h3>
            <p><strong>Name:</strong> ${parcel.sender.name}</p>
            <p><strong>Contact:</strong> ${parcel.sender.contact}</p>
            <p><strong>Address:</strong> ${parcel.sender.address}</p>
          </div>
          <div class="section">
            <h3>Receiver Information</h3>
            <p><strong>Name:</strong> ${parcel.receiver.name}</p>
            <p><strong>Contact:</strong> ${parcel.receiver.contact}</p>
            <p><strong>Address:</strong> ${parcel.receiver.address}</p>
          </div>
          <div class="section">
            <h3>Items</h3>
            <table>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Weight (Kg)</th>
                <th>Value (₦)</th>
                <th>Volume (m³)</th>
              </tr>
              ${parcel.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.category}</td>
                  <td>${item.size}</td>
                  <td>₦${item.value}</td>
                  <td>${item.cubicVolume || '—'}</td>
                </tr>
              `).join('')}
            </table>
          </div>
          <script>
            window.onload = () => window.print();
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading your reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/driver/home')}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Title Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">My Parcel Reports</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {parcels.length} {parcels.length === 1 ? 'parcel' : 'parcels'} registered
                  </p>
                </div>
              </div>
              {parcels.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    parcels.forEach(parcel => {
                      setTimeout(() => downloadQRCode(parcel.referenceNumber), 100);
                    });
                    toast.success(`Downloading ${parcels.length} QR codes...`);
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export All QR Codes
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by reference number, sender, receiver, or item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        {parcels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Registered</p>
                    <p className="text-2xl font-bold">
                      {parcels.filter(p => p.status === 'registered').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Parcels List */}
        {filteredParcels.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-600 mb-2">
                {searchQuery ? 'No parcels found' : 'No parcels registered yet'}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Start by registering your first parcel'
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => navigate('/driver/register/sender')}>
                  Register First Parcel
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredParcels.map((parcel) => (
              <Card key={parcel.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-[200px_1fr] gap-0">
                    {/* QR Code Section */}
                    <div className="bg-gray-50 p-6 flex flex-col items-center justify-center border-r">
                      <div className="bg-white p-3 rounded-lg shadow-sm mb-3">
                        <QRCodeSVG 
                          id={`qr-${parcel.referenceNumber}`}
                          value={parcel.referenceNumber}
                          size={140}
                          level="H"
                          includeMargin={false}
                        />
                      </div>
                      <p className="text-xs text-gray-500 text-center mb-3">
                        Scan to track
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadQRCode(parcel.referenceNumber)}
                        className="w-full text-xs"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download QR
                      </Button>
                    </div>

                    {/* Details Section */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold font-mono">
                              {parcel.referenceNumber}
                            </h3>
                            <Badge className={`${getStatusColor(parcel.status)} flex items-center gap-1`}>
                              {getStatusIcon(parcel.status)}
                              {parcel.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {new Date(parcel.timestamp).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyReferenceNumber(parcel.referenceNumber)}
                            title="Copy reference number"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => printParcel(parcel)}
                            title="Print parcel details"
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      {/* Sender & Receiver */}
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Sender</p>
                          <p className="font-medium">{parcel.sender.name}</p>
                          <p className="text-sm text-gray-600">{parcel.sender.contact}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Receiver</p>
                          <p className="font-medium">{parcel.receiver.name}</p>
                          <p className="text-sm text-gray-600">{parcel.receiver.contact}</p>
                        </div>
                      </div>

                      {/* Items Summary */}
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-2">Items ({parcel.items.length})</p>
                        <div className="flex flex-wrap gap-2">
                          {parcel.items.slice(0, 3).map((item, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {item.name}
                            </Badge>
                          ))}
                          {parcel.items.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{parcel.items.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Total Value & Weight */}
                      <div className="grid grid-cols-3 gap-3 mt-4">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-600">Total Value</p>
                          <p className="font-bold text-sm">
                            ₦{parcel.items.reduce((sum, item) => 
                              sum + parseFloat(item.value.replace(/[^0-9.]/g, '') || '0'), 0
                            ).toFixed(2)}
                          </p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-600">Total Weight</p>
                          <p className="font-bold text-sm">
                            {parcel.items.reduce((sum, item) => 
                              sum + parseFloat(item.size || '0'), 0
                            ).toFixed(2)} Kg
                          </p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-600">Volume</p>
                          <p className="font-bold text-sm font-mono">
                            {parcel.items.reduce((sum, item) => 
                              sum + parseFloat(item.cubicVolume || '0'), 0
                            ).toFixed(4)} m³
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
