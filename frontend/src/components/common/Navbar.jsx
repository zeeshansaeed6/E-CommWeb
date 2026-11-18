import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ShoppingBag,
  ShoppingCart,
  User,
  LogOut,
  Store,
  ShieldCheck,
  ChevronDown,
  Search,
  Package,
  CreditCard,
  DollarSign,
  Heart,
} from 'lucide-react';
import { logout } from '../../redux/slices/authSlice';
import CurrencySelector from './CurrencySelector';
import SearchBox from './SearchBox';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const wishCount = useSelector((state) => state.wishlist.items.length);

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);


  const handleLogout = () => {
    dispatch(logout());
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2 sm:gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group flex-shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform duration-300">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-display font-black tracking-tight text-slate-900">
                Omni<span className="gradient-text">Market</span>
              </span>
              <span className="hidden sm:block text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                Multi-Vendor Platform
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <SearchBox variant="desktop" />

          {/* Actions & User Nav */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Currency Switcher */}
            <CurrencySelector />

            {/* Vendor Portal Link */}
            {userInfo && userInfo.role === 'Vendor' && (
              <Link
                to="/vendor/dashboard"
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold border border-purple-200 transition-colors"
              >
                <Store className="w-4 h-4" />
                Vendor Hub
              </Link>
            )}

            {/* Admin Portal Link */}
            {userInfo && userInfo.role === 'Admin' && (
              <Link
                to="/admin/dashboard"
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-semibold border border-amber-200 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Panel
              </Link>
            )}

            {/* Wishlist */}
            <Link
              to="/wishlist"
              aria-label={`Wishlist (${wishCount})`}
              className="relative p-2.5 text-slate-700 hover:text-rose-500 rounded-xl hover:bg-slate-100 transition-colors hidden sm:flex items-center"
            >
              <Heart className="w-6 h-6" />
              {wishCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                  {wishCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2.5 text-slate-700 hover:text-brand-600 rounded-xl hover:bg-slate-100 transition-colors flex items-center"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* User Dropdown / Auth CTA */}
            {userInfo ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-2 pr-3 bg-slate-100 hover:bg-slate-200/80 rounded-full border border-slate-200 transition-colors"
                >
                  <img
                    src={userInfo.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={userInfo.name}
                    className="w-8 h-8 rounded-full object-cover border border-white"
                  />
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">
                      {userInfo.name.split(' ')[0]}
                    </p>
                    <span className="text-[10px] font-medium text-brand-600 uppercase">
                      {userInfo.role}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-600">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{userInfo.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-brand-50 text-brand-700">
                        {userInfo.role} Account
                      </span>
                    </div>

                    <Link
                      to="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      My Orders & Tracking
                    </Link>

                    {userInfo.role === 'Vendor' && (
                      <>
                        <Link
                          to="/vendor/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition-colors"
                        >
                          <Store className="w-4 h-4 text-purple-500" />
                          Vendor Overview
                        </Link>
                        <Link
                          to="/vendor/products"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition-colors"
                        >
                          <Package className="w-4 h-4 text-purple-500" />
                          Manage Catalog
                        </Link>
                        <Link
                          to="/vendor/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4 text-purple-500" />
                          Fulfillment & Orders
                        </Link>
                      </>
                    )}

                    {userInfo.role === 'Admin' && (
                      <>
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-500" />
                          Platform Dashboard
                        </Link>
                        <Link
                          to="/admin/users"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-amber-500" />
                          User Directory
                        </Link>
                        <Link
                          to="/admin/payouts"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 transition-colors"
                        >
                          <CreditCard className="w-4 h-4 text-amber-500" />
                          Escrow Payouts
                        </Link>
                      </>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="hidden sm:block px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="whitespace-nowrap px-3.5 sm:px-4 py-2 text-sm font-semibold bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white rounded-xl shadow-sm hover:shadow-glow transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <SearchBox variant="mobile" />
    </header>
  );
};

export default Navbar;
