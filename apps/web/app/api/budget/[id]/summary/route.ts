import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@renovate-tracker/db';
import { authOptions } from '@/lib/auth';
import { calculateBudgetSummary } from '@renovate-tracker/utils';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const budget = await prisma.loanBudget.findUnique({
      where: { id: params.id },
      include: {
        withdraws: {
          include: {
            expenses: {
              include: {
                slips: true,
              },
            },
          },
        },
      },
    });

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    const summary = calculateBudgetSummary(budget);

    // Map to match frontend expectations
    return NextResponse.json({
      ...summary,
      remaining: summary.remainingBudget,
    });
  } catch (error) {
    console.error('Budget summary error:', error);
    return NextResponse.json({ error: 'Failed to fetch budget summary' }, { status: 500 });
  }
}

