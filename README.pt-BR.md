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
  ![Supabase](https://img.shields.io/badge/Supabase-Full%20Stack-3ECF8E?style=flat-square&logo=supabase)
  ![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)
  [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=davydfontourac_controle-de-gastos&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=davydfontourac_controle-de-gastos)

  [🌐 Ver Demo](https://controle-de-gastos-tan-six.vercel.app) · [📋 Issues](https://github.com/davydfontourac/expense-tracker/issues)
</div>

---

## ✨ Funcionalidades

- **🏦 Importação Bancária** — Assistente de importação de CSV inteligente com detecção automática de categorias e mapeamento de colunas.
- **📊 Dashboard Inteligente** — Saldo disponível e "Caixinhas" refletem o valor real acumulado independentemente do filtro mensal, enquanto receitas/despesas respeitam o período selecionado.
- **📱 UX Mobile Aprimorada** — Botão de Ação Flutuante (FAB) para acesso rápido às funções principais (Nova Transação, Importação CSV, Categorias).
- **🔐 Autenticação completa** — Login, registro, recuperação de senha e OAuth via Supabase Auth.
- **💳 Transações** — CRUD completo com categorias, tipo (receita/despesa/transferência), data e busca.
- **🗂️ Categorias** — Categorias nativas + criação de categorias personalizadas com cor e emoji.
- **👤 Perfil** — Atualização de nome, avatar e senha do usuário.
- **🌑 Dark Mode** — Alternância entre tema claro e escuro.
- **🎭 Animações** — Transições de página e microanimações com Framer Motion.

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| **React 19** | Interface e lógica de UI |
| **TypeScript** | Tipagem estática |
| **Vite** | Ferramenta de build e dev server ultra rápido |
| **Supabase** | Backend-as-a-Service (Autenticação, Banco de Dados, RPCs) |
| **Tailwind CSS 4** | Estilização utilitária |
| **Framer Motion** | Animações fluidas |
| **Recharts** | Gráficos interativos |
| **React Hook Form** | Gestão de formulários |
| **Zod** | Validação de esquemas |
| **Vitest** | Testes unitários e de integração |

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

### 2. Instale as dependências
```bash
npm install
```

### 3. Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:
```bash
cp .env.example .env
```

Preencha com suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

### 4. Configuração do Banco de Dados
O projeto utiliza funções PostgreSQL (RPCs) para cálculos otimizados no dashboard. Execute os scripts SQL encontrados em `supabase/migrations` diretamente no **SQL Editor do Supabase**.

### 5. Inicie o projeto
```bash
npm run dev
```

---

## 🧪 Testes

```bash
# Rodar testes unitários
npm run test:run

# Abrir interface visual de testes
npm run test:ui

# Gerar relatório de cobertura
npm run test:coverage
```

---

## 📁 Estrutura do Projeto

```
expense-tracker/
├── src/
│   ├── components/     # Componentes de UI reutilizáveis
│   ├── context/        # Estado global (Auth, Tema)
│   ├── hooks/          # Lógica de negócio (useTransactions, useCategories)
│   ├── pages/          # Visualizações principais da aplicação
│   ├── services/       # Inicialização do cliente Supabase
│   └── types/          # Interfaces TypeScript
├── supabase/
│   └── migrations/     # Scripts SQL para funções e triggers do banco
├── .github/workflows/  # Pipeline de CI/CD
└── public/             # Assets estáticos
```

---

## 🔁 Fluxo CI/CD

```
Push / PR → develop ou main
     │
     ├── 🧪 Testes Unitários (Vitest + Coverage)
     ├── 📊 Análise SonarCloud
     ├── 🏗️  Build Vite
     └── 🚀 Deploy Vercel (Produção/Preview)
```

---

<div align="center">
  Feito com ❤️ por <a href="https://github.com/davydfontourac">Davyd Fontoura</a>
</div>
