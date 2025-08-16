import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ReferralProvider } from './contexts/ReferralContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import ContactPage from './pages/ContactPage';
import GiveawayPage from './pages/GiveawayPage';
import GiveawayParticipate from './pages/GiveawayParticipate';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ReferralLogin from './pages/referral/ReferralLogin';
import ReferralDashboard from './pages/referral/ReferralDashboard';
import SellAccountPage from './pages/SellAccountPage';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Nešto je pošlo po zlu
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Molimo osvežite stranicu ili se vratite na početnu.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Nazad na početnu
            </button>
          </div>
        </div>
      );
    }
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ReferralProvider>
            <CartProvider>
              <Router>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                  <Routes>
                    <Route path="/admin" element={<AdminLogin />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/referral" element={<ReferralLogin />} />
                    <Route path="/referral/dashboard" element={<ReferralDashboard />} />
                    <Route path="/" element={
                      <>
                        <Header />
                        <HomePage />
                      </>
                    } />
                    <Route path="/cart" element={
                      <>
                        <Header />
                        <CartPage />
                      </>
                    } />
                    <Route path="/sell" element={
                      <>
                        <Header />
                        <SellAccountPage />
                      </>
                    } />
                    <Route path="/giveaways" element={
                      <>
                        <Header />
                        <GiveawayPage />
                      </>
                    } />
                    <Route path="/giveaway/:id" element={
                      <>
                        <Header />
                        <GiveawayParticipate />
                      </>
                    } />
                    <Route path="/contact" element={
                      <>
                        <Header />
                        <ContactPage />
                      </>
                    } />
                    {/* Catch all route - redirect to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </Router>
            </CartProvider>
          </ReferralProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

    return this.props.children;
  }
}

export default App;