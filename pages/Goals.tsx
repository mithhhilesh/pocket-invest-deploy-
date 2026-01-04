import React, { useEffect, useState } from 'react';
import { UserProfile, Goal, Expense } from '../types';
import * as api from "../services/firebaseApi";
import {
  Plus, Target, Calendar, TrendingUp, X,
  ShoppingBag, Coffee, Truck
} from 'lucide-react';
import { AddMoneyModal } from '../components/AddMoneyModal';

interface GoalsProps {
  user: UserProfile;
  onUpdateUser: (u: UserProfile) => void;
}

const Goals: React.FC<GoalsProps> = ({ user, onUpdateUser }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [showNudge, setShowNudge] = useState(false);
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);

  // Forms
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
    icon: '🎯'
  });

  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: 'Food' as Expense['category'],
    note: ''
  });

  useEffect(() => {
    loadData();
  }, [user.uid]);

  const loadData = async () => {
    const [g, e] = await Promise.all([
      api.getGoals(user.uid),
      api.getExpenses(user.uid)
    ]);
    setGoals(g);
    setExpenses(e);
    setLoading(false);
  };

  // ===================== GOALS =====================

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.deadline) return;

    const res = await api.addGoal(user.uid, {
      title: newGoal.name,
      targetAmount: Number(newGoal.targetAmount)
    });

    if (!res.success) {
      alert(res.message);
      return;
    }

    // Create local goal for UI
    const localGoal: Goal = {
      id: crypto.randomUUID(),
      name: newGoal.name,
      icon: newGoal.icon,
      targetAmount: Number(newGoal.targetAmount),
      currentAmount: 0,
      deadline: newGoal.deadline,
      status: "Active"
    };

    setGoals(prev => [...prev, localGoal]);
    setShowCreateGoal(false);
    setNewGoal({ name: '', targetAmount: '', deadline: '', icon: '🎯' });
  };

  // ===================== EXPENSES =====================

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.amount) return;

    const res = await api.addExpense(user.uid, {
      amount: Number(newExpense.amount),
      category: newExpense.category,
      date: new Date().toISOString(),
      note: newExpense.note
    });

    if (!res.success) {
      alert(res.message);
      return;
    }

    const localExpense: Expense = {
      id: crypto.randomUUID(),
      amount: Number(newExpense.amount),
      category: newExpense.category,
      date: new Date().toISOString(),
      note: newExpense.note
    };

    setExpenses(prev => [localExpense, ...prev]);
    setShowAddExpense(false);
    setNewExpense({ amount: '', category: 'Food', note: '' });

    setTimeout(() => setShowNudge(true), 500);
  };

  // ===================== INVEST =====================

  const handleInvestInGoal = async (amount: number) => {
    if (!activeGoal) return;

    const res = await api.investInGoal(user.uid, activeGoal.id, amount);

    if (!res.success) {
      alert(res.message);
      return;
    }

    setGoals(prev =>
      prev.map(g =>
        g.id === activeGoal.id
          ? { ...g, currentAmount: g.currentAmount + amount }
          : g
      )
    );

    setActiveGoal({
      ...activeGoal,
      currentAmount: activeGoal.currentAmount + amount
    });

    onUpdateUser({
      ...user,
      walletBalance: user.walletBalance - amount
    });
  };

  // ===================== HELPERS =====================

  const totalSpentToday = expenses
    .filter(e => new Date(e.date).toDateString() === new Date().toDateString())
    .reduce((acc, curr) => acc + curr.amount, 0);

  // ===================== UI =====================

  if (loading) {
    return <div className="p-4 text-center text-slate-500">Loading...</div>;
  }

  return (
    <div className="p-4 pb-24 max-w-md mx-auto min-h-screen">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">My Goals 🎯</h1>
          <p className="text-slate-500 text-sm">Turn dreams into reality.</p>
        </div>
        <button
          onClick={() => setShowCreateGoal(true)}
          className="bg-slate-900 text-white p-2 rounded-full"
        >
          <Plus size={22} />
        </button>
      </header>

      {/* Expense Summary */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border mb-6">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="text-xs text-slate-500 uppercase">Spent Today</div>
            <div className="text-2xl font-bold">₹{totalSpentToday}</div>
          </div>
          <button
            onClick={() => setShowAddExpense(true)}
            className="bg-rose-50 text-rose-600 px-4 py-2 rounded-lg text-xs font-bold"
          >
            + Add Expense
          </button>
        </div>
      </div>

      {/* Goals */}
      {goals.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-xl">
          <Target size={36} className="mx-auto text-slate-300 mb-2" />
          <p className="text-slate-500 text-sm">No goals yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map(goal => {
            const progress = Math.min(
              (goal.currentAmount / goal.targetAmount) * 100,
              100
            );

            return (
              <div
                key={goal.id}
                onClick={() => setActiveGoal(goal)}
                className="bg-white p-4 rounded-xl border cursor-pointer"
              >
                <div className="flex justify-between mb-2">
                  <div>
                    <h3 className="font-bold">{goal.name}</h3>
                    <p className="text-xs text-slate-500">
                      Target ₹{goal.targetAmount}
                    </p>
                  </div>
                  <div className="font-bold text-emerald-600">
                    ₹{goal.currentAmount}
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
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

export default Goals;
