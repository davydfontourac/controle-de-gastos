import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Plus, Tag, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import TransactionList from '@/components/TransactionList';
import TransactionForm from '@/components/TransactionForm';
import SummaryCards from '@/components/SummaryCards';
import type { Transaction } from '@/types';
import { useTransactions } from '@/hooks/useTransactions';
import TransactionFilters from '@/components/TransactionFilters';
import CategoryPieChart from '@/components/CategoryPieChart';
import MonthlyChart from '@/components/MonthlyChart';
import { ThemeToggle } from '@/components/ThemeToggle';
import BottomNavigation from '@/components/BottomNavigation';
import PageTransition from '@/components/PageTransition';
import ImportWizard from '@/components/ImportWizard/ImportWizard';
import { FileDown } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';
import { cn } from '@/utils/cn';

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const { transactions, summary, history, isLoading, fetchTransactions, deleteTransactionsByMonth } = useTransactions();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isFABOpen, setIsFABOpen] = useState(false);
  
  // Global Filters State (Shared between Summary and List)
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear())
  });

  const fetchData = useCallback(async () => {
    await fetchTransactions(filters);
  }, [filters, fetchTransactions]);

  useEffect(() => {
    // Debounce only for text search
    const timer = setTimeout(() => {
      fetchData();
    }, filters.search ? 400 : 0);

    return () => clearTimeout(timer);
  }, [fetchData, filters.search]);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleClearMonth = async () => {
    const success = await deleteTransactionsByMonth(Number(filters.month), Number(filters.year));
    if (success) {
      setIsConfirmClearOpen(false);
      fetchData();
    }
  };

  return (
    <PageTransition className="min-h-screen bg-gray-50/50 dark:bg-gray-950 transition-colors">
      {/* Header Premium */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <img src="/logo-expense-tracker.png" alt="Expense Tracker" className="w-16 h-16 object-contain" />
              <h1 className="text-xl font-bold bg-linear-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent dark:from-blue-500 dark:to-blue-400">
                Expense Tracker
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end mr-2 text-right">
                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Conta logada</span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[150px]">
                  {profile?.full_name || user?.email}
                </span>
              </div>
              
              <ThemeToggle />
              
              <Link 
                to="/profile"
                className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 shadow-md relative overflow-hidden group/avatar bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 hover:border-blue-100 dark:hover:border-gray-600 transition-all md:hidden"
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-gray-400 group-hover/avatar:text-blue-500 transition-colors" />
                )}
                <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
              </Link>
              <Link
                to="/profile"
                className="hidden md:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 py-2.5 px-4 rounded-xl transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
              >
                Perfil
                <User className="w-4 h-4" />
              </Link>
              <button
                onClick={() => signOut()}
                className="hidden md:flex items-center gap-2 text-sm text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-500/10 py-2.5 px-4 rounded-xl transition-all border border-transparent hover:border-red-100 dark:hover:border-red-500/20"
              >
                Sair
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 md:pb-10">
        
        {/* Cards de Resumo */}
        <SummaryCards summary={summary} isLoading={isLoading} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <CategoryPieChart transactions={transactions} />
          <MonthlyChart data={history} isLoading={isLoading} />
        </div>

        {/* Listagem e Filtros */}
        <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 mt-10 transition-colors">
          <TransactionFilters 
            filters={filters}
            onSearchChange={(v) => setFilters(prev => ({ ...prev, search: v }))}
            onTypeChange={(v) => setFilters(prev => ({ ...prev, type: v }))}
            onMonthChange={(v) => setFilters(prev => ({ ...prev, month: v }))}
            onYearChange={(v) => setFilters(prev => ({ ...prev, year: v }))}
            onClearMonth={() => setIsConfirmClearOpen(true)}
          />

          <TransactionList 
            transactions={transactions} 
            isLoading={isLoading} 
            filters={filters}
            onDelete={fetchData}
            onEdit={handleEdit}
          />
        </div>
        
        {/* Floating Action Menu */}
        <div className="fixed bottom-20 md:bottom-8 right-8 flex flex-col items-end gap-3 z-50">
          {/* Backdrop for mobile to close when clicking outside */}
          {isFABOpen && (
            <button 
              type="button"
              className="fixed inset-0 bg-transparent w-full h-full cursor-default border-none outline-none" 
              onClick={() => setIsFABOpen(false)}
              aria-label="Fechar menu"
            />
          )}

          {/* Menu Items */}
          <div className={cn(
            "flex flex-col items-end gap-3 mb-2 transition-all duration-300",
            isFABOpen 
              ? "visible opacity-100 translate-y-0" 
              : "invisible opacity-0 translate-y-4 md:group-hover:visible md:group-hover:opacity-100 md:group-hover:translate-y-0"
          )}>
            {/* Opção: Nova Transação */}
            <button
              onClick={() => {
                setIsModalOpen(true);
                setIsFABOpen(false);
              }}
              className="flex items-center gap-3 pr-2 group/item"
            >
              <span className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold py-1.5 px-3 rounded-lg shadow-xl md:opacity-0 md:group-hover/item:opacity-100 transition-opacity">
                Nova Transação
              </span>
              <div className="w-12 h-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-full shadow-lg flex items-center justify-center border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Plus className="w-5 h-5" />
              </div>
            </button>

            {/* Opção: Categorias */}
            <Link
              to="/categories"
              onClick={() => setIsFABOpen(false)}
              className="flex items-center gap-3 pr-2 group/item"
            >
              <span className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold py-1.5 px-3 rounded-lg shadow-xl md:opacity-0 md:group-hover/item:opacity-100 transition-opacity whitespace-nowrap">
                Gerenciar Categorias
              </span>
              <div className="w-12 h-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-full shadow-lg flex items-center justify-center border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Tag className="w-5 h-5" />
              </div>
            </Link>

            {/* Opção: Importar CSV */}
            <button
              onClick={() => {
                setIsImportOpen(true);
                setIsFABOpen(false);
              }}
              className="flex items-center gap-3 pr-2 group/item"
            >
              <span className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold py-1.5 px-3 rounded-lg shadow-xl md:opacity-0 md:group-hover/item:opacity-100 transition-opacity whitespace-nowrap">
                Importar CSV
              </span>
              <div className="w-12 h-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-full shadow-lg flex items-center justify-center border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <FileDown className="w-5 h-5" />
              </div>
            </button>
          </div>

          {/* Main Button */}
          <button
            onClick={() => setIsFABOpen(!isFABOpen)}
            className={cn(
              "w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 relative overflow-hidden",
              isFABOpen && "rotate-45 bg-blue-700"
            )}
          >
            <Plus className="w-8 h-8 transition-transform duration-300" />
            <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
          </button>
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
          onConfirm={handleClearMonth}
          title="Excluir histórico do mês?"
          description={`Isso apagará permanentemente todas as ${transactions.length} transações filtradas para este período. Esta ação não pode ser desfeita.`}
          isLoading={isLoading}
        />

        <BottomNavigation />
      </main>
    </PageTransition>
  );
}
