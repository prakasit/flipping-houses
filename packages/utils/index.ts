import type { LoanBudget, WithdrawRequest, Expense } from '@renovate-tracker/db';

export type BudgetSummary = {
  id: string;
  title: string;
  totalBudget: number;
  totalWithdrawn: number;
  totalExpenses: number;
  remainingBudget: number;
  withdrawCount: number;
  expenseCount: number;
};

export type WithdrawSummary = {
  id: string;
  amount: number;
  totalExpenses: number;
  difference: number;
  status: 'NEED_SLIP' | 'OK' | 'OVERSPENT';
  withdrawRequest: WithdrawRequest;
  expenses: Expense[];
};

export function currencyFormat(amount: number, currency = 'THB'): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number to currency string without currency symbol (for input display)
 * Example: 1500000 -> "1,500,000"
 */
export function formatCurrencyInput(value: number | string): string {
  if (!value && value !== 0) return '';
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Parse currency formatted string to number
 * Example: "1,500,000" -> 1500000
 */
export function parseCurrencyInput(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function dateFormat(date: Date | string, format: 'short' | 'long' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (format === 'long') {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj);
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
}

export function calculateWithdrawSummary(
  withdraw: WithdrawRequest & { expenses: Expense[] }
): WithdrawSummary {
  const totalExpenses = withdraw.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const difference = withdraw.amount - totalExpenses;

  let status: 'NEED_SLIP' | 'OK' | 'OVERSPENT';
  
  // If withdraw doesn't require expense tracking, don't show NEED_SLIP
  if (!withdraw.requiresExpense) {
    // For withdraws that don't require expense, always show OK
    status = 'OK';
  } else if (difference > 0) {
    status = 'NEED_SLIP';
  } else if (difference === 0) {
    status = 'OK';
  } else {
    status = 'OVERSPENT';
  }

  return {
    id: withdraw.id,
    amount: withdraw.amount,
    totalExpenses,
    difference,
    status,
    withdrawRequest: withdraw,
    expenses: withdraw.expenses,
  };
}

export function calculateBudgetSummary(
  budget: LoanBudget & {
    withdraws: Array<WithdrawRequest & { expenses: Expense[] }>;
  }
): BudgetSummary {
  // Include all withdraws regardless of status
  const allWithdraws = budget.withdraws;
  const totalWithdrawn = allWithdraws.reduce((sum, w) => sum + w.amount, 0);
  // Include expenses from all withdraws
  const allExpenses = allWithdraws.flatMap((w) => w.expenses);
  const totalExpenses = allExpenses.reduce((sum, e) => sum + e.amount, 0);
  // Remaining = Budget - Withdraw (not Budget - Expenses)
  const remainingBudget = budget.totalBudget - totalWithdrawn;

  return {
    id: budget.id,
    title: budget.title,
    totalBudget: budget.totalBudget,
    totalWithdrawn,
    totalExpenses,
    remainingBudget,
    withdrawCount: allWithdraws.length,
    expenseCount: allExpenses.length,
  };
}

export function getDeviceInfo(): { isMobile: boolean; isTablet: boolean; isDesktop: boolean } {
  if (typeof window === 'undefined') {
    return { isMobile: false, isTablet: false, isDesktop: true };
  }

  const width = window.innerWidth;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  return { isMobile, isTablet, isDesktop };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

