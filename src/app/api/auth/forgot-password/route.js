import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/mail';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return success even if user doesn't exist for security reasons (don't leak emails)
      return NextResponse.json({ success: true, message: 'If your email is registered, a reset link will be sent.' }, { status: 200 });
    }

    // Generate secure reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Clear existing tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // Save new token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: token,
        expires,
      },
    });

    const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    // Send email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
        <p style="font-size: 16px; color: #555;">We received a request to reset your password for your Adore Prints account. This link is valid for 10 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #f43f5e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Reset Password</a>
        </div>
        <p style="font-size: 14px; color: #888;">If you didn't request this, you can safely ignore this email. Your password will not be changed.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #aaa; text-align: center;">If the button doesn't work, copy and paste this link into your browser: <br/> ${resetLink}</p>
      </div>
    `;

    const result = await sendEmail({
      to: email,
      subject: 'Reset your password - Adore Prints',
      html: emailHtml,
    });

    if (!result.success) {
      console.error('Failed to send email:', result.error);
      return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Reset link sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
