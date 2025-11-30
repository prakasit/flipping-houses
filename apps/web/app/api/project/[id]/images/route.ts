import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@renovate-tracker/db';
import { authOptions } from '@/lib/auth';
import { put } from '@vercel/blob';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'before' or 'after'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!type || (type !== 'before' && type !== 'after')) {
      return NextResponse.json({ error: 'Invalid type. Must be "before" or "after"' }, { status: 400 });
    }

    // Verify project exists
    const project = await prisma.loanBudget.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Upload to Vercel Blob
    const blob = await put(`projects/${params.id}/${type}-${Date.now()}-${file.name}`, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN!,
    });

    // Create ProjectImage record
    const projectImage = await prisma.projectImage.create({
      data: {
        loanBudgetId: params.id,
        fileUrl: blob.url,
        type: type,
      },
      include: {
        loanBudget: {
          include: {
            withdraws: {
              include: {
                expenses: true,
              },
            },
            images: true,
          },
        },
      },
    });

    return NextResponse.json(projectImage.loanBudget);
  } catch (error: any) {
    console.error('Project image upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}

