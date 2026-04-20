<p align="right">
  <a href="./README.md"><img alt="README in English" src="https://img.shields.io/badge/English-blue?style=flat-square&logo=googletranslate&logoColor=white"></a>
  <a href="./README.pt-BR.md"><img alt="README em Português" src="https://img.shields.io/badge/Português-gray?style=flat-square&logo=googletranslate&logoColor=white"></a>
</p>

<div align="center">
  <img src="public/logo-expense-tracker.png" alt="Expense Tracker" width="120" />
  <h1>💰 Expense Tracker</h1>
  <p>Personal finance management with a smart dashboard, charts, and customizable categories.</p>

  <div align="center">
    <img src="./demo.gif" alt="Expense Tracker Demo" width="800"/>
  </div>

  ![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)
  ![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite)
  ![Supabase](https://img.shields.io/badge/Supabase-Full%20Stack-3ECF8E?style=flat-square&logo=supabase)
  ![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)
  [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=davydfontourac_controle-de-gastos&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=davydfontourac_controle-de-gastos)

  [🌐 View Demo](https://controle-de-gastos-tan-six.vercel.app) · [📋 Issues](https://github.com/davydfontourac/expense-tracker/issues)
</div>

---

## ✨ Features

- **🔐 Full Authentication** — Login, registration, password recovery, and Google OAuth via Supabase Auth.
- **💳 Transactions** — Complete CRUD with categories, type (income/expense), date, and search.
- **📊 Dashboard** — Monthly summary with total balance, income, expenses, and annual history.
- **🗂️ Categories** — Native categories + custom category creation with color and emoji.
- **👤 Profile** — Update name, avatar, and user password.
- **🌑 Dark Mode** — Toggle between light and dark themes.
- **📱 Responsive** — Mobile-first layout with bottom navigation for small screens.
- **🎭 Animations** — Page transitions and micro-animations with Framer Motion.

---

## 🛠️ Technologies

| Technology | Purpose |
|---|---|
| **React 19** | Modern UI library |
| **TypeScript** | Type safety |
| **Vite** | Fast build tool and dev server |
| **Supabase** | Backend-as-a-Service (Auth, Database, RPCs) |
| **Tailwind CSS 4** | Utility-first styling |
| **Framer Motion** | Fluid animations |
| **Recharts** | Interactive dashboard charts |
| **React Hook Form** | Efficient form management |
| **Zod** | Schema validation |
| **Vitest** | Unit and integration testing |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- [Supabase](https://supabase.com) account

### 1. Clone the repository
```bash
git clone https://github.com/davydfontourac/expense-tracker.git
cd expense-tracker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Fill in your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Database Setup
The project uses PostgreSQL functions (RPCs) for optimized dashboard calculations. Run the SQL scripts found in `supabase/migrations` directly in the **Supabase SQL Editor**.

### 5. Run the app
```bash
npm run dev
```

---

## 🧪 Testing

```bash
# Run unit tests
npm run test:run

# Open UI test runner
npm run test:ui

# Generate coverage report
npm run test:coverage
```

---

## 📁 Project Structure

```
expense-tracker/
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/        # Global state (Auth, Theme)
│   ├── hooks/          # Business logic (useTransactions, useCategories)
│   ├── pages/          # Main application views
│   ├── services/       # Supabase client initialization
│   └── types/          # TypeScript interfaces
├── supabase/
│   └── migrations/     # SQL scripts for DB functions and triggers
├── .github/workflows/  # CI/CD Pipeline
└── public/             # Static assets
```

---

## 🔁 CI/CD Flow

```
Push / PR → develop or main
     │
     ├── 🧪 Unit Tests (Vitest + Coverage)
     ├── 📊 SonarCloud Analysis
     ├── 🏗️  Vite Build
     └── 🚀 Vercel Deploy (Production/Preview)
```

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/davydfontourac">Davyd Fontoura</a>
</div>
