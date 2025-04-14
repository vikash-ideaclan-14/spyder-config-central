
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 inline-flex items-center justify-center h-24 w-24 rounded-full bg-red-100 dark:bg-red-900/20">
          <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-6xl font-bold text-spyder-dark-blue dark:text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Page not found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
          <br />
          <span className="text-sm text-muted-foreground">
            URL: {location.pathname}
          </span>
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-spyder-teal hover:bg-spyder-teal/90">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Go to Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
