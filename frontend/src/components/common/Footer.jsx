import React from 'react';
import { ShoppingBag, Shield, Truck, RefreshCw, CreditCard, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-surface-900 text-slate-300 pt-16 pb-12 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Prop Badges */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-900/50 border border-brand-500/30 flex items-center justify-center text-brand-400 flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Split Fast Shipping</h4>
              <p className="text-xs text-slate-400">Direct fulfillment from verified vendors</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-900/50 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Buyer Protection</h4>
              <p className="text-xs text-slate-400">Money back guarantee & escrow payouts</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-900/50 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Stripe 3D-Secure</h4>
              <p className="text-xs text-slate-400">256-bit encrypted checkout sessions</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Multi-Vendor Mesh</h4>
              <p className="text-xs text-slate-400">Independent store profiles & live inventory</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 py-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-xl font-display font-bold text-white">
                Omni<span className="text-brand-400">Market</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm mb-6 leading-relaxed">
              Enterprise multi-vendor e-commerce platform engineered with React, Redux Toolkit, Node.js, Mongoose, and Stripe webhook infrastructure.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Engineered with precision for commercial scalability</span>
            </div>
          </div>

          <div>
            <h5 className="text-white font-semibold text-sm mb-4">Explore Marketplace</h5>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/?category=Electronics" className="hover:text-brand-400 transition-colors">Electronics & Tech</Link></li>
              <li><Link to="/?category=Fashion%20%26%20Apparel" className="hover:text-brand-400 transition-colors">Fashion & Apparel</Link></li>
              <li><Link to="/?category=Home%20%26%20Kitchen" className="hover:text-brand-400 transition-colors">Home & Living</Link></li>
              <li><Link to="/?sort=rating" className="hover:text-brand-400 transition-colors">Top Rated Gear</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold text-sm mb-4">Vendor Ecosystem</h5>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/register" className="hover:text-brand-400 transition-colors">Become a Vendor</Link></li>
              <li><Link to="/vendor/dashboard" className="hover:text-brand-400 transition-colors">Vendor Portal</Link></li>
              <li><span className="text-slate-400">Automated Split Payouts</span></li>
              <li><span className="text-slate-400">10% Platform Fee Policy</span></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold text-sm mb-4">Architecture</h5>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><span className="text-slate-400 font-mono text-xs">MERN Stack + ES6 Modules</span></li>
              <li><span className="text-slate-400 font-mono text-xs">HTTP-Only JWT Cookies</span></li>
              <li><span className="text-slate-400 font-mono text-xs">Stripe Webhooks (Raw Body)</span></li>
              <li><span className="text-slate-400 font-mono text-xs">Redux Toolkit State</span></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} OmniMarket Multi-Vendor Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with modern web standards & secure Stripe architecture
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
