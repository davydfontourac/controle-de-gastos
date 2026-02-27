import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/services/api';
import { cn } from '@/utils/cn';
import { X, Loader2, Palette, Tag } from 'lucide-react';
import { toast } from 'sonner';

const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  icon: z.string().min(1, 'Ícone é obrigatório'),
  color: z.string().min(4, 'Selecione uma cor').max(7)
});

type CategoryFormData = {
  name: string;
  icon: string;
  color: string;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: {
    id: number;
    name: string;
    icon: string;
    color: string;
  } | null;
}

const PRESET_COLORS = [
  '#3B82F6', '#10B981', '#EF4444', '#F59E0B', 
  '#8B5CF6', '#EC4899', '#06B6D4', '#71717A'
];

export default function CategoryForm({ isOpen, onClose, onSuccess, category }: Props) {
  const { 
    register, 
    handleSubmit, 
    reset, 
    setValue,
    watch,
    formState: { errors, isSubmitting } 
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      icon: 'tag',
      color: '#3B82F6'
    }
  });

  const selectedColor = watch('color');

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        icon: category.icon,
        color: category.color
      });
    } else {
      reset({
        name: '',
        icon: 'tag',
        color: '#3B82F6'
      });
    }
  }, [category, reset, isOpen]);

  const onSubmit = async (formData: CategoryFormData) => {
    try {
      const data = formData as any;
      if (category) {
        await api.put(`/categories/${category.id}`, data);
        toast.success('Categoria atualizada!');
      } else {
        await api.post('/categories', data);
        toast.success('Categoria criada!');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao salvar categoria');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {category ? 'Editar Categoria' : 'Nova Categoria'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Nome */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-400" />
              Nome da Categoria
            </label>
            <input
              {...register('name')}
              type="text"
              placeholder="Ex: Alimentação, Lazer..."
              className={cn(
                "w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300",
                errors.name && "border-red-300 focus:ring-red-500/10 focus:border-red-500"
              )}
            />
            {errors.name && <p className="mt-2 text-xs font-bold text-red-500">{errors.name.message}</p>}
          </div>

          {/* Cor */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4 text-gray-400" />
              Cor da Categoria
            </label>
            <div className="flex flex-wrap gap-3">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={cn(
                    "w-10 h-10 rounded-full border-4 transition-all hover:scale-110",
                    selectedColor === color ? "border-white shadow-lg ring-2 ring-gray-900" : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
              <input 
                type="color" 
                {...register('color')}
                className="w-10 h-10 rounded-full border-none p-0 bg-transparent cursor-pointer overflow-hidden"
              />
            </div>
            {errors.color && <p className="mt-2 text-xs font-bold text-red-500">{errors.color.message}</p>}
          </div>

          {/* Actions */}
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
              className="flex-1 py-3 px-4 bg-gray-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Categoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
