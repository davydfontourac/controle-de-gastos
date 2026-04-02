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

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { transactions, summary, history, isLoading, fetchTransactions } = useTransactions();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
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

  return (
    <PageTransition className="min-h-screen bg-gray-50/50 dark:bg-gray-950 transition-colors">
      {/* Header Premium */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <img src="/wallet.png" alt="Controle de Gastos" className="w-10 h-10 object-contain drop-shadow-sm" />
              <h1 className="text-xl font-bold bg-linear-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent dark:from-blue-500 dark:to-blue-400">
                Controle de Gastos
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
        <div className="fixed bottom-20 md:bottom-8 right-8 flex flex-col items-end gap-3 group z-50 pointer-events-none">
          {/* Menu Items (Hidden by default, shown on hover) */}
          <div className="flex flex-col items-end gap-3 mb-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 group-hover:pointer-events-auto">
            {/* Opção: Nova Transação */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-3 pr-2 group/item pointer-events-auto"
            >
              <span className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold py-1.5 px-3 rounded-lg shadow-xl opacity-0 group-hover/item:opacity-100 transition-opacity">
                Nova Transação
              </span>
              <div className="w-12 h-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-full shadow-lg flex items-center justify-center border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Plus className="w-5 h-5" />
              </div>
            </button>

            {/* Opção: Categorias */}
            <Link
              to="/categories"
              className="flex items-center gap-3 pr-2 group/item pointer-events-auto"
            >
              <span className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold py-1.5 px-3 rounded-lg shadow-xl opacity-0 group-hover/item:opacity-100 transition-opacity whitespace-nowrap">
                Gerenciar Categorias
              </span>
              <div className="w-12 h-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-full shadow-lg flex items-center justify-center border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Tag className="w-5 h-5" />
              </div>
            </Link>
          </div>

          {/* Main Button */}
          <button
            className="w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 group-hover:rotate-45 relative overflow-hidden group-hover:bg-blue-700 pointer-events-auto"
          >
            <Plus className="w-8 h-8 transition-transform duration-300" />
            
            {/* Subtle overlay effect */}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        <TransactionForm
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSuccess={fetchData}
          transaction={editingTransaction}
        />
      </main>

      <BottomNavigation />
    </PageTransition>
  );
}
