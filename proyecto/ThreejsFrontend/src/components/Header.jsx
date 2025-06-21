import { Link, useLocation } from 'react-router-dom';
import { Recycle, Home, BarChart3, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 md:py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="p-1.5 md:p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg md:rounded-xl">
              <Recycle className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <span className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              EcoScan 3D
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg transition-all duration-200 ${
                location.pathname === '/'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              <Home className="h-4 w-4" />
              <span className="text-sm lg:text-base">Inicio</span>
            </Link>
            <Link
              to="/dashboard"
              className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg transition-all duration-200 ${
                location.pathname === '/dashboard'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span className="text-sm lg:text-base">Dashboard</span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-emerald-100 py-3">
            <nav className="flex flex-col space-y-2">
              <Link
                to="/"
                onClick={closeMobileMenu}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  location.pathname === '/'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                <Home className="h-5 w-5" />
                <span className="text-base font-medium">Inicio</span>
              </Link>
              <Link
                to="/dashboard"
                onClick={closeMobileMenu}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  location.pathname === '/dashboard'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                <span className="text-base font-medium">Dashboard</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
