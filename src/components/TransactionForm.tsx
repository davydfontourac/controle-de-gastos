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
  amount: z.string().min(1, 'O valor é obrigatório.').refine(v => !Number.isNaN(Number(v)) && Number(v) > 0, 'O valor deve ser maior que zero.'),
  date: z.string().min(1, 'A data é obrigatória.'),
  type: z.enum(['income', 'expense']),
  category_id: z.string().nullable().optional(),
  is_recurrent: z.boolean(),
  frequency: z.enum(['weekly', 'monthly', 'yearly']).nullable().optional(),
  installments: z.string(),
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
      is_recurrent: false,
      frequency: 'monthly',
      installments: '1',
    }
  });

  const selectedType = watch('type');
  const isRecurrent = watch('is_recurrent');

  // Carrega categorias ao abrir
  useEffect(() => {
    if (isOpen) {
      api.get('/categories').then(res => setCategories(res.data)).catch(console.error);
    }
  }, [isOpen]);

  // Carrega dados se estiver editando
  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        reset({
          description: transaction.description,
          amount: String(transaction.amount),
          date: new Date(transaction.date).toISOString().split('T')[0],
          type: transaction.type,
          category_id: transaction.category_id ? String(transaction.category_id) : null,
          is_recurrent: transaction.is_recurrent || false,
          frequency: transaction.frequency || 'monthly',
          installments: '1',
        });
      } else {
        reset({
          description: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          type: 'expense',
          category_id: null,
          is_recurrent: false,
          frequency: 'monthly',
          installments: '1',
        });
      }
    }
  }, [transaction, isOpen, reset]);

  // Garante que o valor da categoria seja aplicado quando as categorias carregarem
  useEffect(() => {
    if (transaction && isOpen && categories.length > 0) {
      setValue('category_id', transaction.category_id ? String(transaction.category_id) : null);
    }
  }, [transaction, isOpen, categories, setValue]);

  if (!isOpen) return null;

  async function onSubmit(data: FormValues) {
    try {
      const payload = {
        ...data,
        amount: Number(data.amount),
        category_id: data.category_id || null, // UUID é string
        installments: Number(data.installments),
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
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-transparent dark:border-gray-800 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{transaction ? 'Editar Transação' : 'Nova Transação'}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setValue('type', 'expense')}
              className={cn(
                "flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all",
                selectedType === 'expense' ? "bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
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
                selectedType === 'income' ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
              )}
            >
              <ArrowUpCircle className="w-5 h-5" />
              Receita
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Valor</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-gray-400 dark:text-gray-500">R$</span>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  {...register('amount')}
                  className={cn(
                    "w-full pl-11 pr-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 border rounded-xl focus:ring-2 focus:outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 font-medium text-lg text-gray-900 dark:text-gray-100",
                    errors.amount ? "border-red-300 focus:ring-red-100 dark:focus:ring-red-900/30 focus:border-red-400" : "border-gray-200 dark:border-gray-700 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-400 dark:focus:border-blue-500"
                  )}
                />
              </div>
              {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
              <input
                id="description"
                type="text"
                placeholder="Ex: Freela, Aluguel..."
                {...register('description')}
                className={cn(
                  "w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 border rounded-xl focus:ring-2 focus:outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600",
                  errors.description ? "border-red-300 focus:ring-red-100 dark:focus:ring-red-900/30 focus:border-red-400" : "border-gray-200 dark:border-gray-700 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-400 dark:focus:border-blue-500"
                )}
              />
              {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
            </div>

            <div>
              <label htmlFor="category_id" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <select
                  id="category_id"
                  {...register('category_id')}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-400 dark:focus:border-blue-500 focus:outline-none transition-all appearance-none text-gray-700 dark:text-gray-300 font-medium"
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

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register('is_recurrent')}
                  className="w-5 h-5 rounded-md border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                  Repetir transação (Recorrência)
                </span>
              </label>

              {isRecurrent && (
                <div className="grid grid-cols-2 gap-4 mt-4 animate-in slide-in-from-top-2 duration-200">
                  <div>
                    <label htmlFor="frequency" className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Frequência</label>
                    <select
                      id="frequency"
                      {...register('frequency')}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none transition-all text-sm font-medium"
                    >
                      <option value="monthly">Mensal</option>
                      <option value="weekly">Semanal</option>
                      <option value="yearly">Anual</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="installments" className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Ocorrências</label>
                    <input
                      id="installments"
                      type="number"
                      min="1"
                      max="60"
                      {...register('installments')}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none transition-all text-sm font-medium"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 pt-2">
              <div>
                <label htmlFor="date" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Data da primeira</label>
                <input
                  id="date"
                  type="date"
                  {...register('date')}
                  className={cn(
                    "w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 border rounded-xl focus:ring-2 focus:outline-none transition-all text-gray-700 dark:text-gray-100",
                    errors.date ? "border-red-300 focus:ring-red-100 dark:focus:ring-red-900/30 focus:border-red-400" : "border-gray-200 dark:border-gray-700 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-400 dark:focus:border-blue-500"
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
