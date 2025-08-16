import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Store, Shield, Moon, Sun, Users, Gift, DollarSign, Instagram, MessageCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';

const Header: React.FC = () => {
  const { getTotalItems } = useCart();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 transition-all duration-300 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6 animate-fade-in">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Store className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">GmShop</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">Premium Gaming Prodavnica</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-all duration-300 hover:scale-105">
              Proizvodi
            </Link>
            <Link to="/sell" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-all duration-300 hover:scale-105">
              Prodaj Account
            </Link>
            <Link to="/giveaways" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-all duration-300 hover:scale-105">
              Giveaway
            </Link>
            <Link to="/contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-all duration-300 hover:scale-105">
              Kontakt
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all duration-300"
            >
              <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all duration-300 hover:scale-110 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md"
              title={isDarkMode ? 'Svetli režim' : 'Tamni režim'}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
            <Link 
              to="/cart" 
              className="relative p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 dark:bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce font-bold">
                  {getTotalItems()}
                </span>
              )}
            </Link>
            <Link
              to="/giveaways"
              className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md"
              title="Giveaway"
            >
              <Gift className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </Link>
            <Link
              to="/referral"
              className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md"
              title="Referral Panel"
            >
              <Users className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </Link>
            <Link
              to="/admin"
              className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md"
              title="Admin Panel"
            >
              <Shield className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="px-4 py-4 space-y-3">
            <Link 
              to="/" 
              className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium py-2 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Proizvodi
            </Link>
            <Link 
              to="/sell" 
              className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium py-2 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Prodaj Account
            </Link>
            <Link 
              to="/giveaways" 
              className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium py-2 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Giveaway
            </Link>
            <Link 
              to="/contact" 
              className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium py-2 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Kontakt
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;