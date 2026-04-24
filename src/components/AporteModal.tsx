import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { SavingsGoal } from '@/hooks/useSavings';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (goalId: string, amount: number) => Promise<boolean>;
  goal: SavingsGoal | null;
}

export default function AporteModal({ isOpen, onClose, onConfirm, goal }: Readonly<Props>) {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !goal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    
    setIsSubmitting(true);
    const success = await onConfirm(goal.id, Number(amount));
    setIsSubmitting(false);
    
    if (success) {
      setAmount('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-transparent dark:border-gray-800 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Fazer Aporte</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex flex-col items-center text-center">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
              style={{ backgroundColor: `${goal.color}15` }}
            >
              {goal.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{goal.name}</h3>
            <p className="text-sm text-gray-500">Quanto você deseja guardar hoje?</p>
          </div>

          <div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
              <input
                type="number"
                step="0.01"
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-2xl font-bold text-gray-900 dark:text-white rounded-2xl outline-none focus:border-blue-500 text-center"
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !amount}
              className="flex-1 py-3 px-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
