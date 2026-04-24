import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '@/utils/cn';

interface MonthYearPickerProps {
  month: string;
  year: string;
  onChange: (month: string, year: string) => void;
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function MonthYearPicker({ month, year, onChange }: MonthYearPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const currentMonth = Number(month);
  const currentYear = Number(year);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevYear = () => onChange(month, String(currentYear - 1));
  const handleNextYear = () => onChange(month, String(currentYear + 1));
  
  const handleMonthSelect = (mIdx: number) => {
    onChange(String(mIdx + 1), year);
    setIsOpen(false);
  };

  const currentLabel = `${MONTHS[currentMonth - 1]} ${currentYear}`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="A-chip whitespace-nowrap"
      >
        <Calendar size={14} className="text-indigo-500" />
        <span>{currentLabel}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl z-[100] p-4 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevYear} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="font-bold text-gray-900 dark:text-white">{currentYear}</span>
            <button onClick={handleNextYear} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {MONTHS.map((m, i) => {
              const isSelected = currentMonth === i + 1;
              return (
                <button
                  key={m}
                  onClick={() => handleMonthSelect(i)}
                  className={cn(
                    "py-2 text-[11px] font-medium rounded-lg transition-all",
                    isSelected 
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none" 
                      : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  {m.substring(0, 3)}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800 flex justify-center">
            <button 
              onClick={() => {
                const now = new Date();
                onChange(String(now.getMonth() + 1), String(now.getFullYear()));
                setIsOpen(false);
              }}
              className="text-[10px] font-mono text-indigo-500 uppercase tracking-widest hover:underline"
            >
              Ir para hoje
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
