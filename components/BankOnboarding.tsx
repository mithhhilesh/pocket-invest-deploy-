
import React, { useState } from 'react';
import { Landmark, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';
import { api } from '../services/firebaseApi';
import { UserProfile } from '../types';

interface BankOnboardingProps {
  user: UserProfile;
  onComplete: (updatedUser: UserProfile) => void;
}

export const BankOnboarding: React.FC<BankOnboardingProps> = ({ user, onComplete }) => {
  const [formData, setFormData] = useState({
    accountHolderName: user.name,
    accountNumber: '',
    bankName: '',
    branchName: '',
    accountType: 'Savings' as 'Savings' | 'Current'
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.addBankAccount(user.uid, formData);
      const updatedUser = await api.getUser(user.uid);
      onComplete(updatedUser);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-6 max-w-md mx-auto animate-in fade-in duration-500">
      <div className="mb-8 pt-6">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center font-bold text-sm">2/2</div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bank Setup</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Connect Your Bank</h1>
        <p className="text-slate-500 text-sm">Where should your profits go? Link a bank account to start your journey.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 space-y-5">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Account Holder Name</label>
            <input
              type="text"
              required
              value={formData.accountHolderName}
              onChange={e => setFormData({...formData, accountHolderName: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all"
              placeholder="e.g. John Doe"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Bank Name</label>
            <input
              type="text"
              required
              value={formData.bankName}
              onChange={e => setFormData({...formData, bankName: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all"
              placeholder="e.g. HDFC Bank"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Account Number</label>
              <input
                type="text"
                required
                value={formData.accountNumber}
                onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all"
                placeholder="1234 5678..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Branch Name</label>
              <input
                type="text"
                required
                value={formData.branchName}
                onChange={e => setFormData({...formData, branchName: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all"
                placeholder="e.g. Mumbai Main"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Account Type</label>
            <div className="grid grid-cols-2 gap-3">
              {['Savings', 'Current'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({...formData, accountType: type as any})}
                  className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                    formData.accountType === type 
                    ? 'bg-slate-900 text-white border-slate-900' 
                    : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start space-x-3">
          <ShieldCheck className="text-blue-600 shrink-0 mt-0.5" size={18} />
          <p className="text-xs text-blue-700 leading-relaxed font-medium">
            Your bank details are encrypted and secured. We only use this for authorized transactions initiated by you.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
          ) : (
            <>
              Confirm & Continue
              <ArrowRight size={20} className="ml-2" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
