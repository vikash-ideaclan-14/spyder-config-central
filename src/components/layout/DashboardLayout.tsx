import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Settings, 
  LayoutDashboard, 
  Menu, 
  X, 
  SunMoon, 
  Moon,
  Layers,
  Cog,
  FileText
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useApp } from '@/context/AppContext';

type NavLinkProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
};

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label, isActive }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
      isActive 
        ? 'bg-spyder-teal text-white font-medium' 
        : 'text-gray-200 hover:bg-spyder-dark-blue/30'
    }`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isDarkMode, toggleDarkMode } = useApp();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/configs', label: 'Configurations', icon: <Cog size={20} /> },
    { path: '/ads', label: 'Advertisements', icon: <FileText size={20} /> },
    { path: '/batches', label: 'Spyder Batches', icon: <Layers size={20} /> },
    { path: '/groups', label: 'Spyder Groups', icon: <Layers size={20} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-spyder-light-gray dark:bg-gray-900 overflow-x-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col bg-spyder-dark-blue shrink-0">
        <div className="p-4 flex items-center justify-center border-b border-spyder-dark-blue/50">
          <h1 className="text-white text-xl font-bold">Spyder Config</h1>
        </div>

        <div className="flex-1 py-6 px-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              icon={link.icon}
              label={link.label}
              isActive={location.pathname === link.path}
            />
          ))}
        </div>

        <div className="p-4 border-t border-spyder-dark-blue/50">
          <div className="flex flex-col gap-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-spyder-dark-blue/30"
              onClick={toggleDarkMode}
            >
              {isDarkMode ? <SunMoon size={20} /> : <Moon size={20} />}
              <span className="ml-3">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-spyder-dark-blue border-r-0">
          <div className="p-4 flex items-center justify-between border-b border-spyder-dark-blue/50">
            <h1 className="text-white text-xl font-bold">Spyder Config</h1>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-spyder-dark-blue/30"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={20} />
            </Button>
          </div>

          <div className="flex-1 py-6 px-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                icon={link.icon}
                label={link.label}
                isActive={location.pathname === link.path}
              />
            ))}
          </div>

          <div className="p-4 border-t border-spyder-dark-blue/50">
            <div className="flex flex-col gap-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-spyder-dark-blue/30"
                onClick={toggleDarkMode}
              >
                {isDarkMode ? <SunMoon size={20} /> : <Moon size={20} />}
                <span className="ml-3">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
            </Sheet>
            <h1 className="text-xl font-semibold ml-2 md:ml-0">
              {navLinks.find(link => link.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              className="md:hidden" 
              size="icon"
              onClick={toggleDarkMode}
            >
              {isDarkMode ? <SunMoon size={20} /> : <Moon size={20} />}
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="max-w-full">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-6 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Spyder Config Central. All rights reserved.
        </footer>
      </div>
    </div>
  );
};
