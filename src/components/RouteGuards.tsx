import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Blocks anonymous access to secret pages (Dashboard)
export function PrivateRoute() {
  const { user, isLoading } = useAuth();

  // While figuring out if logged in or not, shows white screen or a spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If there's no logged in user, kick to login screen
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If passed everything, allows the app to render the route
  return <Outlet />;
}

// Prevents logged in users from visiting Login or Register screen again
export function PublicRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If logged in, throw straight to Dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
