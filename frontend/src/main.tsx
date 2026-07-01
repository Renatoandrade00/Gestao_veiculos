import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { VehicleDetail } from './pages/VehicleDetail';
import './globals.css';

// Componente para rotas protegidas
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">
        <svg className="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// Componente para redirecionar usuários logados
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return !user ? <>{children}</> : <Navigate to="/" replace />;
};

const ParallaxWrapper: React.FC = () => {
  React.useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      // Define deslocamentos parallax em diferentes velocidades sem causar repintura pesada
      document.documentElement.style.setProperty('--scroll-y-slow', `${scrolled * 0.15}px`);
      document.documentElement.style.setProperty('--scroll-y-fast', `${scrolled * 0.4}px`);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/vehicle/:id"
            element={
              <PrivateRoute>
                <VehicleDetail />
              </PrivateRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

// Registrar Service Worker se disponível em produção/ambiente suportado
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('Service Worker registrado com sucesso:', reg.scope))
      .catch((err) => console.error('Erro ao registrar Service Worker:', err));
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
