import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  ArrowLeft,
  Tag,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ConfirmModal';
import CategoryForm from '@/components/CategoryForm';
import { ThemeToggle } from '@/components/ThemeToggle';
import BottomNavigation from '@/components/BottomNavigation';
import PageTransition from '@/components/PageTransition';
import { Skeleton } from '@/components/ui/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';

import { useCategories } from '@/hooks/useCategories';
import type { Category } from '@/hooks/useCategories';

export default function Categories() {
  const { profile } = useAuth();
  const { categories, isLoading, fetchCategories } = useCategories();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`cat-skeleton-${i}`} className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (categories.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-900 p-12 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 text-center transition-colors"
        >
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-500 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Tag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Nenhuma categoria</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
            Crie categorias para organizar melhor suas finanças e ver relatórios por tipo de gasto.
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-6 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl hover:bg-black dark:hover:bg-white transition-colors"
          >
            Criar Primeira Categoria
          </button>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <AnimatePresence>
          {categories.map((category, index) => (
            <motion.div
              layout
              key={category.id}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between group hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm"
                  style={{ backgroundColor: `${category.color}20`, color: category.color }}
                >
                  <Tag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">{category.name}</h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">{category.color}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-2 text-blue-600 sm:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingCategory(category)}
                  className="p-2 text-red-500 sm:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 dark:hover:text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <PageTransition className="min-h-screen bg-gray-50/50 dark:bg-gray-950 transition-colors">
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm sticky top-0 z-40 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link 
                to="/dashboard" 
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 border-l border-gray-100 dark:border-gray-800 pl-4">
                Minhas Categorias
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link
                to="/profile"
                className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 shadow-sm relative overflow-hidden group/avatar bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 hover:border-blue-100 dark:hover:border-gray-600 transition-all"
                title="Meu Perfil"
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-gray-400 group-hover/avatar:text-blue-500 transition-colors" />
                )}
              </Link>
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
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 lg:pb-10">
        {renderContent()}
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

      <BottomNavigation />
    </PageTransition>
  );
}
