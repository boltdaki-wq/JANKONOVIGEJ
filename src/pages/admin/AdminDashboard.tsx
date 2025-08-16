import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  Plus,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';
import DiscountManagement from './DiscountManagement';
import FakeDiscountManagement from './FakeDiscountManagement';
import StockManagement from './StockManagement';
import ReferralManagement from './ReferralManagement';
import { supabase } from '../../lib/supabase';

const AdminDashboard: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const fetchStats = async () => {
    try {
      // Fetch products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Fetch orders stats
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, status');

      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0;

      setStats({
        totalProducts: productsCount || 0,
        totalOrders,
        totalRevenue,
        pendingOrders
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const statCards = [
    {
      title: 'Ukupno Proizvoda',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Ukupno Porudžbina',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-green-500',
    },
    {
      title: 'Prihod',
      value: `${stats.totalRevenue.toFixed(0)} RSD`,
      icon: DollarSign,
      color: 'bg-yellow-500',
    },
    {
      title: 'Porudžbine na Čekanju',
      value: stats.pendingOrders,
      icon: Users,
      color: 'bg-purple-500',
    },
  ];

  const tabs = [
    { id: 'overview', name: 'Pregled', icon: BarChart3 },
    { id: 'products', name: 'Proizvodi', icon: Package },
    { id: 'stock', name: 'Stock Upravljanje', icon: Package },
    { id: 'orders', name: 'Porudžbine', icon: ShoppingCart },
    { id: 'discounts', name: 'Kodovi za Popust', icon: Settings },
    { id: 'fake-discounts', name: 'Lažni Popust', icon: Package },
    { id: 'referrals', name: 'Referral Sistem', icon: Users },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductManagement />;
      case 'stock':
        return <StockManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'discounts':
        return <DiscountManagement />;
      case 'fake-discounts':
        return <FakeDiscountManagement />;
      case 'referrals':
        return <ReferralManagement />;
      default:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat) => (
                <div key={stat.title} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Brze Akcije</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('products')}
                  className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Dodaj Novi Proizvod</span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <ShoppingCart className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">Upravljaj Porudžbinama</span>
                </button>
                <button
                  onClick={() => setActiveTab('discounts')}
                  className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-900">Kodovi za Popust</span>
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">GmShop Admin</h1>
              <p className="text-sm text-gray-600">Upravljajte vašom prodavnicom</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Odjavi se</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="bg-white rounded-xl shadow-lg p-4">
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-900 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;