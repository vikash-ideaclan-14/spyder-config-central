import React from 'react';
import { Link } from 'react-router-dom';

type AuthLayoutProps = {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  type: 'login' | 'signup';
};

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  type
}) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-x-hidden">
      {/* Left side - Branding */}
      <div className="w-full md:w-1/2 bg-spyder-dark-blue text-white flex flex-col justify-center p-8 md:p-16 shrink-0">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Spyder Config Central</h1>
          <p className="text-lg md:text-xl opacity-90 mb-8">
            Centralized configuration management for all your Spyder applications.
          </p>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="mt-1 bg-spyder-teal rounded-full p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Centralized Configuration</h3>
                <p className="opacity-75 text-sm md:text-base">Manage all your configurations in one place</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="mt-1 bg-spyder-teal rounded-full p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Advertisement Management</h3>
                <p className="opacity-75 text-sm md:text-base">Track and control all your ad campaigns</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="mt-1 bg-spyder-teal rounded-full p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Batch Processing</h3>
                <p className="opacity-75 text-sm md:text-base">Efficiently manage batch jobs and tasks</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Auth form */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-8 min-w-0">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            <p className="mt-2 text-gray-600">{subtitle}</p>
          </div>
          
          {children}
          
          <div className="text-center text-sm">
            {type === 'login' ? (
              <p>
                Don't have an account?{' '}
                <Link to="/signup" className="text-spyder-teal font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <Link to="/login" className="text-spyder-teal font-medium hover:underline">
                  Log in
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
