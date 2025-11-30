import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@renovate-tracker/db';
import { authOptions } from '@/lib/auth';
import { del } from '@vercel/blob';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMIN can delete images
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get image record
    const image = await prisma.projectImage.findUnique({
      where: { id: params.imageId },
      include: {
        loanBudget: true,
      },
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Verify it belongs to the project
    if (image.loanBudgetId !== params.id) {
      return NextResponse.json({ error: 'Image does not belong to this project' }, { status: 403 });
    }

    // Delete from Vercel Blob
    try {
      await del(image.fileUrl, {
        token: process.env.BLOB_READ_WRITE_TOKEN!,
      });
    } catch (blobError) {
      console.error('Failed to delete from blob:', blobError);
      // Continue to delete from database even if blob deletion fails
    }

    // Delete from database
    await prisma.projectImage.delete({
      where: { id: params.imageId },
    });

    // Return updated project
    const updatedProject = await prisma.loanBudget.findUnique({
      where: { id: params.id },
      include: {
        withdraws: {
          include: {
            expenses: true,
          },
        },
        images: true,
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error: any) {
    console.error('Image deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}

