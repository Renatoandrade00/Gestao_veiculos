import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import router from './routes';
import { env } from './lib/env';

const app = express();
const PORT = env.PORT;

// Middlewares de segurança
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS com whitelist (fallback aberto apenas em dev)
const corsOptions = env.CORS_ORIGINS.length > 0
  ? { origin: env.CORS_ORIGINS, credentials: true }
  : { origin: env.NODE_ENV === 'production' ? false : true };
app.use(cors(corsOptions));

app.use(express.json());

// Rotas da API
app.use('/api', router);

// Rota de status/healthcheck
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Handler 404 para rotas inexistentes
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Middleware de tratamento de erros global
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`==================================================`);
});

export default app;
