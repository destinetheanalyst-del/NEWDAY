import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Separator } from '@/app/components/ui/separator';
import { ParcelData } from '@/lib/parcels';
import { FileText, CheckCircle } from 'lucide-react';

interface BillOfLadingViewProps {
  parcel: ParcelData;
}

export function BillOfLadingView({ parcel }: BillOfLadingViewProps) {
  // If documents don't exist, show message
  if (!parcel.documents?.billOfLading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">Bill of Lading not available for this parcel.</p>
        </CardContent>
      </Card>
    );
  }

  const document = parcel.documents.billOfLading;

  return (
    <Card className="w-full">
      <CardHeader className="bg-blue-50">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-blue-600" />
          <div>
            <CardTitle className="text-xl">Bill of Lading</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Transport Document</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Document Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Reference Number</p>
            <p className="font-mono font-semibold text-lg">{document.referenceNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Issue Date</p>
            <p className="font-medium">{new Date(document.issueDate).toLocaleDateString()}</p>
          </div>
        </div>

        <Separator />

        {/* Shipper Information */}
        <div>
          <h3 className="font-semibold text-lg mb-3 text-blue-900">Shipper (Consignor)</h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{document.shipper.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-medium">{document.shipper.address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Contact</p>
              <p className="font-medium">{document.shipper.contact}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Consignee Information */}
        <div>
          <h3 className="font-semibold text-lg mb-3 text-blue-900">Consignee (Receiver)</h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{document.consignee.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-medium">{document.consignee.address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Contact</p>
              <p className="font-medium">{document.consignee.contact}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Carrier Information */}
        <div>
          <h3 className="font-semibold text-lg mb-3 text-blue-900">Carrier Information</h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            {document.carrier.driverName && (
              <div>
                <p className="text-sm text-gray-600">Driver Name</p>
                <p className="font-semibold">{document.carrier.driverName}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Driver ID</p>
              <p className="font-mono">{document.carrier.driverId}</p>
            </div>
            {document.carrier.driverNIN && (
              <div>
                <p className="text-sm text-gray-600">Driver NIN</p>
                <p className="font-mono font-semibold">{document.carrier.driverNIN}</p>
              </div>
            )}
            {document.carrier.vehicleNumber && (
              <div>
                <p className="text-sm text-gray-600">Vehicle Number</p>
                <p className="font-semibold">{document.carrier.vehicleNumber}</p>
              </div>
            )}
            {document.carrier.vinNumber && (
              <div>
                <p className="text-sm text-gray-600">Vehicle VIN Number</p>
                <p className="font-mono font-semibold">{document.carrier.vinNumber}</p>
              </div>
            )}
            {document.carrier.insuranceNumber && (
              <div>
                <p className="text-sm text-gray-600">Vehicle Insurance Number</p>
                <p className="font-mono font-semibold">{document.carrier.insuranceNumber}</p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Goods Description */}
        <div>
          <h3 className="font-semibold text-lg mb-3 text-blue-900">Description of Goods</h3>
          <div className="space-y-3">
            {document.goods.map((item, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-lg">{item.description}</p>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {item.category}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Quantity</p>
                    <p className="font-medium">{item.quantity}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Weight</p>
                    <p className="font-medium">{item.weight}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Value</p>
                    <p className="font-medium">{item.value}</p>
                  </div>
                </div>
                {item.cubicVolume && (
                  <div className="mt-2 text-sm">
                    <p className="text-gray-600">Cubic Volume</p>
                    <p className="font-mono font-medium text-blue-700">{item.cubicVolume} m³</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className={`grid ${document.totalVolume ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
            <div>
              <p className="text-sm text-gray-600">Total Weight</p>
              <p className="font-bold text-lg">{document.totalWeight}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="font-bold text-lg">{document.totalValue}</p>
            </div>
            {document.totalVolume && (
              <div>
                <p className="text-sm text-gray-600">Total Volume</p>
                <p className="font-bold text-lg font-mono">{document.totalVolume}</p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Terms and Conditions */}
        <div>
          <h3 className="font-semibold text-lg mb-3 text-blue-900">Terms and Conditions</h3>
          <div className="bg-yellow-50 p-4 rounded-lg space-y-2">
            {document.termsAndConditions.map((term, index) => (
              <div key={index} className="flex gap-2 text-sm">
                <span className="text-yellow-600 font-semibold">{index + 1}.</span>
                <p className="text-gray-700">{term}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Signatures */}
        <div>
          <h3 className="font-semibold text-lg mb-3 text-blue-900">Signatures</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium mb-2">Shipper</p>
              {document.signatures.shipper.signed ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-medium">Signed</p>
                    <p className="text-xs text-gray-600">
                      {new Date(document.signatures.shipper.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Not signed</p>
              )}
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium mb-2">Carrier</p>
              {document.signatures.carrier.signed ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-medium">Signed</p>
                    <p className="text-xs text-gray-600">
                      {new Date(document.signatures.carrier.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Not signed</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}