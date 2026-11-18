import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, CreditCard, RefreshCw, Shield, ShoppingBag, Truck } from 'lucide-react';

// One link per page style, so the footer doubles as a tour of the six themes
const STYLES = [
  ['Tech', 'Electronics', '#0071e3'],
  ['Editorial', 'Fashion & Apparel', '#f97316'],
  ['Energy', 'Sports & Outdoors', '#00e5ff'],
  ['Soft', 'Beauty & Health', '#e8a0b4'],
  ['Cozy', 'Home & Kitchen', '#c1583a'],
  ['Luxury', 'Watches & Jewelry', '#c9b27c'],
];

const PROMISES = [
  [Truck, 'Split shipping', 'Each vendor ships directly to you', '#0071e3'],
  [Shield, 'Buyer protection', 'Payments held in escrow until delivery', '#10b981'],
  [CreditCard, 'Secure checkout', 'Encrypted payments with Stripe', '#f97316'],
  [RefreshCw, 'Easy returns', '30 days on every order', '#e8a0b4'],
];

const LINK = 'text-white/60 transition-colors hover:text-white';

const Footer = () => (
  <footer className="mt-24 bg-slate-950 text-white">
    {/* Theme colour strip */}
    <div className="flex h-1" aria-hidden="true">
      {STYLES.map(([name, , color]) => (
        <span key={name} className="flex-1" style={{ backgroundColor: color }} />
      ))}
    </div>

    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Promises */}
      <ul className="grid grid-cols-1 gap-8 border-b border-white/10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {PROMISES.map(([Icon, title, text, color]) => (
          <li key={title} className="flex items-start gap-4">
            <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-2xl" style={{ backgroundColor: `${color}26`, color }}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <h4 className="text-sm font-semibold">{title}</h4>
              <p className="mt-0.5 text-sm text-white/50">{text}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Links */}
      <div className="grid grid-cols-2 gap-10 py-14 md:grid-cols-5">
        <div className="col-span-2">
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <span className="text-xl font-display font-bold tracking-tight">
              Omni<span className="text-brand-400">Market</span>
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/50">
            A multi-vendor marketplace where every product gets a page that fits it, from cinematic tech to quiet luxury.
          </p>
        </div>

        <nav aria-label="Shop by style">
          <h5 className="mb-4 text-sm font-semibold">Shop by style</h5>
          <ul className="space-y-2.5 text-sm">
            {STYLES.map(([name, category, color]) => (
              <li key={name}>
                <Link to={`/?category=${encodeURIComponent(category)}`} className={`${LINK} inline-flex items-center gap-2`}>
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Your account">
          <h5 className="mb-4 text-sm font-semibold">Your account</h5>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/orders" className={LINK}>Orders</Link></li>
            <li><Link to="/wishlist" className={LINK}>Wishlist</Link></li>
            <li><Link to="/cart" className={LINK}>Bag</Link></li>
            <li><Link to="/login" className={LINK}>Sign in</Link></li>
          </ul>
        </nav>

        <nav aria-label="Sell with us">
          <h5 className="mb-4 text-sm font-semibold">Sell with us</h5>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/register" className={LINK}>Become a vendor</Link></li>
            <li><Link to="/vendor/dashboard" className={LINK}>Vendor hub</Link></li>
            <li className="text-white/40">Automatic split payouts</li>
            <li className="text-white/40">10% platform fee</li>
          </ul>
        </nav>
      </div>

      {/* Bottom bar */}
      <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-8 text-xs text-white/40 sm:flex-row">
        <p>© {new Date().getFullYear()} OmniMarket. All rights reserved.</p>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-white/70 ring-1 ring-white/15 transition hover:bg-white/10 hover:text-white"
        >
          Back to top <ArrowUp className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  </footer>
);

export default Footer;
