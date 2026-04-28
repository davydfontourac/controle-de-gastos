import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Plus, Search, X, FileUp, Tag, ArrowUpRight, ArrowDownLeft, Bell, TrendingUp, Loader2, Crosshair, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { useMobile } from '@/hooks/useMobile';
import PageTransition from '@/components/PageTransition';
import { useTransactions } from '@/hooks/useTransactions';
import { Link } from 'react-router-dom';
import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Sparkline } from '@/components/Sparkline';
import { Donut } from '@/components/Donut';
import { motion } from 'framer-motion';

import TransactionForm from '@/components/TransactionForm';
import ImportWizard from '@/components/ImportWizard/ImportWizard';
import ConfirmModal from '@/components/ConfirmModal';
import { MonthYearPicker } from '@/components/MonthYearPicker';
import { usePrivacy } from '@/context/PrivacyContext';
import { cn } from '@/utils/cn';
import type { Transaction } from '@/types';

const CAT_EMOJI: Record<string, string> = {
  Alimentação: '🍔',
  Transporte: '🚗',
  Supermercado: '🛒',
  Pix: '⚡',
  Receita: '💰',
  Débito: '💳',
  Saúde: '💊',
  Lazer: '🎬',
  Educação: '📚',
};

const fmt = (n: number) =>
  'R$ ' +
  Math.abs(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface MonthlyHistory {
  month: string | number;
  fullMonth?: number;
  year: number;
  income: number;
  expense: number;
}

export default function Dashboard() {
  const { profile, isLoading: isAuthLoading } = useAuth();
  const { hideBalance } = usePrivacy();
  const [searchParams] = useSearchParams();
  const [showBalanceLocal, setShowBalanceLocal] = useState(!hideBalance);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const {
    transactions,
    summary,
    history,
    isLoading,
    fetchTransactions,
    deleteTransactionsByMonth,
  } = useTransactions();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [modalInitialType, setModalInitialType] = useState<'income' | 'expense' | 'transfer_in' | 'transfer_out' | undefined>(undefined);

  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
  });

  const fetchData = useCallback(async () => {
    await fetchTransactions(filters);
  }, [filters, fetchTransactions]);

  useEffect(() => {
    const timer = setTimeout(
      () => {
        fetchData();
      },
      filters.search ? 400 : 0,
    );
    return () => clearTimeout(timer);
  }, [fetchData, filters.search]);

  useEffect(() => {
    if (searchParams.get('import') === 'true') {
      setIsImportOpen(true);
    }
  }, [searchParams]);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
    setModalInitialType(undefined);
  };

  const openModalWithType = (type: any) => {
    setModalInitialType(type);
    setIsModalOpen(true);
  };

  const categoriesData = useMemo(() => {
    const cats: Record<string, { total: number; count: number }> = {};
    let totalVal = 0;
    const targetType = filters.type === 'all' ? 'expense' : filters.type;

    transactions
      .filter((t) => t.type === targetType)
      .forEach((t) => {
        const catName = t.categories?.name || 'Outros';
        cats[catName] = cats[catName] || { total: 0, count: 0 };
        cats[catName].total += Math.abs(t.amount);
        cats[catName].count += 1;
        totalVal += Math.abs(t.amount);
      });

    const colors = [
      '#6366f1',
      '#8b5cf6',
      '#22d3ee',
      '#0ea5e9',
      '#f59e0b',
      '#10b981',
      '#ef4444',
      '#a855f7',
    ];

    return Object.entries(cats)
      .map(([name, data], i) => ({
        name,
        total: data.total,
        count: data.count,
        pct: totalVal > 0 ? Math.round((data.total / totalVal) * 100) : 0,
        color: colors[i % colors.length],
      }))
      .sort((a, b) => b.total - a.total);
  }, [transactions, filters.type]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  const currentMonthName = useMemo(() => {
    const date = new Date(Number(filters.year), Number(filters.month) - 1);
    return format(date, 'MMM yyyy', { locale: ptBR }).toUpperCase();
  }, [filters.month, filters.year]);

  const typedHistory = history as MonthlyHistory[];
  const isMobile = useMobile();

  if (isAuthLoading || isLoading && transactions.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-transparent">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (isMobile) {
    return (
      <PageTransition className="min-h-screen bg-[#f8f9fc] dark:bg-[#0c0c1d] pb-32">
        {/* Header */}
        <header className="px-6 pt-12 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <img src="/logo-expense-tracker.png" alt="Logo" className="w-8 h-8 object-contain rounded-xl shadow-lg shadow-blue-600/10" />
             <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Expense Tracker</h1>
          </div>
          <div className="flex items-center gap-3">
             <button className="p-2.5 bg-white dark:bg-[#161629] rounded-xl border border-gray-100 dark:border-white/5 shadow-sm">
                <Bell size={20} className="text-gray-600 dark:text-gray-400" />
             </button>
             <Link to="/profile" className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  profile?.full_name?.charAt(0).toUpperCase() || 'U'
                )}
             </Link>
          </div>
        </header>

        {/* Balance Card */}
        <div className="px-6 mb-8">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#4f46e5] via-[#6366f1] to-[#8b5cf6] rounded-[32px] p-6 shadow-2xl shadow-indigo-500/30">
            {/* Background Chart (Wavy Line) */}
            <div className="absolute inset-0 opacity-20 mt-12 pointer-events-none">
              <svg viewBox="0 0 400 150" preserveAspectRatio="none" className="w-full h-full">
                <path d="M0,100 C50,80 100,120 150,90 C200,60 250,110 300,70 C350,30 400,60 400,60 V150 H0 Z" fill="white" />
              </svg>
            </div>

            <div className="relative z-10">
              <div className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1 flex items-center justify-between">
                <span>Saldo · {currentMonthName}</span>
                <button onClick={() => setShowBalanceLocal(!showBalanceLocal)} className="p-1 hover:bg-white/10 rounded-md transition-colors">
                  {showBalanceLocal ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
              </div>
              <div className={cn("text-3xl font-bold text-white mb-2 transition-all duration-300", !showBalanceLocal && "blur-md select-none")}>
                {fmt(summary.availableBalance)}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-white/90">
                <TrendingUp size={14} className="text-white/60" />
                <span>{fmt(0)} (0%) este mês</span>
              </div>

              {/* Action Buttons Inside Card */}
              <div className="grid grid-cols-4 gap-2 mt-8">
                <button onClick={() => openModalWithType('income')} className="flex flex-col items-center gap-2">
                  <div className="w-11 h-11 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl flex items-center justify-center text-white transition-all active:scale-90">
                    <ArrowUpRight size={20} />
                  </div>
                  <span className="text-[9px] font-bold text-white uppercase tracking-tighter">Receitas</span>
                </button>
                <button onClick={() => openModalWithType('expense')} className="flex flex-col items-center gap-2">
                  <div className="w-11 h-11 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl flex items-center justify-center text-white transition-all active:scale-90">
                    <ArrowDownLeft size={20} />
                  </div>
                  <span className="text-[9px] font-bold text-white uppercase tracking-tighter">Despesas</span>
                </button>
                <button onClick={() => openModalWithType('transfer_out')} className="flex flex-col items-center gap-2">
                  <div className="w-11 h-11 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl flex items-center justify-center text-white transition-all active:scale-90">
                    <Plus size={20} />
                  </div>
                  <span className="text-[9px] font-bold text-white uppercase tracking-tighter">Transf.</span>
                </button>
                <Link to="/goals" className="flex flex-col items-center gap-2">
                  <div className="w-11 h-11 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl flex items-center justify-center text-white transition-all active:scale-90">
                    <Crosshair size={20} />
                  </div>
                  <span className="text-[9px] font-bold text-white uppercase tracking-tighter">Metas</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="px-6 mb-8">
           <div className="bg-white dark:bg-[#161629] p-3 rounded-[24px] border border-gray-100 dark:border-white/5 shadow-sm">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Período de análise</div>
              <MonthYearPicker
                month={filters.month}
                year={filters.year}
                onChange={(m, y) => setFilters((f) => ({ ...f, month: m, year: y }))}
              />
           </div>
        </div>

        {/* Import CSV Shortcut */}
        <div className="px-6 mb-8">
           <button 
            onClick={() => setIsImportOpen(true)}
            className="w-full bg-white dark:bg-[#161629] p-4 rounded-[24px] border border-gray-100 dark:border-white/5 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all"
           >
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-xl flex items-center justify-center">
                    <FileUp size={20} />
                 </div>
                 <div className="text-left">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">Importar dados do banco</div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Sincronize seu extrato via CSV</div>
                 </div>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
           </button>
        </div>

        {/* Summary Grid */}
        <div className="px-6 grid grid-cols-2 gap-4 mb-10">
          <div className="bg-white dark:bg-[#161629] p-5 rounded-[24px] border border-gray-100 dark:border-white/5 shadow-sm">
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Receitas</div>
            <div className={cn("text-lg font-bold text-gray-900 dark:text-white transition-all", !showBalanceLocal && "blur-md select-none")}>
              {fmt(summary.totalIncome)}
            </div>
            <div className="mt-2 text-[10px] font-bold text-gray-400 flex items-center gap-1">
               <ArrowUpRight size={12} />
               0%
            </div>
          </div>
          <div className="bg-white dark:bg-[#161629] p-5 rounded-[24px] border border-gray-100 dark:border-white/5 shadow-sm">
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Despesas</div>
            <div className={cn("text-lg font-bold text-gray-900 dark:text-white transition-all", !showBalanceLocal && "blur-md select-none")}>
              {fmt(summary.totalExpense)}
            </div>
            <div className="mt-2 text-[10px] font-bold text-gray-400 flex items-center gap-1">
               <ArrowDownLeft size={12} />
               0%
            </div>
          </div>
          <div className="bg-white dark:bg-[#161629] p-5 rounded-[24px] border border-gray-100 dark:border-white/5 shadow-sm">
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Caixinhas</div>
            <div className={cn("text-lg font-bold text-gray-900 dark:text-white transition-all", !showBalanceLocal && "blur-md select-none")}>
              {fmt(summary.caixinhaBalance)}
            </div>
            <div className="mt-2 text-[10px] font-bold text-gray-400 flex items-center gap-1">
               <Plus size={12} />
               0%
            </div>
          </div>
          <div className="bg-white dark:bg-[#161629] p-5 rounded-[24px] border border-gray-100 dark:border-white/5 shadow-sm">
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Metas</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">0/0</div>
            <div className="mt-2 text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase">
               0%
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="px-6 mb-10">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-bold text-gray-900 dark:text-white">Categorias</h3>
             <Link to="/categories" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-blue-500 transition-colors">Ver tudo</Link>
          </div>
          <div className="bg-white dark:bg-[#161629] p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-6">
             <div className="w-32 h-32 shrink-0">
                <Donut 
                  segs={categoriesData} 
                  centerLabel="ABR" 
                  centerValue={fmt(summary.totalExpense).replace('R$ ', '').split(',')[0] + 'k'} 
                  isBlurred={!showBalanceLocal}
                />
             </div>
             <div className="flex-1 space-y-2">
                {categoriesData.slice(0, 4).map((c) => (
                  <div key={c.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                       <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{c.name}</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">{c.pct}%</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Monthly Evolution Section */}
        <div className="px-6 mb-10">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-bold text-gray-900 dark:text-white">Evolução Mensal</h3>
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{filters.year}</span>
          </div>
          <div className="bg-white dark:bg-[#161629] p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm">
             <div className="overflow-x-auto no-scrollbar">
                <div className="flex items-end gap-3 h-40 min-w-[500px] pb-2">
                   {typedHistory.map((h, i) => {
                      const max = Math.max(...typedHistory.map(x => Math.max(Number(x.income) || 0, Number(x.expense) || 0)), 1000) || 1000;
                      const isCurrentMonth = Number(h.fullMonth) === new Date().getMonth() + 1 && Number(h.year) === new Date().getFullYear();
                      
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full">
                           <div className="flex-1 w-full flex items-end gap-1 px-1">
                              <motion.div 
                                className={cn("flex-1 rounded-t-sm", isCurrentMonth ? "bg-indigo-500" : "bg-gray-900 dark:bg-gray-100")}
                                initial={{ height: 0 }}
                                animate={{ height: `${((Number(h.income) || 0) / max) * 100}%` }}
                                transition={{ duration: 0.8, delay: i * 0.05 }}
                              />
                              <motion.div 
                                className={cn("flex-1 rounded-t-sm", isCurrentMonth ? "bg-indigo-200 dark:bg-indigo-900/50" : "bg-gray-200 dark:bg-gray-700")}
                                initial={{ height: 0 }}
                                animate={{ height: `${((Number(h.expense) || 0) / max) * 100}%` }}
                                transition={{ duration: 0.8, delay: i * 0.05 + 0.1 }}
                              />
                           </div>
                           <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{String(h.month).substring(0, 3)}</span>
                        </div>
                      );
                   })}
                </div>
             </div>
             <div className="flex gap-4 mt-4 text-[10px] font-bold uppercase tracking-tighter text-gray-400">
               <span className="flex items-center gap-1.5">
                 <span className="w-2 h-2 rounded-full bg-gray-900 dark:bg-gray-100" /> Receitas
               </span>
               <span className="flex items-center gap-1.5">
                 <span className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700" /> Despesas
               </span>
             </div>
          </div>
        </div>

        {/* Latest Transactions */}
        <div className="px-6 mb-10">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-bold text-gray-900 dark:text-white">Últimas transações</h3>
             <Link to="/transactions" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-blue-500 transition-colors">Ver tudo</Link>
          </div>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((t) => (
              <div 
                key={t.id} 
                className="bg-white dark:bg-[#161629] p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-4 active:scale-[0.98] transition-transform"
                onClick={() => handleEdit(t)}
              >
                <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-xl shadow-inner">
                  {CAT_EMOJI[t.categories?.name || ''] || '💰'}
                </div>
                <div className="flex-1">
                   <div className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[120px]">{t.description}</div>
                   <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                     {t.categories?.name} · {(() => {
                       const d = new Date(t.date);
                       if (isToday(d)) return 'HOJE';
                       if (isYesterday(d)) return 'ONTEM';
                       return format(d, "dd 'de' MMM", { locale: ptBR });
                     })()}
                   </div>
                </div>
                <div className={cn("text-sm font-bold transition-all", t.type === 'income' ? 'text-green-500' : 'text-gray-900 dark:text-white', !showBalanceLocal && "blur-md select-none")}>
                   {t.type === 'income' ? '+' : '−'} {fmt(t.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <TransactionForm
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSuccess={fetchData}
          transaction={editingTransaction}
          initialType={modalInitialType}
        />
        <ImportWizard
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onSuccess={fetchData}
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="A-main h-screen overflow-y-auto w-full">
      {/* Top Header */}
      <div className="A-top">
        <div>
          <h1 className="text-gray-900 dark:text-white">
            {greeting}, {profile?.full_name?.split(' ')[0] || 'usuário'}.
          </h1>
          <div className="sub flex items-center gap-2">
            <span>Você gastou</span>
            <b className={cn("text-gray-900 dark:text-white transition-all", !showBalanceLocal && "blur-md select-none")}>
              {fmt(summary.totalExpense)}
            </b>
            <span>em {format(new Date(), 'MMMM', { locale: ptBR })}</span>
            <button onClick={() => setShowBalanceLocal(!showBalanceLocal)} className="ml-2 p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors text-gray-400">
              {showBalanceLocal ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
          </div>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <MonthYearPicker
            month={filters.month}
            year={filters.year}
            onChange={(m, y) => setFilters((f) => ({ ...f, month: m, year: y }))}
          />
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setFilters((f) => ({ ...f, type: 'all' }))}
              className={cn(
                'px-4 py-1.5 rounded-md text-xs font-medium transition-all',
                filters.type === 'all'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500',
              )}
            >
              Todos
            </button>
            <button
              onClick={() => setFilters((f) => ({ ...f, type: 'income' }))}
              className={cn(
                'px-4 py-1.5 rounded-md text-xs font-medium transition-all',
                filters.type === 'income'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500',
              )}
            >
              Receitas
            </button>
            <button
              onClick={() => setFilters((f) => ({ ...f, type: 'expense' }))}
              className={cn(
                'px-4 py-1.5 rounded-md text-xs font-medium transition-all',
                filters.type === 'expense'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500',
              )}
            >
              Despesas
            </button>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="A-chip primary">
            <Plus size={14} className="mr-1" /> Nova transação
          </button>
          <button onClick={() => setIsImportOpen(true)} className="A-chip">
            <FileUp size={14} className="mr-1" /> Importar CSV
          </button>
          <Link to="/categories" className="A-chip">
            <Tag size={14} className="mr-1" /> Gerenciar Categorias
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="A-kpis">
        <div className="A-kpi">
          <div className="lbl">DISPONÍVEL</div>
          <div className="sublbl">Saldo em conta</div>
          <div className={cn("val transition-all duration-300", !showBalanceLocal && "blur-md select-none")}>
            {fmt(summary.availableBalance)}
          </div>
          <div className="dlt pos">0% vs. mês anterior</div>
          <Sparkline data={[32, 41, 28, 52, 45, 63, 58, 72]} color="#10b981" className="spark" />
        </div>
        <div className="A-kpi">
          <div className="lbl">CAIXINHAS</div>
          <div className="sublbl">Investimentos/Reserva</div>
          <div className={cn("val transition-all duration-300", !showBalanceLocal && "blur-md select-none")}>
            {fmt(summary.caixinhaBalance)}
          </div>
          <div className="dlt pos">0% vs. mês anterior</div>
          <Sparkline data={[10, 15, 12, 18, 22, 20, 25, 30]} color="#8b5cf6" className="spark" />
        </div>
        <div className="A-kpi">
          <div className="lbl">RECEITAS</div>
          <div className="sublbl">Neste mês</div>
          <div className={cn("val transition-all duration-300", !showBalanceLocal && "blur-md select-none")}>
            {fmt(summary.totalIncome)}
          </div>
          <div className="dlt pos">0% vs. mês anterior</div>
          <Sparkline data={[20, 40, 30, 50, 60, 45, 70, 80]} color="#6366f1" className="spark" />
        </div>
        <div className="A-kpi">
          <div className="lbl">DESPESAS</div>
          <div className="sublbl">Neste mês</div>
          <div className={cn("val transition-all duration-300", !showBalanceLocal && "blur-md select-none")}>
            {fmt(summary.totalExpense)}
          </div>
          <div className="dlt neg">0% vs. mês anterior</div>
          <Sparkline data={[50, 40, 60, 30, 20, 35, 25, 40]} color="#ef4444" className="spark" />
        </div>
      </div>

      {/* Charts Row */}
      <div className="A-row">
        {/* Monthly Evolution */}
        <div className="A-card">
          <div className="A-card-h">
            <div>
              <h3 className="text-gray-900 dark:text-white">Evolução Mensal</h3>
              <div className="text-xs text-gray-500 mt-1">
                Receitas vs. Despesas · {filters.year}
              </div>
            </div>
            <div className="meta">JAN → DEZ</div>
          </div>
          <div className="A-bars">
            {typedHistory.map((h, i) => {
              const max =
                Math.max(
                  ...typedHistory.map((x) =>
                    Math.max(Number(x.income) || 0, Number(x.expense) || 0),
                  ),
                  1000,
                ) || 1000;
              const label = String(h.month).toUpperCase();
              const isCurrentMonth =
                Number(h.fullMonth) === new Date().getMonth() + 1 &&
                Number(h.year) === new Date().getFullYear();

              return (
                <div key={i} className={cn('A-bar-col', isCurrentMonth && 'curr group')}>
                  <div className="A-bar-pair relative group">
                    <motion.div
                      className="inc"
                      initial={{ height: 0 }}
                      animate={{ height: `${((Number(h.income) || 0) / max) * 100}%` }}
                      transition={{ duration: 0.8, delay: i * 0.05, ease: 'easeOut' }}
                    />
                    <motion.div
                      className="exp"
                      initial={{ height: 0 }}
                      animate={{ height: `${((Number(h.expense) || 0) / max) * 100}%` }}
                      transition={{ duration: 0.8, delay: i * 0.05 + 0.1, ease: 'easeOut' }}
                    />

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-[100]">
                      <div className="bg-gray-900 text-white text-[10px] py-2 px-3 rounded-lg shadow-xl whitespace-nowrap pointer-events-none border border-gray-700">
                        <div className="text-[9px] text-gray-400 mb-1 font-mono uppercase">
                          {h.month} {h.year}
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                          <span>Receita: {fmt(Number(h.income))}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          <span>Despesa: {fmt(Number(h.expense))}</span>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 -mt-1" />
                      </div>
                    </div>
                  </div>
                  <div className="lb">{label}</div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-gray-900 dark:bg-gray-100" /> Receitas
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-gray-200 dark:bg-gray-700" /> Despesas
            </span>
          </div>
        </div>

        {/* Distribution */}
        <div className="A-card">
          <div className="A-card-h">
            <h3 className="text-gray-900 dark:text-white">Distribuição</h3>
            <div className="meta">
              {filters.type === 'income' ? fmt(summary.totalIncome) : fmt(summary.totalExpense)}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Donut
              segs={categoriesData}
              centerLabel={filters.type === 'income' ? 'RECEITA' : 'GASTO'}
              centerValue={
                filters.type === 'income'
                  ? fmt(summary.totalIncome).replace('R$ ', '')
                  : fmt(summary.totalExpense).replace('R$ ', '')
              }
              isBlurred={!showBalanceLocal}
            />
            <div className="flex-1 flex flex-col gap-2">
              {categoriesData.slice(0, 5).map((c) => (
                <div
                  key={c.name}
                  className="flex justify-between items-center text-[13px] text-gray-600 dark:text-gray-300"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-sm" style={{ background: c.color }} />
                    {c.name}
                  </span>
                  <span className="font-mono text-gray-400">{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="A-card A-insight">
          <div className="head text-gray-700 dark:text-gray-300">
            <span className="i">✱</span>Insights
          </div>
          <div className="body text-gray-900 dark:text-gray-100">
            Analise seu comportamento financeiro para gerar insights. As dicas personalizadas
            aparecerão aqui em breve.
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-[11px] font-mono text-gray-500 uppercase tracking-wider mb-2">
              <span>META MENSAL</span>
              <span>0%</span>
            </div>
            <div className="goal-bar">
              <div className="goal-fill" style={{ width: '0%' }} />
            </div>
            <div className="text-[11px] font-mono text-gray-400 mt-2">
              {fmt(0)} de {fmt(0)}
            </div>
          </div>
          <div className="head mt-4 text-gray-700 dark:text-gray-300">
            <span className="i !bg-green-500/10 !text-green-500">↗</span>
            Previsão
          </div>
          <div className="body text-sm text-gray-900 dark:text-gray-100">
            A previsão de fechamento do mês será habilitada após mais registros.
          </div>
        </div>
      </div>

      {/* Latest Transactions */}
      <div className="A-card mb-8">
        <div className="A-card-h">
          <h3 className="text-gray-900 dark:text-white">Últimas Transações</h3>
          <div className="flex gap-2 items-center">
            <div className="A-search w-64">
              <Search size={14} className="text-gray-400" />
              <input
                placeholder="Buscar por descrição..."
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                className="text-gray-900 dark:text-white"
              />
              {filters.search && (
                <X
                  size={14}
                  className="text-gray-400 cursor-pointer"
                  onClick={() => setFilters((f) => ({ ...f, search: '' }))}
                />
              )}
            </div>
            <button
              onClick={() =>
                setFilters({
                  search: '',
                  type: 'all',
                  month: String(new Date().getMonth() + 1),
                  year: String(new Date().getFullYear()),
                })
              }
              className="A-chip"
            >
              Limpar filtros
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {transactions.slice(0, 8).map((t) => (
            <div
              key={t.id}
              className="A-txrow hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors cursor-pointer"
              onClick={() => handleEdit(t)}
            >
              <div className="ic text-xl">{CAT_EMOJI[t.categories?.name || ''] || '💰'}</div>
              <div className="flex-1 min-w-0">
                <div
                  className="desc font-medium text-gray-900 dark:text-white"
                  title={t.description}
                >
                  {t.description}
                </div>
                <div className="meta text-xs text-gray-400">
                  {format(new Date(t.date), 'dd/MM/yyyy')}
                </div>
              </div>
              <div className="cat text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                {t.categories?.name || 'Outros'}
              </div>
              <div
                className={cn(
                  'val font-semibold transition-all',
                  t.type === 'income' ? 'pos text-green-500' : 'text-gray-900 dark:text-white',
                  !showBalanceLocal && "blur-md select-none"
                )}
              >
                {t.type === 'income' ? '+' : '−'} {fmt(t.amount)}
              </div>
            </div>
          ))}
          {transactions.length === 0 && !isLoading && (
            <div className="py-12 text-center text-gray-500">Nenhuma transação encontrada.</div>
          )}
          {isLoading && (
            <div className="py-12 text-center text-gray-500">Carregando transações...</div>
          )}
        </div>
      </div>

      <TransactionForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={fetchData}
        transaction={editingTransaction}
      />
      <ImportWizard
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={fetchData}
      />
      <ConfirmModal
        isOpen={isConfirmClearOpen}
        onClose={() => setIsConfirmClearOpen(false)}
        onConfirm={async () => {
          await deleteTransactionsByMonth(Number(filters.month), Number(filters.year));
          setIsConfirmClearOpen(false);
          fetchData();
        }}
        title="Excluir histórico do mês?"
        description={`Isso apagará permanentemente todas as transações deste período. Esta ação não pode ser desfeita.`}
        isLoading={isLoading}
      />
    </PageTransition>
  );
}
