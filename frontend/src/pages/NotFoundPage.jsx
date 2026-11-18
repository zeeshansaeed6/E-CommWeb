import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => (
  <div className="text-center py-24 animate-fade-up">
    <div className="mx-auto w-20 h-20 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mb-6">
      <Compass className="w-10 h-10" />
    </div>
    <p className="text-sm font-bold uppercase tracking-widest text-brand-600">Error 404</p>
    <h1 className="mt-2 text-4xl sm:text-5xl font-display font-black text-slate-900">This page wandered off.</h1>
    <p className="mt-3 text-slate-500 max-w-md mx-auto">The page you're looking for doesn't exist or has been moved.</p>
    <Link to="/" className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-glow transition-all hover:scale-105">
      <ArrowLeft className="w-4 h-4" /> Back to the marketplace
    </Link>
  </div>
);

export default NotFoundPage;
