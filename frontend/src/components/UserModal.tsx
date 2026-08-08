import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, UserRole } from '../types';
import { X, UserPlus, Shield } from 'lucide-react';

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email address is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'MANAGER', 'AGENT']),
});

const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email address is required'),
  password: z.string().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'AGENT']),
});

type UserFormData = z.infer<typeof createUserSchema>;

interface UserModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  user?: User | null;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  mode,
  user,
  onClose,
  onSubmit,
}) => {
  const schema = mode === 'create' ? createUserSchema : updateUserSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'AGENT',
    },
  });

  useEffect(() => {
    if (user && mode === 'edit') {
      reset({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
      });
    } else {
      reset({
        name: '',
        email: '',
        password: '',
        role: 'AGENT',
      });
    }
  }, [user, mode, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-cyan-400" />
            {mode === 'create' ? 'Create New User' : 'Edit User Profile'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input
              {...register('name')}
              placeholder="e.g. Sarah Connor"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-400">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              {...register('email')}
              placeholder="sarah@cloudblitz.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password {mode === 'edit' && '(Leave blank to keep unchanged)'}
            </label>
            <input
              type="password"
              {...register('password')}
              placeholder={mode === 'edit' ? '••••••••' : 'Min 6 characters'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-slate-400" /> User Role
            </label>
            <select
              {...register('role')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="AGENT">AGENT</option>
              <option value="MANAGER">MANAGER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create User' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
