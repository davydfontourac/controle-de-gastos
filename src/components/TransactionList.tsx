import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import type { Transaction } from '@/types';
import TransactionItem from './TransactionItem';
import TransactionFilters from './TransactionFilters';
import { ReceiptText, SearchX } from 'lucide-react';

export default function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de Filtro
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear())
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (filters.type !== 'all') params.append('type', filters.type);
        if (filters.month && filters.year) {
          params.append('month', filters.month);
          params.append('year', filters.year);
        }
        if (filters.search) params.append('search', filters.search);

        const response = await api.get<Transaction[]>(`/transactions?${params.toString()}`);
        setTransactions(response.data);
      } catch (err) {
        console.error(err);
        setError('Ocorreu um erro ao carregar as transações.');
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce para a busca por texto
    const timer = setTimeout(() => {
      fetchTransactions();
    }, filters.search ? 400 : 0);

    return () => clearTimeout(timer);
  }, [filters]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 animate-pulse">Carregando transações...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center border border-red-100">
        <p>⚠️ {error}</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col">
        <TransactionFilters 
          filters={filters}
          onSearchChange={(v) => setFilters(prev => ({ ...prev, search: v }))}
          onTypeChange={(v) => setFilters(prev => ({ ...prev, type: v }))}
          onMonthChange={(v) => setFilters(prev => ({ ...prev, month: v }))}
          onYearChange={(v) => setFilters(prev => ({ ...prev, year: v }))}
        />

        <div className="flex flex-col items-center justify-center py-16 bg-white border border-dashed border-gray-300 rounded-2xl">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
            {filters.search || filters.type !== 'all' ? <SearchX className="w-8 h-8" /> : <ReceiptText className="w-8 h-8" />}
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {filters.search || filters.type !== 'all' ? 'Nenhum resultado encontrado' : 'Nenhuma transação ainda'}
          </h3>
          <p className="text-gray-500 max-w-sm text-center">
            {filters.search || filters.type !== 'all' 
              ? 'Tente ajustar seus filtros para encontrar o que procura.' 
              : 'Seu caixa está vazio. Comece a registrar suas entradas e saídas para ver os gráficos e listar aqui!'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <TransactionFilters 
        filters={filters}
        onSearchChange={(v) => setFilters(prev => ({ ...prev, search: v }))}
        onTypeChange={(v) => setFilters(prev => ({ ...prev, type: v }))}
        onMonthChange={(v) => setFilters(prev => ({ ...prev, month: v }))}
        onYearChange={(v) => setFilters(prev => ({ ...prev, year: v }))}
      />

      <h2 className="text-xl font-bold text-gray-800 mb-6">Últimas Transações</h2>
      <div className="flex flex-col space-y-2">
        {transactions.map((transaction) => (
          <TransactionItem 
            key={transaction.id} 
            transaction={transaction} 
            onDelete={() => setFilters(prev => ({ ...prev }))} 
          />
        ))}
      </div>
    </div>
  );
}
