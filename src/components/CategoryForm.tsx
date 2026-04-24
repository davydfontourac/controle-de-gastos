import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/services/supabase';
import { cn } from '@/utils/cn';
import { X, Loader2, Palette, Tag } from 'lucide-react';
import { toast } from 'sonner';

const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  icon: z.string().min(1, 'Ícone é obrigatório'),
  color: z.string().min(4, 'Selecione uma cor').max(7),
  monthly_limit: z.number().min(0, 'Limite inválido'),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: {
    id: string;
    name: string;
    icon: string;
    color: string;
    monthly_limit: number;
  } | null;
}

const PRESET_COLORS = [
  '#3B82F6',
  '#10B981',
  '#EF4444',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#71717A',
];

const PRESET_EMOJIS = [
  '💰', '💵', '💳', '💎', '📈', '📉', '🏦', '🪙', 
  '🍔', '🍕', '🍱', '🍦', '☕', '🍺', '🥤', '🍎',
  '🏠', '🛋️', '🧹', '🔌', '🚿', '🔑', '🏢', '🏗️',
  '🚗', '🚕', '🚌', '🚆', '✈️', '🚲', '⛽', '⚓',
  '👕', '👗', '👟', '🕶️', '👜', '💄', '⌚', '💍',
  '🏥', '💊', '🩹', '🦷', '🏋️', '🧘', '🚲', '🩺',
  '🎬', '🎮', '🎧', '🎤', '🎨', '📸', '🎭', '🎪',
  '📚', '🎓', '📝', '💻', '📱', '🖥️', '📡', '💾',
  '🐶', '🐱', '🐾', '🌿', '🌻', '🌞', '🌙', '⭐',
  '🎁', '🎈', '🎉', '🎊', '🧧', '✉️', '📦', '🛒'
];

export default function CategoryForm({ isOpen, onClose, onSuccess, category }: Readonly<Props>) {
  const [isEmojiExpanded, setIsEmojiExpanded] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      icon: '💰',
      color: '#3B82F6',
      monthly_limit: 0,
    },
  });

  const selectedColor = watch('color');
  const selectedEmoji = watch('icon');

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        icon: category.icon,
        color: category.color,
        monthly_limit: category.monthly_limit || 0,
      });
    } else {
      reset({
        name: '',
        icon: '💰',
        color: '#3B82F6',
        monthly_limit: 0,
      });
    }
  }, [category, reset, isOpen]);

  const onSubmit = async (formData: CategoryFormData) => {
    try {
      const data = formData as any;
      if (category) {
        const { error } = await supabase.from('categories').update(data).eq('id', category.id);
        if (error) throw error;
        toast.success('Categoria atualizada!');
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');
        const finalPayload = { ...data, user_id: user.id };
        const { error } = await supabase.from('categories').insert([finalPayload]);
        if (error) throw error;
        toast.success('Categoria criada!');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao salvar categoria');
    }
  };

  if (!isOpen) return null;

  const visibleEmojis = isEmojiExpanded ? PRESET_EMOJIS : PRESET_EMOJIS.slice(0, 8);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-transparent dark:border-gray-800 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {category ? 'Editar Categoria' : 'Nova Categoria'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Nome e Icone */}
          <div className="flex gap-4">
             <div className="shrink-0">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block text-center">
                Ícone
              </label>
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700"
                style={{ color: selectedColor, backgroundColor: `${selectedColor}15` }}
              >
                {selectedEmoji}
              </div>
            </div>
            <div className="flex-1">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                Nome da Categoria
              </label>
              <input
                {...register('name')}
                type="text"
                placeholder="Ex: Alimentação..."
                className={cn(
                  'w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600',
                  errors.name &&
                    'border-red-300 focus:ring-red-500/10 focus:border-red-500 dark:border-red-500/50 dark:focus:ring-red-500/20',
                )}
              />
            </div>
          </div>

          {/* Limite Mensal */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <span className="w-4 h-4 flex items-center justify-center text-gray-400 dark:text-gray-500 font-mono text-[10px]">R$</span>
              Limite Mensal (Budget)
            </label>
            <input
              {...register('monthly_limit', { valueAsNumber: true })}
              type="number"
              step="0.01"
              placeholder="Ex: 500,00"
              className={cn(
                'w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600',
                errors.monthly_limit &&
                  'border-red-300 focus:ring-red-500/10 focus:border-red-500 dark:border-red-500/50 dark:focus:ring-red-500/20',
              )}
            />
            <p className="text-[10px] text-gray-400 dark:text-gray-500 ml-1">Deixe como 0 para não definir limite.</p>
          </div>

          {/* Emoji Picker */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block">
                Escolha um Emoji
              </label>
              <button 
                type="button"
                onClick={() => setIsEmojiExpanded(!isEmojiExpanded)}
                className="text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors"
              >
                {isEmojiExpanded ? 'Ver menos' : 'Ver todos'}
              </button>
            </div>
            <div className="grid grid-cols-8 gap-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-700">
              {visibleEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setValue('icon', emoji)}
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center text-lg hover:bg-white dark:hover:bg-gray-700 transition-all active:scale-90',
                    selectedEmoji === emoji && 'bg-white dark:bg-gray-700 shadow-sm ring-2 ring-blue-500/20'
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Cor */}
          <div>
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              Cor da Categoria
            </label>
            <div className="flex flex-wrap gap-3">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={cn(
                    'w-10 h-10 rounded-full border-4 transition-all hover:scale-110',
                    selectedColor === color
                      ? 'border-white dark:border-gray-900 shadow-lg ring-2 ring-gray-900 dark:ring-white scale-110'
                      : 'border-transparent',
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:scale-110 transition-transform shadow-sm group">
                <div 
                  className="absolute inset-0 pointer-events-none" 
                  style={{ background: 'linear-gradient(45deg, #f06, #9f6, #0cf, #f06)' }}
                />
                <input
                  type="color"
                  {...register('color')}
                  className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 border-none p-0 bg-transparent cursor-pointer opacity-0"
                />
              </div>
            </div>
            {errors.color && (
              <p className="mt-2 text-xs font-bold text-red-500">{errors.color.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 text-gray-500 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-gray-100 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Categoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
