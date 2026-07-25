import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../ui/Toast';

export const Layout: React.FC = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isAuth = ['/login', '/register', '/forgot-password'].includes(location.pathname);

  if (isLanding || isAuth) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-[#090d16]">
        {!isAuth && <Navbar />}
        <main className="flex-1">
          <Outlet />
        </main>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex gap-6 flex-1">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};
