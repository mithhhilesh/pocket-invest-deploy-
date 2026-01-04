// ===================== FIREBASE =====================
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";

import {
  ref,
  set,
  get,
  push,
  update
} from "firebase/database";

// ⚠️ MUST match firebaseConfig.ts exports
import { auth, rtdb } from "./firebaseConfig";

import {
  UserProfile,
  BankAccount,
  Goal,
  Expense,
  Transaction,
  Portfolio
} from "../types";


// ===================== HELPERS =====================

const emptyUserProfile = (
  uid: string,
  name = "",
  email = ""
): UserProfile => ({
  uid,
  name,
  email,
  walletBalance: 0,
  riskLevel: "Low",
  joinedAt: Date.now(),
  completedLessonIds: [],
  bankAccounts: [] // ✅ REQUIRED BY TYPE
});

// ===================== AUTH =====================

export const login = async (
  email: string,
  pass: string
): Promise<UserProfile> => {
  const res = await signInWithEmailAndPassword(auth, email, pass);
  const uid = res.user.uid;

  const snap = await get(ref(rtdb, `users/${uid}/profile`));

  if (!snap.exists()) {
    return emptyUserProfile(uid, "", email);
  }

  return {
    ...emptyUserProfile(uid),
    ...snap.val()
  };
};

export const signup = async (
  name: string,
  email: string,
  pass: string
): Promise<UserProfile> => {
  const res = await createUserWithEmailAndPassword(auth, email, pass);
  const uid = res.user.uid;

  const user = emptyUserProfile(uid, name, email);

  await set(ref(rtdb, `users/${uid}/profile`), user);
  return user;
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
};

// ===================== USER =====================

export const getUser = async (uid: string): Promise<UserProfile> => {
  const snap = await get(ref(rtdb, `users/${uid}/profile`));
  if (!snap.exists()) return emptyUserProfile(uid);
  return { ...emptyUserProfile(uid), ...snap.val() };
};

export const updateRiskProfile = async (
  uid: string,
  riskLevel: "Low" | "Medium" | "High"
) => {
  await update(ref(rtdb, `users/${uid}/profile`), { riskLevel });
};

// ===================== BANK =====================

export const addBankAccount = async (
  uid: string,
  bank: Omit<BankAccount, "id" | "balance" | "isPrimary">
): Promise<BankAccount> => {
  const bankRef = push(ref(rtdb, `users/${uid}/bankAccounts`));

  const bankData: BankAccount = {
    id: bankRef.key as string,
    ...bank,
    balance: 0,
    isPrimary: false
  };

  await set(bankRef, bankData);
  return bankData;
};

// ===================== WALLET =====================

export const investMoney = async (
  uid: string,
  amount: number,
  optionId: string
): Promise<{ success: boolean; message: string }> => {
  const profileRef = ref(rtdb, `users/${uid}/profile`);
  const snap = await get(profileRef);

  if (!snap.exists()) {
    return { success: false, message: "Profile not found" };
  }

  const balance = snap.val().walletBalance ?? 0;

  if (balance < amount) {
    return { success: false, message: "Insufficient wallet balance" };
  }

  // Deduct wallet balance
  await update(profileRef, {
    walletBalance: balance - amount
  });

  // Record transaction
  const txRef = push(ref(rtdb, `users/${uid}/transactions`));
  await set(txRef, {
    id: txRef.key,
    amount,
    type: "Investment",
    optionId,
    status: "Success",
    date: Date.now()
  });

  return {
    success: true,
    message: `Successfully invested ₹${amount}`
  };
};


// ===================== GOALS =====================

export const getGoals = async (uid: string): Promise<any[]> => {
  const snap = await get(ref(rtdb, `users/${uid}/goals`));
  return snap.exists() ? Object.values(snap.val()) : [];
};

export const addGoal = async (
  uid: string,
  goal: { title: string; targetAmount: number }
): Promise<{ success: boolean; message: string }> => {
  const goalRef = push(ref(rtdb, `users/${uid}/goals`));

  const goalData = {
    id: goalRef.key,
    ...goal,
    currentAmount: 0,
    status: "Active"
  };

  await set(goalRef, goalData);

  return {
    success: true,
    message: "Goal created successfully"
  };
};


export const investInGoal = async (
  uid: string,
  goalId: string,
  amount: number
): Promise<{ success: boolean; message: string }> => {
  const goalRef = ref(rtdb, `users/${uid}/goals/${goalId}`);
  const snap = await get(goalRef);

  if (!snap.exists()) {
    return { success: false, message: "Goal not found" };
  }

  const current = snap.val().currentAmount ?? 0;

  await update(goalRef, {
    currentAmount: current + amount
  });

  return {
    success: true,
    message: `₹${amount} invested successfully`
  };
};

// ===================== EXPENSES =====================

export const getExpenses = async (uid: string) => {
  const snap = await get(ref(rtdb, `users/${uid}/expenses`));
  return snap.exists() ? Object.values(snap.val()) : [];
};

export const addExpense = async (
  uid: string,
  expense: {
    amount: number;
    category: string;
    date: string;
    note?: string;
  }
): Promise<{ success: boolean; message: string }> => {
  const refExp = push(ref(rtdb, `users/${uid}/expenses`));

  await set(refExp, {
    id: refExp.key,
    ...expense
  });

  return {
    success: true,
    message: "Expense added successfully"
  };
};


// ===================== TRANSACTIONS =====================

export const getTransactions = async (uid: string) => {
  const snap = await get(ref(rtdb, `users/${uid}/transactions`));
  return snap.exists() ? Object.values(snap.val()) : [];
};

// ===================== LEARNING =====================

export const markLessonComplete = async (
  uid: string,
  lessonId: string
) => {
  await update(ref(rtdb, `users/${uid}/profile`), {
    completedLessonIds: [lessonId]
  });
};

// ===================== INVEST OPTIONS =====================

export const getInvestmentOptions = async () => {
  const snap = await get(ref(rtdb, "investmentOptions"));
  return snap.exists() ? Object.values(snap.val()) : [];
};

// ===================== FAQ / LESSONS =====================

export const getLessons = async () => {
  const snap = await get(ref(rtdb, "lessons"));
  return snap.exists() ? Object.values(snap.val()) : [];
};

export const getFAQs = async () => {
  const snap = await get(ref(rtdb, "faqs"));
  return snap.exists() ? Object.values(snap.val()) : [];
};
// === last piece === //
export const getPortfolio = async (uid: string): Promise<Portfolio> => {
  const [goalsSnap, txSnap, banksSnap] = await Promise.all([
    get(ref(rtdb, `users/${uid}/goals`)),
    get(ref(rtdb, `users/${uid}/transactions`)),
    get(ref(rtdb, `users/${uid}/bankAccounts`))
  ]);

  return {
    goals: goalsSnap.exists() ? Object.values(goalsSnap.val()) : [],
    transactions: txSnap.exists() ? Object.values(txSnap.val()) : [],
    bankAccounts: banksSnap.exists() ? Object.values(banksSnap.val()) : []
  };
};
export const addMoney = async (
  uid: string,
  amount: number,
  bankAccountId: string
): Promise<{ success: boolean; message: string; newBalance: number }> => {
  if (amount <= 0) {
    return {
      success: false,
      message: "Amount must be greater than zero",
      newBalance: 0
    };
  }

  const profileRef = ref(rtdb, `users/${uid}/profile`);
  const profileSnap = await get(profileRef);

  if (!profileSnap.exists()) {
    return {
      success: false,
      message: "User profile not found",
      newBalance: 0
    };
  }

  const currentBalance: number = profileSnap.val().walletBalance ?? 0;
  const newBalance = currentBalance + amount;

  // 1️⃣ Update wallet
  await update(profileRef, {
    walletBalance: newBalance
  });

  // 2️⃣ Record transaction
  const txRef = push(ref(rtdb, `users/${uid}/transactions`));
  await set(txRef, {
    id: txRef.key,
    amount,
    type: "Deposit",
    status: "Success",
    date: new Date().toISOString(),
    bankAccountId
  });

  return {
    success: true,
    message: `${amount} added to wallet`,
    newBalance
  };
};

export const withdrawMoney = async (
  uid: string,
  amount: number,
  bankAccountId: string
): Promise<{ success: boolean; message: string; newBalance?: number }> => {
  if (amount <= 0) {
    return { success: false, message: "Amount must be greater than zero" };
  }

  const profileRef = ref(rtdb, `users/${uid}`);
  const profileSnap = await get(profileRef);

  if (!profileSnap.exists()) {
    return { success: false, message: "User profile not found" };
  }

  const currentBalance = profileSnap.val().walletBalance ?? 0;

  if (currentBalance < amount) {
    return { success: false, message: "Insufficient wallet balance" };
  }

  const newBalance = currentBalance - amount;

  // 1️⃣ Update wallet balance
  await update(profileRef, {
    walletBalance: newBalance
  });

  // 2️⃣ Record transaction
  const txRef = push(ref(rtdb, `users/${uid}/transactions`));
  await set(txRef, {
    id: txRef.key,
    amount,
    type: "Withdrawal",
    status: "Success",
    date: new Date().toISOString(),
    bankAccountId
  });

  return {
    success: true,
    message: `${amount} withdrawn from wallet`,
    newBalance
  };
};



export const api = {
  // auth
  login,
  signup,
  logout,

  // user
  getUser,
  updateRiskProfile,

  // bank
  addBankAccount,
  addMoney,
  withdrawMoney,

  // goals
  getGoals,
  addGoal,

  // expenses
  addExpense,
  getExpenses,

  // investments
  investMoney,
  getInvestmentOptions,

  // portfolio
  getPortfolio,

  // learning
  getLessons,
  getFAQs,
  markLessonComplete,
};
