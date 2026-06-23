'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(null);
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmitStep1 = async (data) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Failed to send OTP');
      } else {
        setFormData(data);
        setStep(2);
        setResendTimer(30);
        toast.success('OTP sent to your email!');
      }
    } catch {
      toast.error('Something went wrong');
    }
    setLoading(false);
  };

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const resendOtp = async () => {
    if (!formData?.email || resendTimer > 0) return;
    setResendTimer(30);
    try {
      const res = await fetch('/api/auth/register/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      if (res.ok) {
        toast.success('New OTP sent!');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to resend OTP');
      }
    } catch {
      toast.error('Failed to resend OTP');
    }
  };

  const onSubmitStep2 = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) return toast.error('Enter valid 6-digit OTP');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, otp }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Registration failed');
      } else {
        toast.success('Account created! Please sign in.');
        router.push('/auth/login');
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
              <span className="text-white font-bold text-2xl">A</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-white">Create Account</h1>
            <p className="text-white/50 text-sm mt-1">Join AdorePrints today</p>
          </div>

          {step === 1 && (
            <>
              <form onSubmit={handleSubmit(onSubmitStep1)} className="space-y-4">
                {[
                  { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Your Name' },
                  { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
                ].map(({ name, label, type, placeholder }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">{label}</label>
                    <input
                      {...register(name)}
                      type={type}
                      placeholder={placeholder}
                      className="w-full px-4 py-3 glass rounded-xl text-white placeholder:text-white/30 border border-white/10 focus:border-primary-500 focus:outline-none text-sm transition-all"
                    />
                    {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name].message}</p>}
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Password</label>
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
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Confirm Password</label>
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    placeholder="Repeat password"
                    className="w-full px-4 py-3 glass rounded-xl text-white placeholder:text-white/30 border border-white/10 focus:border-primary-500 focus:outline-none text-sm"
                  />
                  {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl gradient-primary text-white font-bold hover:opacity-90 transition-all glow disabled:opacity-60"
                >
                  {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending OTP...</span> : 'Send Verification OTP'}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <motion.form initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={onSubmitStep2} className="space-y-4">
              <div className="text-center mb-6">
                <p className="text-white/70 text-sm">We've sent a 6-digit code to</p>
                <p className="text-white font-medium">{formData?.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Enter Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-4 glass rounded-xl text-white placeholder:text-white/30 border border-white/10 focus:border-primary-500 focus:outline-none text-center text-2xl font-bold tracking-[0.5em] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-3.5 rounded-xl gradient-primary text-white font-bold hover:opacity-90 transition-all glow disabled:opacity-60"
              >
                {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Verifying...</span> : 'Verify & Register'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-2 text-white/50 text-sm hover:text-white transition-colors"
              >
                Back to registration
              </button>

              <button
                type="button"
                onClick={resendOtp}
                disabled={resendTimer > 0}
                className="w-full py-2 text-primary-400 text-sm hover:text-primary-300 transition-colors disabled:text-white/30 disabled:cursor-not-allowed"
              >
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </motion.form>
          )}

          {step === 1 && (
            <p className="text-center text-sm text-white/50 mt-6">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign In</Link>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
