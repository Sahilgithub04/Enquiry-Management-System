import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Zap, Mail, Lock, ArrowRight, Info, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Valid email address is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    try {
      await login(data.email, data.password);
      addToast('success', 'Login successful', 'Welcome back to CloudBlitz CRM!');
      navigate('/dashboard');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Invalid email or password';
      setAuthError(msg);
      addToast('error', 'Login Failed', msg);
    }
  };

  const fillDefaultAdmin = () => {
    setValue('email', 'admin@cloudblitz.com');
    setValue('password', 'Admin@123');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow graphics */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 items-center justify-center shadow-lg shadow-cyan-500/30 mb-2">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">CloudBlitz CRM</h1>
          <p className="text-sm text-slate-400">Sign in to your CRM dashboard</p>
        </div>

        {/* Auth Error Banner */}
        {authError && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3 text-xs text-rose-300 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Development Seed Credentials Banner */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3 text-xs text-slate-300 flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-cyan-300">Default Admin Credentials</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                admin@cloudblitz.com | Admin@123
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={fillDefaultAdmin}
            className="text-[11px] font-semibold text-cyan-400 hover:underline shrink-0"
          >
            Auto Fill
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
            </label>
            <input
              {...register('email')}
              placeholder="admin@cloudblitz.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" /> Password
            </label>
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              'Signing in...'
            ) : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Don't have an account?{' '}
          <Link to="/register" className="text-cyan-400 hover:underline font-semibold">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
