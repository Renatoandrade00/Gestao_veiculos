import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { getApiErrorMessage } from '../services/api';

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
    } catch (err) {
      setError(getApiErrorMessage(err, 'Erro ao realizar login. Verifique suas credenciais.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Controle de Manutenções"
      subtitle="Gerencie e otimize a vida útil do seu veículo"
      cardTitle="Faça login na sua conta"
      footer={
        <p className="text-center text-sm text-slate-400 mt-6">
          Não tem uma conta?{' '}
          <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Cadastre-se
          </Link>
        </p>
      }
    >
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
    </AuthLayout>
  );
};
