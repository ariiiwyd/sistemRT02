import React from 'react';
import { LayoutDashboard, Users, Bell, LogOut, Wallet, Briefcase } from 'lucide-react';
import { ViewState, User } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, user, onLogout }) => {
  
  const navItems = [
    { id: 'DASHBOARD', label: 'Home', icon: LayoutDashboard },
    { id: 'SERVICES', label: 'Layanan', icon: Briefcase },
    { id: 'RESIDENTS', label: 'Warga', icon: Users },
    { id: 'FINANCE', label: 'Kas', icon: Wallet },
    { id: 'ANNOUNCEMENTS', label: 'Info', icon: Bell },
  ];

  return (
    <>
      {/* --- DESKTOP SIDEBAR (Hidden on Mobile) --- */}
      <div className="hidden lg:flex flex-col w-64 bg-slate-900 text-white h-screen sticky top-0">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
                <Users className="w-6 h-6 text-white" />
            </div>
            <div>
                <h1 className="text-xl font-bold tracking-tight">SiPintar</h1>
                <p className="text-xs text-slate-400">Sistem RT/RW Digital</p>
            </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as ViewState)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-3 mb-4 px-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-slate-900 ${user.role === 'ADMIN' ? 'bg-amber-400' : 'bg-emerald-400'}`}>
                    {user.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">{user.role === 'ADMIN' ? 'KETUA RT' : user.role}</p>
                </div>
            </div>
            <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm"
            >
                <LogOut className="w-4 h-4" />
                <span>Keluar</span>
            </button>
        </div>
      </div>

      {/* --- MOBILE BOTTOM NAVIGATION (Visible only on Mobile) --- */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 pb-safe pt-2 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as ViewState)}
                  className={`
                    flex flex-col items-center justify-center p-2 rounded-xl transition-all w-16
                    ${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}
                  `}
                >
                  <div className={`
                    p-1.5 rounded-full mb-1 transition-all
                    ${isActive ? 'bg-blue-50' : 'bg-transparent'}
                  `}>
                    <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              );
            })}
             <button
                onClick={onLogout}
                className="flex flex-col items-center justify-center p-2 rounded-xl text-red-400 hover:text-red-600 w-16"
            >
                <div className="p-1.5 rounded-full mb-1">
                    <LogOut className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-medium">Keluar</span>
            </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;