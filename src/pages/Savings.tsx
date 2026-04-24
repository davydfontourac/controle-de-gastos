import { useState, useEffect } from 'react';
import PageTransition from '@/components/PageTransition';
import { Plus, ArrowRightLeft, TrendingUp, Target, MoreHorizontal, Trash2, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSavings, type SavingsGoal } from '@/hooks/useSavings';
import { useTransactions } from '@/hooks/useTransactions';
import SavingsForm from '@/components/SavingsForm';
import AporteModal from '@/components/AporteModal';
import ConfirmModal from '@/components/ConfirmModal';

const fmt = (n: number) =>
  'R$ ' +
  Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Savings() {
  const { goals, isLoading, fetchGoals, upsertGoal, deleteGoal, addDeposit } = useSavings();
  const { summary, fetchTransactions } = useTransactions();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAporteOpen, setIsAporteOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  useEffect(() => {
    fetchGoals();
    fetchTransactions({ type: 'all', month: String(new Date().getMonth() + 1), year: String(new Date().getFullYear()), search: '' });
  }, [fetchGoals, fetchTransactions]);

  const totalTarget = goals.reduce((acc, g) => acc + Number(g.target_amount), 0);
  const totalReserved = summary.caixinhaBalance;
  const totalPct = totalTarget > 0 ? Math.round((totalReserved / totalTarget) * 100) : 0;

  const handleEdit = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setIsFormOpen(true);
  };

  const handleAddAporte = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setIsAporteOpen(true);
  };

  const handleDeleteRequest = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedGoal) {
      await deleteGoal(selectedGoal.id);
      setIsDeleteConfirmOpen(false);
      setSelectedGoal(null);
    }
  };

  return (
    <PageTransition className="A-main h-screen overflow-y-auto w-full">
      {/* Top Header */}
      <div className="A-top">
        <div>
          <h1 className="text-gray-900 dark:text-white">Caixinhas</h1>
          <div className="sub">
            {goals.length} objetivos · {fmt(totalReserved)} reservados · {totalPct}% da meta total
          </div>
        </div>
        <div className="flex gap-2">
          <button className="A-chip">
            <ArrowRightLeft size={14} className="mr-1" /> Transferir
          </button>
          <button 
            onClick={() => {
              setSelectedGoal(null);
              setIsFormOpen(true);
            }} 
            className="A-chip primary"
          >
            <Plus size={14} className="mr-1" /> Nova caixinha
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="A-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16" />
          <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">Total Reservado</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{fmt(totalReserved)}</div>
          <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
            Rendendo 103% CDI · Última atualização agora
          </div>
        </div>

        <div className="A-card">
          <div className="flex justify-between items-start mb-2">
            <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Meta Total</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{totalPct}%</div>
          </div>
          <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-3">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${totalPct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-blue-500 rounded-full" 
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-gray-400 uppercase">
            <span>{fmt(totalReserved)}</span>
            <span>{fmt(totalTarget)}</span>
          </div>
        </div>

        <div className="A-card">
          <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">Rendimento (mês)</div>
          <div className="text-2xl font-bold text-green-500 flex items-baseline gap-2">
            + R$ 0,00
            <span className="text-xs font-medium text-green-600/70">+0.00%</span>
          </div>
          <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-2 flex items-center gap-1">
             <TrendingUp size={10} /> vs. mês anterior
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        <AnimatePresence>
          {goals.map((goal, i) => {
            const pct = goal.target_amount > 0 ? Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100) : 0;
            const remaining = Math.max(goal.target_amount - goal.current_amount, 0);
            
            return (
              <motion.div 
                key={goal.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.1 }}
                className="A-card group relative"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm border border-white/50 dark:border-gray-800"
                      style={{ backgroundColor: `${goal.color}15` }}
                    >
                      {goal.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{goal.name}</h3>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Target size={12} /> Meta: {goal.target_date ? new Date(goal.target_date).toLocaleDateString('pt-BR') : 'Sem data'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAddAporte(goal)}
                      className="A-chip !py-1 text-[11px]"
                    >
                      + Aportar
                    </button>
                    <div className="relative group/menu">
                       <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <MoreHorizontal size={18} />
                      </button>
                      <div className="absolute right-0 top-full mt-2 w-32 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10 overflow-hidden">
                        <button 
                          onClick={() => handleEdit(goal)}
                          className="w-full px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <Edit2 size={12} /> Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteRequest(goal)}
                          className="w-full px-4 py-2 text-left text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2"
                        >
                          <Trash2 size={12} /> Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{fmt(goal.current_amount)}</span>
                  <span className="text-sm text-gray-400">/ {fmt(goal.target_amount)}</span>
                </div>

                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-4">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.1, ease: 'easeOut' }}
                    className="h-full rounded-full" 
                    style={{ backgroundColor: goal.color }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-gray-400">
                  <span>{pct}% do objetivo</span>
                  <span className="font-bold">Faltam {fmt(remaining)}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {goals.length === 0 && !isLoading && (
          <button 
            onClick={() => {
              setSelectedGoal(null);
              setIsFormOpen(true);
            }}
            className="col-span-full border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl p-12 flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all group"
          >
            <Plus size={32} className="group-hover:scale-110 transition-transform" />
            <span className="font-bold">Comece a guardar dinheiro criando sua primeira caixinha!</span>
          </button>
        )}
      </div>

      {/* Modals */}
      <SavingsForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onConfirm={upsertGoal}
        goal={selectedGoal}
      />

      <AporteModal 
        isOpen={isAporteOpen}
        onClose={() => setIsAporteOpen(false)}
        onConfirm={addDeposit}
        goal={selectedGoal}
      />

      <ConfirmModal 
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir Caixinha"
        description={`Tem certeza que deseja excluir a caixinha "${selectedGoal?.name}"? O saldo acumulado não será perdido, mas o objetivo deixará de existir.`}
      />
    </PageTransition>
  );
}
