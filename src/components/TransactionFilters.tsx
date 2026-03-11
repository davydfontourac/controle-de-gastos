import { Search, Calendar, Filter } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props {
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
  filters: {
    search: string;
    type: string;
    month: string;
    year: string;
  };
}

const MONTHS = [
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

const YEARS = Array.from({ length: 5 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { value: String(year), label: String(year) };
});

function getTypeLabel(type: string): string {
  if (type === 'all') return 'Todos';
  if (type === 'income') return 'Receitas';
  return 'Despesas';
}

export default function TransactionFilters({
  onSearchChange,
  onTypeChange,
  onMonthChange,
  onYearChange,
  filters
}: Props) {
  return (
    <div className="space-y-4 mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Busca por Descrição */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por descrição..."
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-400 dark:focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>

        {/* Filtro por Tipo */}
        <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          {['all', 'income', 'expense'].map((t) => (
            <button
              key={t}
              onClick={() => onTypeChange(t)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-all",
                filters.type === t ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              )}
            >
              {getTypeLabel(t)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
          <Calendar className="w-4 h-4" />
          Período:
        </div>
        
        <select
          value={filters.month}
          onChange={(e) => onMonthChange(e.target.value)}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all cursor-pointer"
        >
          {MONTHS.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>

        <select
          value={filters.year}
          onChange={(e) => onYearChange(e.target.value)}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all cursor-pointer"
        >
          {YEARS.map(y => (
            <option key={y.value} value={y.value}>{y.label}</option>
          ))}
        </select>

        <div className="flex-1" />

        <div className="flex items-center gap-2 text-gray-400 text-xs italic">
          <Filter className="w-3 h-3" />
          Refinando resultados
        </div>
      </div>
    </div>
  );
}
