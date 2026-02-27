import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface HistoryData {
  month: string;
  income: number;
  expense: number;
}

interface Props {
  data: HistoryData[];
  isLoading?: boolean;
}

export default function MonthlyChart({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-[400px] flex flex-col animate-pulse">
        <div className="h-6 w-48 bg-gray-100 rounded mb-8" />
        <div className="flex-1 bg-gray-50 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-[400px] flex flex-col">
      <h3 className="text-lg font-bold text-gray-800 mb-6 px-2">Evolução Mensal</h3>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
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
            <Tooltip
              cursor={{ fill: '#F9FAFB' }}
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              formatter={(value: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
            />
            <Legend 
              verticalAlign="top" 
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingBottom: '20px' }}
              formatter={(value) => <span className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{value === 'income' ? 'Receitas' : 'Despesas'}</span>}
            />
            <Bar 
              dataKey="income" 
              fill="#3B82F6" 
              radius={[4, 4, 0, 0]} 
              name="income"
              barSize={20}
            />
            <Bar 
              dataKey="expense" 
              fill="#EF4444" 
              radius={[4, 4, 0, 0]} 
              name="expense"
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
