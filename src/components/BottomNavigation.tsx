import { LayoutDashboard, Receipt, Plus, Tags, UserCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { useState } from 'react';
import TransactionForm from './TransactionForm';

export default function BottomNavigation() {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navItems = [
    {
      label: 'Início',
      icon: LayoutDashboard,
      path: '/dashboard',
    },
    {
      label: 'Transaç',
      icon: Receipt,
      path: '/transactions',
    },
    {
      label: 'Novo',
      icon: Plus,
      path: '#',
      isAction: true,
    },
    {
      label: 'Categ',
      icon: Tags,
      path: '/categories',
    },
    {
      label: 'Conta',
      icon: UserCircle,
      path: '/profile',
    },
  ];

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 w-full bg-white/80 dark:bg-[#0c0c1d]/80 backdrop-blur-xl border-t border-gray-100 dark:border-white/5 pb-safe z-50">
        <div className="flex justify-around items-center h-20 px-2 relative">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            if (item.isAction) {
              return (
                <button
                  key="action"
                  onClick={() => setIsModalOpen(true)}
                  className="flex flex-col items-center justify-center -mt-8"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/40 active:scale-90 transition-transform">
                    <Plus size={28} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-tighter">Novo</span>
                </button>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full gap-1.5 transition-all relative',
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-400'
                )}
              >
                {isActive && (
                  <div className="absolute top-0 w-8 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-b-full shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                )}
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className={cn("text-[9px] font-bold uppercase tracking-tighter", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <TransactionForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => window.location.reload()} 
      />
    </>
  );
}
