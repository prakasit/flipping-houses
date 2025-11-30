import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@renovate-tracker/db';
import { authOptions } from '@/lib/auth';
import type { LoanBudget, WithdrawRequest, Expense } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const budgets = await prisma.loanBudget.findMany({
      include: {
        withdraws: {
          // Include all withdraws regardless of status
          include: {
            expenses: true,
          },
        },
      },
    });

    const allWithdraws = await prisma.withdrawRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        loanBudget: true,
      },
      take: 5,
      orderBy: {
        requestedAt: 'desc',
      },
    });

    type BudgetWithRelations = LoanBudget & {
      withdraws: Array<
        WithdrawRequest & {
          expenses: Expense[];
        }
      >;
    };

    const totalBudgets = budgets.length;
    const totalWithdrawn = budgets.reduce(
      (sum: number, budget: BudgetWithRelations) =>
        sum + budget.withdraws.reduce((wSum: number, w) => wSum + w.amount, 0),
      0
    );
    const totalExpenses = budgets.reduce(
      (sum: number, budget: BudgetWithRelations) =>
        sum +
        budget.withdraws.reduce(
          (wSum: number, w) => wSum + w.expenses.reduce((eSum: number, e) => eSum + e.amount, 0),
          0
        ),
      0
    );
    const totalBudget = budgets.reduce((sum: number, budget: BudgetWithRelations) => sum + budget.totalBudget, 0);
    // Remaining = Budget - Withdraw (not Budget - Expenses)
    const remaining = totalBudget - totalWithdrawn;

    const recentBudgets = budgets.slice(0, 5).map((budget: BudgetWithRelations) => ({
      id: budget.id,
      title: budget.title,
      totalBudget: budget.totalBudget,
    }));

    return NextResponse.json({
      totalBudgets,
      totalWithdrawn,
      totalExpenses,
      remaining,
      recentBudgets,
      pendingWithdraws: allWithdraws,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

