import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@renovate-tracker/db';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const inviteSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { email } = inviteSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Create user
    await prisma.user.create({
      data: {
        email,
        status: 'PENDING',
        invitedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, message: 'User invited successfully' });
  } catch (error: any) {
    console.error('Invite error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to send invite' }, { status: 500 });
  }
}

