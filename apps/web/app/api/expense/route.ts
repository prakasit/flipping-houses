import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@renovate-tracker/db';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    
    // Parse form data
    const withdrawId = formData.get('withdrawId') as string;
    const amount = parseInt(formData.get('amount') as string);
    const description = formData.get('description') as string;
    const spentDate = formData.get('spentDate') as string;
    const files = formData.getAll('files') as File[];

    // Validate required fields
    if (!withdrawId || !amount || !description || !spentDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify withdraw exists and is approved
    const withdraw = await prisma.withdrawRequest.findUnique({
      where: { id: withdrawId },
    });

    if (!withdraw) {
      return NextResponse.json({ error: 'Withdraw request not found' }, { status: 404 });
    }

    if (withdraw.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Cannot add expenses to non-approved withdraw' },
        { status: 400 }
      );
    }

    // Create expense
    const expense = await prisma.expense.create({
      data: {
        withdrawId,
        amount,
        description,
        spentDate: new Date(spentDate),
      },
    });

    // Upload files if any
    if (files && files.length > 0) {
      const uploadPromises = files.map(async (file) => {
        if (file.size === 0) return null;
        
        const blob = await put(`expenses/${expense.id}/${Date.now()}-${file.name}`, file, {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN!,
        });

        return prisma.expenseSlip.create({
          data: {
            expenseId: expense.id,
            fileUrl: blob.url,
          },
        });
      });

      await Promise.all(uploadPromises.filter(p => p !== null));
    }

    // Return expense with slips
    const expenseWithSlips = await prisma.expense.findUnique({
      where: { id: expense.id },
      include: {
        withdraw: {
          include: {
            loanBudget: true,
          },
        },
        slips: true,
      },
    });

    return NextResponse.json(expenseWithSlips);
  } catch (error: any) {
    console.error('Expense creation error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const expenses = await prisma.expense.findMany({
      include: {
        withdraw: {
          include: {
            loanBudget: true,
          },
        },
        slips: true,
      },
      orderBy: {
        spentDate: 'desc',
      },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Expense fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

