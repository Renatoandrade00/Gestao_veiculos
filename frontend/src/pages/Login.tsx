import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { Car } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error || 
        'Erro ao realizar login. Verifique suas credenciais.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="p-3 bg-emerald-950/50 border border-emerald-800/40 rounded-2xl text-emerald-400">
            <Car size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 font-sans">
            Controle de Manutenções
          </h1>
          <p className="text-sm text-slate-400">
            Gerencie e otimize a vida útil do seu veículo
          </p>
        </div>

        <Card variant="glass">
          <h2 className="text-xl font-semibold mb-6 text-slate-100 font-sans">
            Faça login na sua conta
          </h2>

          {error && (
            <Alert type="error" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col">
            <Input
              id="email"
              type="email"
              label="E-mail"
              placeholder="seu-email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Input
              id="password"
              type="password"
              label="Senha"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" isLoading={isLoading} className="mt-4">
              Entrar
            </Button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
              Cadastre-se
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};
