import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@renovate-tracker/db';
import { authOptions } from '@/lib/auth';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const withdrawId = formData.get('withdrawId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!withdrawId) {
      return NextResponse.json({ error: 'No withdraw ID provided' }, { status: 400 });
    }

    // Verify withdraw exists
    const withdraw = await prisma.withdrawRequest.findUnique({
      where: { id: withdrawId },
    });

    if (!withdraw) {
      return NextResponse.json({ error: 'Withdraw request not found' }, { status: 404 });
    }

    // Upload to Vercel Blob
    const blob = await put(`withdraw-slips/${withdrawId}/${Date.now()}-${file.name}`, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN!,
    });

    // Create slip record
    const slip = await prisma.withdrawSlip.create({
      data: {
        withdrawId,
        fileUrl: blob.url,
      },
    });

    return NextResponse.json(slip);
  } catch (error: any) {
    console.error('Withdraw slip upload error:', error);
    return NextResponse.json({ error: 'Failed to upload slip' }, { status: 500 });
  }
}

