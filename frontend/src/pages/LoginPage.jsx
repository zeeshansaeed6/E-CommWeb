import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { login, clearAuthError } from '../redux/slices/authSlice';
import Alert from '../components/common/Alert';
import AuthShell, { AuthField, AUTH_INPUT } from '../components/auth/AuthShell';

// Demo accounts, each tinted with the accent of the theme it feels like
const DEMOS = [
  { label: 'Admin', note: 'Platform control', email: 'admin@ecommerce.com', color: '#f59e0b' },
  { label: 'TechGear Prime', note: 'Vendor · tech', email: 'techgear@vendor.com', color: '#0071e3' },
  { label: 'UrbanStyle', note: 'Vendor · fashion', email: 'urbanstyle@vendor.com', color: '#f97316' },
  { label: 'Sarah Shopper', note: 'Customer', email: 'sarah@customer.com', color: '#e8a0b4' },
];

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
  const handleQuickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    dispatch(login({ email: demoEmail, password: 'password123' }));
  };

  return (
    <AuthShell>
      <div>
        <h1 className="text-5xl font-sans font-semibold tracking-[-0.045em] text-slate-900">Welcome back.</h1>
        <p className="mt-3 text-slate-500">Sign in as a customer, vendor or admin.</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => dispatch(clearAuthError())} />}

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField label="Email" icon={Mail}>
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className={AUTH_INPUT} />
        </AuthField>

        <AuthField label="Password" icon={Lock}>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={`${AUTH_INPUT} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-400 hover:text-slate-700"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </AuthField>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 py-4 text-sm font-bold text-white transition hover:bg-slate-800 active:scale-[.98] disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        New here?{' '}
        <Link to={`/register?redirect=${redirect}`} className="font-semibold text-slate-900 underline underline-offset-4">
          Create an account
        </Link>
      </p>

      <div className="space-y-3 border-t border-slate-100 pt-6">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">Try a demo account</p>
        <div className="grid grid-cols-2 gap-2">
          {DEMOS.map((d) => (
            <button
              key={d.email}
              type="button"
              onClick={() => handleQuickLogin(d.email)}
              disabled={loading}
              className="group flex items-center gap-3 rounded-2xl p-3 text-left ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
            >
              <span className="h-8 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-slate-900">{d.label}</span>
                <span className="block truncate text-[11px] text-slate-500">{d.note}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </AuthShell>
  );
};

export default LoginPage;
