import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Skeleton } from './ui/Skeleton';

interface Props {
  summary: {
    totalIncome: number;
    totalExpense: number;
    availableBalance: number;
    caixinhaBalance: number;
    yearBalance: number;
  };
  isLoading?: boolean;
}

const COLOR_CLASSES: Record<string, { bg: string; icon: string; amount: string }> = {
  blue: {
    bg: 'bg-blue-600 dark:bg-blue-400',
    icon: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
    amount: 'text-gray-900 dark:text-white',
  },
  indigo: {
    bg: 'bg-indigo-600 dark:bg-indigo-400',
    icon: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    amount: 'text-indigo-600 dark:text-indigo-400',
  },
  emerald: {
    bg: 'bg-emerald-600 dark:bg-emerald-400',
    icon: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    amount: 'text-emerald-600 dark:text-emerald-400',
  },
  red: {
    bg: 'bg-red-600 dark:bg-red-400',
    icon: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
    amount: 'text-red-500 dark:text-red-400',
  },
};

export default function SummaryCards({ summary, isLoading }: Readonly<Props>) {
  const cards = [
    {
      title: 'Disponível',
      amount: summary.availableBalance,
      icon: Wallet,
      color: 'blue',
      description: 'Saldo em conta',
      subValue: (summary.availableBalance || 0) + (summary.caixinhaBalance || 0),
      subDescription: 'Patrimônio Total'
    },
    {
      title: 'Caixinhas',
      amount: summary.caixinhaBalance,
      icon: PiggyBank,
      color: 'indigo',
      description: 'Investimentos/Reserva'
    },
    {
      title: 'Receitas',
      amount: summary.totalIncome,
      icon: TrendingUp,
      color: 'emerald',
      description: 'Neste mês'
    },
    {
      title: 'Despesas',
      amount: summary.totalExpense,
      icon: TrendingDown,
      color: 'red',
      description: 'Neste mês'
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        
        const colors = COLOR_CLASSES[card.color] ?? COLOR_CLASSES.red;

        return (
          <div 
            key={card.title}
            className="relative bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden group hover:shadow-md transition-all"
          >
            {/* Background Accent */}
            <div className={cn(
              "absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity",
              colors.bg
            )} />

            <div className="flex items-start justify-between mb-4">
              <div className={cn(
                "p-3 rounded-2xl",
                colors.icon
              )}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{card.title}</span>
            </div>

            <div>
              {isLoading ? (
                <div className="space-y-2 mt-4">
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                  {card.subValue !== undefined && <Skeleton className="h-3 w-1/3 mt-2" />}
                </div>
              ) : (
                <h2 className={cn(
                  "text-2xl font-bold mb-1",
                  colors.amount
                )}>
                  {formatCurrency(card.amount)}
                </h2>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {card.description}
                {card.subValue !== undefined && (
                  <span className="block mt-1 text-[10px] font-bold uppercase tracking-tight">
                    {card.subDescription}: {' '}
                    <span className={cn(
                      card.subValue >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
                    )}>
                      {formatCurrency(card.subValue)}
                    </span>
                  </span>
                )}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
