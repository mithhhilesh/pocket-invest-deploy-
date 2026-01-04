import React, { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MicroLearn from './pages/MicroLearn';
import Profile from './pages/Profile';
import Invest from './pages/Invest';
import Goals from './pages/Goals';
import { BottomNav } from './components/BottomNav';
import { BankOnboarding } from './components/BankOnboarding';
import { UserProfile } from './types';
import { api } from './services/firebaseApi';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [needsBank, setNeedsBank] = useState(false);

  const handleLogin = (u: UserProfile) => {
    setUser(u);
    if (u.bankAccounts.length === 0) {
      setNeedsBank(true);
    } else {
      setCurrentTab('dashboard');
    }
  };

  const handleBankComplete = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    setNeedsBank(false);
    setCurrentTab('dashboard');
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setNeedsBank(false);
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (needsBank) {
    return <BankOnboarding user={user} onComplete={handleBankComplete} />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard user={user} onUpdateUser={handleUpdateUser} />;
      case 'invest':
        return <Invest user={user} onUpdateUser={handleUpdateUser} />;
      case 'learn':
        return <MicroLearn user={user} onUpdateUser={handleUpdateUser} />;
      case 'goals':
        return <Goals user={user} onUpdateUser={handleUpdateUser} />;
      case 'profile':
        return <Profile user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />;
      default:
        return <Dashboard user={user} onUpdateUser={handleUpdateUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <main className="max-w-md mx-auto bg-white min-h-screen shadow-2xl overflow-hidden relative">
        {renderContent()}
        <BottomNav activeTab={currentTab} onNavigate={setCurrentTab} />
      </main>
    </div>
  );
};

export default App;
