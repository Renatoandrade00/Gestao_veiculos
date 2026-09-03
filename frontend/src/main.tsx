import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { Spinner } from './components/Spinner';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import './globals.css';

// Code splitting: páginas pesadas carregadas sob demanda
const Dashboard = lazy(() =>
  import('./pages/Dashboard').then((m) => ({ default: m.Dashboard }))
);
const VehicleDetail = lazy(() =>
  import('./pages/VehicleDetail').then((m) => ({ default: m.VehicleDetail }))
);

// Componente para rotas protegidas
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">
        <Spinner size={10} />
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// Componente para redirecionar usuários logados
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">
        <Spinner size={10} />
      </div>
    );
  }

  return !user ? <>{children}</> : <Navigate to="/" replace />;
};

const ParallaxWrapper: React.FC = () => {
  React.useEffect(() => {
    let rafId: number | null = null;
    let pendingScroll = 0;

    const applyScroll = () => {
      rafId = null;
      document.documentElement.style.setProperty('--scroll-y-slow', `${pendingScroll * 0.15}px`);
      document.documentElement.style.setProperty('--scroll-y-fast', `${pendingScroll * 0.4}px`);
    };

    // Throttle via requestAnimationFrame: só aplica CSS vars 1x por frame
    const handleScroll = () => {
      pendingScroll = window.scrollY;
      if (rafId === null) {
        rafId = requestAnimationFrame(applyScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      {/* Camadas estáticas de Parallax no Background */}
      <div className="parallax-grid" />
      <div className="parallax-bg" />
    </>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ParallaxWrapper />
          <Routes>
            {/* Rotas Públicas */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Rotas Protegidas */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Suspense
                    fallback={
                      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">
                        <Spinner size={10} />
                      </div>
                    }
                  >
                    <Dashboard />
                  </Suspense>
                </PrivateRoute>
              }
            />
            <Route
              path="/vehicle/:id"
              element={
                <PrivateRoute>
                  <Suspense
                    fallback={
                      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">
                        <Spinner size={10} />
                      </div>
                    }
                  >
                    <VehicleDetail />
                  </Suspense>
                </PrivateRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

// Registrar Service Worker apenas em produção (evita conflito com HMR do Vite em dev)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('Service Worker registrado:', reg.scope))
      .catch((err) => console.error('Erro ao registrar Service Worker:', err));
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
