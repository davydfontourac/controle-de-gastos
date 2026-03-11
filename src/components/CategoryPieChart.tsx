import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Transaction } from '@/types';
import { useMemo } from 'react';

interface Props {
  transactions: Transaction[];
}

const COLORS = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280', '#06B6D4'];

export default function CategoryPieChart({ transactions }: Props) {
  const { data, totalExpenses } = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const total = expenses.reduce((acc, t) => acc + Number(t.amount), 0);
    
    // Agrupa por categoria
    const groups: Record<string, { value: number; color?: string }> = {};
    
    expenses.forEach(t => {
      const categoryName = t.categories?.name || 'Sem categoria';
      if (!groups[categoryName]) {
        groups[categoryName] = { value: 0, color: t.categories?.color };
      }
      groups[categoryName].value += Number(t.amount);
    });

    const chartData = Object.entries(groups).map(([name, { value, color }], index) => ({
      name,
      value: Number(value.toFixed(2)),
      color: color || COLORS[index % COLORS.length]
    })).sort((a, b) => b.value - a.value);

    return { data: chartData, totalExpenses: total };
  }, [transactions]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 h-full min-h-[400px] transition-colors">
        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
          <PieChart className="w-8 h-8 text-gray-300 dark:text-gray-600" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-medium text-center">Nenhuma despesa registrada<br/>neste período para exibir o gráfico.</p>
      </div>
    );
  }

  const formattedTotal = new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL',
    maximumFractionDigits: 0 
  }).format(totalExpenses);

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm h-full min-h-[400px] flex flex-col relative overflow-hidden group transition-colors">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 px-2">Distribuição de Gastos</h3>
        <span className="text-xs font-bold text-gray-400 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg uppercase tracking-wider">
          Total: {formattedTotal}
        </span>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row items-center">
        <div className="relative w-full h-[240px] sm:h-full sm:flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="70%"
                outerRadius="90%"
                paddingAngle={4}
                dataKey="value"
                stroke="none"
                animationBegin={0}
                animationDuration={1200}
              >
                {data.map((entry) => (
                  <Cell 
                    key={`cell-${entry.name}`} 
                    fill={entry.color} 
                    className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                  padding: '12px'
                }}
                itemStyle={{ fontWeight: 'bold', fontSize: '14px' }}
                formatter={(value: any) => {
                  const numericValue = typeof value === 'string' ? Number.parseFloat(value) : (value as number);
                  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numericValue || 0);
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Valor Central */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Total Gasto</span>
            <span className="text-gray-900 dark:text-white text-2xl font-black tracking-tight">{formattedTotal}</span>
          </div>
        </div>

        {/* Legenda Customizada Premium */}
        <div className="w-full sm:w-48 flex flex-col gap-2 mt-4 sm:mt-0 sm:pl-4 max-h-[160px] overflow-y-auto no-scrollbar">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between group/item cursor-default">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-bold text-gray-600 dark:text-gray-300 truncate max-w-[100px] group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors">
                  {item.name}
                </span>
              </div>
              <span className="text-xs font-black text-gray-400 dark:text-gray-500 tabular-nums">
                {Math.round((item.value / totalExpenses) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
