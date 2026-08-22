import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Lock, Mail, ArrowRight, Shield, Store, User } from 'lucide-react';
import { login, clearAuthError } from '../redux/slices/authSlice';
import Alert from '../components/common/Alert';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { userInfo, loading, error } = useSelector((state) => state.auth);

  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  useEffect(() => {
    dispatch(clearAuthError());
    if (userInfo) {
      if (userInfo.role === 'Vendor' && redirect === '/') {
        navigate('/vendor/dashboard');
      } else if (userInfo.role === 'Admin' && redirect === '/') {
        navigate('/admin/dashboard');
      } else {
        navigate(redirect);
      }
    }
  }, [userInfo, navigate, redirect, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  // Quick 1-click test credentials for instant evaluation
  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    dispatch(login({ email: demoEmail, password: demoPass }));
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-display font-extrabold text-slate-900">Welcome Back</h1>
        <p className="text-xs text-slate-500">Sign in to your customer, vendor, or admin account</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => dispatch(clearAuthError())} />}

      {/* Main Login Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-glow flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to={`/register?redirect=${redirect}`} className="text-brand-600 font-bold hover:underline">
            Sign up now
          </Link>
        </div>

        {/* Quick Demo Logins Section */}
        <div className="pt-6 border-t border-slate-100 space-y-3">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            Instant Demo Account Sign-In
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@ecommerce.com', 'password123')}
              className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold border border-amber-200 flex items-center gap-2 transition-colors text-left"
            >
              <Shield className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-[11px] font-bold">Admin</p>
                <p className="text-[9px] text-amber-600">Platform Control</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('techgear@vendor.com', 'password123')}
              className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-semibold border border-purple-200 flex items-center gap-2 transition-colors text-left"
            >
              <Store className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <div>
                <p className="text-[11px] font-bold">Vendor 1</p>
                <p className="text-[9px] text-purple-600">TechGear Prime</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('urbanstyle@vendor.com', 'password123')}
              className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-semibold border border-indigo-200 flex items-center gap-2 transition-colors text-left"
            >
              <Store className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <div>
                <p className="text-[11px] font-bold">Vendor 2</p>
                <p className="text-[9px] text-indigo-600">UrbanStyle</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('sarah@customer.com', 'password123')}
              className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200 flex items-center gap-2 transition-colors text-left"
            >
              <User className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-[11px] font-bold">Customer</p>
                <p className="text-[9px] text-emerald-600">Sarah Shopper</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
