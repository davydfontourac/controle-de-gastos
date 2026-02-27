import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import routes from './routes';

// Carreaga as as variáveis do .env (se existir localmente)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração dos Middlewares
app.use(helmet()); // Reforça segurança dos HTTP Headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // Permite o Vite acessar o back-end
  credentials: true,
}));
app.use(express.json()); // Permite ler JSON no req.body

// Aplica as Rotas importadas da pasta "routes"
app.use('/api', routes);

// Escuta a porta definida
app.listen(PORT, () => {
  console.log(`🚀 Server rodando em http://localhost:${PORT}`);
});
