import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@renovate-tracker/db';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMIN can delete withdraws
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if withdraw exists
    const withdraw = await prisma.withdrawRequest.findUnique({
      where: { id: params.id },
      include: {
        slips: true,
        expenses: {
          include: {
            slips: true,
          },
        },
      },
    });

    if (!withdraw) {
      return NextResponse.json({ error: 'Withdraw not found' }, { status: 404 });
    }

    // Delete withdraw (cascade will delete related expenses and slips)
    await prisma.withdrawRequest.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Withdraw deleted' });
  } catch (error: any) {
    console.error('Withdraw deletion error:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Withdraw not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete withdraw' }, { status: 500 });
  }
}



