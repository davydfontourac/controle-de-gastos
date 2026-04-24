import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase';
import { Plus, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ConfirmModal';
import CategoryForm from '@/components/CategoryForm';
import PageTransition from '@/components/PageTransition';
import { Skeleton } from '@/components/ui/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

import { MonthYearPicker } from '@/components/MonthYearPicker';

import { useCategories } from '@/hooks/useCategories';
import type { Category } from '@/hooks/useCategories';

const SKELETON_CAT_IDS = ['sk-c-1', 'sk-c-2', 'sk-c-3', 'sk-c-4', 'sk-c-5', 'sk-c-6', 'sk-c-7', 'sk-c-8'];

const fmt = (n: number) =>
  'R$ ' +
  Math.abs(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Categories() {
  const { categories, isLoading, fetchCategories } = useCategories();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState({
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
  });

  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});
  const [totalSpentMonth, setTotalSpentMonth] = useState(0);

  const fetchTotals = useCallback(async () => {
    try {
      const startDate = new Date(Number(filters.year), Number(filters.month) - 1, 1).toISOString();
      const endDate = new Date(Number(filters.year), Number(filters.month), 0, 23, 59, 59).toISOString();

      const { data, error } = await supabase
        .from('transactions')
        .select('amount, category_id, type')
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;

      const totals: Record<string, number> = {};
      let totalExpense = 0;

      data?.forEach(t => {
        if (t.type === 'expense') {
          const cid = t.category_id || 'unassigned';
          const amt = Math.abs(Number(t.amount));
          totals[cid] = (totals[cid] || 0) + amt;
          totalExpense += amt;
        }
      });

      setCategoryTotals(totals);
      setTotalSpentMonth(totalExpense);
    } catch (err) {
      console.error('Error fetching totals:', err);
    }
  }, [filters]);

  useEffect(() => {
    fetchCategories();
    fetchTotals();
  }, [fetchCategories, fetchTotals]);

  const handleDelete = async () => {
    if (!deletingCategory) return;
    try {
      setIsDeleting(true);
      const { error } = await supabase.from('categories').delete().eq('id', deletingCategory.id);
      if (error) throw error;
      toast.success('Categoria excluída com sucesso');
      fetchCategories();
      setDeletingCategory(null);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir categoria');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  return (
    <PageTransition className="A-main h-screen overflow-y-auto w-full">
      <div className="A-top">
        <div>
          <h1 className="text-gray-900 dark:text-white">Categorias</h1>
          <div className="sub">
            {categories.length} categorias cadastradas
          </div>
        </div>
        <div className="flex gap-2">
          <MonthYearPicker 
            month={filters.month} 
            year={filters.year} 
            onChange={(m, y) => setFilters(f => ({ ...f, month: m, year: y }))} 
          />
          <button 
            onClick={() => {
              setEditingCategory(null);
              setIsFormOpen(true);
            }} 
            className="A-chip primary"
          >
            <Plus size={14} className="mr-1" /> Nova categoria
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          SKELETON_CAT_IDS.map((id) => (
            <div key={id} className="A-card animate-pulse">
              <div className="flex justify-between mb-4">
                <Skeleton className="w-11 h-11 rounded-xl" />
                <Skeleton className="w-4 h-4 rounded" />
              </div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-20 mb-4" />
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
          ))
        ) : (
          <AnimatePresence>
            {categories.map((c, i) => {
              const spent = categoryTotals[c.id] || 0;
              const hasLimit = (c.monthly_limit || 0) > 0;
              const pctOfLimit = hasLimit ? Math.min((spent / c.monthly_limit) * 100, 100) : 0;
              const pctOfTotal = totalSpentMonth > 0 ? Math.round((spent / totalSpentMonth) * 100) : 0;
              const isOverLimit = hasLimit && spent > c.monthly_limit;

              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "A-card flex flex-col gap-3 group hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer",
                    isOverLimit && "!border-red-500/50 bg-red-50/5 dark:bg-red-900/5"
                  )}
                  onClick={() => handleEdit(c)}
                >
                  <div className="flex justify-between items-center">
                    <div 
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${c.color}15`, color: c.color }}
                    >
                      {c.icon || '💰'}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingCategory(c);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                  
                  <div>
                    <div className="text-base font-semibold text-gray-900 dark:text-white flex items-center justify-between">
                      <span>{c.name}</span>
                      {isOverLimit && <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Limite Excedido</span>}
                    </div>
                    <div className="text-xs text-gray-500 font-mono mt-1">Transações classificadas</div>
                  </div>

                  <div className="mt-2">
                    <div className="flex items-baseline gap-2">
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{fmt(spent)}</div>
                      {hasLimit && (
                        <div className="text-[11px] text-gray-400">/ {fmt(c.monthly_limit)}</div>
                      )}
                    </div>
                    
                    <div className="flex justify-between text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-3 mb-2">
                      {hasLimit ? (
                        <span>{Math.round((spent/c.monthly_limit)*100)}% DO LIMITE</span>
                      ) : (
                        <span>{pctOfTotal}% DO TOTAL</span>
                      )}
                    </div>
                    
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${hasLimit ? pctOfLimit : (pctOfTotal || 0)}%` }}
                        className={cn("h-full rounded-full", isOverLimit ? "bg-red-500" : "")} 
                        style={{ backgroundColor: !isOverLimit ? c.color : undefined }} 
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        
        <button 
          onClick={() => {
            setEditingCategory(null);
            setIsFormOpen(true);
          }}
          className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-all group min-h-[180px]"
        >
          <Plus size={24} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Criar categoria personalizada</span>
        </button>
      </div>

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
    </PageTransition>
  );
}
