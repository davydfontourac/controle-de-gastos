import { useState, useCallback } from 'react';
import { supabase } from '@/services/supabase';
import { toast } from 'sonner';

export interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  icon: string;
  color: string;
}

export function useSavings() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setGoals(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar metas de economia');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const upsertGoal = async (goal: Partial<SavingsGoal>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const payload = { ...goal, user_id: user.id };
      
      let res;
      if (goal.id) {
        res = await supabase.from('savings_goals').update(payload).eq('id', goal.id);
      } else {
        res = await supabase.from('savings_goals').insert([payload]);
      }

      if (res.error) throw res.error;
      toast.success(goal.id ? 'Meta atualizada!' : 'Meta criada!');
      fetchGoals();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar meta');
      return false;
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase.from('savings_goals').delete().eq('id', id);
      if (error) throw error;
      toast.success('Meta excluída!');
      fetchGoals();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir meta');
      return false;
    }
  };

  const addDeposit = async (goalId: string, amount: number) => {
    try {
      // 1. Update goal balance
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return false;

      const newAmount = Number(goal.current_amount) + Number(amount);
      const { error: goalErr } = await supabase
        .from('savings_goals')
        .update({ current_amount: newAmount })
        .eq('id', goalId);

      if (goalErr) throw goalErr;

      // 2. Create transaction (optional but consistent with the system)
      const { data: { user } } = await supabase.auth.getUser();
      
      // Find 'Caixinha' category
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', '%caixinha%')
        .single();

      await supabase.from('transactions').insert([{
        user_id: user?.id,
        amount: amount,
        type: 'transfer_out',
        description: `Aporte: ${goal.name}`,
        category_id: catData?.id,
        savings_goal_id: goalId,
        date: new Date().toISOString()
      }]);

      toast.success('Aporte realizado com sucesso!');
      fetchGoals();
      return true;
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Erro ao realizar aporte');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { goals, isLoading, fetchGoals, upsertGoal, deleteGoal, addDeposit };
}
