import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Truck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/app/context/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';

export function DriverLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phone || !formData.password) {
      toast.error('Please enter phone and password');
      return;
    }

    setLoading(true);
    try {
      await login(formData.phone, formData.password, 'driver');
      toast.success('Login successful!');
      
      // Check if we're using client auth mode
      const { isClientAuthMode } = await import('@/lib/client-auth');
      if (isClientAuthMode()) {
        // For client auth, reload to ensure everything is properly initialized
        console.log('Client auth mode - reloading to initialize session');
        setTimeout(() => {
          window.location.href = '/driver/home';
        }, 500);
      } else {
        // For Supabase auth, navigate normally
        navigate('/driver/home');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-3">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center p-4">
          <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Truck className="w-7 h-7 text-white" />
          </div>
          <CardTitle className="text-xl">Driver Login</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {!isSupabaseConfigured && (
            <Alert className="mb-4 bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-900 text-sm">Using Client-Side Authentication</AlertTitle>
              <AlertDescription className="text-blue-800 text-xs">
                Supabase is not configured. The app will use client-side authentication for development.
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
                name="phone"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                name="password"
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full h-11" size="lg" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/driver/signup"
                className="text-blue-600 hover:underline"
                disabled={loading}
              >
                Sign Up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}