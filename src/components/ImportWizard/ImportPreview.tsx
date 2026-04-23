import type { TransactionType } from '@/types';
import { format, parseISO } from 'date-fns';
import { ArrowUpCircle, ArrowDownCircle, Info } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface PreviewTransaction {
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category_id: string | null;
}

interface ImportPreviewProps {
  transactions: PreviewTransaction[];
  categories: Category[];
  onTransactionsChange: (transactions: PreviewTransaction[]) => void;
}

export default function ImportPreview({ 
  transactions, 
  categories,
  onTransactionsChange 
}: ImportPreviewProps) {
  const summary = transactions.reduce(
    (acc, t) => {
      if (t.type === 'income') acc.income += t.amount;
      else if (t.type === 'expense') acc.expense += t.amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const handleCategoryChange = (index: number, categoryId: string) => {
    const newTransactions = [...transactions];
    newTransactions[index].category_id = categoryId === '' ? null : categoryId;
    onTransactionsChange(newTransactions);
  };

  return (
    <div className="space-y-6">
      {/* Summary Mini Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/50 p-4 rounded-2xl">
          <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase tracking-wider mb-1">
            Total Receitas
          </p>
          <p className="text-xl font-bold text-green-700 dark:text-green-300">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.income)}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/50 p-4 rounded-2xl">
          <p className="text-xs text-red-600 dark:text-red-400 font-bold uppercase tracking-wider mb-1">
            Total Despesas
          </p>
          <p className="text-xl font-bold text-red-700 dark:text-red-300">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.expense)}
          </p>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 p-3 rounded-xl flex items-center gap-3 text-xs text-blue-700 dark:text-blue-400">
        <Info className="w-4 h-4 shrink-0" />
        <p>Revise e altere as categorias se necessário. Transações sem categoria serão marcadas como "Sem categoria".</p>
      </div>

      {/* Table Preview */}
      <div className="overflow-hidden border border-gray-100 dark:border-gray-800 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {transactions.map((t, i) => (
                <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {format(parseISO(t.date), 'dd/MM/yy')}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 min-w-[150px]">
                    <p className="truncate max-w-[200px]" title={t.description}>{t.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={t.category_id || ''}
                        onChange={(e) => handleCategoryChange(i, e.target.value)}
                        className={`text-xs p-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer min-w-[140px] ${
                          t.category_id 
                            ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-400 font-semibold'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500'
                        }`}
                      >
                        <option value="">Sem categoria</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className={`px-4 py-3 text-sm font-bold text-right flex items-center justify-end gap-2 whitespace-nowrap ${
                    t.type === 'transfer_in' || t.type === 'transfer_out' 
                      ? 'text-blue-500' 
                      : (t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')
                  }`}>
                    {t.type === 'income' || t.type === 'transfer_in' ? (
                      <ArrowUpCircle className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownCircle className="w-3.5 h-3.5" />
                    )}
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
