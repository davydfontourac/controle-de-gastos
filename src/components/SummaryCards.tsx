import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props {
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    yearBalance: number;
  };
  isLoading?: boolean;
}

export default function SummaryCards({ summary, isLoading }: Props) {
  const cards = [
    {
      title: 'Saldo Total',
      amount: summary.balance,
      icon: Wallet,
      color: 'blue',
      description: 'Disponível agora',
      subValue: summary.yearBalance,
      subDescription: 'Acumulado no ano'
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
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        
        return (
          <div 
            key={card.title}
            className="relative bg-white p-6 rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all"
          >
            {/* Background Accent */}
            <div className={cn(
              "absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity",
              card.color === 'blue' ? "bg-blue-600" : card.color === 'emerald' ? "bg-emerald-600" : "bg-red-600"
            )} />

            <div className="flex items-start justify-between mb-4">
              <div className={cn(
                "p-3 rounded-2xl",
                card.color === 'blue' ? "bg-blue-50 text-blue-600" : card.color === 'emerald' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
              )}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{card.title}</span>
            </div>

            <div>
              {isLoading ? (
                <div className="h-8 w-32 bg-gray-100 animate-pulse rounded-lg mb-1" />
              ) : (
                <h2 className={cn(
                  "text-2xl font-bold mb-1",
                  card.color === 'blue' ? "text-gray-900" : card.color === 'emerald' ? "text-emerald-600" : "text-red-500"
                )}>
                  {formatCurrency(card.amount)}
                </h2>
              )}
              <p className="text-sm text-gray-500">
                {card.description}
                {card.subValue !== undefined && (
                  <span className="block mt-1 text-[10px] font-bold uppercase tracking-tight">
                    {card.subDescription}: {' '}
                    <span className={cn(
                      card.subValue >= 0 ? "text-emerald-500" : "text-red-500"
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
