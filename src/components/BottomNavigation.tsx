import { Home, Tag, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/utils/cn';

export default function BottomNavigation() {
  const location = useLocation();

  const navItems = [
    {
      label: 'Home',
      icon: Home,
      path: '/dashboard'
    },
    {
      label: 'Categorias',
      icon: Tag,
      path: '/categories'
    },
    {
      label: 'Perfil',
      icon: User,
      path: '/profile'
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe z-50 transition-colors">
      <div className="flex justify-around items-center h-16 px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                isActive 
                  ? "text-blue-600 dark:text-blue-500" 
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              )}
            >
              {/* Highlight bar for active item */}
              <div 
                className={cn(
                  "absolute top-0 w-8 h-1 rounded-b-full transition-all duration-300",
                  isActive ? "bg-blue-600 dark:bg-blue-500 scale-x-100" : "bg-transparent scale-x-0"
                )} 
              />
              
              <item.icon className={cn("w-5 h-5", isActive && "fill-current/20")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
