import { ArrowDownRight, ArrowUpRight, Tag, Trash2, Edit2, Repeat } from 'lucide-react';
import type { Transaction } from '@/types';
import { useState } from 'react';
import { api } from '@/services/api';
import { toast } from 'sonner';
import ConfirmModal from './ConfirmModal';

interface Props {
  transaction: Transaction;
  onDelete: () => void;
  onEdit: (transaction: Transaction) => void;
}

export default function TransactionItem({ transaction, onDelete, onEdit }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isIncome = transaction.type === 'income';

  // Formata dinamicamente R$ com base no local BRL
  const formattedAmount = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(transaction.amount);

  // Formata D/M/Y via browser padrão
  const formattedDate = new Date(transaction.date).toLocaleDateString('pt-BR', {
    timeZone: 'UTC'
  });

  async function handleDelete() {
    try {
      setIsDeleting(true);
      await api.delete(`/transactions/${transaction.id}`);
      toast.success('Transação excluída com sucesso!');
      onDelete();
    } catch (err: any) {
      toast.error('Erro ao excluir transação.');
    } finally {
      setIsDeleting(false);
      setIsModalOpen(false);
    }
  }

  return (
    <>
      <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 mb-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all gap-4 sm:gap-0">
        
        <div className="flex items-center gap-4">
          {/* Ícone da Categoria */}
          <div 
            className="w-12 h-12 flex items-center justify-center rounded-xl transition-transform group-hover:scale-105"
            style={{ backgroundColor: transaction.categories?.color ? `${transaction.categories.color}20` : '#E5E7EB' }}
          >
            <Tag className="w-5 h-5" style={{ color: transaction.categories?.color || '#6B7280' }} />
          </div>

          {/* Detalhes de Texto */}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              {transaction.description}
              {transaction.is_recurrent && (
                <Repeat className="w-3.5 h-3.5 text-blue-500" />
              )}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {transaction.categories?.name || 'Sem categoria'} • {formattedDate}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-gray-100 dark:border-gray-700 pt-3 sm:pt-0">
          {/* Valor */}
          <div className={`flex items-center gap-2 font-bold text-lg sm:text-base ${isIncome ? 'text-emerald-600' : 'text-red-500'}`}>
            {isIncome ? <ArrowUpRight className="w-5 h-5 sm:w-4 sm:h-4" /> : <ArrowDownRight className="w-5 h-5 sm:w-4 sm:h-4" />}
            {isIncome ? '+' : '-'} {formattedAmount.replace('R$', '').trim()}
          </div>

          <div className="flex items-center gap-2 sm:gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all sm:translate-x-4 sm:group-hover:translate-x-0">
            {/* Botão Editar */}
            <button
              onClick={() => onEdit(transaction)}
              className="p-2 text-blue-600 sm:text-gray-400 bg-blue-50 sm:bg-transparent hover:text-blue-600 dark:text-blue-400 dark:sm:text-gray-400 dark:bg-blue-500/10 dark:sm:bg-transparent dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all"
              title="Editar transação"
            >
              <Edit2 className="w-4 h-4 sm:w-4 sm:h-4" />
            </button>

            {/* Botão Deletar */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 text-red-500 sm:text-gray-400 bg-red-50 sm:bg-transparent hover:text-red-500 dark:text-red-400 dark:sm:text-gray-400 dark:bg-red-500/10 dark:sm:bg-transparent dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
              title="Excluir transação"
            >
              <Trash2 className="w-4 h-4 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Excluir Transação"
        description="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
      />
    </>
  );
}
