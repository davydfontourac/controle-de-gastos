import type { Transaction } from '@/types';
import TransactionItem from './TransactionItem';
import { ReceiptText, SearchX } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  isLoading: boolean;
  filters: {
    search: string;
    type: string;
    month: string;
    year: string;
  };
  onDelete: () => void;
  onEdit: (transaction: Transaction) => void;
}

export default function TransactionList({ transactions, isLoading, filters, onDelete, onEdit }: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 animate-pulse">Carregando transações...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
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
    );
  }

  return (
    <div className="mt-2">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Últimas Transações</h2>
      <div className="flex flex-col space-y-2">
        {transactions.map((transaction) => (
          <TransactionItem 
            key={transaction.id} 
            transaction={transaction} 
            onDelete={onDelete} 
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
}
