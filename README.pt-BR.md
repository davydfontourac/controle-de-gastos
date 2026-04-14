<p align="right">
  <a href="./README.md"><img alt="README in English" src="https://img.shields.io/badge/English-gray?style=flat-square&logo=googletranslate&logoColor=white"></a>
  <a href="./README.pt-BR.md"><img alt="README em Português" src="https://img.shields.io/badge/Português-blue?style=flat-square&logo=googletranslate&logoColor=white"></a>
</p>

<div align="center">
  <img src="public/logo-expense-tracker.png" alt="Expense Tracker" width="120" />
  <h1>💰 Expense Tracker</h1>
  <p>Gerenciamento pessoal de finanças com dashboard inteligente, gráficos e categorias customizáveis.</p>

  <div align="center">
    <img src="./demo.gif" alt="Demo Expense Tracker" width="800"/>
  </div>

  ![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)
  ![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite)
  ![Express](https://img.shields.io/badge/Express-5-000?style=flat-square&logo=express)
  ![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E?style=flat-square&logo=supabase)
  ![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)
  [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=davydfontourac_controle-de-gastos&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=davydfontourac_controle-de-gastos)

  [🌐 Ver Demo](https://controle-de-gastos-tan-six.vercel.app) · [📋 Issues](https://github.com/davydfontourac/expense-tracker/issues)
</div>

---

## ✨ Funcionalidades

- **🔐 Autenticação completa** — Login, registro, recuperação de senha e OAuth via Supabase Auth
- **💳 Transações** — CRUD completo com categorias, tipo (receita/despesa), data e busca
- **📊 Dashboard** — Resumo mensal com saldo total, receitas, despesas e histórico anual
- **🗂️ Categorias** — Categorias nativas + criação de categorias personalizadas com cor e emoji
- **👤 Perfil** — Atualização de nome, avatar e senha do usuário
- **🌑 Dark Mode** — Alternância entre tema claro e escuro
- **📱 Responsivo** — Layout mobile-first com navegação inferior em telas pequenas
- **🎭 Animações** — Transições de página e microanimações com Framer Motion

---

## 🛠️ Tecnologias

### Frontend
| Tecnologia | Uso |
|---|---|
| React 19 + TypeScript | Interface e tipagem |
| Vite | Build tool e dev server |
| Tailwind CSS 4 | Estilização |
| Framer Motion | Animações e transições |
| Recharts | Gráficos de dashboard |
| React Hook Form + Zod | Formulários com validação |
| React Router DOM | Roteamento |
| Sonner | Notificações toast |
| Supabase JS | Auth e banco de dados |

### Backend
| Tecnologia | Uso |
|---|---|
| Node.js + Express 5 | API REST |
| TypeScript | Tipagem |
| Supabase Admin | Acesso privilegiado ao banco |
| Zod | Validação de payload das rotas |
| Helmet + CORS | Segurança |

### Infraestrutura
| Serviço | Uso |
|---|---|
| Supabase | Auth + PostgreSQL |
| Vercel | Deploy e hospedagem do frontend |
| Render | Deploy da API backend (via Blueprints) |
| GitHub Actions | CI/CD com testes e análise de código |
| SonarCloud | Análise estática e cobertura de código |
| Vitest + Supertest | Testes unitários e de integração |

---

## 🚀 Como rodar localmente

### Pré-requisitos
- Node.js 20+
- Conta no [Supabase](https://supabase.com)

### 1. Clone o repositório
```bash
git clone https://github.com/davydfontourac/expense-tracker.git
cd expense-tracker
```

### 2. Configure o Frontend
```bash
# Instale as dependências
npm install

# Crie o arquivo de variáveis de ambiente
cp .env.example .env.local
```

Preencha o `.env.local`:
```env
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
VITE_API_URL=http://localhost:3000
```

```bash
# Inicie o frontend
npm run dev
```

### 3. Configure o Backend
```bash
cd server

# Instale as dependências
npm install

# Crie o arquivo de variáveis de ambiente
cp .env.example .env
```

Preencha o `server/.env`:
```env
SUPABASE_URL=https://SEU_PROJETO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
PORT=3000
NODE_ENV=development
```

```bash
# Inicie o backend
npm run dev
```

---

## 🧪 Testes

```bash
# Frontend — testes unitários
npm run test:run

# Frontend — com interface visual
npm run test:ui

# Frontend — com cobertura
npm run test:coverage

# Backend — testes de integração
cd server && npm run test
```

---

## 📁 Estrutura do Projeto

```
expense-tracker/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── context/        # AuthContext, ThemeContext
│   ├── hooks/          # useTransactions, useCategories
│   ├── pages/          # Dashboard, Login, Registro, Perfil...
│   ├── services/       # api.ts, supabase.ts
│   └── types/          # Tipos globais TypeScript
├── server/
│   └── src/
│       ├── controllers/ # lógica das rotas
│       ├── middlewares/ # authMiddleware
│       ├── routes/      # endpoints da API
│       └── utils/       # validators (Zod)
├── .github/workflows/  # CI/CD Pipeline
└── public/             # Assets estáticos
```

---

## 🔁 Fluxo CI/CD

```
Push / PR → develop ou main
     │
     ├── 🧪 Testes Frontend  (Vitest + Coverage)
     ├── 🧪 Testes Backend   (Vitest + Supertest)
     │           │
     │     (ambos passam)
     │
     ├── 📊 SonarCloud Analysis
     ├── 🏗️  Build Vite
     └── 🚀 Deploy Vercel
              │
       develop → preview
       main    → produção
```

---

## 🛣️ Roadmap

- [ ] Metas de economia por categoria
- [ ] Exportação de relatórios em PDF/CSV
- [ ] Transações recorrentes
- [ ] Múltiplas carteiras/contas
- [ ] Notificações de limite de gastos
- [ ] App mobile (React Native)

---

<div align="center">
  Feito com ❤️ por <a href="https://github.com/davydfontourac">Davyd Fontoura</a>
</div>
