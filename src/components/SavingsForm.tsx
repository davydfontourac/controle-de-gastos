import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/utils/cn';
import { X, Loader2, Target, Calendar, Tag } from 'lucide-react';
import type { SavingsGoal } from '@/hooks/useSavings';

const goalSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  target_amount: z.number().min(0.01, 'Valor da meta deve ser maior que zero'),
  target_date: z.string().optional().nullable(),
  icon: z.string().min(1, 'Emoji é obrigatório'),
  color: z.string().min(4).max(7),
});

type GoalFormData = {
  name: string;
  target_amount: number;
  target_date?: string | null;
  icon: string;
  color: string;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: Partial<SavingsGoal>) => Promise<boolean>;
  goal?: SavingsGoal | null;
}

const PRESET_COLORS = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
const PRESET_EMOJIS = ['💰', '✈️', '🏠', '🚗', '🛡️', '🎓', '💍', '🎮', '💻', '🚲', '🎁', '🏖️'];

export default function SavingsForm({ isOpen, onClose, onConfirm, goal }: Readonly<Props>) {
  const [isEmojiExpanded, setIsEmojiExpanded] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      target_amount: 0,
      icon: '💰',
      color: '#3B82F6',
    },
  });

  const selectedColor = watch('color');
  const selectedEmoji = watch('icon');

  useEffect(() => {
    if (goal) {
      reset({
        name: goal.name,
        target_amount: Number(goal.target_amount),
        target_date: goal.target_date,
        icon: goal.icon,
        color: goal.color,
      });
    } else {
      reset({
        name: '',
        target_amount: 0,
        icon: '💰',
        color: '#3B82F6',
      });
    }
  }, [goal, reset, isOpen]);

  const onSubmit = async (data: GoalFormData) => {
    const success = await onConfirm(goal ? { ...data, id: goal.id } : data);
    if (success) onClose();
  };

  if (!isOpen) return null;

  const visibleEmojis = isEmojiExpanded ? PRESET_EMOJIS : PRESET_EMOJIS.slice(0, 6);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-transparent dark:border-gray-800 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {goal ? 'Editar Caixinha' : 'Nova Caixinha'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="flex gap-4">
             <div className="shrink-0 text-center">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Ícone</label>
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700"
                style={{ color: selectedColor, backgroundColor: `${selectedColor}15` }}
              >
                {selectedEmoji}
              </div>
            </div>
            <div className="flex-1">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Tag size={14} /> Nome do Objetivo
              </label>
              <input
                {...register('name')}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-2xl outline-none focus:border-blue-500"
                placeholder="Ex: Viagem Japão"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Target size={14} /> Valor Alvo
              </label>
              <input
                {...register('target_amount', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-2xl outline-none focus:border-blue-500"
                placeholder="R$ 0,00"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Calendar size={14} /> Data Limite
              </label>
              <input
                {...register('target_date')}
                type="date"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-2xl outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block">Escolha um Emoji</label>
              <button 
                type="button"
                onClick={() => setIsEmojiExpanded(!isEmojiExpanded)}
                className="text-[10px] font-bold text-blue-500 uppercase tracking-wider"
              >
                {isEmojiExpanded ? 'Menos' : 'Todos'}
              </button>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {visibleEmojis.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setValue('icon', emoji)}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all",
                    selectedEmoji === emoji ? "bg-white dark:bg-gray-700 shadow-md ring-2 ring-blue-500" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 block">Cor Temática</label>
            <div className="flex flex-wrap gap-3">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all hover:scale-110",
                    selectedColor === color ? "border-white dark:border-gray-900 scale-110 shadow-lg ring-2 ring-gray-900 dark:ring-white" : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
              <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-transparent hover:scale-110 transition-transform shadow-sm">
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(45deg, #f06, #9f6, #0cf, #f06)' }} />
                <input
                  type="color"
                  {...register('color')}
                  className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 border-none p-0 bg-transparent cursor-pointer opacity-0"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Caixinha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
