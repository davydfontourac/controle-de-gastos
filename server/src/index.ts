import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import routes from './routes';

// Carreaga as as variáveis do .env (se existir localmente)
dotenv.config();

export const app = express();
const PORT = process.env.PORT || 3000;

// Configuração dos Middlewares
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      process.env.CORS_ORIGIN,
    ].filter(Boolean);
    // Permite requisições sem origin (Postman, CI) ou origins permitidas
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS bloqueado para: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Health check para Railway/Render
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Aplica as Rotas importadas da pasta "routes"
app.use('/api', routes);

if (process.env.NODE_ENV !== 'test') {
  // Escuta a porta definida
  const server = app.listen(PORT, (err?: any) => {
    if (err) {
      console.error(`❌ Erro ao iniciar o servidor na porta ${PORT}:`, err.message || err);
      process.exit(1);
    }
    console.log(`🚀 Server rodando em http://localhost:${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ A porta ${PORT} já está em uso!`);
      console.error(`O servidor do back-end já deve estar rodando em outro terminal ou processo.`);
      process.exit(1);
    }
  });
}
