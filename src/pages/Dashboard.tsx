import { useAuth } from '@/context/AuthContext';
import { LogOut, Plus, Wallet } from 'lucide-react';
import TransactionList from '@/components/TransactionList';
import TransactionForm from '@/components/TransactionForm';
import { useState } from 'react';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Trick to force list re-render
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <nav className="max-w-7xl mx-auto flex justify-between items-center bg-white p-4 rounded-xl shadow-sm mb-8 border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900">Controle de Gastos</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nova Transação
          </button>
          <span className="text-gray-500 text-sm hidden sm:block">
            {user?.email}
          </span>
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-sm text-red-600 font-medium hover:bg-red-50 py-2 px-4 rounded-lg transition-colors border border-transparent hover:border-red-100"
          >
            Sair
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 lg:px-0">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mt-10">
          <TransactionList key={refreshKey} />
        </div>
      </main>

      {/* Renderização Condicional do Modal */}
      <TransactionForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => setRefreshKey(prev => prev + 1)} 
      />
    </div>
  );
}
