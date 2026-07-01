import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5 mb-4">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-400 font-sans">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 ${
          error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-rose-500 mt-0.5">{error}</span>
      )}
    </div>
  );
};
