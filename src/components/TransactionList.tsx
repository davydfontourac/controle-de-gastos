import type { Transaction } from '@/types';
import TransactionItem from './TransactionItem';
import { ReceiptText, SearchX } from 'lucide-react';
import { Skeleton } from './ui/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';

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

const SKELETON_IDS = ['sk-t-1', 'sk-t-2', 'sk-t-3', 'sk-t-4'];

export default function TransactionList({
  transactions,
  isLoading,
  filters,
  onDelete,
  onEdit,
}: Readonly<Props>) {
  if (isLoading) {
    return (
      <div className="mt-2 text-left w-full">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 w-48 h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse">
          <span className="sr-only">Carregando transações...</span>
        </h2>
        <div className="flex flex-col space-y-3">
          {SKELETON_IDS.map((id) => (
            <div
              key={id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm gap-4 sm:gap-0"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-gray-100 dark:border-gray-700 pt-3 sm:pt-0">
                <Skeleton className="h-5 w-20" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl"
      >
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-500 dark:text-blue-400 rounded-full flex items-center justify-center mb-4 animate-bounce">
          {filters.search || filters.type !== 'all' ? (
            <SearchX className="w-8 h-8" />
          ) : (
            <ReceiptText className="w-8 h-8" />
          )}
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {filters.search || filters.type !== 'all'
            ? 'Nenhum resultado encontrado'
            : 'Nenhuma transação ainda'}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm text-center">
          {filters.search || filters.type !== 'all'
            ? 'Tente ajustar seus filtros para encontrar o que procura.'
            : 'Seu caixa está vazio. Comece a registrar suas entradas e saídas para ver os gráficos e listar aqui!'}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        Últimas Transações
      </h2>
      <div className="flex flex-col space-y-3">
        <AnimatePresence>
          {transactions.map((transaction, index) => (
            <motion.div
              layout
              key={transaction.id}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <TransactionItem transaction={transaction} onDelete={onDelete} onEdit={onEdit} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
