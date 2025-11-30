import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@renovate-tracker/db';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const statusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { status } = statusSchema.parse(body);

    const updateData: any = {
      status,
    };

    if (status === 'APPROVED') {
      updateData.approvedAt = new Date();
    }

    const withdraw = await prisma.withdrawRequest.update({
      where: { id: params.id },
      data: updateData,
      include: {
        loanBudget: true,
        expenses: {
          include: {
            slips: true,
          },
        },
        slips: true,
      },
    });

    return NextResponse.json(withdraw);
  } catch (error: any) {
    console.error('Withdraw status update error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update withdraw status' }, { status: 500 });
  }
}

