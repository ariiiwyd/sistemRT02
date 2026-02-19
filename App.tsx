import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ResidentList from './components/ResidentList';
import Announcements from './components/Announcements';
import Login from './components/Login';
import Finance from './components/Finance';
import Services from './components/Services';
import { ViewState, Resident, Announcement, User, Transaction } from './types';
import { MOCK_USERS } from './constants';
import { db } from './services/db';

// Key untuk LocalStorage (Hanya untuk Users/Auth sementara)
const STORAGE_KEYS = {
  USERS: 'sipintar_users',
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  
  // --- STATE INITIALIZATION ---
  
  // 1. Users (Tetap di LocalStorage untuk Demo ini karena Auth kompleks)
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  // 2. Data from Database
  const [residents, setResidents] = useState<Resident[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // --- LOAD DATA FROM DB ---
  useEffect(() => {
    const loadData = async () => {
        const residentsData = await db.residents.getAll();
        setResidents(residentsData);

        const announcementsData = await db.announcements.getAll();
        setAnnouncements(announcementsData);

        const transactionsData = await db.transactions.getAll();
        setTransactions(transactionsData);
    };
    loadData();
  }, []); // Run once on mount

  // --- PERSISTENCE FOR USERS ONLY ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);


  // --- HANDLERS ---

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentView('DASHBOARD');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('DASHBOARD');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.username === updatedUser.username ? updatedUser : u));
  };

  const renderContent = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard residents={residents} />;
      case 'SERVICES':
        return <Services residents={residents} user={user!} />;
      case 'RESIDENTS':
        return <ResidentList residents={residents} setResidents={setResidents} user={user!} />;
      case 'FINANCE':
        return <Finance transactions={transactions} setTransactions={setTransactions} user={user!} />;
      case 'ANNOUNCEMENTS':
        return <Announcements announcements={announcements} setAnnouncements={setAnnouncements} />;
      default:
        return <Dashboard residents={residents} />;
    }
  };

  if (!user) {
    return (
      <Login 
        onLogin={handleLogin} 
        users={users} 
        onUpdateUser={handleUpdateUser} 
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        user={user}
        onLogout={handleLogout}
      />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Main Content Area */}
        {/* pb-24 added to ensure content is not hidden behind the mobile bottom nav */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto">
             {/* Mobile Header Title Only (No Menu Button) */}
             <div className="lg:hidden mb-6 flex items-center gap-2">
                 <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold">
                    Si
                 </div>
                 <h1 className="text-xl font-bold text-slate-800">SiPintar RT/RW</h1>
             </div>

             {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;