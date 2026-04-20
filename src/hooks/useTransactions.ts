import { useState, useCallback } from 'react';
import { supabase } from '@/services/supabase';
import { toast } from 'sonner';
import type { Transaction } from '@/types';

interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  yearBalance: number;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    yearBalance: 0,
  });
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = useCallback(
    async (filters: { type: string; month: string; year: string; search: string }) => {
      try {
        setIsLoading(true);

        const monthNum = Number(filters.month);
        const yearNum = Number(filters.year);

        // 1. Fetch Transactions with Category details
        let query = supabase
          .from('transactions')
          .select('*, categories(name, icon, color)')
          .order('date', { ascending: false });

        if (filters.type !== 'all') {
          query = query.eq('type', filters.type);
        }

        if (filters.search) {
          query = query.ilike('description', `%${filters.search}%`);
        }

        if (monthNum && yearNum) {
          const startDate = new Date(Date.UTC(yearNum, monthNum - 1, 1)).toISOString();
          const endDate = new Date(Date.UTC(yearNum, monthNum, 0, 23, 59, 59)).toISOString();
          query = query.gte('date', startDate).lte('date', endDate);
        }

        // 2. Fetch Summary and History via RPC
        const [transRes, sumRes, historyRes] = await Promise.all([
          query,
          supabase.rpc('get_dashboard_summary', { p_month: monthNum, p_year: yearNum }),
          supabase.rpc('get_monthly_history', { p_year: yearNum }),
        ]);

        if (transRes.error) throw transRes.error;
        if (sumRes.error) throw sumRes.error;
        if (historyRes.error) throw historyRes.error;

        setTransactions(transRes.data || []);
        setSummary({
          totalIncome: sumRes.data.income,
          totalExpense: sumRes.data.expense,
          balance: sumRes.data.totalBalance,
          yearBalance: sumRes.data.yearBalance,
        });
        setHistory(historyRes.data || []);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        toast.error('Erro ao carregar transações');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { transactions, summary, history, isLoading, fetchTransactions };
}
