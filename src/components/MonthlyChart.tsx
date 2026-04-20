import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useMemo } from 'react';

interface HistoryData {
  month: string;
  income: number;
  expense: number;
  fullMonth: number;
  year: number;
}

interface Props {
  data: HistoryData[];
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 min-w-[150px]">
        <p className="font-bold text-gray-800 dark:text-gray-200 mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((item: any) => (
            <div key={item.dataKey} className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium" style={{ color: item.color }}>
                {item.name}:
              </span>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const renderLegendText = (value: string) => (
  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{value}</span>
);

export default function MonthlyChart({ data, isLoading }: Readonly<Props>) {
  // Guaranteed chronological sorting
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.fullMonth - b.fullMonth;
    });
  }, [data]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm h-[400px] flex flex-col animate-pulse transition-colors">
        <div className="h-6 w-48 bg-gray-100 dark:bg-gray-800 rounded mb-8" />
        <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm h-[400px] flex flex-col transition-colors">
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6 px-2">Evolução Mensal</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            barGap={8}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F9FAFB' }} />
            <Legend 
              verticalAlign="top" 
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingBottom: '20px' }}
              formatter={renderLegendText}
            />
            <Bar 
              dataKey="expense" 
              fill="#EF4444" 
              radius={[4, 4, 0, 0]} 
              name="Despesas"
              barSize={20}
              animationDuration={1500}
            />
            <Bar 
              dataKey="income" 
              fill="#10B981" 
              radius={[4, 4, 0, 0]} 
              name="Receitas"
              barSize={20}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
