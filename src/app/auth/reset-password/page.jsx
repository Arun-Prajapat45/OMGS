'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import toast from 'react-hot-toast';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      toast.error('Invalid reset link');
      router.push('/auth/login');
    }
  }, [token, email, router]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    if (!token || !email) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password: data.password }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Failed to reset password');
      } else {
        toast.success('Password reset successfully!');
        router.push('/auth/login');
      }
    } catch {
      toast.error('Something went wrong');
    }
    setLoading(false);
  };

  if (!token || !email) return null;

  return (
    <div className="glass rounded-3xl p-8 shadow-premium border border-white/10">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl gradient-primary mx-auto flex items-center justify-center glow mb-4">
          <span className="text-white font-bold text-2xl">R</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-white">New Password</h1>
        <p className="text-white/50 text-sm mt-1">Enter your new secure password</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">New Password</label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 6 characters"
              className="w-full px-4 py-3 pr-12 glass rounded-xl text-white placeholder:text-white/30 border border-white/10 focus:border-primary-500 focus:outline-none text-sm"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
              {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">Confirm New Password</label>
          <input
            {...register('confirmPassword')}
            type="password"
            placeholder="Repeat new password"
            className="w-full px-4 py-3 glass rounded-xl text-white placeholder:text-white/30 border border-white/10 focus:border-primary-500 focus:outline-none text-sm"
          />
          {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl gradient-primary text-white font-bold hover:opacity-90 transition-all glow disabled:opacity-60"
        >
          {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Resetting...</span> : 'Reset Password'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/10 text-center">
        <Link href="/auth/login" className="text-sm text-white/50 hover:text-white transition-colors">
          Return to Login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 gradient-hero">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Suspense fallback={<div className="text-white text-center py-10">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
