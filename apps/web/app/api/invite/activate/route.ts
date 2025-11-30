import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@renovate-tracker/db';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    // Find invite token
    const inviteToken = await prisma.inviteToken.findUnique({
      where: { token },
    });

    if (!inviteToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    if (inviteToken.used) {
      return NextResponse.json({ error: 'Token already used' }, { status: 400 });
    }

    if (inviteToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Token expired' }, { status: 400 });
    }

    // Activate user
    await prisma.user.update({
      where: { email: inviteToken.email },
      data: {
        status: 'ACTIVE',
        activatedAt: new Date(),
      },
    });

    // Mark token as used
    await prisma.inviteToken.update({
      where: { id: inviteToken.id },
      data: { used: true },
    });

    return NextResponse.json({ success: true, message: 'Account activated' });
  } catch (error) {
    console.error('Activate account error:', error);
    return NextResponse.json({ error: 'Failed to activate account' }, { status: 500 });
  }
}

