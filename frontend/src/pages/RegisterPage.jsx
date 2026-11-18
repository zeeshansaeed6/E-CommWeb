import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Lock, Mail, User, Store, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { register, clearAuthError } from '../redux/slices/authSlice';
import Alert from '../components/common/Alert';
import AuthShell, { AuthField, AUTH_INPUT } from '../components/auth/AuthShell';

const STRENGTH = [
  ['Too short', '#e2e8f0'],
  ['Weak', '#ef4444'],
  ['Okay', '#f59e0b'],
  ['Good', '#10b981'],
  ['Strong', '#0071e3'],
];

// 0 = too short (<6). Otherwise 1, plus a point each for length 8+, a capital, a number and a symbol (max 4)
const strengthOf = (pw) => {
  if (pw.length < 6) return 0;
  const extras = [pw.length >= 8, /[A-Z]/.test(pw), /\d/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
  return Math.min(4, 1 + extras);
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('Customer');
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');

  const { userInfo, loading, error } = useSelector((state) => state.auth);

  const redirect = new URLSearchParams(location.search).get('redirect') || '/';
  const strength = strengthOf(password);
  const [strengthLabel, strengthColor] = STRENGTH[strength];

  useEffect(() => {
    dispatch(clearAuthError());
    if (userInfo) {
      if (userInfo.role === 'Vendor') {
        navigate('/vendor/dashboard');
      } else {
        navigate(redirect);
      }
    }
  }, [userInfo, navigate, redirect, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(
      register({
        name,
        email,
        password,
        role,
        storeName: role === 'Vendor' ? storeName : undefined,
        storeDescription: role === 'Vendor' ? storeDescription : undefined,
      })
    );
  };

  const isVendor = role === 'Vendor';

  return (
    <AuthShell>
      <div>
        <h1 className="text-5xl font-sans font-semibold tracking-[-0.045em] text-slate-900">Create your account.</h1>
        <p className="mt-3 text-slate-500">Shop as a customer, or open your own store.</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => dispatch(clearAuthError())} />}

      {/* Role switch with a sliding pill */}
      <div className="relative grid grid-cols-2 rounded-full bg-slate-100 p-1" role="tablist" aria-label="Account type">
        <span
          className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-white shadow transition-transform duration-300 ease-out"
          style={{ transform: isVendor ? 'translateX(100%)' : 'translateX(0)' }}
          aria-hidden="true"
        />
        {[
          ['Customer', User],
          ['Vendor', Store],
        ].map(([r, Icon]) => (
          <button
            key={r}
            type="button"
            role="tab"
            aria-selected={role === r}
            onClick={() => setRole(r)}
            className={`relative z-10 flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-colors ${role === r ? 'text-slate-900' : 'text-slate-500'}`}
          >
            <Icon className="h-4 w-4" /> {r === 'Vendor' ? 'Vendor store' : r}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField label="Full name" icon={User}>
          <input type="text" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className={AUTH_INPUT} />
        </AuthField>

        <AuthField label="Email" icon={Mail}>
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" className={AUTH_INPUT} />
        </AuthField>

        <div>
          <AuthField label="Password" icon={Lock}>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
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
          {password && (
            <div className="mt-2 flex items-center gap-3" aria-live="polite">
              <div className="flex flex-1 gap-1.5">
                {[1, 2, 3, 4].map((n) => (
                  <span key={n} className="h-1.5 flex-1 rounded-full transition-colors duration-300" style={{ backgroundColor: n <= strength ? strengthColor : '#e2e8f0' }} />
                ))}
              </div>
              <span className="w-16 text-right text-xs font-semibold" style={{ color: strength ? strengthColor : '#94a3b8' }}>{strengthLabel}</span>
            </div>
          )}
        </div>

        {/* Vendor-only fields reveal smoothly */}
        <div className={`grid transition-all duration-500 ease-out ${isVendor ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`} aria-hidden={!isVendor}>
          <div className="overflow-hidden">
            <div className="space-y-5 pt-1">
              <AuthField label="Store name" icon={Store}>
                <input type="text" required={isVendor} tabIndex={isVendor ? 0 : -1} value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Apex Audio & Electronics" className={AUTH_INPUT} />
              </AuthField>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">Store bio</span>
                <textarea
                  rows="2"
                  tabIndex={isVendor ? 0 : -1}
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  placeholder="What makes your products special?"
                  className="w-full rounded-2xl bg-slate-50 p-4 text-sm text-slate-900 ring-1 ring-slate-200 placeholder-slate-400 transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 py-4 text-sm font-bold text-white transition hover:bg-slate-800 active:scale-[.98] disabled:opacity-50"
        >
          {loading ? 'Creating account…' : isVendor ? 'Open my store' : 'Create account'}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to={`/login?redirect=${redirect}`} className="font-semibold text-slate-900 underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
};

export default RegisterPage;
