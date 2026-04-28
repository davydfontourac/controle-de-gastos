import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/cn';
import {
  LayoutDashboard,
  Receipt,
  Tags,
  PiggyBank,
  BarChart3,
  Target,
  Sparkles,
  UserCircle,
  LogOut,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

const SB_ITEMS = [
  {
    group: 'Geral',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        ic: <LayoutDashboard size={16} />,
        path: '/dashboard',
      },
      { id: 'transactions', label: 'Transações', ic: <Receipt size={16} />, path: '/transactions' },
      { id: 'categories', label: 'Categorias', ic: <Tags size={16} />, path: '/categories' },
      { id: 'savings', label: 'Caixinhas', ic: <PiggyBank size={16} />, path: '/savings' },
    ],
  },
  {
    group: 'Análises',
    items: [
      { id: 'reports', label: 'Relatórios', ic: <BarChart3 size={16} />, path: '/reports' },
      { id: 'goals', label: 'Metas', ic: <Target size={16} />, path: '/goals' },
      { id: 'insights', label: 'Insights', ic: <Sparkles size={16} />, path: '/insights' },
    ],
  },
  {
    group: 'Conta',
    items: [{ id: 'profile', label: 'Perfil', ic: <UserCircle size={16} />, path: '/profile' }],
  },
];

export function Sidebar() {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();

  return (
    <aside className="A-sb hidden lg:flex">
      <div className="A-sb-brand">
        <img src="/logo-expense-tracker.png" alt="Logo" className="rounded-lg" />
        <b className="text-gray-900 dark:text-white">Expense Tracker</b>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {SB_ITEMS.map((g) => (
          <div key={g.group} className="mb-6">
            <div className="A-sb-sect">{g.group}</div>
            {g.items.map((it) => {
              const isActive = location.pathname === it.path;
              return (
                <Link key={it.id} to={it.path} className={cn('A-sb-item', isActive && 'active')}>
                  <span className="ic">{it.ic}</span>
                  <span className="lbl">{it.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
            Aparência
          </div>
          <ThemeToggle dropdownPosition="top" />
        </div>

        <div className="A-sb-user">
          <div className="av overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              profile?.full_name?.charAt(0).toUpperCase() ||
              user?.email?.charAt(0).toUpperCase() ||
              'U'
            )}
          </div>
          <div className="info">
            <div className="n text-gray-900 dark:text-white truncate">
              {profile?.full_name || 'Usuário'}
            </div>
            <div className="e text-gray-500 dark:text-gray-400 truncate">{user?.email}</div>
          </div>
          <button
            onClick={() => signOut()}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors ml-auto"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
