import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/mail';

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Clear existing tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // Save new token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: otp,
        expires,
      },
    });

    // Send email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Welcome to Adore Prints!</h2>
        <p style="font-size: 16px; color: #555;">Please use the following OTP to complete your registration. This OTP is valid for 10 minutes.</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <strong style="font-size: 24px; letter-spacing: 4px; color: #222;">${otp}</strong>
        </div>
        <p style="font-size: 14px; color: #888;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `;

    const result = await sendEmail({
      to: email,
      subject: 'Your Verification OTP - Adore Prints',
      html: emailHtml,
    });

    if (!result.success) {
      console.error('Failed to send email:', result.error);
      return NextResponse.json({ error: 'Failed to send OTP email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
