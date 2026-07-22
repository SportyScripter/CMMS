import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Wrench, 
  Settings, 
  CalendarClock, 
  Package, 
  MessageSquare, 
  LogOut, IdCard
} from 'lucide-react';
import clsx from 'clsx';

const navigation = [
  { name: 'Pulpit', href: '/', icon: LayoutDashboard, allowedRoles: ['Super Admin', 'Kierownik','Technik','Operator','Mechanik','Elektryk'] },
  { name: 'Maszyny', href: '/machines', icon: Settings, allowedRoles: ['Super Admin', 'Kierownik','Technik','Operator','Mechanik','Elektryk'] },
  { name: 'Awarie', href: '/failures', icon: Wrench, allowedRoles: ['Super Admin', 'Kierownik','Technik','Operator','Mechanik','Elektryk'] },
  { name: 'Kalendarz Zleceń', href: '/calendar', icon: CalendarClock, allowedRoles: ['Super Admin', 'Kierownik','Technik','Operator','Mechanik','Elektryk'] },
  { name: 'Magazyn', href: '/inventory', icon: Package, allowedRoles: ['Super Admin', 'Kierownik','Technik','Operator','Mechanik','Elektryk'] },
  { name: 'Wiadomości', href: '/messages', icon: MessageSquare, allowedRoles: ['Super Admin', 'Kierownik','Technik','Operator','Mechanik','Elektryk'] },
  { name: 'Użytkownicy', href: '/users', icon: IdCard, allowedRoles: ['Super Admin','Kierownik','Administrator'] },
];

export const MainLayout = () => {
  const { user, logout} = useAuth();
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="h-16 flex items-center px-6 bg-slate-950">
          <Wrench className="w-8 h-8 text-blue-500 mr-3" />
          <span className="text-xl font-bold tracking-wider text-gray-100">CMMS<span className="text-blue-500">PRO</span></span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.filter(item => item.allowedRoles.includes(user?.role?.name || '')).map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm ">
              {user?.name?.[0]}{user?.lastname?.[0]}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.name} {user?.lastname}</p>
              <p className="text-xs text-slate-400 truncate">SAP: {user?.sap_number}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-400 rounded-lg hover:bg-slate-800 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Wyloguj się
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <main className="p-8">
          <Outlet /> {}
        </main>
      </div>
    </div>
  );
};