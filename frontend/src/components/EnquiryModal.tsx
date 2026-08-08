import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Enquiry, User, EnquiryStatus } from '../types';
import { useAuth } from '../hooks/useAuth';
import { X, UserCheck, Mail, Phone, MessageSquare, Tag } from 'lucide-react';

const enquirySchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  email: z.string().email('Valid email address is required'),
  phone: z.string().min(1, 'Phone number is required'),
  message: z.string().min(1, 'Message is required'),
  status: z.enum(['NEW', 'IN_PROGRESS', 'CLOSED']),
  assignedTo: z.string().nullable().optional(),
});

type EnquiryFormData = z.infer<typeof enquirySchema>;

interface EnquiryModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'view';
  enquiry?: Enquiry | null;
  staffList: User[];
  onClose: () => void;
  onSubmit: (data: EnquiryFormData) => Promise<void>;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  isOpen,
  mode,
  enquiry,
  staffList,
  onClose,
  onSubmit,
}) => {
  const { isManagerOrAdmin, user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryFormData>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      customerName: '',
      email: '',
      phone: '',
      message: '',
      status: 'NEW',
      assignedTo: null,
    },
  });

  useEffect(() => {
    if (enquiry && (mode === 'edit' || mode === 'view')) {
      reset({
        customerName: enquiry.customerName,
        email: enquiry.email,
        phone: enquiry.phone,
        message: enquiry.message,
        status: enquiry.status,
        assignedTo: enquiry.assignedTo ? enquiry.assignedTo.id : null,
      });
    } else {
      reset({
        customerName: '',
        email: '',
        phone: '',
        message: '',
        status: 'NEW',
        assignedTo: null,
      });
    }
  }, [enquiry, mode, reset]);

  if (!isOpen) return null;

  const isViewOnly = mode === 'view';
  const isAgent = user?.role === 'AGENT';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Tag className="w-5 h-5 text-cyan-400" />
            {mode === 'create' && 'New Enquiry'}
            {mode === 'edit' && 'Edit Enquiry'}
            {mode === 'view' && 'Enquiry Details'}
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
            <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Name</label>
            <div className="relative">
              <input
                {...register('customerName')}
                disabled={isViewOnly}
                placeholder="e.g. John Smith"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-60"
              />
            </div>
            {errors.customerName && (
              <p className="mt-1 text-xs text-rose-400">{errors.customerName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email
              </label>
              <input
                {...register('email')}
                disabled={isViewOnly}
                placeholder="john@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-60"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone
              </label>
              <input
                {...register('phone')}
                disabled={isViewOnly}
                placeholder="+1 555 0199"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-60"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-rose-400">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> Message
            </label>
            <textarea
              {...register('message')}
              disabled={isViewOnly}
              rows={3}
              placeholder="Enter enquiry message details..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-60 resize-none"
            />
            {errors.message && (
              <p className="mt-1 text-xs text-rose-400">{errors.message.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                {...register('status')}
                disabled={isViewOnly}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 disabled:opacity-60"
              >
                <option value="NEW">NEW</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" /> Assigned To
              </label>
              <select
                {...register('assignedTo')}
                disabled={isViewOnly || (mode === 'edit' && isAgent)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 disabled:opacity-60"
              >
                <option value="">-- Unassigned --</option>
                {staffList.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} ({staff.role})
                  </option>
                ))}
              </select>
              {isAgent && mode === 'edit' && (
                <p className="text-[10px] text-slate-500 mt-1">Agents cannot reassign enquiries.</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              {isViewOnly ? 'Close' : 'Cancel'}
            </button>

            {!isViewOnly && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Enquiry' : 'Save Changes'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
