import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { ChevronLeft, Plus, Trash2, Camera, Upload, X, FileText, File } from 'lucide-react';
import { useParcel } from '@/app/context/ParcelContext';
import { toast } from 'sonner';
import { getHSCode } from '@/lib/hs-codes';

interface Item {
  name: string;
  category: string;
  value: string;
  size: string;
  cubicVolume?: string;
  photo?: string;
  formM?: string;
  nxpNumber?: string;
  hsCode?: string;
  otherDocuments?: Array<{
    name: string;
    data: string;
    type: 'image' | 'pdf';
  }>;
}

/**
 * Calculate cubic volume based on weight and value
 * Formula: Estimates volume based on weight-to-value density
 * Higher value per kg suggests denser/more compact items
 * 
 * @param weightKg - Weight in kilograms
 * @param valueNaira - Value in Naira
 * @returns Cubic volume in cubic meters (m³)
 */
const calculateCubicVolume = (weightKg: number, valueNaira: number): number => {
  if (weightKg <= 0 || valueNaira <= 0) return 0;
  
  // Calculate value density (₦ per kg)
  const valueDensity = valueNaira / weightKg;
  
  // Base density assumption (kg/m³)
  // Lower value items (e.g., furniture) have lower density ~50-100 kg/m³
  // Higher value items (e.g., electronics) have higher density ~150-300 kg/m³
  let estimatedDensity: number;
  
  if (valueDensity < 10000) {
    // Low value density - bulky items like furniture, clothing
    estimatedDensity = 75; // kg/m³
  } else if (valueDensity < 100000) {
    // Medium value density - general goods
    estimatedDensity = 150; // kg/m³
  } else {
    // High value density - compact valuable items like electronics
    estimatedDensity = 250; // kg/m³
  }
  
  // Calculate volume: Volume (m³) = Weight (kg) / Density (kg/m³)
  const volumeM3 = weightKg / estimatedDensity;
  
  return volumeM3;
};

export function DriverItemDetails() {
  const navigate = useNavigate();
  const { setItemsData } = useParcel();
  const [items, setItems] = useState<Item[]>([
    { name: '', category: '', value: '', size: '', cubicVolume: '', photo: '' }
  ]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  const handleItemChange = (index: number, field: keyof Item, value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    // Auto-generate HS Code when category changes
    if (field === 'category' && value) {
      newItems[index].hsCode = getHSCode(value);
    }
    
    // Auto-calculate cubic volume when weight or value changes
    if (field === 'size' || field === 'value') {
      const weight = parseFloat(field === 'size' ? value : newItems[index].size);
      const itemValue = parseFloat(field === 'value' ? value : newItems[index].value);
      
      if (!isNaN(weight) && !isNaN(itemValue) && weight > 0 && itemValue > 0) {
        const volume = calculateCubicVolume(weight, itemValue);
        newItems[index].cubicVolume = volume.toFixed(4); // 4 decimal places for m³
      } else {
        newItems[index].cubicVolume = '';
      }
    }
    
    setItems(newItems);
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const newItems = [...items];
      newItems[index].photo = base64String;
      setItems(newItems);
      toast.success('Photo uploaded successfully');
    };
    reader.readAsDataURL(file);
  };

  const handleOtherDocumentChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type (images or PDFs)
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';

    if (!isImage && !isPDF) {
      toast.error('Please select an image or PDF file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const newItems = [...items];
      
      // Initialize otherDocuments array if it doesn't exist
      if (!newItems[index].otherDocuments) {
        newItems[index].otherDocuments = [];
      }

      // Add the new document
      newItems[index].otherDocuments!.push({
        name: file.name,
        data: base64String,
        type: isImage ? 'image' : 'pdf',
      });

      setItems(newItems);
      toast.success(`Document "${file.name}" added successfully`);
    };
    reader.readAsDataURL(file);

    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  const removeOtherDocument = (itemIndex: number, docIndex: number) => {
    const newItems = [...items];
    if (newItems[itemIndex].otherDocuments) {
      newItems[itemIndex].otherDocuments!.splice(docIndex, 1);
      setItems(newItems);
      toast.success('Document removed');
    }
  };

  const openCamera = async (index: number) => {
    setCurrentItemIndex(index);
    setCameraOpen(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, // Use back camera on mobile
        audio: false 
      });
      setVideoStream(stream);
      
      // Set video source after a brief delay to ensure video element is rendered
      setTimeout(() => {
        const video = document.getElementById('camera-feed') as HTMLVideoElement;
        if (video) {
          video.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      toast.error('Unable to access camera. Please check permissions.');
      setCameraOpen(false);
      setCurrentItemIndex(null);
    }
  };

  const closeCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    setCameraOpen(false);
    setCurrentItemIndex(null);
  };

  const capturePhoto = () => {
    const video = document.getElementById('camera-feed') as HTMLVideoElement;
    const canvas = document.createElement('canvas');
    
    if (!video) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to base64
    const base64String = canvas.toDataURL('image/jpeg', 0.8);
    
    if (currentItemIndex !== null) {
      const newItems = [...items];
      newItems[currentItemIndex].photo = base64String;
      setItems(newItems);
      toast.success('Photo captured successfully');
    }
    
    closeCamera();
  };

  const addItem = () => {
    setItems([...items, { name: '', category: '', value: '', size: '', cubicVolume: '', photo: '' }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = items.every(item => item.name && item.category && item.value && item.size);
    if (!isValid) {
      toast.error('Please fill in all item fields');
      return;
    }
    setItemsData(items);
    navigate('/driver/register/receiver');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3">
      <div className="max-w-2xl mx-auto">
        <div className="mb-3">
          <Button variant="ghost" onClick={() => navigate('/driver/register/sender')} className="h-9">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-lg">Item Information</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleNext} className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4 relative">
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                  <h3 className="font-medium">Item {index + 1}</h3>
                  <div className="space-y-2">
                    <Label htmlFor={`name-${index}`}>Item Name</Label>
                    <Input
                      id={`name-${index}`}
                      placeholder="Enter item name"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`category-${index}`}>Item Category</Label>
                    <Select value={item.category} onValueChange={(value) => handleItemChange(index, 'category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="documents">Documents</SelectItem>
                        <SelectItem value="furniture">Furniture</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* HS Code - Auto-generated based on category */}
                  {item.category && (
                    <div className="space-y-2">
                      <Label htmlFor={`hsCode-${index}`}>HS Code (Optional)</Label>
                      <div className="relative">
                        <Input
                          id={`hsCode-${index}`}
                          value={item.hsCode || '—'}
                          readOnly
                          className="bg-green-50 border-green-200 font-mono text-green-900"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600">
                          Auto-generated
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Nigeria Trade Traffic classification code
                      </p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor={`value-${index}`}>Item Value</Label>
                    <Input
                      id={`value-${index}`}
                      type="number"
                      placeholder="Enter value (₦)"
                      value={item.value}
                      onChange={(e) => handleItemChange(index, 'value', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`size-${index}`}>Item Weight (Kg)</Label>
                    <Input
                      id={`size-${index}`}
                      type="number"
                      step="0.01"
                      placeholder="Enter weight in Kg"
                      value={item.size}
                      onChange={(e) => handleItemChange(index, 'size', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`volume-${index}`}>Cubic Volume (m³)</Label>
                    <div className="relative">
                      <Input
                        id={`volume-${index}`}
                        value={item.cubicVolume || '—'}
                        readOnly
                        className="bg-blue-50 border-blue-200 font-mono text-blue-900"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-600">
                        Auto-calculated
                      </span>
                    </div>
                    {item.cubicVolume && (
                      <p className="text-xs text-gray-500">
                        Estimated based on weight and value
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Parcel Picture</Label>
                    
                    {/* Photo capture/upload buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => openCamera(index)}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Take Photo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById(`photo-${index}`)?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                    
                    {/* Hidden file input */}
                    <Input
                      id={`photo-${index}`}
                      name={`photo-${index}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoChange(e, index)}
                      className="hidden"
                    />
                    
                    <p className="text-xs text-gray-500">Max size: 5MB</p>
                    
                    {/* Photo preview */}
                    {item.photo && (
                      <div className="mt-2 relative border-2 border-green-200 rounded-lg overflow-hidden">
                        <img 
                          src={item.photo} 
                          alt={`Parcel ${index + 1} preview`} 
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
                          <Camera className="w-3 h-3" />
                          Photo Added
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute bottom-2 right-2"
                          onClick={() => {
                            const newItems = [...items];
                            newItems[index].photo = '';
                            setItems(newItems);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Form M - Optional */}
                  <div className="space-y-2">
                    <Label htmlFor={`formM-${index}`}>Form M (Optional)</Label>
                    <Input
                      id={`formM-${index}`}
                      placeholder="Enter Form M number"
                      value={item.formM || ''}
                      onChange={(e) => handleItemChange(index, 'formM', e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Form M application number (if applicable)
                    </p>
                  </div>
                  
                  {/* NXP Number - Optional */}
                  <div className="space-y-2">
                    <Label htmlFor={`nxpNumber-${index}`}>NXP Number (Optional)</Label>
                    <Input
                      id={`nxpNumber-${index}`}
                      placeholder="Enter NXP number"
                      value={item.nxpNumber || ''}
                      onChange={(e) => handleItemChange(index, 'nxpNumber', e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Nigeria Export Proceeds Form number (if applicable)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Other Documents (Optional)</Label>
                    
                    {/* Document upload button */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById(`document-${index}`)?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Document
                      </Button>
                    </div>
                    
                    {/* Hidden file input */}
                    <Input
                      id={`document-${index}`}
                      name={`document-${index}`}
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleOtherDocumentChange(e, index)}
                      className="hidden"
                    />
                    
                    <p className="text-xs text-gray-500">Max size: 5MB</p>
                    
                    {/* Document previews */}
                    {item.otherDocuments && item.otherDocuments.length > 0 && (
                      <div className="mt-2">
                        {item.otherDocuments.map((doc, docIndex) => (
                          <div key={docIndex} className="relative border-2 border-gray-200 rounded-lg overflow-hidden mb-2">
                            {doc.type === 'image' ? (
                              <img 
                                src={doc.data} 
                                alt={`Document ${docIndex + 1} preview`} 
                                className="w-full h-48 object-cover"
                              />
                            ) : (
                              <div className="w-full h-48 flex items-center justify-center bg-gray-100">
                                <FileText className="w-10 h-10 text-gray-500" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2 bg-gray-600 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
                              <File className="w-3 h-3" />
                              {doc.name}
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute bottom-2 right-2"
                              onClick={() => removeOtherDocument(index, docIndex)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" className="w-full" onClick={addItem}>
                <Plus className="w-4 h-4 mr-2" />
                Add Another Item
              </Button>
              <Button type="submit" className="w-full" size="lg">
                Next
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Camera Modal */}
      {cameraOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg overflow-hidden">
            <div className="relative">
              {/* Camera header */}
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent z-10 p-4 flex justify-between items-center">
                <h3 className="text-white font-medium">Take Parcel Photo</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={closeCamera}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Camera feed */}
              <video
                id="camera-feed"
                autoPlay
                playsInline
                className="w-full aspect-video bg-black"
              />
              
              {/* Capture button */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-6 flex justify-center">
                <Button
                  type="button"
                  size="lg"
                  className="rounded-full w-16 h-16 p-0 bg-white hover:bg-gray-100"
                  onClick={capturePhoto}
                >
                  <div className="w-14 h-14 rounded-full border-4 border-gray-800" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}