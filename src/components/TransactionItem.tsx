import { ArrowDownRight, ArrowUpRight, Tag, Trash2 } from 'lucide-react';
import type { Transaction } from '@/types';
import { useState } from 'react';
import { api } from '@/services/api';
import { toast } from 'sonner';
import ConfirmModal from './ConfirmModal';

interface Props {
  transaction: Transaction;
  onDelete: () => void;
}

export default function TransactionItem({ transaction, onDelete }: Props) {
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
      <div className="group flex items-center justify-between p-4 mb-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all">
        
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
            <h3 className="font-semibold text-gray-800">{transaction.description}</h3>
            <p className="text-sm text-gray-500">
              {transaction.categories?.name || 'Sem categoria'} • {formattedDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Valor */}
          <div className={`flex items-center gap-2 font-bold ${isIncome ? 'text-emerald-600' : 'text-red-500'}`}>
            {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {isIncome ? '+' : '-'} {formattedAmount.replace('R$', '').trim()}
          </div>

          {/* Botão Deletar */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            title="Excluir transação"
          >
            <Trash2 className="w-4 h-4" />
          </button>
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
