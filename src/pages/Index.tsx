
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login page
    navigate('/login');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-spyder-teal mb-4"></div>
        <h1 className="text-2xl font-bold mb-2">Redirecting to Spyder Config Central</h1>
        <p className="text-gray-600 dark:text-gray-400">Please wait...</p>
      </div>
    </div>
  );
};

export default Index;
