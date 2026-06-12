'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Failed to send reset link');
      } else {
        toast.success('Reset link sent to your email!');
        setIsSent(true);
      }
    } catch {
      toast.error('Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 gradient-hero">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="glass rounded-3xl p-8 shadow-premium border border-white/10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl gradient-primary mx-auto flex items-center justify-center glow mb-4">
              <span className="text-white font-bold text-2xl">?</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-white">Reset Password</h1>
            <p className="text-white/50 text-sm mt-1">Enter your email to receive a reset link</p>
          </div>

          {!isSent ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Email Address</label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 glass rounded-xl text-white placeholder:text-white/30 border border-white/10 focus:border-primary-500 focus:outline-none text-sm transition-all"
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl gradient-primary text-white font-bold hover:opacity-90 transition-all glow disabled:opacity-60"
              >
                {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending...</span> : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-white font-medium mb-1">Check your inbox</p>
                <p className="text-white/50 text-sm">We've sent a password reset link to your email address.</p>
              </div>
              <button
                onClick={() => setIsSent(false)}
                className="text-primary-400 hover:text-primary-300 text-sm transition-colors"
              >
                Try a different email
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <Link href="/auth/login" className="text-sm text-white/50 hover:text-white transition-colors">
              Return to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
