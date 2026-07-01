import React from 'react';

interface AlertProps {
  type?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  className = '',
}) => {
  const styles = {
    success: 'bg-emerald-950/30 border-emerald-800 text-emerald-400',
    warning: 'bg-amber-950/30 border-amber-800 text-amber-400 animate-pulse',
    error: 'bg-rose-950/30 border-rose-800 text-rose-400',
    info: 'bg-slate-900 border-slate-800 text-slate-300',
  };

  return (
    <div className={`p-4 border rounded-xl flex flex-col gap-1 text-sm ${styles[type]} ${className}`}>
      {title && <span className="font-bold font-sans">{title}</span>}
      <div className="font-sans leading-relaxed">{children}</div>
    </div>
  );
};
