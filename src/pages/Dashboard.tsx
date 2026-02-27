import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Plus, Wallet, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import TransactionList from '@/components/TransactionList';
import TransactionForm from '@/components/TransactionForm';
import SummaryCards from '@/components/SummaryCards';
import type { Transaction } from '@/types';
import TransactionFilters from '@/components/TransactionFilters';
import CategoryPieChart from '@/components/CategoryPieChart';
import MonthlyChart from '@/components/MonthlyChart';
import { api } from '@/services/api';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  // Estado Global de Filtros (Compartilhado entre Resumo e Lista)
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear())
  });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams();
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.month && filters.year) {
        params.append('month', filters.month);
        params.append('year', filters.year);
      }
      if (filters.search) params.append('search', filters.search);

      // Busca transações, sumário e histórico em paralelo
      const [transRes, sumRes, historyRes] = await Promise.all([
        api.get<Transaction[]>(`/transactions?${params.toString()}`),
        api.get(`/transactions/summary?month=${filters.month}&year=${filters.year}`),
        api.get('/transactions/history')
      ]);

      setTransactions(transRes.data);
      setSummary({
        totalIncome: sumRes.data.income,
        totalExpense: sumRes.data.expense,
        balance: sumRes.data.total
      });
      setHistory(historyRes.data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // Debounce apenas para a busca por texto
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
    <div className="min-h-screen bg-gray-50/50">
      {/* Header Premium */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
                Controle de Gastos
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-xs text-gray-400 font-medium">Conta logada</span>
                <span className="text-sm font-semibold text-gray-700">{user?.email}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 text-sm text-red-500 font-bold hover:bg-red-50 py-2.5 px-4 rounded-xl transition-all border border-transparent hover:border-red-100"
              >
                Sair
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Cards de Resumo */}
        <SummaryCards summary={summary} isLoading={isLoading} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <CategoryPieChart transactions={transactions} />
          <MonthlyChart data={history} isLoading={isLoading} />
        </div>

        {/* Listagem e Filtros */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 mt-10">
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
        <div className="fixed bottom-8 right-8 flex flex-col items-end gap-3 group z-50">
          {/* Menu Items (Hidden by default, shown on hover) */}
          <div className="flex flex-col items-end gap-3 mb-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
            {/* Opção: Nova Transação */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-3 pr-2 group/item"
            >
              <span className="bg-gray-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-xl opacity-0 group-hover/item:opacity-100 transition-opacity">
                Nova Transação
              </span>
              <div className="w-12 h-12 bg-white text-gray-900 rounded-full shadow-lg flex items-center justify-center border border-gray-100 hover:bg-gray-50 transition-colors">
                <Plus className="w-5 h-5" />
              </div>
            </button>

            {/* Opção: Categorias */}
            <Link
              to="/categories"
              className="flex items-center gap-3 pr-2 group/item"
            >
              <span className="bg-gray-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-xl opacity-0 group-hover/item:opacity-100 transition-opacity whitespace-nowrap">
                Gerenciar Categorias
              </span>
              <div className="w-12 h-12 bg-white text-gray-900 rounded-full shadow-lg flex items-center justify-center border border-gray-100 hover:bg-gray-50 transition-colors">
                <Tag className="w-5 h-5" />
              </div>
            </Link>
          </div>

          {/* Main Button */}
          <button
            className="w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 group-hover:rotate-45 relative overflow-hidden group-hover:bg-blue-700"
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
    </div>
  );
}
