import React from 'react';

const Loader = ({ size = 'medium', message = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-5 h-5 border-2',
    medium: 'w-10 h-10 border-3',
    large: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div
        className={`${sizeClasses[size] || sizeClasses.medium} border-brand-200 border-t-brand-600 rounded-full animate-spin`}
      ></div>
      {message && <p className="text-sm font-medium text-slate-500">{message}</p>}
    </div>
  );
};

export default Loader;
