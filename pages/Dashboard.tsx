
import React, { useEffect, useState } from 'react';
import { UserProfile, Portfolio } from '../types';
import * as api from "../services/firebaseApi";
import {
  PortfolioGrowthChart,
  AssetAllocationChart,
} from '../components/Charts';
import { TrendingUp, Wallet, ShieldCheck } from 'lucide-react';
import { AddMoneyModal } from '../components/AddMoneyModal';


interface DashboardProps {
  user: UserProfile;
  onUpdateUser: (u: UserProfile) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onUpdateUser }) => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await api.getPortfolio(user.uid);
        setPortfolio(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user.uid]);

  // Use a stable return to prevent Error #310
  return (
    <div className="p-4 pb-24 space-y-6 max-w-md mx-auto min-h-screen">
      {loading || !portfolio ? (
        <div className="p-6 space-y-4 animate-pulse">
          <div className="h-24 bg-slate-200 rounded-xl"></div>
          <div className="h-48 bg-slate-200 rounded-xl"></div>
          <div className="h-48 bg-slate-200 rounded-xl"></div>
        </div>
      ) : (
        <>
          {/* Header */}
          <header>
            <h1 className="text-2xl font-bold text-slate-900">
              Hi, {user.name.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-500 text-sm">
              Let's grow your wealth today.
            </p>
          </header>

          {/* Main Stats Card */}
          <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200">
            <div className="flex items-center space-x-2 opacity-90 mb-1">
              <ShieldCheck size={16} />
              <span className="text-xs font-medium uppercase tracking-wide">
                Current Portfolio
              </span>
            </div>
            <div className="text-3xl font-bold">₹{(user?.walletBalance ?? 0).toLocaleString()}</div>
            <div className="flex items-center mt-2 space-x-2">
              <div className="bg-emerald-500/30 px-2 py-1 rounded-lg text-xs font-semibold flex items-center">
                <TrendingUp size={12} className="mr-1" />
                {portfolio.currentValue >= portfolio.totalInvested ? '+' : ''}₹{Math.abs(portfolio.currentValue - portfolio.totalInvested).toLocaleString()}
              </div>
              <span className="text-xs opacity-80">
                Total Invested: ₹{portfolio.totalInvested}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-emerald-500/50 flex justify-between items-center">
               <div className="flex items-center space-x-2">
                 <div className="bg-white/20 p-1.5 rounded-full">
                   <Wallet size={16} />
                 </div>
                 <div>
                   <div className="text-[10px] opacity-75">
                     Wallet Balance
                   </div>
                   <div className="text-sm font-bold">₹{(user?.walletBalance ?? 0).toLocaleString()}
</div>
                 </div>
               </div>
               <button 
                onClick={() => setIsAddMoneyOpen(true)}
                className="bg-white text-emerald-700 text-xs font-bold px-4 py-2 rounded-full shadow-sm active:scale-95 transition-transform"
               >
                 Add Money
               </button>
            </div>
          </div>

          {/* Growth Chart */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
              <TrendingUp size={16} className="text-emerald-500 mr-2" />
              Growth Simulation
            </h2>
            <PortfolioGrowthChart data={portfolio.history} />
            <p className="text-xs text-center text-slate-400 mt-2">
              Slow and steady wins the race. 🐢
            </p>
          </div>

          {/* Asset Allocation */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
             <h2 className="text-sm font-bold text-slate-800 mb-2">
               Where is your money?
             </h2>
             <div className="w-full h-64">
                <AssetAllocationChart assets={portfolio.assets} />
              </div>
          </div>

          {/* Encouragement */}
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
            <p className="text-indigo-800 text-sm font-medium">
              💡 <strong>Tip:</strong> You invested ₹20 more than last month. Great habit!
            </p>
          </div>
        </>
      )}

      <AddMoneyModal 
        isOpen={isAddMoneyOpen} 
        onClose={() => setIsAddMoneyOpen(false)} 
        user={user} 
        onUpdateUser={onUpdateUser}
      />
    </div>
  );
};

export default Dashboard;
