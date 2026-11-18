import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import Loader from './components/common/Loader';
import Toaster from './components/common/Toaster';

// Pages
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const OrderDetailsPage = lazy(() => import('./pages/OrderDetailsPage'));
const OrderHistoryPage = lazy(() => import('./pages/OrderHistoryPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const VendorDashboardPage = lazy(() => import('./pages/vendor/VendorDashboardPage'));
const VendorProductsPage = lazy(() => import('./pages/vendor/VendorProductsPage'));
const VendorOrdersPage = lazy(() => import('./pages/vendor/VendorOrdersPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminPayoutsPage = lazy(() => import('./pages/admin/AdminPayoutsPage'));

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen font-sans bg-slate-50 text-slate-900">
        <Navbar />
        <Toaster />
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Suspense fallback={<Loader message="Loading..." />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/order-success/:sessionId" element={<OrderSuccessPage />} />

            {/* Protected Customer Routes */}
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrderHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <OrderDetailsPage />
                </ProtectedRoute>
              }
            />

            {/* Vendor Only Routes */}
            <Route
              path="/vendor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['Vendor', 'Admin']}>
                  <VendorDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/products"
              element={
                <ProtectedRoute allowedRoles={['Vendor', 'Admin']}>
                  <VendorProductsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/orders"
              element={
                <ProtectedRoute allowedRoles={['Vendor', 'Admin']}>
                  <VendorOrdersPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Only Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payouts"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminPayoutsPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
