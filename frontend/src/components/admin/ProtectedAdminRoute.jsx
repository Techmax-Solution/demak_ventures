import { Navigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';

const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAdmin();

  if (loading) {
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
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
