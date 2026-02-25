import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Truck, AlertCircle, Upload, User, Phone, Building, Car, Shield, CreditCard, Hash } from 'lucide-react';
import { toast } from 'sonner';
import { signUp } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { ChevronLeft } from 'lucide-react';

export function DriverSignUp() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    companyName: '',
    vehicleNumber: '',
    vinNumber: '',
    vehicleDescription: '',
    vehicleInsuranceNumber: '',
    driverNIN: '',
    password: '',
    confirmPassword: '',
  });
  const [driverPhoto, setDriverPhoto] = useState<string | null>(null);
  const [licensePhoto, setLicensePhoto] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'driver' | 'license') => {
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
      if (type === 'driver') {
        setDriverPhoto(base64String);
      } else {
        setLicensePhoto(base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.fullName || !formData.phone || !formData.companyName || 
        !formData.vehicleNumber || !formData.vinNumber || !formData.vehicleDescription || 
        !formData.vehicleInsuranceNumber || !formData.driverNIN || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!driverPhoto || !licensePhoto) {
      toast.error('Please upload both driver photo and license photo');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await signUp({
        phone: formData.phone,
        password: formData.password,
        fullName: formData.fullName,
        role: 'driver',
        vehicleNumber: formData.vehicleNumber,
        vinNumber: formData.vinNumber,
        companyName: formData.companyName,
        vehicleDescription: formData.vehicleDescription,
        vehicleInsuranceNumber: formData.vehicleInsuranceNumber,
        driverNIN: formData.driverNIN,
        driverPhoto,
        licensePhoto,
      });
      
      toast.success('Account created successfully!');
      
      // Check if we're using client auth mode
      const { isClientAuthMode } = await import('@/lib/client-auth');
      if (isClientAuthMode()) {
        // For client auth, reload to ensure AuthContext picks up the session
        console.log('Client auth mode - reloading to initialize session');
        setTimeout(() => {
          window.location.href = '/driver/home';
        }, 500);
      } else {
        // For Supabase auth, navigate normally
        navigate('/driver/home');
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Handle specific error for existing user
      if (error.message?.includes('already exists') || error.message?.includes('Please login')) {
        toast.error('This phone number is already registered. Please login instead.');
        setTimeout(() => navigate('/driver/login'), 2000);
      } else {
        toast.error(error.message || 'Sign up failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3">
      <div className="max-w-md mx-auto">
        <div className="mb-3">
          <Button variant="ghost" onClick={() => navigate('/driver/login')} className="h-9">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Login
          </Button>
        </div>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-lg">Driver Sign Up</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleNext} className="space-y-4">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Enter full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter phone number with country code"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                  <p className="text-xs text-gray-500">Format: +1234567890</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="driverNIN">Driver NIN *</Label>
                  <Input
                    id="driverNIN"
                    name="driverNIN"
                    placeholder="Enter driver NIN"
                    value={formData.driverNIN}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="driverPhoto">Driver Photo *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="driverPhoto"
                      name="driverPhoto"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'driver')}
                      disabled={loading}
                      required
                      className="cursor-pointer"
                    />
                    {driverPhoto && <span className="text-green-600 text-sm">✓</span>}
                  </div>
                  <p className="text-xs text-gray-500">Max size: 5MB</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="licensePhoto">Driver's License Photo *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="licensePhoto"
                      name="licensePhoto"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'license')}
                      disabled={loading}
                      required
                      className="cursor-pointer"
                    />
                    {licensePhoto && <span className="text-green-600 text-sm">✓</span>}
                  </div>
                  <p className="text-xs text-gray-500">Max size: 5MB</p>
                </div>
              </div>

              {/* Company Information */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Company Information
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    placeholder="Enter company name"
                    value={formData.companyName}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Vehicle Information
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
                  <Input
                    id="vehicleNumber"
                    name="vehicleNumber"
                    placeholder="Enter vehicle number"
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vinNumber">VIN Number *</Label>
                  <Input
                    id="vinNumber"
                    name="vinNumber"
                    placeholder="Enter VIN number"
                    value={formData.vinNumber}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vehicleDescription">Vehicle Description *</Label>
                  <Input
                    id="vehicleDescription"
                    name="vehicleDescription"
                    placeholder="e.g., Toyota Hilux, White"
                    value={formData.vehicleDescription}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vehicleInsuranceNumber">Vehicle Insurance Number *</Label>
                  <Input
                    id="vehicleInsuranceNumber"
                    name="vehicleInsuranceNumber"
                    placeholder="Enter vehicle insurance number"
                    value={formData.vehicleInsuranceNumber}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Security */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter password (min 6 characters)"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Creating account...' : 'Register'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}