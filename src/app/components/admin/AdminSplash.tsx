import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Shield } from 'lucide-react';

export function AdminSplash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if admin is already logged in
      const adminSession = localStorage.getItem('gts_admin_session');
      if (adminSession) {
        navigate('/admin/dashboard');
      } else {
        navigate('/admin/login');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Shield className="w-10 h-10 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">NEWDAY Admin</h1>
        <p className="text-lg text-purple-100">System Management Portal</p>
      </div>
    </div>
  );
}
