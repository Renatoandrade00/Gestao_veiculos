import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { getApiErrorMessage } from '../services/api';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Erro ao criar conta. Tente novamente mais tarde.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Crie sua Conta"
      subtitle="Mantenha seu automóvel sempre seguro e revisado"
      cardTitle="Cadastre-se grátis"
      footer={
        <p className="text-center text-sm text-slate-400 mt-6">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Faça login
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
          id="name"
          type="text"
          label="Nome"
          placeholder="Renato Silva"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
        />

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
          minLength={6}
        />

        <Button type="submit" isLoading={isLoading} className="mt-4">
          Criar Conta
        </Button>
      </form>
    </AuthLayout>
  );
};
