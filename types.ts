// ================= USER =================
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  walletBalance: number;
  bankAccounts: BankAccount[];
  riskLevel: 'Low' | 'Medium' | 'High';
  joinedAt: number; // Timestamp
  completedLessonIds: string[];
}

// ================= BANK =================
export interface BankAccount {
  id: string;
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  branchName: string;
  accountType: 'Savings' | 'Current';
  balance: number;
  isPrimary: boolean;
}

// ================= ASSET =================
export interface Asset {
  type: string;
  amount: number;
  color: string;
}

// ================= GOALS =================
export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // ISO Date
  icon: string;
  status: 'Active' | 'Completed' | 'Paused';
}

// ================= EXPENSE =================
export interface Expense {
  id: string;
  amount: number;
  category: 'Food' | 'Travel' | 'Shopping' | 'Bills' | 'Other';
  date: string;
  note?: string;
}

// ================= INVESTMENT =================
export type InvestmentCategory =
  | 'FD'
  | 'RD'
  | 'MF'
  | 'SIP'
  | 'Govt'
  | 'Gold';

export interface InvestmentOption {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  howItWorks: string;
  type: 'Lumpsum' | 'SIP' | 'Recurring';
  category: InvestmentCategory;
  interestRate: number;
  minAmount: number;
  risk: 'Low' | 'Medium' | 'High';
  isGovtBacked: boolean;
  lockInPeriod?: string;
}

// ================= TRANSACTION =================
export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'Investment' | 'Deposit' | 'Withdrawal';
  assetName: string;
  category: InvestmentCategory;
  status: 'Success' | 'Pending' | 'Failed';
  bankAccountId?: string;
}

// ================= PORTFOLIO =================
export interface Portfolio {
  goals: Goal[];
  transactions: Transaction[];
  bankAccounts: BankAccount[];
}

// ================= LEARNING =================
export interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: string;
  category: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}
