import React, { useEffect, useState } from 'react';
import { InvestmentOption, UserProfile } from '../types';
import * as api from "../services/firebaseApi";
import {
  ShieldCheck,
  Info,
  X,
  ChevronRight,
  Calculator
} from 'lucide-react';
import { AddMoneyModal } from '../components/AddMoneyModal';

interface InvestProps {
  user: UserProfile;
  onUpdateUser: (u: UserProfile) => void;
}

const Invest: React.FC<InvestProps> = ({ user, onUpdateUser }) => {
  const [options, setOptions] = useState<InvestmentOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<InvestmentOption | null>(null);
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);

  // Calculator state
  const [investAmount, setInvestAmount] = useState<number>(500);
  const [durationMonths, setDurationMonths] = useState<number>(12);
  const [processing, setProcessing] = useState(false);
  const [notification, setNotification] = useState<{
    msg: string;
    type: 'success' | 'error';
  } | null>(null);

  useEffect(() => {
    api.getInvestmentOptions().then(setOptions);
  }, []);

  // ===================== CALCULATOR =====================

  const calculateReturns = () => {
    if (!selectedOption) {
      return { totalInvested: 0, estimatedReturn: 0 };
    }

    const years = durationMonths / 12;
    const rate = selectedOption.interestRate / 100;

    let totalInvested = 0;
    let maturityValue = 0;

    if (selectedOption.type === 'Lumpsum') {
      totalInvested = investAmount;
      maturityValue = investAmount * Math.pow(1 + rate, years);
    } else {
      totalInvested = investAmount * durationMonths;
      const monthlyRate = rate / 12;
      maturityValue =
        investAmount *
        ((Math.pow(1 + monthlyRate, durationMonths) - 1) / monthlyRate) *
        (1 + monthlyRate);
    }

    return {
      totalInvested: Math.round(totalInvested),
      estimatedReturn: Math.round(maturityValue)
    };
  };

  // ===================== INVEST =====================

  const handleInvest = async () => {
    if (!selectedOption) return;

    if (user.walletBalance < investAmount) {
      setNotification({
        msg: "Insufficient wallet balance",
        type: "error"
      });
      return;
    }

    setProcessing(true);
    setNotification(null);

    const result = await api.investMoney(
      user.uid,
      investAmount,
      selectedOption.id
    );

    if (!result.success) {
      setNotification({
        msg: result.message,
        type: "error"
      });
      setProcessing(false);
      return;
    }

    const updatedUser = await api.getUser(user.uid);
    if (updatedUser) {
      onUpdateUser(updatedUser);
    }

    setNotification({
      msg: result.message,
      type: "success"
    });

    setTimeout(() => {
      setSelectedOption(null);
      setNotification(null);
    }, 2000);

    setProcessing(false);
  };

  const projection = calculateReturns();

  // ===================== UI =====================

  return (
    <div className="p-4 pb-24 max-w-md mx-auto min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Start Investing 🚀</h1>
        <p className="text-slate-500 text-sm">
          Choose a safe path to grow your money.
        </p>

        <div className="mt-4 bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex justify-between items-center">
          <div>
            <div className="text-xs text-slate-500 uppercase">
              Available Balance
            </div>
            <div className="text-lg font-bold">
              ₹{user.walletBalance.toLocaleString()}
            </div>
          </div>

          <button
            onClick={() => setIsAddMoneyOpen(true)}
            className="bg-white text-emerald-600 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-100"
          >
            Add Money
          </button>
        </div>
      </header>

      <div className="space-y-4">
        {options.map(option => (
          <div
            key={option.id}
            onClick={() => {
              setSelectedOption(option);
              setInvestAmount(option.minAmount);
              setDurationMonths(12);
              setNotification(null);
            }}
            className="bg-white p-4 rounded-xl border shadow-sm cursor-pointer active:scale-[0.99]"
          >
            <div className="flex justify-between mb-2">
              <div>
                <h3 className="font-bold text-lg">{option.title}</h3>
                <p className="text-xs text-slate-500">{option.shortDesc}</p>
              </div>
              <div className="text-right">
                <span className="text-emerald-600 font-bold text-sm">
                  ~{option.interestRate}%
                </span>
                {option.isGovtBacked && (
                  <div className="text-[10px] mt-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded inline-flex items-center">
                    <ShieldCheck size={10} className="mr-1" /> Govt Backed
                  </div>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>
                Risk: {option.risk} • Min ₹{option.minAmount}
              </span>
              <span className="flex items-center text-emerald-500 font-semibold">
                Explore <ChevronRight size={14} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selectedOption && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="font-bold text-lg">{selectedOption.title}</h2>
                <p className="text-xs text-slate-500">
                  {selectedOption.type === 'Lumpsum'
                    ? 'One-time Investment'
                    : 'Monthly Investment'}
                </p>
              </div>
              <button onClick={() => setSelectedOption(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-6">
              <div className="bg-indigo-50 p-4 rounded-xl border">
                <h3 className="flex items-center text-sm font-bold mb-2">
                  <Info size={16} className="mr-2" /> What is it?
                </h3>
                <p className="text-sm">{selectedOption.fullDesc}</p>
              </div>

              <div className="border-t pt-4">
                <h3 className="flex items-center font-bold mb-3">
                  <Calculator size={16} className="mr-2" /> Return Calculator
                </h3>

                <input
                  type="range"
                  min={selectedOption.minAmount}
                  max={10000}
                  step={100}
                  value={investAmount}
                  onChange={e => setInvestAmount(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />

                <div className="flex justify-between text-xs mt-1">
                  <span>₹{selectedOption.minAmount}</span>
                  <span>₹10,000</span>
                </div>

                <div className="grid grid-cols-4 gap-2 mt-3">
                  {[6, 12, 36, 60].map(m => (
                    <button
                      key={m}
                      onClick={() => setDurationMonths(m)}
                      className={`py-2 rounded-lg text-xs font-bold ${
                        durationMonths === m
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100'
                      }`}
                    >
                      {m < 12 ? `${m}M` : `${m / 12}Y`}
                    </button>
                  ))}
                </div>

                <div className="bg-emerald-50 p-4 rounded-xl mt-4">
                  <div className="flex justify-between text-sm">
                    <span>Total Invested</span>
                    <strong>₹{projection.totalInvested}</strong>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Estimated Value</span>
                    <strong className="text-emerald-600">
                      ₹{projection.estimatedReturn}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t">
              {notification && (
                <div
                  className={`text-center text-xs font-bold p-2 mb-3 rounded ${
                    notification.type === 'success'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {notification.msg}
                </div>
              )}

              <button
                disabled={processing}
                onClick={handleInvest}
                className="w-full bg-emerald-600 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl"
              >
                {processing
                  ? 'Processing...'
                  : `Invest ₹${investAmount} Now`}
              </button>
            </div>
          </div>
        </div>
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

export default Invest;
