import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  ArrowLeft,
  Tag
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ConfirmModal';
import CategoryForm from '@/components/CategoryForm';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<Category[]>('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar categorias');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async () => {
    if (!deletingCategory) return;
    try {
      setIsDeleting(true);
      await api.delete(`/categories/${deletingCategory.id}`);
      toast.success('Categoria excluída com sucesso');
      fetchCategories();
      setDeletingCategory(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao excluir categoria');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link 
                to="/dashboard" 
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900 border-l border-gray-100 pl-4">
                Minhas Categorias
              </h1>
            </div>
            <button
              onClick={() => {
                setEditingCategory(null);
                setIsFormOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-200 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova Categoria</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 font-medium">Carregando categorias...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Nenhuma categoria</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Crie categorias para organizar melhor suas finanças e ver relatórios por tipo de gasto.
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors"
            >
              Criar Primeira Categoria
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((category) => (
              <div 
                key={category.id}
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm"
                    style={{ backgroundColor: `${category.color}20`, color: category.color }}
                  >
                    {/* Aqui poderíamos renderizar o ícone dinamicamente se tivéssemos um map */}
                    <Tag className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{category.name}</h3>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{category.color}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingCategory(category)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modais */}
      <CategoryForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchCategories}
        category={editingCategory}
      />

      <ConfirmModal 
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDelete}
        title="Excluir Categoria"
        description={`Tem certeza que deseja excluir "${deletingCategory?.name}"? Transações vinculadas a esta categoria ficarão "Sem categoria".`}
        isLoading={isDeleting}
      />
    </div>
  );
}
