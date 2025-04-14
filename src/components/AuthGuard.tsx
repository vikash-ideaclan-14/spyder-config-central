
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Skip auth check for login, signup, and forgot password pages
    const publicPaths = ['/login', '/signup', '/forgot-password'];
    const isPublicPath = publicPaths.includes(location.pathname);

    if (!isAuthenticated && !isPublicPath) {
      // Redirect to login with return path
      navigate(`/login?returnUrl=${encodeURIComponent(location.pathname)}`, { replace: true });
    }
  }, [isAuthenticated, navigate, location.pathname]);

  // If on a protected route and not authenticated, don't render children
  if (!isAuthenticated && location.pathname !== '/login' && location.pathname !== '/signup' && location.pathname !== '/forgot-password') {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
