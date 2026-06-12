import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { email, token, password } = await req.json();

    if (!email || !token || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify token
    const verificationRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: token,
      },
    });

    if (!verificationRecord) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    if (new Date() > new Date(verificationRecord.expires)) {
      return NextResponse.json({ error: 'Reset link has expired' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);
    
    // Update password
    await prisma.user.update({
      where: { email },
      data: { password: hashed },
    });

    // Delete the token
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
