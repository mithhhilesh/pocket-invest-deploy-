
import React, { useState } from 'react';
import { X, CheckCircle, Wallet, Plus, AlertCircle, Landmark } from 'lucide-react';
import { api } from '../services/firebaseApi';
import { UserProfile, BankAccount } from '../types';

interface AddMoneyModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser: (u: UserProfile) => void;
}

export const AddMoneyModal: React.FC<AddMoneyModalProps> = ({ user, isOpen, onClose, onUpdateUser }) => {
  const [amount, setAmount] = useState<number>(10);
  const [selectedBankId, setSelectedBankId] = useState<string>(user.bankAccounts[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newBalance, setNewBalance] = useState<number | null>(null);

  if (!isOpen) return null;

  const selectedBank = user.bankAccounts.find(b => b.id === selectedBankId);

  const handleAddMoney = async () => {
    if (amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (!selectedBankId) {
      setError("Please select a bank account");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await api.addMoney(user.uid, amount, selectedBankId);
      if (result.success) {
        setNewBalance(result.newBalance!);
        setSuccess(true);
      const updatedUser = await api.getUser(user.uid);
        onUpdateUser(updatedUser);
      } else {
        setError(result.message || "Failed to add money");
      }
    } catch (e) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setSuccess(false);
    setAmount(10);
    setError(null);
    setNewBalance(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {!success ? (
          <>
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 flex items-center">
                <Plus className="mr-2 text-emerald-600" size={20} />
                Add Money
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Bank Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Bank Account</label>
                <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
                  {user.bankAccounts.map(bank => (
                    <button
                      key={bank.id}
                      onClick={() => setSelectedBankId(bank.id)}
                      className={`w-full flex items-center p-3 rounded-xl border transition-all text-left ${
                        selectedBankId === bank.id 
                        ? 'border-emerald-500 bg-emerald-50 shadow-sm' 
                        : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className={`p-2 rounded-lg mr-3 ${selectedBankId === bank.id ? 'bg-white text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                        <Landmark size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-slate-800">{bank.bankName}</div>
                        <div className="text-[10px] text-slate-500">{bank.accountNumber} • Balance: ₹{bank.balance.toLocaleString()}</div>
                      </div>
                      {selectedBankId === bank.id && <CheckCircle size={16} className="text-emerald-600" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">Quick Amounts</label>
                <div className="grid grid-cols-3 gap-2">
                  {[50, 100, 500].map(val => (
                    <button
                      key={val}
                      onClick={() => setAmount(val)}
                      className={`py-2 rounded-xl font-bold text-xs border ${
                        amount === val ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-100'
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Custom Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={amount === 0 ? '' : amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-8 pr-4 text-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none"
                    placeholder="0"
                  />
                </div>
              </div>

              {error && <div className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl flex items-center"><AlertCircle size={14} className="mr-2" /> {error}</div>}

              <button
                onClick={handleAddMoney}
                disabled={loading || amount <= 0 || (selectedBank && amount > selectedBank.balance)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-100 flex items-center justify-center transition-all"
              >
                {loading ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> : `Add ₹${amount.toLocaleString()}`}
              </button>
            </div>
          </>
        ) : (
          <div className="p-8 text-center space-y-6 animate-in slide-in-from-bottom-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2"><CheckCircle size={32} className="text-emerald-600" /></div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Success!</h2>
              <p className="text-slate-500 text-xs">₹{amount.toLocaleString()} moved to your wallet.</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">New Balance</div>
              <div className="text-2xl font-bold text-slate-900">₹{newBalance?.toLocaleString()}</div>
            </div>
            <button onClick={resetAndClose} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl">Awesome</button>
          </div>
        )}
      </div>
    </div>
  );
};
