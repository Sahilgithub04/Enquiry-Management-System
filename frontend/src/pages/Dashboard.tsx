import React, { useState, useEffect, useCallback } from 'react';
import { Enquiry, User, Pagination, EnquiryStatus } from '../types';
import { enquiryService } from '../services/enquiryService';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { formatDate } from '../utils/formatters';
import { Badge } from '../components/Badge';
import { EnquiryModal } from '../components/EnquiryModal';
import { ConfirmModal } from '../components/ConfirmModal';
import {
  Search,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Trash2,
  Inbox,
  Clock,
  CheckCircle,
  FileText,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [staffList, setStaffList] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Stats calculation
  const [stats, setStats] = useState({
    total: 0,
    newCount: 0,
    inProgressCount: 0,
    closedCount: 0,
  });

  // Modal States
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
    enquiry: Enquiry | null;
  }>({
    isOpen: false,
    mode: 'create',
    enquiry: null,
  });

  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    enquiryId: string | null;
    customerName: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    enquiryId: null,
    customerName: '',
    isDeleting: false,
  });

  const fetchEnquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const statusParam = activeTab === 'ALL' ? undefined : activeTab;
      const res = await enquiryService.getEnquiries({
        search,
        status: statusParam,
        assignee: selectedAssignee || undefined,
        page: pagination.page,
        limit: pagination.limit,
      });

      setEnquiries(res.data);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (error: any) {
      addToast('error', 'Error Loading Enquiries', error.response?.data?.message || 'Failed to fetch enquiries');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [search, activeTab, selectedAssignee, pagination.page, pagination.limit, addToast]);

  const fetchStatsAndStaff = useCallback(async () => {
    try {
      const allRes = await enquiryService.getEnquiries({ limit: 1000 });
      const allData = allRes.data || [];

      setStats({
        total: allData.length,
        newCount: allData.filter((e) => e.status === 'NEW').length,
        inProgressCount: allData.filter((e) => e.status === 'IN_PROGRESS').length,
        closedCount: allData.filter((e) => e.status === 'CLOSED').length,
      });

      // If user is Admin/Manager, fetch staff list for assignment dropdown
      try {
        const users = await userService.getUsers();
        setStaffList(users);
      } catch (_err) {
        // Non-admin might get 403 on /users endpoint
      }
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
    }
  }, []);

  useEffect(() => {
    fetchStatsAndStaff();
  }, [fetchStatsAndStaff]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStatsAndStaff();
    fetchEnquiries();
  };

  const handleCreateEnquiry = async (formData: any) => {
    try {
      await enquiryService.createEnquiry(formData);
      addToast('success', 'Enquiry Created', 'New enquiry has been successfully registered.');
      setModalState({ isOpen: false, mode: 'create', enquiry: null });
      handleRefresh();
    } catch (error: any) {
      addToast('error', 'Creation Failed', error.response?.data?.message || 'Failed to create enquiry');
    }
  };

  const handleUpdateEnquiry = async (formData: any) => {
    if (!modalState.enquiry) return;
    try {
      await enquiryService.updateEnquiry(modalState.enquiry.id, formData);
      addToast('success', 'Enquiry Updated', 'Enquiry details updated successfully.');
      setModalState({ isOpen: false, mode: 'edit', enquiry: null });
      handleRefresh();
    } catch (error: any) {
      addToast('error', 'Update Failed', error.response?.data?.message || 'Failed to update enquiry');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalState.enquiryId) return;
    setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));
    try {
      await enquiryService.deleteEnquiry(deleteModalState.enquiryId);
      addToast('success', 'Enquiry Deleted', 'Enquiry soft-deleted successfully.');
      setDeleteModalState({ isOpen: false, enquiryId: null, customerName: '', isDeleting: false });
      handleRefresh();
    } catch (error: any) {
      addToast('error', 'Deletion Failed', error.response?.data?.message || 'Failed to delete enquiry');
      setDeleteModalState((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const isAgent = user?.role === 'AGENT';

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">CRM Dashboard</h1>
          <p className="text-sm text-slate-400">Track and manage customer enquiries in real-time</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className={`p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 transition-all ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setModalState({ isOpen: true, mode: 'create', enquiry: null })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" /> New Enquiry
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Enquiries</p>
            <h3 className="text-2xl font-bold text-slate-100 mt-1">{stats.total}</h3>
          </div>
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-amber-400/90 uppercase tracking-wider">New Enquiries</p>
            <h3 className="text-2xl font-bold text-amber-400 mt-1">{stats.newCount}</h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Inbox className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-blue-400/90 uppercase tracking-wider">In Progress</p>
            <h3 className="text-2xl font-bold text-blue-400 mt-1">{stats.inProgressCount}</h3>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-400/90 uppercase tracking-wider">Closed</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">{stats.closedCount}</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'NEW', label: 'New' },
              { id: 'IN_PROGRESS', label: 'In Progress' },
              { id: 'CLOSED', label: 'Closed' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-cyan-500 text-white font-semibold shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search name, email, phone..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Assignee Filter */}
            {staffList.length > 0 && (
              <div className="relative w-full sm:w-48">
                <Filter className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <select
                  value={selectedAssignee}
                  onChange={(e) => {
                    setSelectedAssignee(e.target.value);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">All Assignees</option>
                  <option value="unassigned">Unassigned</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-400">Fetching enquiries...</p>
            </div>
          ) : enquiries.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Inbox className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-300">No Enquiries Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No matching enquiries match your search or filter settings.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] font-semibold bg-slate-950/40">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned To</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {enquiries.map((enquiry) => {
                  const canAgentEdit = !isAgent || (enquiry.assignedTo && enquiry.assignedTo.id === user?.id);

                  return (
                    <tr key={enquiry.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-100">{enquiry.customerName}</td>
                      <td className="py-3.5 px-4 text-slate-300">{enquiry.email}</td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono">{enquiry.phone}</td>
                      <td className="py-3.5 px-4">
                        <Badge type="status" value={enquiry.status} />
                      </td>
                      <td className="py-3.5 px-4">
                        {enquiry.assignedTo ? (
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{enquiry.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{formatDate(enquiry.createdAt)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setModalState({ isOpen: true, mode: 'view', enquiry })}
                            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {canAgentEdit && (
                            <button
                              onClick={() => setModalState({ isOpen: true, mode: 'edit', enquiry })}
                              className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                              title="Edit Enquiry"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() =>
                              setDeleteModalState({
                                isOpen: true,
                                enquiryId: enquiry.id,
                                customerName: enquiry.customerName,
                                isDeleting: false,
                              })
                            }
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                            title="Soft Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
            <span>
              Showing Page <strong className="text-slate-200">{pagination.page}</strong> of{' '}
              <strong className="text-slate-200">{pagination.totalPages}</strong> ({pagination.total} items)
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                className="p-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 hover:text-white disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                className="p-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 hover:text-white disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enquiry Form Modal */}
      <EnquiryModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        enquiry={modalState.enquiry}
        staffList={staffList}
        onClose={() => setModalState({ isOpen: false, mode: 'create', enquiry: null })}
        onSubmit={modalState.mode === 'create' ? handleCreateEnquiry : handleUpdateEnquiry}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        title="Soft Delete Enquiry"
        message={`Are you sure you want to delete the enquiry from "${deleteModalState.customerName}"? It will be archived.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModalState({ isOpen: false, enquiryId: null, customerName: '', isDeleting: false })}
        isDeleting={deleteModalState.isDeleting}
      />
    </div>
  );
};
