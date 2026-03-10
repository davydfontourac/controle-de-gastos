export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  user_id: string;
  created_at: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  description: string;
  date: string;
  category_id?: string | null;
  categories?: Pick<Category, 'name' | 'icon' | 'color'> | null;
  is_recurrent?: boolean;
  frequency?: 'weekly' | 'monthly' | 'yearly' | null;
  parent_id?: string | null;
  user_id: string;
  created_at: string;
}
