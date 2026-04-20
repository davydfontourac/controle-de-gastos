import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import routes from './routes';

// Load .env variables (if exists locally)
dotenv.config();

export const app = express();
const PORT = process.env.PORT || 3000;

// Middleware Configuration
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    const originsFromEnv = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      ...originsFromEnv,
    ].filter(Boolean).map(o => o.trim());

    // Allows no-origin requests (Postman, CI) or allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS bloqueado para: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Health check for Railway/Render
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Apply imported routes from "routes" folder
app.use('/api', routes);

if (process.env.NODE_ENV !== 'test') {
  // Listen to defined port
  const server = app.listen(PORT, (err?: any) => {
    if (err) {
      console.error(`❌ Erro ao iniciar o servidor na porta ${PORT}:`, err.message || err);
      process.exit(1);
    }
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ A porta ${PORT} já está em uso!`);
      console.error(`O servidor do back-end já deve estar rodando em outro terminal ou processo.`);
      process.exit(1);
    }
  });
}
