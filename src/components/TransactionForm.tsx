import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/services/api';
import { cn } from '@/utils/cn';
import { X, ArrowUpCircle, ArrowDownCircle, Loader2, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

const formSchema = z.object({
  description: z.string().min(1, 'A descrição é obrigatória.'),
  amount: z.string().min(1, 'O valor é obrigatório.').refine(v => !isNaN(Number(v)) && Number(v) > 0, 'O valor deve ser maior que zero.'),
  date: z.string().min(1, 'A data é obrigatória.'),
  type: z.enum(['income', 'expense']),
  category_id: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Category {
  id: string;
  name: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transaction?: any; // Para carregar dados na edição
}

export default function TransactionForm({ isOpen, onClose, onSuccess, transaction }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      category_id: null,
    }
  });

  const selectedType = watch('type');

  // Carrega categorias ao abrir
  useEffect(() => {
    if (isOpen) {
      api.get('/categories').then(res => setCategories(res.data)).catch(console.error);
    }
  }, [isOpen]);

  // Carrega dados se estiver editando
  useEffect(() => {
    if (transaction && isOpen) {
      reset({
        description: transaction.description,
        amount: String(transaction.amount),
        date: new Date(transaction.date).toISOString().split('T')[0],
        type: transaction.type,
        category_id: transaction.category_id ? String(transaction.category_id) : null,
      });
    } else if (!transaction && isOpen) {
      reset({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        category_id: null,
      });
    }
  }, [transaction, isOpen, reset]);

  if (!isOpen) return null;

  async function onSubmit(data: FormValues) {
    try {
      const payload = {
        ...data,
        amount: Number(data.amount),
        category_id: data.category_id || null, // UUID é string
      };

      if (transaction) {
        await api.put(`/transactions/${transaction.id}`, payload);
        toast.success('Transação atualizada!');
      } else {
        await api.post('/transactions', payload);
        toast.success('Transação salva!');
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao salvar transação.');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">{transaction ? 'Editar Transação' : 'Nova Transação'}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setValue('type', 'expense')}
              className={cn(
                "flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all",
                selectedType === 'expense' ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              )}
            >
              <ArrowDownCircle className="w-5 h-5" />
              Despesa
            </button>
            <button
              type="button"
              onClick={() => setValue('type', 'income')}
              className={cn(
                "flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all",
                selectedType === 'income' ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              )}
            >
              <ArrowUpCircle className="w-5 h-5" />
              Receita
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Valor</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-gray-400">R$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  {...register('amount')}
                  className={cn(
                    "w-full pl-11 pr-4 py-3 bg-gray-50/50 border rounded-xl focus:ring-2 focus:outline-none transition-all placeholder:text-gray-300 font-medium text-lg",
                    errors.amount ? "border-red-300 focus:ring-red-100 focus:border-red-400" : "border-gray-200 focus:ring-blue-100 focus:border-blue-400"
                  )}
                />
              </div>
              {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Descrição</label>
              <input
                type="text"
                placeholder="Ex: Freela, Aluguel..."
                {...register('description')}
                className={cn(
                  "w-full px-4 py-3 bg-gray-50/50 border rounded-xl focus:ring-2 focus:outline-none transition-all",
                  errors.description ? "border-red-300 focus:ring-red-100 focus:border-red-400" : "border-gray-200 focus:ring-blue-100 focus:border-blue-400"
                )}
              />
              {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Categoria</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  {...register('category_id')}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 focus:outline-none transition-all appearance-none text-gray-700 font-medium"
                >
                  <option value="">Sem categoria</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ArrowDownCircle className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Data</label>
                <input
                  type="date"
                  {...register('date')}
                  className={cn(
                    "w-full px-4 py-3 bg-gray-50/50 border rounded-xl focus:ring-2 focus:outline-none transition-all text-gray-700",
                    errors.date ? "border-red-300 focus:ring-red-100 focus:border-red-400" : "border-gray-200 focus:ring-blue-100 focus:border-blue-400"
                  )}
                />
                {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg active:scale-95"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Transação'}
          </button>
        </form>
      </div>
    </div>
  );
}
