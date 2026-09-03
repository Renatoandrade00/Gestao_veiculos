import React from 'react';
import { Card } from './Card';
import { Car } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  cardTitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  cardTitle,
  children,
  footer,
}) => (
  <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950">
    <div className="w-full max-w-md flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="p-3 bg-emerald-950/50 border border-emerald-800/40 rounded-2xl text-emerald-400">
          <Car size={32} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 font-sans">{title}</h1>
        <p className="text-sm text-slate-400">{subtitle}</p>
      </div>

      <Card variant="glass">
        <h2 className="text-xl font-semibold mb-6 text-slate-100 font-sans">{cardTitle}</h2>
        {children}
        {footer}
      </Card>
    </div>
  </div>
);
