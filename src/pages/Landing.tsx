/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';

// ─────────────────────────────────────────────────────────────────────────────
// Reveal on scroll (IntersectionObserver) + delayed entry for above-the-fold
// ─────────────────────────────────────────────────────────────────────────────
function Reveal({
  children,
  as = 'div',
  variant = 'up',
  delay = 0,
  afterLoad = 0,
  className = '',
  ...rest
}: any) {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (afterLoad > 0) {
      // Dashboard mockup sits in the first fold — don't wait for scroll.
      const t = setTimeout(() => setSeen(true), afterLoad);
      return () => clearTimeout(t);
    }
    if (typeof IntersectionObserver === 'undefined') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setSeen(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [afterLoad]);

  const Tag: any = as;
  const cls = `reveal reveal-${variant} ${seen ? 'in' : ''} ${className}`.trim();
  return (
    <Tag ref={ref} className={cls} data-delay={delay || undefined} {...rest}>
      {children}
    </Tag>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Copy (PT-BR + EN)
// ─────────────────────────────────────────────────────────────────────────────
const COPY: Record<string, any> = {
  'pt-BR': {
    nav: {
      features: 'Recursos',
      how: 'Como funciona',
      faq: 'FAQ',
      github: 'GitHub',
      signin: 'Entrar',
      cta: 'Cadastrar',
    },
    hero: {
      badge: '100% open source · gratuito',
      h1a: 'Seu dinheiro,',
      h1b: 'sob controle.',
      sub: 'Rastreie despesas, receitas e investimentos em um só lugar. Importe extratos do seu banco, categorize automaticamente e entenda para onde vai cada real.',
      cta: 'Começar grátis',
      cta2: 'Ver demo',
      trust: 'Sem cartão de crédito · Dados criptografados · Código aberto',
    },
    problems: {
      kicker: 'O problema',
      title: 'Você já passou pelo mês sem saber pra onde foi o dinheiro?',
      items: [
        {
          t: 'Planilhas que ninguém atualiza',
          d: 'Começa com disciplina na primeira semana. Some até o fim do mês.',
        },
        {
          t: '"Para onde foi meu salário?"',
          d: 'Fatura do cartão chega e você não lembra de 80% das compras.',
        },
        {
          t: 'Sem visão do todo',
          d: 'Investimentos de um lado, gastos do outro, reservas no meio. Nada se conversa.',
        },
      ],
    },
    solution: {
      kicker: 'A solução',
      title: 'Um único painel. Todo o seu dinheiro.',
      sub: 'Expense Tracker junta contas, cartões e categorias em um dashboard que entende o seu mês — e o seu acumulado.',
    },
    features: {
      kicker: 'Recursos',
      title: 'Tudo que você precisa. Nada que você não vai usar.',
      items: [
        {
          tag: '01',
          t: 'Dashboard inteligente',
          d: 'Saldo disponível e "Caixinhas" refletem o valor real acumulado, enquanto receitas e despesas respeitam o filtro mensal.',
        },
        {
          tag: '02',
          t: 'Importação bancária (CSV)',
          d: 'Assistente de importação com detecção automática de categorias e mapeamento de colunas do extrato.',
        },
        {
          tag: '03',
          t: 'Categorias customizáveis',
          d: 'Categorias nativas + crie as suas com emoji e cor. Personalize do seu jeito.',
        },
        {
          tag: '04',
          t: 'Dark mode nativo',
          d: 'Tema escuro pra quem fecha as contas de madrugada. Alterna com um clique.',
        },
        {
          tag: '05',
          t: 'Segurança Supabase',
          d: 'Autenticação completa (OAuth, recuperação), banco criptografado e RLS em todas as tabelas.',
        },
      ],
    },
    how: {
      kicker: 'Como funciona',
      title: 'Do cadastro ao primeiro relatório em menos de 5 minutos.',
      steps: [
        {
          n: '01',
          t: 'Crie sua conta',
          d: 'E-mail e senha ou login com Google. Sem papelada, sem cartão.',
        },
        {
          n: '02',
          t: 'Importe suas transações',
          d: 'Suba o CSV do seu banco. A gente detecta categorias automaticamente.',
        },
        {
          n: '03',
          t: 'Visualize seus relatórios',
          d: 'Gráficos de receita vs. despesa, por categoria, por mês. Tudo em tempo real.',
        },
        {
          n: '04',
          t: 'Tome decisões',
          d: 'Entenda seu padrão de gastos e reorganize o que importa.',
        },
      ],
    },
    cta: {
      title: 'Pronto pra controlar suas finanças?',
      sub: 'Leva 5 minutos pra começar. Você pode fechar esta aba depois.',
      btn: 'Começar grátis',
      btn2: 'Ver no GitHub',
    },
    footer: {
      tag: 'Feito com ❤️ por Davyd Fontoura',
      product: 'Produto',
      company: 'Projeto',
      resources: 'Recursos',
      links: {
        product: [
          ['Recursos', '#features'],
          ['Como funciona', '#how'],
          ['Demo', '#'],
          ['Dark mode', '#'],
        ],
        company: [
          ['GitHub', 'https://github.com/davydfontourac/expense-tracker'],
          ['Issues', 'https://github.com/davydfontourac/expense-tracker/issues'],
          ['Licença MIT', '#'],
        ],
        resources: [
          ['Documentação', '#'],
          ['Changelog', '#'],
          ['Privacidade', '#'],
        ],
      },
      rights: '© 2026 Expense Tracker · Open source sob licença MIT',
    },
    mock: {
      months: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      sidebar: {
        general: 'GERAL',
        dashboard: 'Dashboard',
        transactions: 'Transações',
        categories: 'Categorias',
        savings: 'Caixinhas',
        analysis: 'ANÁLISES',
        reports: 'Relatórios',
        goals: 'Metas',
        insights: 'Insights',
        activeFilter: 'Filtro ativo',
        october: 'OUTUBRO 2026',
      },
      header: {
        greeting: 'Boa tarde, davyd.',
        spent: 'Você gastou',
        ofRevenue: 'da sua receita',
        inApril: 'em abril',
        april2026: 'Abril 2026',
        all: 'Todos',
        new: 'Nova',
      },
      kpis: {
        available: 'DISPONÍVEL',
        balance: 'Saldo em conta',
        income: 'RECEITAS',
        thisMonth: 'Neste mês',
        expenses: 'DESPESAS',
        vsLastMonth: 'vs. mês anterior',
      },
      charts: {
        monthlyTitle: 'Evolução Mensal',
        monthlySub: 'Receitas vs. Despesas · 12 meses',
        janDez: 'JAN → DEZ',
        income: 'Receitas',
        expenses: 'Despesas',
        distTitle: 'Distribuição',
        spent: 'GASTO',
      },
      dist: {
        debit: 'Débito',
        pix: 'Pix',
        food: 'Alimentação',
        transport: 'Transporte',
        others: 'Outros',
      },
    },
    visuals: {
      balance: 'SALDO',
      accumulated: 'ACUMULADO',
      expenses: 'DESPESAS',
      oct2026: 'OUT/2026',
      csv: {
        food: 'Alimentação',
        transport: 'Transporte',
        subs: 'Assinaturas',
        imported: 'transações importadas',
      },
      categories: [
        'Alimentação',
        'Transporte',
        'Moradia',
        'Lazer',
        'Saúde',
        'Educação',
        'Viagem',
        'Nova',
      ],
    },
  },
  en: {
    nav: {
      features: 'Features',
      how: 'How it works',
      faq: 'FAQ',
      github: 'GitHub',
      signin: 'Sign in',
      cta: 'Sign up',
    },
    hero: {
      badge: '100% open source · free forever',
      h1a: 'Your money,',
      h1b: 'under control.',
      sub: 'Track expenses, income and investments in one place. Import bank statements, auto-categorize, and understand where every dollar goes.',
      cta: 'Start free',
      cta2: 'See demo',
      trust: 'No credit card · Encrypted data · Open source',
    },
    problems: {
      kicker: 'The problem',
      title: 'Ever reached month-end with no idea where the money went?',
      items: [
        {
          t: 'Spreadsheets no one updates',
          d: 'Discipline in week one. Gone by week four. Every single time.',
        },
        {
          t: '"Where did my paycheck go?"',
          d: 'Credit-card bill arrives and 80% of the charges are a blur.',
        },
        {
          t: 'No full picture',
          d: 'Investments over there, spending over here, savings somewhere. None of it talks.',
        },
      ],
    },
    solution: {
      kicker: 'The solution',
      title: 'One dashboard. All of your money.',
      sub: 'Expense Tracker ties accounts, cards and categories into one view that understands both your month and your lifetime totals.',
    },
    features: {
      kicker: 'Features',
      title: 'Everything you need. Nothing you won\u2019t use.',
      items: [
        {
          tag: '01',
          t: 'Smart dashboard',
          d: 'Available balance and "Savings" reflect real accumulated value, while income and expenses respect the monthly filter.',
        },
        {
          tag: '02',
          t: 'Bank import (CSV)',
          d: 'Import wizard with auto-detected categories and smart column mapping for your statement.',
        },
        {
          tag: '03',
          t: 'Custom categories',
          d: 'Built-in categories plus your own — with emoji and color. Shape it around your life.',
        },
        {
          tag: '04',
          t: 'Native dark mode',
          d: 'Dark theme for closing the books late at night. One click to switch.',
        },
        {
          tag: '05',
          t: 'Supabase security',
          d: 'Full auth (OAuth, recovery), encrypted database and row-level security on every table.',
        },
      ],
    },
    how: {
      kicker: 'How it works',
      title: 'From sign-up to your first report in under 5 minutes.',
      steps: [
        {
          n: '01',
          t: 'Create your account',
          d: 'Email + password or Google login. No paperwork, no card.',
        },
        {
          n: '02',
          t: 'Import your transactions',
          d: 'Drop in your bank CSV. We detect categories automatically.',
        },
        {
          n: '03',
          t: 'See your reports',
          d: 'Income vs. expense, by category, by month. All real-time.',
        },
        {
          n: '04',
          t: 'Make decisions',
          d: 'Understand your spending pattern and reshape what matters.',
        },
      ],
    },
    cta: {
      title: 'Ready to own your finances?',
      sub: 'Five minutes to set up. You can close this tab after.',
      btn: 'Start free',
      btn2: 'View on GitHub',
    },
    footer: {
      tag: 'Built with ❤️ by Davyd Fontoura',
      product: 'Product',
      company: 'Project',
      resources: 'Resources',
      links: {
        product: [
          ['Features', '#features'],
          ['How it works', '#how'],
          ['Demo', '#'],
          ['Dark mode', '#'],
        ],
        company: [
          ['GitHub', 'https://github.com/davydfontourac/expense-tracker'],
          ['Issues', 'https://github.com/davydfontourac/expense-tracker/issues'],
          ['MIT License', '#'],
        ],
        resources: [
          ['Docs', '#'],
          ['Changelog', '#'],
          ['Privacy', '#'],
        ],
      },
      rights: '© 2026 Expense Tracker · Open source under MIT license',
    },
    mock: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      sidebar: {
        general: 'GENERAL',
        dashboard: 'Dashboard',
        transactions: 'Transactions',
        categories: 'Categories',
        savings: 'Savings',
        analysis: 'ANALYSIS',
        reports: 'Reports',
        goals: 'Goals',
        insights: 'Insights',
        activeFilter: 'Active filter',
        october: 'OCTOBER 2026',
      },
      header: {
        greeting: 'Good afternoon, davyd.',
        spent: 'You spent',
        ofRevenue: 'of your revenue',
        inApril: 'in April',
        april2026: 'April 2026',
        all: 'All',
        new: 'New',
      },
      kpis: {
        available: 'AVAILABLE',
        balance: 'Account balance',
        income: 'INCOME',
        thisMonth: 'This month',
        expenses: 'EXPENSES',
        vsLastMonth: 'vs. last month',
      },
      charts: {
        monthlyTitle: 'Monthly Evolution',
        monthlySub: 'Income vs. Expenses · 12 months',
        janDez: 'JAN → DEC',
        income: 'Income',
        expenses: 'Expenses',
        distTitle: 'Distribution',
        spent: 'SPENT',
      },
      dist: {
        debit: 'Debit',
        pix: 'Pix',
        food: 'Food',
        transport: 'Transport',
        others: 'Others',
      },
    },
    visuals: {
      balance: 'BALANCE',
      accumulated: 'ACCUMULATED',
      expenses: 'EXPENSES',
      oct2026: 'OCT/2026',
      csv: {
        food: 'Food',
        transport: 'Transport',
        subs: 'Subscriptions',
        imported: 'transactions imported',
      },
      categories: [
        'Food',
        'Transport',
        'Housing',
        'Leisure',
        'Health',
        'Education',
        'Travel',
        'New',
      ],
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles (scoped via data-attrs)
// ─────────────────────────────────────────────────────────────────────────────
const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

/* ── Variables injected for Landing ─────────────────────────────────────────── */
:root {
  --maxw: 1200px;
  --radius: 12px;
  --radius-lg: 16px;
  --brand-500: #6366f1;
  --brand-600: #4f46e5;
  --brand-700: #4338ca;
  --accent-400: #38bdf8;
  --accent-500: #0ea5e9;
  --ink-50: #f8fafc;
  --ink-100: #f1f5f9;
  --ink-200: #e2e8f0;
  --ink-300: #cbd5e1;
  --ink-400: #94a3b8;
  --ink-500: #64748b;
  --ink-700: #334155;
  --ink-900: #0f172a;
}

/* ── Shared ─────────────────────────────────────────────────────────────── */
.landing-wrapper {
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.landing-wrapper .container { max-width: var(--maxw); margin: 0 auto; padding: 0 24px; text-align: left; }
@media (max-width: 820px) { .landing-wrapper .container { padding: 20px 20px; } }
.landing-wrapper .kicker {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: 'Geist Mono', ui-monospace, monospace;
  font-size: 12px; font-weight: 500; letter-spacing: 0.02em;
  color: var(--brand-600); text-transform: uppercase;
}
.landing-wrapper .kicker::before {
  content: ''; width: 18px; height: 1px; background: currentColor; opacity: 0.5;
}
.landing-wrapper[data-theme="dark"] .kicker { color: var(--accent-400); }

.landing-wrapper .h1 {
  font-size: clamp(44px, 7vw, 88px);
  line-height: 0.95; letter-spacing: -0.04em;
  font-weight: 600; margin: 0;
  text-wrap: balance;
}
.landing-wrapper .h2 {
  font-size: clamp(32px, 4.5vw, 56px);
  line-height: 1.02; letter-spacing: -0.035em;
  font-weight: 600; margin: 0;
  text-wrap: balance;
}
.landing-wrapper .h3 {
  font-size: 20px; line-height: 1.3; letter-spacing: -0.01em;
  font-weight: 600; margin: 0;
}
.landing-wrapper .lede {
  font-size: clamp(17px, 1.4vw, 20px); line-height: 1.55;
  color: var(--ink-500); max-width: 640px; text-wrap: pretty;
}
.landing-wrapper[data-theme="dark"] .lede { color: rgba(232, 232, 240, 0.7); }

/* ── Buttons ────────────────────────────────────────────────────────────── */
.landing-wrapper .btn {
  display: inline-flex; align-items: center; gap: 8px;
  height: 44px; padding: 0 20px; border-radius: 999px;
  font-family: 'Outfit', sans-serif;
  font-size: 15px; font-weight: 500; letter-spacing: -0.01em;
  border: 1px solid transparent; cursor: pointer;
  transition: transform 120ms ease, background 120ms ease, border-color 120ms ease, box-shadow 120ms ease;
  white-space: nowrap;
  text-decoration: none;
}
.landing-wrapper .btn:active { transform: translateY(1px); }
.landing-wrapper .btn-primary {
  background: var(--ink-900); color: white;
  box-shadow: 0 1px 0 0 rgba(255,255,255,0.15) inset, 0 1px 2px rgba(12,12,29,0.15), 0 8px 24px -8px rgba(99,102,241,0.4);
}
.landing-wrapper .btn-primary:hover { background: #1a1a33; }
.landing-wrapper[data-theme="dark"] .btn-primary {
  background: white; color: var(--ink-900);
  box-shadow: 0 0 0 1px rgba(255,255,255,0.1), 0 8px 32px -4px rgba(99,102,241,0.3);
}
.landing-wrapper[data-theme="dark"] .btn-primary:hover { background: #f0f0f5; }

.landing-wrapper .btn-ghost {
  background: transparent; color: var(--ink-900);
  border-color: var(--ink-200);
}
.landing-wrapper .btn-ghost:hover { background: var(--ink-100); }
.landing-wrapper[data-theme="dark"] .btn-ghost {
  color: #e8e8f0;
  border-color: rgba(255,255,255,0.12);
}
.landing-wrapper[data-theme="dark"] .btn-ghost:hover { background: rgba(255,255,255,0.05); }

.landing-wrapper .btn-sm { height: 36px; padding: 0 14px; font-size: 13px; }

/* ── Nav ────────────────────────────────────────────────────────────────── */
.landing-wrapper .nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: transparent;
  border-bottom: 1px solid transparent;
  transition: background 300ms ease, border-color 300ms ease, backdrop-filter 300ms ease;
}
.landing-wrapper .nav.scrolled {
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  background: rgba(255,255,255,0.72);
  border-bottom: 1px solid rgba(12,12,29,0.06);
}
.landing-wrapper[data-theme="dark"] .nav.scrolled {
  background: rgba(7,7,15,0.72);
  border-bottom-color: rgba(255,255,255,0.06);
}
.landing-wrapper .nav-inner {
  display: flex; align-items: center; justify-content: space-between;
  height: 64px;
}
.landing-wrapper .brand {
  display: flex; align-items: center; gap: 10px;
  font-weight: 600; letter-spacing: -0.01em; font-size: 15px;
  text-decoration: none;
  color: inherit;
}
.landing-wrapper .brand img { width: 28px; height: 28px; object-fit: contain; }
.landing-wrapper .nav-links {
  display: flex; align-items: center; gap: 28px;
  font-size: 14px; color: var(--ink-500);
}
.landing-wrapper[data-theme="dark"] .nav-links { color: rgba(232,232,240,0.6); }
.landing-wrapper .nav-links a { color: inherit; text-decoration: none; transition: color 150ms ease; }
.landing-wrapper .nav-links a:hover { color: var(--ink-900); }
.landing-wrapper[data-theme="dark"] .nav-links a:hover { color: #fff; }
.landing-wrapper .nav-actions { display: flex; align-items: center; gap: 8px; }

/* Mobile Menu */
.landing-wrapper .burger { display: none; appearance: none; background: transparent; border: 1px solid var(--ink-200); width: 36px; height: 36px; border-radius: 9px; cursor: pointer; padding: 0; }
.landing-wrapper[data-theme="dark"] .burger { border-color: rgba(255,255,255,0.12); }
.landing-wrapper .burger span { display: block; width: 16px; height: 1.5px; background: var(--ink-900); transition: 0.3s; margin: 2.5px auto; }
.landing-wrapper[data-theme="dark"] .burger span { background: #fff; }

.landing-wrapper .mobile-sheet {
  position: fixed; inset: 0; background: var(--ink-50); z-index: 200;
  display: flex; flex-direction: column; padding: 20px;
  animation: sheetIn 260ms cubic-bezier(0.2,0.9,0.3,1.2);
}
.landing-wrapper[data-theme="dark"] .mobile-sheet { background: #07070f; }
@keyframes sheetIn { from { opacity: 0; transform: translateY(12px); } to { opacity:1; transform: none; } }

.landing-wrapper .mobile-sheet .top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.landing-wrapper .mobile-sheet .x-btn { appearance: none; background: transparent; border: 1px solid var(--ink-200); width: 36px; height: 36px; border-radius: 9px; color: var(--ink-900); font-size: 16px; cursor: pointer; display: grid; place-items: center; }
.landing-wrapper[data-theme="dark"] .mobile-sheet .x-btn { border-color: rgba(255,255,255,0.12); color: #fff; }

.landing-wrapper .mobile-sheet nav { display: flex; flex-direction: column; gap: 4px; }
.landing-wrapper .mobile-sheet nav a {
  padding: 16px 6px; font-size: 24px; font-weight: 500; letter-spacing: -0.025em;
  color: var(--ink-900); text-decoration: none; border-bottom: 1px solid var(--ink-200);
  display: flex; justify-content: space-between; align-items: center;
}
.landing-wrapper[data-theme="dark"] .mobile-sheet nav a { color: #fff; border-color: rgba(255,255,255,0.06); }
.landing-wrapper .mobile-sheet nav a::after { content: '→'; color: var(--ink-400); font-size: 18px; }

.landing-wrapper .mobile-sheet .foot { margin-top: auto; display: flex; flex-direction: column; gap: 10px; }
.landing-wrapper .mobile-sheet .foot-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.landing-wrapper .mobile-sheet .btn { width: 100%; justify-content: center; padding: 14px; height: auto; }

@media (max-width: 820px) {
  .landing-wrapper .nav-inner { height: 72px; padding: 0 20px; }
  .landing-wrapper .nav-links, .landing-wrapper .nav-actions { display: none; }
  .landing-wrapper .burger { display: grid; place-items: center; }
  .landing-wrapper .h1 { font-size: 40px; }
  .landing-wrapper .h2 { font-size: 28px; }
  .landing-wrapper .hero { padding-top: calc(72px + 80px); text-align: center; }
  .landing-wrapper .hero-badge { margin-bottom: 12px; }
  .landing-wrapper .hero-inner { display: flex; flex-direction: column; align-items: center; }
  .landing-wrapper .hero-actions { flex-direction: column; align-items: stretch; width: 100%; }
  .landing-wrapper .hero-actions .btn { justify-content: center; width: 100%; }
  .landing-wrapper .final-cta .actions { flex-direction: column; align-items: stretch; width: 100%; }
  .landing-wrapper .final-cta .actions .btn { justify-content: center; width: 100%; }
  .landing-wrapper .footer-bottom { flex-direction: column; align-items: flex-start; }
}

.landing-wrapper .lang-toggle {
  display: inline-flex; padding: 2px; border-radius: 999px;
  background: var(--ink-100); border: 1px solid var(--ink-200);
  font-family: 'Geist Mono', ui-monospace, monospace;
  font-size: 11px; font-weight: 500;
}
.landing-wrapper[data-theme="dark"] .lang-toggle {
  background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.08);
}
.landing-wrapper .lang-toggle button {
  appearance: none; border: 0; background: transparent;
  padding: 4px 10px; border-radius: 999px; cursor: pointer;
  color: var(--ink-500); font: inherit;
}
.landing-wrapper .lang-toggle button.active {
  background: white; color: var(--ink-900);
  box-shadow: 0 1px 2px rgba(12,12,29,0.08);
}
.landing-wrapper[data-theme="dark"] .lang-toggle button { color: rgba(232,232,240,0.5); }
.landing-wrapper[data-theme="dark"] .lang-toggle button.active {
  background: rgba(255,255,255,0.12); color: #fff; box-shadow: none;
}

/* ── Hero ───────────────────────────────────────────────────────────────── */
.landing-wrapper .hero {
  position: relative; overflow: hidden;
  padding: clamp(48px, 8vw, 96px) 0 0;
}
.landing-wrapper .hero-bg {
  position: absolute; inset: 0; pointer-events: none; z-index: 0;
  background:
    radial-gradient(1200px 600px at 50% -10%, rgba(99,102,241,0.18), transparent 60%),
    radial-gradient(800px 400px at 90% 10%, rgba(34,211,238,0.12), transparent 60%);
}
.landing-wrapper .hero-grid {
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background-image:
    linear-gradient(to right, rgba(12,12,29,0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(12,12,29,0.05) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, #000 40%, transparent 85%);
  -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, #000 40%, transparent 85%);
}
.landing-wrapper .hero-inner { position: relative; z-index: 1; padding-bottom: 80px; }
.landing-wrapper .hero-badge {
  display: inline-flex; align-items: center; gap: 8px;
  height: 30px; padding: 0 12px; border-radius: 999px;
  background: white; border: 1px solid var(--ink-200);
  font-family: 'Geist Mono', ui-monospace, monospace;
  font-size: 11.5px; color: var(--ink-700);
  box-shadow: 0 1px 2px rgba(12,12,29,0.04);
}
.landing-wrapper[data-theme="dark"] .hero-badge {
  background: #0f0f1e;
  border-color: #1e1e2e;
  color: rgba(255, 255, 255, 0.5);
  box-shadow: none;
}
.landing-wrapper .hero-badge .dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.18); }
.landing-wrapper .hero-h1 { margin-top: 22px; }
.landing-wrapper .hero-h1 em {
  font-style: normal;
  background: linear-gradient(100deg, var(--brand-600) 0%, var(--accent-500) 60%, var(--brand-700) 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.landing-wrapper .hero-sub { margin-top: 22px; }
.landing-wrapper .hero-actions { margin-top: 32px; display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.landing-wrapper .hero-trust {
  margin-top: 20px;
  font-family: 'Geist Mono', ui-monospace, monospace;
  font-size: 11.5px; color: var(--ink-400); letter-spacing: 0.01em;
}

/* Dashboard mockup frame */
.landing-wrapper .mock-wrap {
  position: relative; margin-top: 56px; padding: 0 0 20px;
}
.landing-wrapper .mock-wrap::before {
  content: ''; position: absolute; left: 50%; top: -40px; transform: translateX(-50%);
  width: 70%; height: 180px;
  background: radial-gradient(ellipse 50% 50% at 50% 50%, rgba(99,102,241,0.35), transparent 70%);
  filter: blur(40px); z-index: 0;
}
.landing-wrapper .mock {
  position: relative; z-index: 1;
  border-radius: var(--radius-lg);
  border: 1px solid var(--ink-200);
  background: white;
  box-shadow:
    0 1px 0 rgba(255,255,255,0.8) inset,
    0 2px 4px rgba(12,12,29,0.04),
    0 24px 64px -20px rgba(12,12,29,0.22),
    0 50px 100px -40px rgba(99,102,241,0.25);
  overflow: hidden;
}
/* Dashboard mockup stays white even in dark mode as requested */
.landing-wrapper[data-theme="dark"] .mock {
  background: white;
  border-color: var(--ink-200);
  color: var(--ink-900);
}
.landing-wrapper .mock::after {
  content: ''; position: absolute; right: -40px; top: -40px; width: 220px; height: 220px; border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(99,102,241,0.12), transparent 70%);
  pointer-events: none; z-index: 0; opacity: 0; transition: opacity 300ms ease;
}
@media (max-width: 820px) {
  .landing-wrapper .mock::after { opacity: 1; }
}
.landing-wrapper .desktop-only { display: block; }
.landing-wrapper .mobile-only { display: none; }
@media (max-width: 820px) {
  .landing-wrapper .desktop-only { display: none !important; }
  .landing-wrapper .mobile-only { display: block !important; }
}
.landing-wrapper .mock-chrome {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px; border-bottom: 1px solid var(--ink-200);
  background: var(--ink-50);
}
.landing-wrapper .mock-chrome .dots { display: flex; gap: 6px; }
.landing-wrapper .mock-chrome .dots span {
  width: 10px; height: 10px; border-radius: 50%; background: var(--ink-200);
}
.landing-wrapper .mock-chrome .url {
  flex: 1; text-align: center;
  font-family: 'Geist Mono', ui-monospace, monospace;
  font-size: 11.5px; color: var(--ink-400);
}

/* ── Section wrapper ────────────────────────────────────────────────────── */
.landing-wrapper .section { padding: clamp(80px, 12vw, 140px) 0; position: relative; }
.landing-wrapper .section-dark {
  background: #07070f;
  color: #e8e8f0;
  position: relative;
  overflow: hidden;
}
.landing-wrapper .section-dark::before {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(800px 500px at 20% 0%, rgba(99,102,241,0.18), transparent 60%),
    radial-gradient(700px 500px at 90% 100%, rgba(34,211,238,0.08), transparent 60%);
}
.landing-wrapper .section-dark::after {
  content: ''; position: absolute; inset: 0; pointer-events: none; opacity: 0.4;
  background-image:
    linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, #000 30%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, #000 30%, transparent 80%);
}
.landing-wrapper .section-dark > .container { position: relative; z-index: 1; }

/* ── Scroll reveal ─────────────────────────────────────────────────────── */
.landing-wrapper .reveal { opacity: 0; transform: translateY(28px); transition: opacity 720ms cubic-bezier(0.16, 1, 0.3, 1), transform 720ms cubic-bezier(0.16, 1, 0.3, 1); will-change: opacity, transform; }
.landing-wrapper .reveal.in { opacity: 1; transform: translateY(0); }
.landing-wrapper .reveal-up    { transform: translateY(36px); }
.landing-wrapper .reveal-left  { transform: translateX(-28px); }
.landing-wrapper .reveal-right { transform: translateX(28px); }
.landing-wrapper .reveal-scale { transform: translateY(24px) scale(0.985); }
.landing-wrapper .reveal.in.reveal-left, .landing-wrapper .reveal.in.reveal-right { transform: translateX(0); }
.landing-wrapper .reveal.in.reveal-scale { transform: translateY(0) scale(1); }
.landing-wrapper .reveal[data-delay="1"] { transition-delay: 80ms; }
.landing-wrapper .reveal[data-delay="2"] { transition-delay: 160ms; }
.landing-wrapper .reveal[data-delay="3"] { transition-delay: 240ms; }
.landing-wrapper .reveal[data-delay="4"] { transition-delay: 320ms; }
.landing-wrapper .reveal[data-delay="5"] { transition-delay: 400ms; }
@media (prefers-reduced-motion: reduce) {
  .landing-wrapper .reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
}

.landing-wrapper .section-head { max-width: 720px; margin-bottom: 56px; }
.landing-wrapper .section-head .kicker { margin-bottom: 16px; }
.landing-wrapper .section-head .h2 + .lede { margin-top: 20px; }

/* ── Problems ───────────────────────────────────────────────────────────── */
.landing-wrapper .prob-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
}
@media (max-width: 820px) { .landing-wrapper .prob-grid { grid-template-columns: 1fr; } }
.landing-wrapper .prob-card {
  padding: 28px; border-radius: var(--radius);
  background: var(--ink-50);
  border: 1px solid var(--ink-200);
  display: flex; flex-direction: column; gap: 10px;
  transition: transform 200ms ease, box-shadow 200ms ease;
}
.landing-wrapper[data-theme="dark"] .prob-card {
  background: #0f0f1e;
  border-color: #1e1e2e;
}
.landing-wrapper .prob-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px -16px rgba(12,12,29,0.15);
}
.landing-wrapper[data-theme="dark"] .prob-card:hover {
  box-shadow: 0 12px 32px -16px rgba(0,0,0,0.5);
  border-color: rgba(99,102,241,0.2);
}
.landing-wrapper .prob-num {
  font-family: 'Geist Mono', ui-monospace, monospace;
  font-size: 11px; color: var(--brand-600); letter-spacing: 0.05em;
}
.landing-wrapper .prob-t { font-size: 19px; font-weight: 600; letter-spacing: -0.015em; line-height: 1.25; }
.landing-wrapper[data-theme="dark"] .prob-t { color: #fff; }
.landing-wrapper .prob-d { font-size: 15px; color: var(--ink-500); line-height: 1.5; }
.landing-wrapper[data-theme="dark"] .prob-d { color: rgba(232,232,240,0.6); }

/* ── Features (dark) ────────────────────────────────────────────────────── */
.landing-wrapper .feat-grid {
  display: grid; grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}
@media (max-width: 960px) { .landing-wrapper .feat-grid { grid-template-columns: 1fr; } }

.landing-wrapper .feat-card {
  position: relative; padding: 32px;
  border-radius: var(--radius);
  background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015));
  border: 1px solid rgba(255,255,255,0.08);
  display: flex; flex-direction: column; gap: 14px;
  overflow: hidden;
  transition: border-color 200ms ease, transform 200ms ease;
}
.landing-wrapper .feat-card:hover {
  border-color: rgba(99,102,241,0.35);
  transform: translateY(-2px);
}
.landing-wrapper .feat-card .feat-tag {
  font-family: 'Geist Mono', ui-monospace, monospace;
  font-size: 11px; color: var(--accent-400); letter-spacing: 0.05em;
}
.landing-wrapper .feat-card .feat-t {
  font-size: 22px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.2;
  color: #fff;
}
.landing-wrapper .feat-card .feat-d { font-size: 15px; color: rgba(232,232,240,0.6); line-height: 1.55; }
.landing-wrapper .feat-card .feat-visual {
  margin-top: auto; padding-top: 16px;
}

/* grid placements: 1 wide, 4 others arranged */
.landing-wrapper .feat-card.span-3 { grid-column: span 3; min-height: 360px; }
.landing-wrapper .feat-card.span-2 { grid-column: span 2; min-height: 260px; }
@media (max-width: 960px) {
  .landing-wrapper .feat-card.span-3, .landing-wrapper .feat-card.span-2 { grid-column: auto; min-height: 0; }
}

/* ── How it works ───────────────────────────────────────────────────────── */
.landing-wrapper .steps {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
  position: relative;
}
.landing-wrapper .steps::before {
  content: ''; position: absolute;
  top: 22px; left: 5%; right: 5%; height: 1px;
  background: repeating-linear-gradient(to right, var(--ink-300) 0 4px, transparent 4px 8px);
  z-index: 0;
}
.landing-wrapper[data-theme="dark"] .steps::before {
  background: repeating-linear-gradient(to right, rgba(255,255,255,0.12) 0 4px, transparent 4px 8px);
}
@media (max-width: 820px) {
  .landing-wrapper .steps { grid-template-columns: 1fr; }
  .landing-wrapper .steps::before { display: none; }
}
.landing-wrapper .step { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 14px; }
.landing-wrapper .step-num {
  width: 44px; height: 44px; border-radius: 999px;
  display: flex; align-items: center; justify-content: center;
  background: white; border: 1px solid var(--ink-200);
  font-family: 'Geist Mono', ui-monospace, monospace;
  font-size: 13px; color: var(--brand-700); font-weight: 500;
  box-shadow: 0 1px 2px rgba(12,12,29,0.04);
}
.landing-wrapper[data-theme="dark"] .step-num {
  background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.12); color: var(--accent-400);
}
.landing-wrapper .step-t { font-size: 18px; font-weight: 600; letter-spacing: -0.015em; }
.landing-wrapper[data-theme="dark"] .step-t { color: #fff; }
.landing-wrapper .step-d { font-size: 15px; color: var(--ink-500); line-height: 1.5; }
.landing-wrapper[data-theme="dark"] .step-d { color: rgba(232,232,240,0.6); }

/* ── Stats ──────────────────────────────────────────────────────────────── */
.landing-wrapper .stats {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 0;
  border-top: 1px solid var(--ink-200);
  border-bottom: 1px solid var(--ink-200);
  margin-top: 80px;
}
.landing-wrapper[data-theme="dark"] .stats { border-color: rgba(255,255,255,0.1); }
@media (max-width: 820px) { .landing-wrapper .stats { grid-template-columns: repeat(2, 1fr); } }
.landing-wrapper .stat {
  padding: 28px 24px; border-right: 1px solid var(--ink-200);
}
.landing-wrapper[data-theme="dark"] .stat { border-right-color: rgba(255,255,255,0.1); }
.landing-wrapper .stat:last-child { border-right: 0; }
@media (max-width: 820px) {
  .landing-wrapper .stat:nth-child(2) { border-right: 0; }
  .landing-wrapper .stat:nth-child(1), .landing-wrapper .stat:nth-child(2) { border-bottom: 1px solid var(--ink-200); }
  .landing-wrapper[data-theme="dark"] .stat:nth-child(1), .landing-wrapper[data-theme="dark"] .stat:nth-child(2) { border-bottom-color: rgba(255,255,255,0.1); }
}
.landing-wrapper .stat-v {
  font-size: 40px; font-weight: 600; letter-spacing: -0.035em; line-height: 1;
  font-family: 'Geist', sans-serif;
}
.landing-wrapper[data-theme="dark"] .stat-v { color: #fff; }
.landing-wrapper .stat-v em { font-family: 'Instrument Serif', serif; font-style: italic; font-weight: 400; color: var(--brand-600); }
.landing-wrapper[data-theme="dark"] .stat-v em { color: var(--accent-400); }
.landing-wrapper .stat-l {
  margin-top: 10px; font-size: 13px; color: var(--ink-500);
  font-family: 'Geist Mono', ui-monospace, monospace;
}
.landing-wrapper[data-theme="dark"] .stat-l { color: rgba(232,232,240,0.6); }

/* ── Final CTA ──────────────────────────────────────────────────────────── */
.landing-wrapper .final-cta {
  position: relative; overflow: hidden;
  border-radius: 28px;
  padding: clamp(56px, 8vw, 96px) clamp(24px, 5vw, 64px);
  background:
    radial-gradient(800px 400px at 20% 0%, rgba(99,102,241,0.7), transparent 60%),
    radial-gradient(600px 400px at 100% 100%, rgba(14,165,233,0.5), transparent 60%),
    linear-gradient(180deg, #1e1b4b, #0c0c1d);
  color: #fff;
  text-align: center;
  box-shadow: 0 30px 80px -30px rgba(99,102,241,0.4);
}
.landing-wrapper .final-cta::before {
  content: ''; position: absolute; inset: 0; opacity: 0.3;
  background-image:
    linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 70% 80% at 50% 50%, #000 30%, transparent 90%);
  -webkit-mask-image: radial-gradient(ellipse 70% 80% at 50% 50%, #000 30%, transparent 90%);
}
.landing-wrapper .final-cta-inner { position: relative; z-index: 1; }
.landing-wrapper .final-cta .h2 { color: #fff; }
.landing-wrapper .final-cta .lede { color: rgba(255,255,255,0.75); margin: 20px auto 0; }
.landing-wrapper .final-cta .actions { margin-top: 32px; display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
.landing-wrapper .final-cta .btn-primary {
  background: white; color: var(--ink-900);
  box-shadow: 0 10px 40px -10px rgba(0,0,0,0.4);
}
.landing-wrapper .final-cta .btn-primary:hover { background: #f0f0f5; }
.landing-wrapper .final-cta .btn-ghost {
  color: #fff;
  border-color: rgba(255,255,255,0.22);
  background: rgba(255,255,255,0.04);
}
.landing-wrapper .final-cta .btn-ghost:hover { background: rgba(255,255,255,0.1); }

/* ── Footer ─────────────────────────────────────────────────────────────── */
.landing-wrapper .footer { padding: 64px 0 32px; border-top: 1px solid var(--ink-200); }
.landing-wrapper[data-theme="dark"] .footer { border-top-color: rgba(255,255,255,0.08); }
.landing-wrapper .footer-grid {
  display: grid; grid-template-columns: 2fr repeat(3, 1fr); gap: 32px;
  margin-bottom: 48px;
}
@media (max-width: 720px) { .landing-wrapper .footer-grid { grid-template-columns: 1fr 1fr; } }
.landing-wrapper .footer-col h4 {
  font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--ink-500); font-weight: 500; margin: 0 0 14px;
  font-family: 'Geist Mono', ui-monospace, monospace;
}
.landing-wrapper .footer-col ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.landing-wrapper .footer-col a { font-size: 14px; color: var(--ink-700); text-decoration: none; }
.landing-wrapper .footer-col a:hover { color: var(--brand-700); }
.landing-wrapper .footer-bottom {
  display: flex; justify-content: space-between; align-items: center; gap: 16px;
  padding-top: 24px; border-top: 1px solid var(--ink-200);
  font-size: 13px; color: var(--ink-500);
  flex-wrap: wrap;
}
.landing-wrapper[data-theme="dark"] .footer-bottom { border-top-color: rgba(255,255,255,0.08); }
.landing-wrapper .footer-social { display: flex; gap: 8px; }
.landing-wrapper .footer-social a {
  width: 34px; height: 34px; border-radius: 8px;
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid var(--ink-200); color: var(--ink-500);
}
.landing-wrapper .footer-social a:hover { color: var(--brand-700); border-color: var(--brand-500); }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────
const Icon = {
  arrow: (p: any) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}>
      <path
        d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  play: (p: any) => (
    <svg width="10" height="12" viewBox="0 0 10 12" fill="none" {...p}>
      <path
        d="M1 1l8 5-8 5V1z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="currentColor"
      />
    </svg>
  ),
  github: (p: any) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.79 8.2 11.38.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.13-.3-.54-1.52.11-3.17 0 0 1-.32 3.3 1.23a11.5 11.5 0 016 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.92 1.24 3.23 0 4.62-2.81 5.64-5.48 5.94.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58C20.56 22.28 24 17.8 24 12.5 24 5.87 18.63.5 12 .5z" />
    </svg>
  ),
  linkedin: (p: any) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
    </svg>
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// Nav
// ─────────────────────────────────────────────────────────────────────────────
function Nav({ lang, setLang, t, scrolled, isMobile }: any) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-inner">
          <a href="#" className="brand">
            <img src="/logo-expense-tracker.png" alt="" />
            <span>Expense Tracker</span>
          </a>
          <div className="nav-links">
            <a href="#features">{t.nav.features}</a>
            <a href="#how">{t.nav.how}</a>
            <a
              href="https://github.com/davydfontourac/expense-tracker"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.nav.github}
            </a>
          </div>
          <div className="nav-actions">
            <ThemeToggle />
            <div className="lang-toggle" role="tablist" aria-label="Language">
              <button className={lang === 'pt-BR' ? 'active' : ''} onClick={() => setLang('pt-BR')}>
                PT
              </button>
              <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>
                EN
              </button>
            </div>
            <Link to={isMobile ? "/welcome?mode=login" : "/login"} className="btn btn-ghost btn-sm">
              {t.nav.signin}
            </Link>
            <Link to={isMobile ? "/welcome" : "/register"} className="btn btn-primary btn-sm">
              {t.nav.cta}
            </Link>
          </div>
          <button className="burger" onClick={() => setMenuOpen(true)} aria-label="Menu">
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="mobile-sheet">
          <div className="top">
            <a href="#" className="brand" onClick={() => setMenuOpen(false)}>
              <img src="/logo-expense-tracker.png" alt="" />
              <span>Expense Tracker</span>
            </a>
            <button className="x-btn" onClick={() => setMenuOpen(false)} aria-label="Close menu">
              ✕
            </button>
          </div>
          <nav>
            <a href="#features" onClick={() => setMenuOpen(false)}>
              {t.nav.features}
            </a>
            <a href="#how" onClick={() => setMenuOpen(false)}>
              {t.nav.how}
            </a>
            <a
              href="https://github.com/davydfontourac/expense-tracker"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
            >
              {t.nav.github}
            </a>
          </nav>
          <div className="foot">
            <div className="foot-row">
              <ThemeToggle dropdownPosition="top" align="left" />
              <div className="lang-toggle" role="tablist" aria-label="Language">
                <button
                  className={lang === 'pt-BR' ? 'active' : ''}
                  onClick={() => setLang('pt-BR')}
                >
                  PT
                </button>
                <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>
                  EN
                </button>
              </div>
            </div>
            <Link to={isMobile ? "/welcome?mode=login" : "/login"} className="btn btn-ghost" onClick={() => setMenuOpen(false)}>
              {t.nav.signin}
            </Link>
            <Link to={isMobile ? "/welcome" : "/register"} className="btn btn-primary" onClick={() => setMenuOpen(false)}>
              {t.nav.cta}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard mockup (clean, data-driven, not slop)
// ─────────────────────────────────────────────────────────────────────────────
function DashboardMock({ t }: any) {
  const bars = [42, 58, 71, 49, 83, 92, 76, 64, 88, 72, 95, 81];
  const months = t.mock.months;
  const sparks = [
    [20, 28, 24, 36, 30, 42, 38, 50],
    [60, 52, 58, 44, 50, 38, 30, 24],
    [12, 18, 16, 22, 20, 28, 26, 34],
  ];
  const pts = [28, 34, 30, 42, 38, 50, 46, 58, 52, 64];
  const mkSpark = (pts: number[], color: string) => {
    const mx = Math.max(...pts);
    return (
      <svg
        width="100%"
        height="22"
        viewBox="0 0 100 22"
        preserveAspectRatio="none"
        style={{ marginTop: 10 }}
      >
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          points={pts
            .map((v, i) => `${(i / (pts.length - 1)) * 100},${22 - (v / mx) * 20}`)
            .join(' ')}
        />
      </svg>
    );
  };

  return (
    <>
      {/* Desktop Version */}
      <div className="mock desktop-only">
        <div className="mock-chrome">
          <div className="dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="url">controle-de-gastos.vercel.app/dashboard</div>
          <div style={{ width: 52 }}></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: 500 }}>
          {/* Sidebar */}
          <aside
            style={{
              borderRight: '1px solid var(--ink-200)',
              padding: '20px 16px',
              background: 'var(--ink-50)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '0 4px 16px',
                marginBottom: 4,
              }}
            >
              <img
                src="/logo-expense-tracker.png"
                alt=""
                style={{ width: 22, height: 22, objectFit: 'contain' }}
              />
              <span style={{ fontWeight: 600, fontSize: 13, letterSpacing: '-0.01em' }}>
                Expense Tracker
              </span>
            </div>
            <div
              style={{
                fontFamily: 'Geist Mono, monospace',
                fontSize: 9.5,
                color: 'var(--ink-400)',
                letterSpacing: '0.08em',
                padding: '6px 10px 6px',
                textTransform: 'uppercase',
              }}
            >
              {t.mock.sidebar.general}
            </div>
            {[
              ['▦', t.mock.sidebar.dashboard, true],
              ['≡', t.mock.sidebar.transactions, false],
              ['◫', t.mock.sidebar.categories, false],
              ['⎘', t.mock.sidebar.savings, false],
            ].map(([ic, label, active]) => (
              <div
                key={label.toString()}
                style={{
                  padding: '7px 10px',
                  borderRadius: 7,
                  fontSize: 13,
                  color: active ? 'var(--ink-900)' : 'var(--ink-500)',
                  background: active ? 'var(--ink-100)' : 'transparent',
                  fontWeight: active ? 500 : 400,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span
                  style={{
                    width: 14,
                    fontFamily: 'Geist Mono, monospace',
                    fontSize: 11,
                    color: active ? 'var(--brand-500)' : 'var(--ink-400)',
                    textAlign: 'center',
                  }}
                >
                  {ic}
                </span>
                {label}
              </div>
            ))}
          </aside>

          {/* Main */}
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div
              style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.025em' }}>
                  {t.mock.header.greeting}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 4 }}>
                  {t.mock.header.spent} <b style={{ color: 'var(--ink-900)' }}>R$ 1.292,83</b>{' '}
                  {t.mock.header.inApril} · 41% {t.mock.header.ofRevenue}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <div
                  style={{
                    height: 30,
                    padding: '0 10px',
                    borderRadius: 7,
                    border: '1px solid var(--ink-200)',
                    background: 'white',
                    fontSize: 11.5,
                    color: 'var(--ink-700)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  📅 {t.mock.header.april2026}
                </div>
              </div>
            </div>

            {/* KPI cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                {
                  label: t.mock.kpis.available,
                  sub: t.mock.kpis.balance,
                  v: 'R$ 2.014,70',
                  delta: '+4.2%',
                  color: 'var(--brand-500)',
                  pts: sparks[0],
                },
                {
                  label: t.mock.kpis.income,
                  sub: t.mock.kpis.thisMonth,
                  v: 'R$ 3.179,00',
                  delta: '+12%',
                  color: '#10b981',
                  pts: sparks[0],
                },
                {
                  label: t.mock.kpis.expenses,
                  sub: t.mock.kpis.thisMonth,
                  v: 'R$ 1.292,83',
                  delta: '-3.1%',
                  color: '#ef4444',
                  pts: sparks[1],
                },
              ].map((k) => (
                <div
                  key={k.label}
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    border: '1px solid var(--ink-200)',
                    background: 'white',
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: 'var(--ink-400)',
                      fontFamily: 'Geist Mono, monospace',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {k.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>{k.sub}</div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 600,
                      letterSpacing: '-0.025em',
                      marginTop: 10,
                      lineHeight: 1,
                    }}
                  >
                    {k.v}
                  </div>
                  {mkSpark(k.pts, k.color)}
                </div>
              ))}
            </div>

            {/* Chart */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 10, flex: 1 }}>
              <div
                style={{
                  padding: 14,
                  borderRadius: 12,
                  border: '1px solid var(--ink-200)',
                  background: 'white',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
                  {t.mock.charts.monthlyTitle}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 130 }}>
                  {bars.map((h, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: h + '%',
                          borderRadius: '3px 3px 0 0',
                          background: i === 3 ? 'var(--brand-500)' : 'var(--ink-100)',
                        }}
                      />
                      <div
                        style={{
                          fontSize: 9,
                          color: 'var(--ink-400)',
                          fontFamily: 'Geist Mono, monospace',
                        }}
                      >
                        {months[i]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  padding: 14,
                  borderRadius: 12,
                  border: '1px solid var(--ink-200)',
                  background: 'white',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
                  {t.mock.charts.distTitle}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                  }}
                >
                  <Donut t={t} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Version */}
      <div className="mock mobile-only" style={{ padding: 20 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontFamily: '"Geist Mono", monospace',
              fontSize: 10,
              color: 'var(--ink-400)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Disponível · Abril
          </div>
          <div style={{ fontSize: 14, color: 'var(--ink-400)' }}>⋯</div>
        </div>
        <div
          style={{
            fontSize: 38,
            fontWeight: 600,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            color: 'inherit',
            position: 'relative',
            zIndex: 1,
          }}
        >
          R$ 2.014,70
        </div>
        <div
          style={{
            fontFamily: '"Geist Mono", monospace',
            fontSize: 11,
            color: '#10b981',
            marginTop: 10,
            position: 'relative',
            zIndex: 1,
          }}
        >
          + R$ 412,00 · 4,2% vs. março
        </div>
        <svg
          style={{
            marginTop: 14,
            height: 42,
            width: '100%',
            position: 'relative',
            zIndex: 1,
            overflow: 'visible',
          }}
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="sparkGradMobile" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`M 0,${40 - (pts[0] / Math.max(...pts)) * 36} ${pts.map((v, i) => `L ${(i / (pts.length - 1)) * 100},${40 - (v / Math.max(...pts)) * 36}`).join(' ')} L 100,40 L 0,40 Z`}
            fill="url(#sparkGradMobile)"
          />
          <polyline
            fill="none"
            stroke="#6366f1"
            strokeWidth="1.5"
            points={pts
              .map((v, i) => `${(i / (pts.length - 1)) * 100},${40 - (v / Math.max(...pts)) * 36}`)
              .join(' ')}
          />
        </svg>
        <div
          style={{
            marginTop: 32,
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {[
            { ic: '🍔', d: 'iFood — Combo', m: '22 ABR · Débito', v: -33.39, pos: false },
            { ic: '⚡', d: 'Pix recebido', m: '21 ABR · Zamp SA', v: 25.9, pos: true },
            { ic: '🚗', d: 'Uber *Trip', m: '21 ABR · Transporte', v: -17.36, pos: false },
            { ic: '🛒', d: 'Supermercado', m: '20 ABR · Mercado', v: -142.8, pos: false },
          ].map((r, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 0',
                borderTop: '1px solid var(--ink-200)',
                borderTopColor: 'var(--div-color, var(--ink-100))',
              }}
            >
              <div
                className="ic"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 16,
                  background: 'var(--ink-100)',
                }}
              >
                {r.ic}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {r.d}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--ink-400)',
                    fontFamily: '"Geist Mono", monospace',
                    marginTop: 3,
                    letterSpacing: '0.02em',
                  }}
                >
                  {r.m}
                </div>
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  fontVariantNumeric: 'tabular-nums',
                  color: r.pos ? '#10b981' : 'inherit',
                }}
              >
                {r.pos ? '+' : '−'} R${' '}
                {Math.abs(r.v).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Donut({ t }: any) {
  const segs = [
    { v: 38, c: '#6366f1' },
    { v: 30, c: '#8b5cf6' },
    { v: 16, c: '#22d3ee' },
    { v: 8, c: '#0ea5e9' },
    { v: 8, c: '#94a3b8' },
  ];
  const R = 36,
    C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={R} fill="none" stroke="var(--ink-100)" strokeWidth="14" />
      {segs.map((s, i) => {
        const len = (s.v / 100) * C;
        const el = (
          <circle
            key={i}
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke={s.c}
            strokeWidth="14"
            strokeDasharray={`${len} ${C - len}`}
            strokeDashoffset={-acc}
            transform="rotate(-90 50 50)"
          />
        );
        acc += len;
        return el;
      })}
      <text
        x="50"
        y="48"
        textAnchor="middle"
        fontSize="14"
        fontWeight="600"
        fill="#0c0c1d"
        fontFamily="Geist"
      >
        R$ 1.3k
      </text>
      <text x="50" y="62" textAnchor="middle" fontSize="8" fill="#9a9ab0" fontFamily="Geist Mono">
        {t.mock.charts.spent}
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────────────────────────────────────
function Hero({ t, isMobile }: any) {
  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="hero-grid" />
      <div className="container hero-inner">
        <div className="hero-badge">
          <span className="dot"></span>
          <span>{t.hero.badge}</span>
        </div>
        <h1 className="h1 hero-h1">
          {t.hero.h1a}
          <br />
          <em>{t.hero.h1b}</em>
        </h1>
        <p className="lede hero-sub">{t.hero.sub}</p>
        <div className="hero-actions">
          <Link to={isMobile ? "/welcome" : "/register"} className="btn btn-primary">
            {t.hero.cta} <Icon.arrow />
          </Link>
          <a
            href="https://controle-de-gastos-tan-six.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
          >
            <Icon.play /> {t.hero.cta2}
          </a>
        </div>
        <div className="hero-trust">{t.hero.trust}</div>

        <Reveal className="mock-wrap" variant="scale" afterLoad={900}>
          <DashboardMock t={t} />
        </Reveal>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Problems
// ─────────────────────────────────────────────────────────────────────────────
function Problems({ t }: any) {
  return (
    <section className="section">
      <div className="container">
        <Reveal className="section-head">
          <div className="kicker">{t.problems.kicker}</div>
          <h2 className="h2">{t.problems.title}</h2>
        </Reveal>
        <div className="prob-grid">
          {t.problems.items.map((p: any, i: number) => (
            <Reveal className="prob-card" key={i} delay={i + 1}>
              <div className="prob-num">0{i + 1} / 03</div>
              <div className="prob-t">{p.t}</div>
              <div className="prob-d">{p.d}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Features (dark section)
// ─────────────────────────────────────────────────────────────────────────────
function FeatureVisuals(t: any) {
  return {
    dashboard: (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div
          style={{
            padding: 14,
            borderRadius: 10,
            background: 'rgba(99,102,241,0.12)',
            border: '1px solid rgba(99,102,241,0.25)',
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontFamily: 'Geist Mono, monospace',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            {t.visuals.balance}
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: '#fff',
              letterSpacing: '-0.02em',
              marginTop: 4,
            }}
          >
            R$ 18.240
          </div>
          <div
            style={{
              fontSize: 10,
              fontFamily: 'Geist Mono, monospace',
              color: 'var(--accent-400)',
              marginTop: 2,
            }}
          >
            {t.visuals.accumulated}
          </div>
        </div>
        <div
          style={{
            padding: 14,
            borderRadius: 10,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontFamily: 'Geist Mono, monospace',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            {t.visuals.expenses}
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: '#fff',
              letterSpacing: '-0.02em',
              marginTop: 4,
            }}
          >
            R$ 4.827
          </div>
          <div
            style={{
              fontSize: 10,
              fontFamily: 'Geist Mono, monospace',
              color: 'rgba(255,255,255,0.5)',
              marginTop: 2,
            }}
          >
            {t.visuals.oct2026}
          </div>
        </div>
      </div>
    ),
    csv: (
      <div
        style={{
          fontFamily: 'Geist Mono, monospace',
          fontSize: 11,
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10,
          padding: 12,
          color: 'rgba(255,255,255,0.75)',
        }}
      >
        <div style={{ color: 'rgba(255,255,255,0.4)' }}>$ statement.csv</div>
        <div style={{ marginTop: 6 }}>
          <span style={{ color: '#22d3ee' }}>02/10</span> IFOOD *PIZZARIA{' '}
          <span style={{ color: '#a78bfa' }}>→ {t.visuals.csv.food}</span>
        </div>
        <div>
          <span style={{ color: '#22d3ee' }}>04/10</span> UBER TRIP{' '}
          <span style={{ color: '#a78bfa' }}>→ {t.visuals.csv.transport}</span>
        </div>
        <div>
          <span style={{ color: '#22d3ee' }}>07/10</span> NETFLIX{' '}
          <span style={{ color: '#a78bfa' }}>→ {t.visuals.csv.subs}</span>
        </div>
        <div style={{ marginTop: 8, color: '#10b981' }}>✓ 47 {t.visuals.csv.imported}</div>
      </div>
    ),
    categories: (
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[
          ['🍔', t.visuals.categories[0], 'rgba(239,68,68,0.2)'],
          ['🚗', t.visuals.categories[1], 'rgba(14,165,233,0.2)'],
          ['🏠', t.visuals.categories[2], 'rgba(99,102,241,0.2)'],
          ['🎬', t.visuals.categories[3], 'rgba(168,85,247,0.2)'],
          ['💊', t.visuals.categories[4], 'rgba(34,197,94,0.2)'],
          ['📚', t.visuals.categories[5], 'rgba(234,179,8,0.2)'],
          ['✈️', t.visuals.categories[6], 'rgba(34,211,238,0.2)'],
          ['+ ' + t.visuals.categories[7], '', 'rgba(255,255,255,0.06)'],
        ].map(([e, l, bg], i) => (
          <div
            key={i}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              borderRadius: 999,
              background: bg,
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: 12,
              color: '#fff',
            }}
          >
            <span>{e}</span>
            {l && <span>{l}</span>}
          </div>
        ))}
      </div>
    ),
    dark: (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, height: 80 }}>
        <div style={{ borderRadius: 8, background: 'white', padding: 10 }}>
          <div style={{ height: 4, borderRadius: 2, background: '#e6e6ee', width: '60%' }} />
          <div
            style={{
              height: 12,
              borderRadius: 2,
              background: '#0c0c1d',
              marginTop: 6,
              width: '80%',
            }}
          />
          <div
            style={{
              height: 4,
              borderRadius: 2,
              background: '#e6e6ee',
              marginTop: 8,
              width: '50%',
            }}
          />
        </div>
        <div
          style={{
            borderRadius: 8,
            background: '#0c0c1d',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: 10,
          }}
        >
          <div
            style={{
              height: 4,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.15)',
              width: '60%',
            }}
          />
          <div
            style={{
              height: 12,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.85)',
              marginTop: 6,
              width: '80%',
            }}
          />
          <div
            style={{
              height: 4,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.15)',
              marginTop: 8,
              width: '50%',
            }}
          />
        </div>
      </div>
    ),
    security: (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: 14,
          borderRadius: 10,
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.08)',
          fontFamily: 'Geist Mono, monospace',
          fontSize: 11,
        }}
      >
        <div style={{ color: '#10b981' }}>●</div>
        <div style={{ color: 'rgba(255,255,255,0.75)' }}>
          row-level-security <span style={{ color: 'rgba(255,255,255,0.4)' }}>ON</span>
        </div>
        <div style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.4)' }}>Supabase</div>
      </div>
    ),
  };
}

function Features({ t }: any) {
  const v = FeatureVisuals(t);
  const visuals = [v.dashboard, v.csv, v.categories, v.dark, v.security];
  const classes = ['span-3', 'span-3', 'span-2', 'span-2', 'span-2'];

  return (
    <section className="section section-dark" id="features">
      <div className="container">
        <Reveal className="section-head">
          <div className="kicker">{t.features.kicker}</div>
          <h2 className="h2" style={{ color: '#fff' }}>
            {t.features.title}
          </h2>
        </Reveal>
        <div className="feat-grid">
          {t.features.items.map((f: any, i: number) => (
            <Reveal
              key={i}
              className={`feat-card ${classes[i]}`}
              variant="scale"
              delay={(i % 3) + 1}
            >
              <div className="feat-tag">{f.tag}</div>
              <div className="feat-t">{f.t}</div>
              <div className="feat-d">{f.d}</div>
              <div className="feat-visual">{visuals[i]}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// How it works + stats
// ─────────────────────────────────────────────────────────────────────────────
function HowItWorks({ t, lang }: any) {
  const stats =
    lang === 'pt-BR'
      ? [
          [
            '100%',
            <>
              <em>open</em> source
            </>,
            'Código no GitHub · MIT',
          ],
          ['5min', 'Até o primeiro relatório', 'Do cadastro ao insight'],
          ['∞', 'Categorias customizáveis', 'Emoji, cor, seu jeito'],
          ['R$ 0', 'Gratuito para sempre', 'Sem pegadinha, sem cartão'],
        ]
      : [
          [
            '100%',
            <>
              <em>open</em> source
            </>,
            'Code on GitHub · MIT',
          ],
          ['5min', 'To your first report', 'Sign-up to insight'],
          ['∞', 'Custom categories', 'Emoji, color, your way'],
          ['$0', 'Free forever', 'No tricks, no card'],
        ];

  return (
    <section className="section" id="how">
      <div className="container">
        <Reveal className="section-head">
          <div className="kicker">{t.how.kicker}</div>
          <h2 className="h2">{t.how.title}</h2>
        </Reveal>
        <div className="steps">
          {t.how.steps.map((s: any, i: number) => (
            <Reveal className="step" key={i} delay={i + 1}>
              <div className="step-num">{s.n}</div>
              <div className="step-t">{s.t}</div>
              <div className="step-d">{s.d}</div>
            </Reveal>
          ))}
        </div>

        <div className="stats">
          {stats.map(([v, label, sub], i) => (
            <Reveal className="stat" key={i} delay={i + 1}>
              <div className="stat-v">{v}</div>
              <div className="stat-l">{label}</div>
              <div
                className="stat-l"
                style={{ fontFamily: 'Geist', color: 'var(--ink-700)', fontSize: 14, marginTop: 4 }}
              >
                {sub}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Final CTA
// ─────────────────────────────────────────────────────────────────────────────
function FinalCTA({ t, isMobile }: any) {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <Reveal className="final-cta" variant="scale">
          <div className="final-cta-inner">
            <h2 className="h2">{t.cta.title}</h2>
            <p className="lede">{t.cta.sub}</p>
            <div className="actions">
              <Link to={isMobile ? "/welcome" : "/register"} className="btn btn-primary">
                {t.cta.btn} <Icon.arrow />
              </Link>
              <a
                href="https://github.com/davydfontourac/expense-tracker"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
              >
                <Icon.github /> {t.cta.btn2}
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────────────────────────────
function Footer({ t }: any) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <a href="#" className="brand">
              <img
                src="/logo-expense-tracker.png"
                alt=""
                style={{ width: 32, height: 32, objectFit: 'contain' }}
              />
              <span style={{ fontSize: 16 }}>Expense Tracker</span>
            </a>
            <div
              style={{
                marginTop: 14,
                fontSize: 14,
                color: 'var(--ink-500)',
                maxWidth: 320,
                lineHeight: 1.55,
              }}
            >
              {t.footer.tag}
            </div>
          </div>
          <div className="footer-col">
            <h4>{t.footer.product}</h4>
            <ul>
              {t.footer.links.product.map(([l, h]: any) => (
                <li key={l}>
                  <a href={h}>{l}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>{t.footer.company}</h4>
            <ul>
              {t.footer.links.company.map(([l, h]: any) => (
                <li key={l}>
                  <a
                    href={h}
                    target={h.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>{t.footer.resources}</h4>
            <ul>
              {t.footer.links.resources.map(([l, h]: any) => (
                <li key={l}>
                  <a href={h}>{l}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div>{t.footer.rights}</div>
          <div className="footer-social">
            <a
              href="https://github.com/davydfontourac"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <Icon.github />
            </a>
            <a
              href="https://linkedin.com/in/davyd-camargo-dev"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <Icon.linkedin />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Landing Page Component
// ─────────────────────────────────────────────────────────────────────────────
export default function Landing() {
  useTheme();
  const [lang, setLang] = useState(() => localStorage.getItem('language') || 'pt-BR');
  const [isDark, setIsDark] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 820);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const checkDark = () => {
      setIsDark(root.classList.contains('dark'));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const t = COPY[lang];
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang === 'pt-BR' ? 'pt-BR' : 'en';
  }, [lang]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="landing-wrapper"
      data-theme={isDark ? 'dark' : 'light'}
      style={{
        background: isDark ? '#07070f' : 'white',
        color: isDark ? '#e8e8f0' : 'var(--ink-900)',
        minHeight: '100vh',
        width: '100vw',
        overflowX: 'hidden',
      }}
    >
      <style>{STYLE}</style>
      <Nav lang={lang} setLang={setLang} t={t} scrolled={scrolled} isMobile={isMobile} />
      <Hero t={t} isMobile={isMobile} />
      <Problems t={t} />
      <Features t={t} />
      <HowItWorks t={t} lang={lang} />
      <FinalCTA t={t} isMobile={isMobile} />
      <Footer t={t} />
    </div>
  );
}
