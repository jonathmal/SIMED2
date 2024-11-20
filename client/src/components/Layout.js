// components/Layout.js
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { User } from 'lucide-react';
import { authService } from '@/services/auth.service';

const Layout = ({ children }) => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    setIsClient(true);
    const checkAuth = async () => {
      try {
        // Use auth service instead of direct localStorage access
        if (!authService.isAuthenticated()) {
          if (router.pathname !== '/login') {
            router.push('/login');
          }
          return;
        }
        
        const currentUser = authService.getCurrentUser();
        setUsuario(currentUser);
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router.pathname]);

  const handleLogout = () => {
    try {
      authService.logout();
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (!isClient || (!authService.isAuthenticated() && router.pathname !== '/login')) {
    return null;
  }

  const navigationLinks = [
    { href: "/interconsulta", label: "Ver Interconsultas" },
    { href: "/interconsulta/crear", label: "Crear Interconsulta" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo/title */}
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-800">
                  Sistema de Interconsultas
                </h1>
              </div>
              {/* Desktop navigation */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigationLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium
                      ${router.pathname === link.href
                        ? "border-blue-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* User info and logout */}
            <div className="flex items-center">
              {usuario && (
                <div className="mr-4 px-3 py-2 rounded-lg bg-gray-100 text-sm flex items-center">
                  <User className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <span className="font-medium text-gray-700">
                      {usuario.nombre || usuario.email}
                    </span>
                    <span className="ml-2 text-gray-500 text-xs">
                      {usuario.rol || 'Usuario'}
                    </span>
                  </div>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cerrar sesión
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigationLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block pl-3 pr-4 py-2 text-base font-medium ${
                    router.pathname === link.href
                      ? "bg-blue-50 border-l-4 border-blue-500 text-blue-700"
                      : "border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;