import React, { useState, useEffect } from 'react';
import { UserProfile, Transaction, InvestmentCategory, FAQItem, BankAccount } from '../types';
import * as api from "../services/firebaseApi";
import { User, LogOut, Shield, ChevronRight, Clock, ArrowLeft, History, Landmark, Copy, CheckCircle, HelpCircle, ChevronDown, ChevronUp, Wallet, ArrowUpRight, ArrowDownLeft, Plus, CreditCard, X } from 'lucide-react';
import { AddMoneyModal } from '../components/AddMoneyModal';
import { WithdrawMoneyModal } from '../components/WithdrawMoneyModal';

interface ProfileProps {
  user: UserProfile;
  onLogout: () => void;
  onUpdateUser: (u: UserProfile) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout, onUpdateUser }) => {
  const [updating, setUpdating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showWalletManage, setShowWalletManage] = useState(false);
  const [showAddBank, setShowAddBank] = useState(false);
  
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'All' | InvestmentCategory>('All');
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  // Add Bank Form State
  const [newBank, setNewBank] = useState({
    accountHolderName: user.name,
    accountNumber: '',
    bankName: '',
    branchName: '',
    accountType: 'Savings' as 'Savings' | 'Current'
  });

  useEffect(() => {
    if (showHistory) api.getTransactions(user.uid).then(setTransactions);
  }, [showHistory, user.uid]);

  useEffect(() => {
    if (showFAQ && faqs.length === 0) api.getFAQs().then(setFaqs);
  }, [showFAQ]);

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    await api.addBankAccount(user.uid, newBank);
    const updatedUser = await api.getUser(user.uid);
    onUpdateUser(updatedUser);
    setShowAddBank(false);
    setUpdating(false);
    setNewBank({ ...newBank, accountNumber: '', bankName: '', branchName: '' });
  };

  const handleRiskChange = async (level: UserProfile['riskLevel']) => {
    setUpdating(true);
    await api.updateRiskProfile(user.uid, level);
    onUpdateUser({ ...user, riskLevel: level });
    setUpdating(false);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const filteredTransactions = activeTab === 'All' 
    ? transactions 
    : transactions.filter(t => t.category === activeTab);

  // Define conditional sub-views for stable hook count
  const renderSubView = () => {
    if (showBankDetails) {
      return (
        <div className="flex flex-col animate-in slide-in-from-right duration-300">
          <div className="bg-white p-4 shadow-sm border-b border-slate-100 sticky top-0 z-10 flex items-center">
              <button onClick={() => setShowBankDetails(false)} className="p-2 mr-2 -ml-2 rounded-full hover:bg-slate-100">
                  <ArrowLeft size={20} className="text-slate-600" />
              </button>
              <h1 className="text-lg font-bold text-slate-900">Bank Accounts</h1>
              <button onClick={() => setShowAddBank(true)} className="ml-auto bg-emerald-50 text-emerald-600 p-2 rounded-lg">
                  <Plus size={20} />
              </button>
          </div>
          <div className="p-4 space-y-4">
              {user.bankAccounts.map((bank, index) => (
                <div key={bank.id} className={`rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-transform active:scale-[0.98] ${
                  index % 2 === 0 ? 'bg-gradient-to-br from-indigo-600 to-indigo-800' : 'bg-gradient-to-br from-slate-700 to-slate-900'
                }`}>
                  <div className="absolute top-[-10px] right-[-10px] w-24 h-24 rounded-full bg-white/10"></div>
                  <div className="flex justify-between items-start mb-6">
                       <div className="flex items-center space-x-2">
                          <div className="bg-white/20 p-2 rounded-lg"><Landmark size={18} /></div>
                          <span className="font-bold text-sm tracking-wide">{bank.bankName}</span>
                       </div>
                       {bank.isPrimary && <span className="bg-emerald-500/30 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border border-emerald-400/30">Primary</span>}
                  </div>
                  <div className="mb-6">
                      <div className="text-[10px] opacity-60 mb-1 uppercase tracking-wider">Account Number</div>
                      <div className="text-lg font-mono tracking-widest">{bank.accountNumber}</div>
                  </div>
                  <div className="flex justify-between items-end">
                      <div>
                          <div className="text-[10px] opacity-60 mb-0.5 uppercase tracking-wider">Balance</div>
                          <div className="text-xl font-bold">₹{bank.balance.toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                           <div className="text-[10px] opacity-60 mb-0.5 uppercase tracking-wider">Type</div>
                           <div className="font-semibold text-xs">{bank.accountType}</div>
                      </div>
                  </div>
                </div>
              ))}
          </div>
          {showAddBank && (
            <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
              <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 animate-in slide-in-from-bottom-10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Add New Bank</h2>
                  <button onClick={() => setShowAddBank(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
                </div>
                <form onSubmit={handleAddBank} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bank Name</label>
                    <input required value={newBank.bankName} onChange={e => setNewBank({...newBank, bankName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-200 outline-none" placeholder="e.g. ICICI Bank" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Account No.</label>
                      <input required value={newBank.accountNumber} onChange={e => setNewBank({...newBank, accountNumber: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-200 outline-none" placeholder="•••• 1234" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Branch</label>
                      <input required value={newBank.branchName} onChange={e => setNewBank({...newBank, branchName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-200 outline-none" placeholder="City Center" />
                    </div>
                  </div>
                  <button disabled={updating} type="submit" className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all">
                    {updating ? 'Processing...' : 'Link Account'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      );
    }
    if (showWalletManage) {
      return (
        <div className="flex flex-col animate-in slide-in-from-right duration-300">
          <div className="bg-white p-4 shadow-sm border-b border-slate-100 sticky top-0 z-10 flex items-center">
              <button onClick={() => setShowWalletManage(false)} className="p-2 mr-2 -ml-2 rounded-full hover:bg-slate-100">
                  <ArrowLeft size={20} className="text-slate-600" />
              </button>
              <h1 className="text-lg font-bold text-slate-900">Manage Wallet</h1>
          </div>
          <div className="p-4 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Pocket Wallet Balance</div>
                  <div className="text-4xl font-bold text-slate-900 mb-4">₹{user.walletBalance.toLocaleString()}</div>
                  <div className="flex items-center justify-center space-x-2 text-xs text-emerald-600 font-semibold bg-emerald-50 py-2 px-4 rounded-full mx-auto w-fit">
                      <CheckCircle size={14} />
                      <span>Safe & Secure</span>
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setIsAddMoneyOpen(true)} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all flex flex-col items-center group">
                      <div className="bg-emerald-50 text-emerald-600 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform"><ArrowUpRight size={24} /></div>
                      <span className="font-bold text-slate-800">Add Money</span>
                  </button>
                  <button onClick={() => setIsWithdrawOpen(true)} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all flex flex-col items-center group">
                      <div className="bg-indigo-50 text-indigo-600 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform"><ArrowDownLeft size={24} /></div>
                      <span className="font-bold text-slate-800">Withdraw</span>
                  </button>
              </div>
          </div>
        </div>
      );
    }
    if (showHistory) {
      return (
        <div className="flex flex-col animate-in slide-in-from-right duration-300">
          <div className="bg-white p-4 shadow-sm border-b border-slate-100 sticky top-0 z-10">
            <div className="flex items-center">
              <button onClick={() => setShowHistory(false)} className="p-2 mr-2 -ml-2 rounded-full hover:bg-slate-100">
                <ArrowLeft size={20} className="text-slate-600" />
              </button>
              <h1 className="text-lg font-bold text-slate-900">History</h1>
            </div>
            <div className="flex space-x-2 mt-4 overflow-x-auto no-scrollbar pb-1">
               {(['All', 'MF', 'SIP', 'FD', 'RD', 'Govt'] as const).map(tab => (
                 <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                   {tab}
                 </button>
               ))}
            </div>
          </div>
          <div className="p-4 space-y-3 pb-24">
            {filteredTransactions.map(tx => (
                <div key={tx.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        tx.type === 'Deposit' ? 'bg-emerald-50 text-emerald-600' :
                        tx.type === 'Withdrawal' ? 'bg-red-50 text-red-600' :
                        'bg-indigo-50 text-indigo-600'
                      }`}>
                        {tx.type}
                      </span>
                      <span className="text-[10px] text-slate-400">{formatDate(tx.date)}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 line-clamp-1">{tx.assetName}</h3>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${tx.type === 'Deposit' ? 'text-emerald-600' : tx.type === 'Withdrawal' ? 'text-red-600' : 'text-slate-900'}`}>
                      {tx.type === 'Deposit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                    </div>
                  </div>
                </div>
            ))}
          </div>
        </div>
      );
    }
    if (showFAQ) {
      return (
        <div className="flex flex-col animate-in slide-in-from-right duration-300">
          <div className="bg-white p-4 shadow-sm border-b border-slate-100 sticky top-0 z-10 flex items-center">
              <button onClick={() => setShowFAQ(false)} className="p-2 mr-2 -ml-2 rounded-full hover:bg-slate-100">
                  <ArrowLeft size={20} className="text-slate-600" />
              </button>
              <h1 className="text-lg font-bold text-slate-900">Common Questions</h1>
          </div>
          <div className="p-4 space-y-3 pb-24">
              {faqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div key={faq.id} className={`bg-white rounded-xl border overflow-hidden transition-all ${isOpen ? 'border-indigo-200 shadow-sm' : 'border-slate-100'}`}>
                    <button onClick={() => setOpenFaqId(isOpen ? null : faq.id)} className="w-full px-5 py-4 flex justify-between items-center text-left">
                      <span className={`font-semibold text-sm ${isOpen ? 'text-indigo-900' : 'text-slate-700'}`}>{faq.question}</span>
                      {isOpen ? <ChevronUp size={20} className="text-indigo-500" /> : <ChevronDown size={20} className="text-slate-400" />}
                    </button>
                    {isOpen && <div className="px-5 pb-5 pt-0 text-slate-600 text-sm bg-indigo-50/20">{faq.answer}</div>}
                  </div>
                );
              })}
              <div className="mt-6 text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-sm text-slate-500 mb-2">Still have questions?</p>
                <button className="text-indigo-600 font-bold text-sm hover:underline flex items-center justify-center">
                  Chat with our guide <ChevronRight size={14} className="ml-1"/>
                </button>
              </div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 pb-24 max-w-md mx-auto min-h-screen">
        <header className="mb-8 text-center pt-8">
          <div className="w-20 h-20 bg-emerald-100 rounded-full mx-auto flex items-center justify-center mb-4 border-4 border-white shadow-lg">
            <User size={40} className="text-emerald-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
          <p className="text-slate-500 text-sm">{user.email}</p>
        </header>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-emerald-50 p-2 rounded-xl mr-3"><Wallet className="text-emerald-600" size={20} /></div>
              <div>
                  <div className="text-xs text-slate-500 font-medium uppercase">Wallet</div>
                  <div className="text-2xl font-bold text-slate-900">₹{user.walletBalance.toLocaleString()}</div>
              </div>
            </div>
            <button onClick={() => setShowWalletManage(true)} className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md shadow-emerald-100">Manage</button>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center mb-4">
              <Shield className="text-slate-400 mr-2" size={20} />
              <h2 className="text-base font-bold text-slate-800">Risk Profile</h2>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['Low', 'Medium', 'High'] as const).map((level) => (
                <button key={level} onClick={() => handleRiskChange(level)} className={`py-2 px-1 rounded-lg text-sm font-medium border transition-all ${user.riskLevel === level ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border-slate-200'}`}>
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div onClick={() => setShowHistory(true)} className="p-4 border-b border-slate-100 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="flex items-center text-slate-700 font-medium"><Clock size={18} className="mr-3 text-slate-400" />Transactions</div>
              <ChevronRight size={16} className="text-slate-300" />
            </div>
            <div onClick={() => setShowBankDetails(true)} className="p-4 border-b border-slate-100 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="flex items-center text-slate-700 font-medium"><CreditCard size={18} className="mr-3 text-slate-400" />Bank Accounts</div>
              <div className="flex items-center text-xs text-emerald-600 font-bold">
                  {user.bankAccounts.length} Linked <ChevronRight size={16} className="ml-1 text-slate-300" />
              </div>
            </div>
            <div onClick={() => setShowFAQ(true)} className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="flex items-center text-slate-700 font-medium"><HelpCircle size={18} className="mr-3 text-slate-400" />Common Questions</div>
              <ChevronRight size={16} className="text-slate-300" />
            </div>
          </div>

          <button onClick={onLogout} className="w-full py-4 text-red-500 font-semibold text-sm hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center">
            <LogOut size={18} className="mr-2" />
            Log Out
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderSubView()}
      <AddMoneyModal isOpen={isAddMoneyOpen} onClose={() => setIsAddMoneyOpen(false)} user={user} onUpdateUser={onUpdateUser} />
      <WithdrawMoneyModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} user={user} onUpdateUser={onUpdateUser} />
    </>
  );
};

export default Profile;