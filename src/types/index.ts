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
  icon?: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO date string
  categoryId: string;
  type: TransactionType;
}
