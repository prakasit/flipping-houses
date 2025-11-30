import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@renovate-tracker/db';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const budgetUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  totalBudget: z.number().int().positive().optional(),
  purchasePrice: z.number().int().positive().optional(),
  expectedSellingPrice: z.number().int().positive().optional().nullable(),
  actualSellingPrice: z.number().int().positive().optional().nullable(),
  bankClosingBalance: z.number().int().optional().nullable(),
  startDate: z.string().optional().nullable().refine(
    (val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val),
    { message: 'Invalid date format. Expected YYYY-MM-DD' }
  ),
  endDate: z.string().optional().nullable().refine(
    (val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val),
    { message: 'Invalid date format. Expected YYYY-MM-DD' }
  ),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMIN can update projects
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const data = budgetUpdateSchema.parse(body);

    // Build update data
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.totalBudget !== undefined) updateData.totalBudget = data.totalBudget;
    if (data.purchasePrice !== undefined) updateData.purchasePrice = data.purchasePrice;
    if (data.expectedSellingPrice !== undefined) {
      updateData.expectedSellingPrice = data.expectedSellingPrice ?? null;
    }
    if (data.actualSellingPrice !== undefined) {
      updateData.actualSellingPrice = data.actualSellingPrice ?? null;
    }
    if (data.bankClosingBalance !== undefined) {
      updateData.bankClosingBalance = data.bankClosingBalance ?? null;
    }
    if (data.startDate !== undefined) {
      updateData.startDate = data.startDate ? new Date(data.startDate + 'T00:00:00.000Z') : null;
    }
    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate ? new Date(data.endDate + 'T00:00:00.000Z') : null;
    }

    const budget = await prisma.loanBudget.update({
      where: { id: params.id },
      data: updateData,
      include: {
        withdraws: {
          include: {
            expenses: true,
          },
        },
        images: true,
      },
    });

    return NextResponse.json(budget);
  } catch (error: any) {
    console.error('Budget update error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMIN can delete projects
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if project exists
    const project = await prisma.loanBudget.findUnique({
      where: { id: params.id },
      include: {
        withdraws: true,
        images: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Delete project (cascade will delete related withdraws, expenses, images)
    await prisma.loanBudget.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Project deleted' });
  } catch (error: any) {
    console.error('Project deletion error:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}

