// src/components/ProtectedRoute.jsx
// Protected route component for admin-only pages

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, userRole, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-construction-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600 font-semibold">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but not admin (when admin is required)
  if (requireAdmin && userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="max-w-md w-full bg-white border-3 border-neutral-900 p-8 text-center construction-shadow">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-black text-neutral-900 mb-4 uppercase">Access Denied</h2>
          <p className="text-neutral-600 mb-6">
            You don't have permission to access this page. Admin access is required.
          </p>
          <div className="space-y-3">
            <a
              href="/"
              className="block w-full bg-construction-yellow hover:bg-construction-orange text-neutral-900 font-bold py-3 px-6 border-3 border-neutral-900 uppercase transition-all"
            >
              Go to Homepage
            </a>
            <button
              onClick={() => window.history.back()}
              className="block w-full bg-white hover:bg-neutral-100 text-neutral-700 font-bold py-3 px-6 border-2 border-neutral-300 uppercase transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authorized - render children
  return children;
};

export default ProtectedRoute;
