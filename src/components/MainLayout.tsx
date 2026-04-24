import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

export function MainLayout() {
  return (
    <div className="A-shell">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Outlet />
        <div className="lg:hidden">
          <BottomNavigation />
        </div>
      </div>
    </div>
  );
}
