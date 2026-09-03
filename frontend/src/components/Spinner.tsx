import React from 'react';

export const Spinner: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = 'text-emerald-500',
}) => (
  <svg
    className={`animate-spin ${className}`}
    style={{ width: size, height: size }}
    fill="none"
    viewBox="0 0 24 24"
    role="status"
    aria-label="Carregando"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

export const FullScreenSpinner: React.FC<{ label?: string }> = ({
  label = 'Carregando...',
}) => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-500 gap-3">
    <Spinner />
    <span>{label}</span>
  </div>
);
