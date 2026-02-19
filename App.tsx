import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ResidentList from './components/ResidentList';
import Documents from './components/Documents';
import Announcements from './components/Announcements';
import AIChat from './components/AIChat';
import Login from './components/Login';
import Finance from './components/Finance';
import { ViewState, Resident, DocumentRequest, Announcement, User, Transaction } from './types';
import { MOCK_RESIDENTS, MOCK_REQUESTS, MOCK_ANNOUNCEMENTS, MOCK_TRANSACTIONS } from './constants';
import { Menu } from 'lucide-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [residents, setResidents] = useState<Resident[]>(MOCK_RESIDENTS);
  const [requests, setRequests] = useState<DocumentRequest[]>(MOCK_REQUESTS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentView('DASHBOARD');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('DASHBOARD');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard residents={residents} requests={requests} />;
      case 'RESIDENTS':
        return <ResidentList residents={residents} setResidents={setResidents} user={user!} />;
      case 'DOCUMENTS':
        return <Documents requests={requests} setRequests={setRequests} />;
      case 'FINANCE':
        return <Finance transactions={transactions} setTransactions={setTransactions} user={user!} />;
      case 'ANNOUNCEMENTS':
        return <Announcements announcements={announcements} setAnnouncements={setAnnouncements} />;
      case 'AI_ASSISTANT':
        return <AIChat />;
      default:
        return <Dashboard residents={residents} requests={requests} />;
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        user={user}
        onLogout={handleLogout}
      />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between">
           <div className="font-bold text-lg text-slate-800">SiPintar</div>
           <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
             <Menu className="w-6 h-6" />
           </button>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
             {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;