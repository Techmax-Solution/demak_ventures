import { Navigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';

const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAdmin();

  console.log('🛡️ ProtectedAdminRoute: Checking access', {
    isAuthenticated,
    isAdmin,
    loading
  });

  if (loading) {
    console.log('🛡️ ProtectedAdminRoute: Still loading...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    console.log('🛡️ ProtectedAdminRoute: Access denied, redirecting to login');
    return <Navigate to="/admin/login" replace />;
  }

  console.log('🛡️ ProtectedAdminRoute: Access granted, rendering children');
  return children;
};

export default ProtectedAdminRoute;
