import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@renovate-tracker/db';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const budgetSchema = z.object({
  title: z.string().min(1),
  totalBudget: z.number().int().positive(),
  purchasePrice: z.number().int().positive(),
  expectedSellingPrice: z.number().int().positive().optional(),
  actualSellingPrice: z.number().int().positive().optional(),
  bankClosingBalance: z.number().int().optional(),
  startDate: z.string().optional().refine(
    (val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val),
    { message: 'Invalid date format. Expected YYYY-MM-DD' }
  ),
  endDate: z.string().optional().refine(
    (val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val),
    { message: 'Invalid date format. Expected YYYY-MM-DD' }
  ),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = budgetSchema.parse(body);

    const budget = await prisma.loanBudget.create({
      data: {
        title: data.title,
        totalBudget: data.totalBudget,
        purchasePrice: data.purchasePrice,
        expectedSellingPrice: data.expectedSellingPrice || null,
        actualSellingPrice: data.actualSellingPrice || null,
        bankClosingBalance: data.bankClosingBalance || null,
        startDate: data.startDate ? new Date(data.startDate + 'T00:00:00.000Z') : null,
        endDate: data.endDate ? new Date(data.endDate + 'T00:00:00.000Z') : null,
      },
    });

    return NextResponse.json(budget);
  } catch (error: any) {
    console.error('Budget creation error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const budgets = await prisma.loanBudget.findMany({
      include: {
        withdraws: {
          include: {
            expenses: true,
          },
        },
        images: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(budgets);
  } catch (error) {
    console.error('Budget fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 });
  }
}

