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

    // Only ADMIN can create withdraw requests
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await req.formData();
    
    // Parse form data
    const loanBudgetId = formData.get('loanBudgetId') as string;
    const amount = parseInt(formData.get('amount') as string);
    const description = formData.get('description') as string;
    const requiresExpense = formData.get('requiresExpense') === 'true';
    const files = formData.getAll('files') as File[];

    // Validate required fields
    if (!loanBudgetId || !amount || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify budget exists
    const budget = await prisma.loanBudget.findUnique({
      where: { id: loanBudgetId },
    });

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    // If doesn't require expense tracking, auto-approve
    const status = requiresExpense === false ? 'APPROVED' : 'PENDING';
    const approvedAt = requiresExpense === false ? new Date() : null;

    // Create withdraw request
    const withdraw = await prisma.withdrawRequest.create({
      data: {
        loanBudgetId,
        amount,
        description,
        requiresExpense: requiresExpense ?? true,
        status: status,
        approvedAt: approvedAt,
      },
    });

    // Upload files if any
    if (files && files.length > 0) {
      const uploadPromises = files.map(async (file) => {
        if (file.size === 0) return null;
        
        const blob = await put(`withdraws/${withdraw.id}/${Date.now()}-${file.name}`, file, {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN!,
        });

        return prisma.withdrawSlip.create({
          data: {
            withdrawId: withdraw.id,
            fileUrl: blob.url,
          },
        });
      });

      await Promise.all(uploadPromises.filter(p => p !== null));
    }

    // Return withdraw with slips
    const withdrawWithSlips = await prisma.withdrawRequest.findUnique({
      where: { id: withdraw.id },
      include: {
        loanBudget: true,
        slips: true,
        expenses: {
          include: {
            slips: true,
          },
        },
      },
    });

    return NextResponse.json(withdrawWithSlips);
  } catch (error: any) {
    console.error('Withdraw creation error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create withdraw request' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const withdraws = await prisma.withdrawRequest.findMany({
      include: {
        loanBudget: true,
        expenses: {
          include: {
            slips: true,
          },
        },
        slips: true,
      },
      orderBy: {
        requestedAt: 'desc',
      },
    });

    return NextResponse.json(withdraws);
  } catch (error) {
    console.error('Withdraw fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch withdraws' }, { status: 500 });
  }
}

