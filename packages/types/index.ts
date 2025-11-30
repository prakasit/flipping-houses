export type { User, UserRole, UserStatus } from '@renovate-tracker/db';
export type {
  LoanBudget,
  WithdrawRequest,
  WithdrawStatus,
  Expense,
  ExpenseCategory,
  ExpenseSlip,
  InviteToken,
} from '@renovate-tracker/db';

export type { BudgetSummary, WithdrawSummary } from '@renovate-tracker/utils';

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

