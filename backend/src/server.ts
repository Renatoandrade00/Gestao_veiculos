import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api', router);

// Rota de status/healthcheck
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Middleware de tratamento de erros global
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
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
