import React from 'react';
import { Car, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  title?: string;
  onBack?: () => void;
  action?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, onBack, action }) => {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10 px-4 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {onBack ? (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft size={16} aria-hidden="true" /> Voltar
            </button>
          ) : (
            <>
              <div className="p-2 bg-emerald-950/50 border border-emerald-800/40 rounded-xl text-emerald-400">
                <Car size={20} aria-hidden="true" />
              </div>
              <span className="font-bold text-slate-100 font-sans tracking-tight">CarMaint</span>
            </>
          )}
          {title && (
            <h1 className="text-base font-bold text-slate-200 font-sans truncate hidden sm:block">
              {title}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-4">
          {action}
          {user && (
            <span className="text-sm text-slate-400 hidden sm:inline">
              Olá, <strong className="text-slate-200">{user.name}</strong>
            </span>
          )}
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-xl transition-all duration-200"
            title="Sair"
            aria-label="Sair da conta"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
