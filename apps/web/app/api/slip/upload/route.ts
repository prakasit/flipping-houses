import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@renovate-tracker/db';
import { authOptions } from '@/lib/auth';
import { put } from '@vercel/blob';
import { z } from 'zod';

const uploadSchema = z.object({
  expenseId: z.string(),
  filename: z.string(),
  contentType: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const expenseId = formData.get('expenseId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!expenseId) {
      return NextResponse.json({ error: 'No expense ID provided' }, { status: 400 });
    }

    // Verify expense exists
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Upload to Vercel Blob
    const blob = await put(`slips/${expenseId}/${Date.now()}-${file.name}`, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN!,
    });

    // Create slip record
    const slip = await prisma.expenseSlip.create({
      data: {
        expenseId,
        fileUrl: blob.url,
      },
    });

    return NextResponse.json(slip);
  } catch (error: any) {
    console.error('Slip upload error:', error);
    return NextResponse.json({ error: 'Failed to upload slip' }, { status: 500 });
  }
}

