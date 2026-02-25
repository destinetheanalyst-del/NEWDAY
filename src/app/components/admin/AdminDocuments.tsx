import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { ChevronLeft, FileText, Download, Eye } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { generateBillOfLading, generateRoadManifest } from '@/lib/documents';

interface Parcel {
  id: string;
  referenceNumber: string;
  sender: any;
  receiver: any;
  item: any;
  status: string;
  created_at: string;
  driverInfo?: any;
}

export function AdminDocuments() {
  const navigate = useNavigate();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [documentType, setDocumentType] = useState<'bol' | 'manifest' | null>(null);
  const [documentContent, setDocumentContent] = useState<string>('');

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

  const viewDocument = (parcel: Parcel, type: 'bol' | 'manifest') => {
    setSelectedParcel(parcel);
    setDocumentType(type);
    
    const content = type === 'bol' 
      ? generateBillOfLading(parcel)
      : generateRoadManifest(parcel);
    
    setDocumentContent(content);
  };

  const downloadDocument = (parcel: Parcel, type: 'bol' | 'manifest') => {
    const content = type === 'bol' 
      ? generateBillOfLading(parcel)
      : generateRoadManifest(parcel);
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type === 'bol' ? 'Bill_of_Lading' : 'Road_Manifest'}_${parcel.referenceNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
              <FileText className="w-5 h-5" />
              All Documents ({parcels.length * 2})
            </CardTitle>
            <p className="text-xs text-gray-600 mt-1">
              Each parcel has 2 documents: Bill of Lading & Road Manifest
            </p>
          </CardHeader>
          <CardContent className="p-4">
            {parcels.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No documents available yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {parcels.map((parcel, index) => (
                  <Card key={parcel.id || index} className="bg-red-50 border-red-200">
                    <CardContent className="p-3 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm">{parcel.item.description}</p>
                          <p className="text-xs text-gray-600">Ref: {parcel.referenceNumber}</p>
                        </div>
                        <Badge className="text-xs bg-red-200 text-red-800">
                          2 Docs
                        </Badge>
                      </div>

                      {/* Documents */}
                      <div className="space-y-2">
                        {/* Bill of Lading */}
                        <div className="flex items-center justify-between bg-white p-2 rounded border border-red-200">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-red-600" />
                            <div>
                              <p className="text-xs font-semibold">Bill of Lading</p>
                              <p className="text-xs text-gray-600">Legal document</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="h-8 px-2"
                              onClick={() => viewDocument(parcel, 'bol')}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="h-8 px-2"
                              onClick={() => downloadDocument(parcel, 'bol')}
                            >
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Road Manifest */}
                        <div className="flex items-center justify-between bg-white p-2 rounded border border-red-200">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-red-600" />
                            <div>
                              <p className="text-xs font-semibold">Road Manifest</p>
                              <p className="text-xs text-gray-600">Transport document</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="h-8 px-2"
                              onClick={() => viewDocument(parcel, 'manifest')}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="h-8 px-2"
                              onClick={() => downloadDocument(parcel, 'manifest')}
                            >
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-red-200">
                        <p className="text-xs text-gray-600">
                          Created: {new Date(parcel.created_at).toLocaleDateString()}
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

      {/* Document Viewer Dialog */}
      <Dialog open={!!documentType} onOpenChange={() => setDocumentType(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {documentType === 'bol' ? 'Bill of Lading' : 'Road Manifest'}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <pre className="text-xs whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded border">
              {documentContent}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
