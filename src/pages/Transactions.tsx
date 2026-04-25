import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Search, Download, Upload, Trash2, MoreHorizontal } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import TransactionForm from '@/components/TransactionForm';
import ImportWizard from '@/components/ImportWizard/ImportWizard';
import PageTransition from '@/components/PageTransition';
import { MonthYearPicker } from '@/components/MonthYearPicker';
import ConfirmModal from '@/components/ConfirmModal';
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

export default function Transactions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isConfirmDeleteAllOpen, setIsConfirmDeleteAllOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const {
    transactions,
    summary,
    isLoading,
    fetchTransactions,
    deleteTransaction,
    deleteTransactionsByMonth,
  } = useTransactions();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

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
    fetchData();
  }, [fetchData]);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const currentMonthName = useMemo(() => {
    const date = new Date(Number(filters.year), Number(filters.month) - 1);
    return format(date, 'MMMM yyyy', { locale: ptBR });
  }, [filters.month, filters.year]);

  const handleDeleteIndividual = async () => {
    if (transactionToDelete) {
      await deleteTransaction(transactionToDelete);
      setTransactionToDelete(null);
      setIsConfirmDeleteOpen(false);
      fetchData();
    }
  };

  const handleDeleteAll = async () => {
    await deleteTransactionsByMonth(Number(filters.month), Number(filters.year));
    setIsConfirmDeleteAllOpen(false);
    fetchData();
  };

  return (
    <PageTransition className="A-main h-screen overflow-y-auto w-full">
      {/* Top Header */}
      <div className="A-top">
        <div>
          <h1 className="text-gray-900 dark:text-white">Transações</h1>
          <div className="sub">
            {transactions.length} registros · {currentMonthName}
          </div>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <button 
            onClick={() => setIsConfirmDeleteAllOpen(true)} 
            className="A-chip text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border-red-200 dark:border-red-900/30"
            disabled={transactions.length === 0}
          >
            <Trash2 size={14} className="mr-1" /> Excluir período
          </button>
          <button className="A-chip">
            <Download size={14} className="mr-1" /> Exportar CSV
          </button>
          <button onClick={() => setIsImportOpen(true)} className="A-chip">
            <Upload size={14} className="mr-1" /> Importar
          </button>
          <button onClick={() => setIsModalOpen(true)} className="A-chip primary">
            <Plus size={14} className="mr-1" /> Nova transação
          </button>
        </div>
      </div>

      {/* Transaction Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="A-card !p-4">
          <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Total no período</div>
          <div className="text-2xl font-bold mt-2 text-red-500">− {fmt(summary.totalExpense)}</div>
        </div>
        <div className="A-card !p-4">
          <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Receitas</div>
          <div className="text-2xl font-bold mt-2 text-green-500">+ {fmt(summary.totalIncome)}</div>
        </div>
        <div className="A-card !p-4">
          <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
            {filters.type === 'income' ? 'Maior receita' : 'Maior gasto'}
          </div>
          <div className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
            {fmt(Math.max(...transactions.filter(t => filters.type === 'all' ? t.type === 'expense' : t.type === filters.type).map(t => t.amount), 0))}
          </div>
        </div>
        <div className="A-card !p-4">
          <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Média diária</div>
          <div className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
            {fmt((filters.type === 'income' ? summary.totalIncome : summary.totalExpense) / 30)}
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex gap-2 items-center flex-wrap mb-6">
        <div className="A-search flex-1 max-w-md">
          <Search size={14} className="text-gray-400" />
          <input 
            placeholder="Buscar por descrição, valor, categoria..." 
            value={filters.search}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            className="text-gray-900 dark:text-white"
          />
        </div>
        <MonthYearPicker 
          month={filters.month} 
          year={filters.year} 
          onChange={(m, y) => setFilters(f => ({ ...f, month: m, year: y }))} 
        />
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button 
            onClick={() => setFilters(f => ({ ...f, type: 'all' }))}
            className={cn("px-4 py-1.5 rounded-md text-xs font-medium transition-all", filters.type === 'all' ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500")}
          >
            Todos
          </button>
          <button 
            onClick={() => setFilters(f => ({ ...f, type: 'income' }))}
            className={cn("px-4 py-1.5 rounded-md text-xs font-medium transition-all", filters.type === 'income' ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500")}
          >
            Receitas
          </button>
          <button 
            onClick={() => setFilters(f => ({ ...f, type: 'expense' }))}
            className={cn("px-4 py-1.5 rounded-md text-xs font-medium transition-all", filters.type === 'expense' ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500")}
          >
            Despesas
          </button>
        </div>
        <div className="flex-1" />
        <button 
          onClick={() => setFilters({ search: '', type: 'all', month: String(new Date().getMonth() + 1), year: String(new Date().getFullYear()) })}
          className="A-chip"
        >
          Limpar
        </button>
      </div>

      {/* Transactions Table */}
      <div className="A-card !p-0 overflow-hidden mb-12">
        <div className="grid grid-cols-[48px_1fr_140px_110px_130px_80px] gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
          <span />
          <span className="min-w-0 truncate">Descrição</span>
          <span>Categoria</span>
          <span>Data</span>
          <span className="text-right">Valor</span>
          <span />
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {transactions.map((t) => (
            <div 
              key={t.id} 
              className="grid grid-cols-[48px_1fr_140px_110px_130px_80px] gap-4 px-6 py-4 items-center hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
              onClick={() => handleEdit(t)}
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg">
                {CAT_EMOJI[t.categories?.name || ''] || '💰'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate" title={t.description}>
                  {t.description}
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">Conta Corrente · Principais</div>
              </div>
              <div>
                <span className="inline-flex px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-bold uppercase tracking-wider">
                  {t.categories?.name || 'Outros'}
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {format(new Date(t.date), 'dd/MM/yyyy')}
              </div>
              <div className={cn("text-sm font-semibold text-right", t.type === 'income' ? "text-green-500" : "text-gray-900 dark:text-white")}>
                {t.type === 'income' ? '+' : '−'} {fmt(t.amount)}
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setTransactionToDelete(t.id);
                    setIsConfirmDeleteOpen(true);
                  }}
                  className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>
          ))}
          {transactions.length === 0 && !isLoading && (
            <div className="py-20 text-center text-gray-500">Nenhuma transação encontrada para este período.</div>
          )}
          {isLoading && (
            <div className="py-20 text-center text-gray-500 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              Carregando transações...
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
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
        isOpen={isConfirmDeleteOpen}
        onClose={() => {
          setIsConfirmDeleteOpen(false);
          setTransactionToDelete(null);
        }}
        onConfirm={handleDeleteIndividual}
        title="Excluir Transação"
        description="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
      />

      <ConfirmModal
        isOpen={isConfirmDeleteAllOpen}
        onClose={() => setIsConfirmDeleteAllOpen(false)}
        onConfirm={handleDeleteAll}
        title="Excluir Todo o Período"
        description={`Tem certeza que deseja excluir TODAS as ${transactions.length} transações de ${currentMonthName}? Esta ação é irreversível.`}
      />
    </PageTransition>
  );
}

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
