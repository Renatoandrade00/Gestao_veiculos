import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Variável de ambiente obrigatória ausente: ${name}. ` +
      `Configure o arquivo .env (veja .env.example).`
    );
  }
  return value;
}

export const env = {
  get JWT_SECRET(): string {
    return required('JWT_SECRET');
  },
  get PORT(): number {
    return parseInt(process.env.PORT ?? '3000', 10);
  },
  get NODE_ENV(): string {
    return process.env.NODE_ENV ?? 'development';
  },
  get CORS_ORIGINS(): string[] {
    const raw = process.env.CORS_ORIGINS;
    if (!raw) return [];
    return raw.split(',').map((o) => o.trim()).filter(Boolean);
  },
};
