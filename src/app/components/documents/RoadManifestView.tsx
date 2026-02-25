import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Separator } from '@/app/components/ui/separator';
import { Badge } from '@/app/components/ui/badge';
import { ParcelData } from '@/lib/parcels';
import { Truck, MapPin, AlertCircle, FileText, File } from 'lucide-react';

interface RoadManifestViewProps {
  parcel: ParcelData;
}

export function RoadManifestView({ parcel }: RoadManifestViewProps) {
  // If documents don't exist, show message
  if (!parcel.documents?.roadManifest) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">Road Manifest not available for this parcel.</p>
        </CardContent>
      </Card>
    );
  }

  const document = parcel.documents.roadManifest;

  return (
    <Card className="w-full">
      <CardHeader className="bg-green-50">
        <div className="flex items-center gap-3">
          <Truck className="w-6 h-6 text-green-600" />
          <div>
            <CardTitle className="text-xl">Road Manifest</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Transportation Manifest</p>
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

        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-600">Status:</p>
          <Badge variant={document.status === 'verified' ? 'default' : 'secondary'}>
            {document.status.toUpperCase()}
          </Badge>
        </div>

        <Separator />

        {/* Driver & Vehicle Information */}
        <div>
          <h3 className="font-semibold text-lg mb-3 text-green-900">Driver & Vehicle</h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            {/* Driver Photos Section */}
            {(document.driver.driverPhoto || document.driver.licensePhoto) && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                {document.driver.driverPhoto && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Driver Photo</p>
                    <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                      <img 
                        src={document.driver.driverPhoto} 
                        alt="Driver Photo" 
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  </div>
                )}
                {document.driver.licensePhoto && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Driver's License Photo</p>
                    <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                      <img 
                        src={document.driver.licensePhoto} 
                        alt="Driver License" 
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Driver Information */}
            {document.driver.name && (
              <div>
                <p className="text-sm text-gray-600">Driver Name</p>
                <p className="font-semibold text-lg">{document.driver.name}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Driver ID</p>
              <p className="font-mono">{document.driver.id}</p>
            </div>
            {document.driver.driverNIN && (
              <div>
                <p className="text-sm text-gray-600">Driver NIN</p>
                <p className="font-mono font-semibold">{document.driver.driverNIN}</p>
              </div>
            )}
            {document.driver.vehicleNumber && (
              <div>
                <p className="text-sm text-gray-600">Vehicle Number</p>
                <p className="font-semibold text-lg">{document.driver.vehicleNumber}</p>
              </div>
            )}
            {document.driver.vinNumber && (
              <div>
                <p className="text-sm text-gray-600">Vehicle VIN Number</p>
                <p className="font-mono font-semibold">{document.driver.vinNumber}</p>
              </div>
            )}
            {document.driver.insuranceNumber && (
              <div>
                <p className="text-sm text-gray-600">Vehicle Insurance Number</p>
                <p className="font-mono font-semibold">{document.driver.insuranceNumber}</p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Route Information */}
        <div>
          <h3 className="font-semibold text-lg mb-3 text-green-900 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Route Information
          </h3>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Origin</p>
              <p className="font-medium text-lg">{document.route.origin}</p>
            </div>
            <div className="flex justify-center">
              <div className="border-l-2 border-dashed border-gray-300 h-8"></div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Destination</p>
              <p className="font-medium text-lg">{document.route.destination}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Parties Involved */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2 text-green-900">Shipper</h3>
            <div className="bg-gray-50 p-3 rounded-lg space-y-1">
              <p className="font-medium">{document.shipper.name}</p>
              <p className="text-sm text-gray-600">{document.shipper.contact}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-green-900">Consignee</h3>
            <div className="bg-gray-50 p-3 rounded-lg space-y-1">
              <p className="font-medium">{document.consignee.name}</p>
              <p className="text-sm text-gray-600">{document.consignee.contact}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Cargo Details */}
        <div>
          <h3 className="font-semibold text-lg mb-3 text-green-900">Cargo Details</h3>
          <div className="space-y-3">
            {document.cargo.map((item, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                {/* Parcel Picture */}
                {item.photo && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-2">Parcel Picture</p>
                    <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                      <img 
                        src={item.photo} 
                        alt={`Parcel: ${item.itemName}`} 
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-lg">{item.itemName}</p>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {item.category}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
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
                    <p className="font-mono font-medium text-green-700">{item.cubicVolume} m³</p>
                  </div>
                )}
                
                {/* HS Code */}
                {item.hsCode && (
                  <div className="mt-2 text-sm">
                    <p className="text-gray-600">HS Code</p>
                    <p className="font-mono font-medium text-blue-700">{item.hsCode}</p>
                  </div>
                )}
                
                {/* Form M */}
                {item.formM && (
                  <div className="mt-2 text-sm">
                    <p className="text-gray-600">Form M</p>
                    <p className="font-medium">{item.formM}</p>
                  </div>
                )}
                
                {/* NXP Number */}
                {item.nxpNumber && (
                  <div className="mt-2 text-sm">
                    <p className="text-gray-600">NXP Number</p>
                    <p className="font-medium">{item.nxpNumber}</p>
                  </div>
                )}
                
                {/* Other Documents */}
                {item.otherDocuments && item.otherDocuments.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Other Documents ({item.otherDocuments.length})</p>
                    <div className="space-y-2">
                      {item.otherDocuments.map((doc, docIndex) => (
                        <div key={docIndex} className="border border-gray-300 rounded p-2 flex items-center gap-2">
                          {doc.type === 'pdf' ? (
                            <FileText className="w-4 h-4 text-red-600" />
                          ) : (
                            <File className="w-4 h-4 text-blue-600" />
                          )}
                          <span className="text-xs font-medium flex-1">{doc.name}</span>
                          <span className="text-xs text-gray-500 uppercase">{doc.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Totals Summary */}
        <div className="bg-green-50 p-4 rounded-lg">
          <div
            className={`grid ${
              document.totalVolume ? 'grid-cols-4' : 'grid-cols-3'
            } gap-4`}
          >
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="font-bold text-lg">{document.totalItems}</p>
            </div>
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

        {/* Compliance Notes */}
        <div>
          <h3 className="font-semibold text-lg mb-3 text-green-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Compliance Notes
          </h3>
          <div className="bg-amber-50 p-4 rounded-lg space-y-2">
            {document.complianceNotes.map((note, index) => (
              <div key={index} className="flex gap-2 text-sm">
                <span className="text-amber-600 font-semibold">{index + 1}.</span>
                <p className="text-gray-700">{note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Official Stamp Area */}
        <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500 mb-2">Official Stamp/Seal</p>
          <p className="text-xs text-gray-400">
            This space is reserved for official stamps and seals during inspections
          </p>
        </div>
      </CardContent>
    </Card>
  );
}