import { useState, useCallback } from 'react';
import { supabase } from '@/services/supabase';
import { toast } from 'sonner';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  monthly_limit: number;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar categorias');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { categories, isLoading, fetchCategories, setCategories };
}
