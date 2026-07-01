import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const baseStyle = 'p-6 rounded-2xl shadow-xl transition-all duration-300';
  
  const variants = {
    default: 'bg-slate-900 border border-slate-800/80',
    glass: 'glass-panel',
  };

  return (
    <div className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};
