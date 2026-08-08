import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { formatDate } from '../utils/formatters';
import { Badge } from '../components/Badge';
import { UserModal } from '../components/UserModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { Users as UsersIcon, Plus, Edit, Trash2, RefreshCw, ShieldAlert } from 'lucide-react';

export const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // User Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    user: User | null;
  }>({
    isOpen: false,
    mode: 'create',
    user: null,
  });

  // Delete Modal state
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    userId: string | null;
    userName: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    userId: null,
    userName: '',
    isDeleting: false,
  });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error: any) {
      addToast('error', 'Error Fetching Users', error.response?.data?.message || 'Failed to load users list');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchUsers();
  };

  const handleCreateUser = async (formData: any) => {
    try {
      await userService.createUser(formData);
      addToast('success', 'User Created', 'New user account created successfully.');
      setModalState({ isOpen: false, mode: 'create', user: null });
      fetchUsers();
    } catch (error: any) {
      addToast('error', 'Creation Failed', error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (formData: any) => {
    if (!modalState.user) return;
    try {
      // Remove empty password if not provided
      if (!formData.password) delete formData.password;
      await userService.updateUser(modalState.user.id, formData);
      addToast('success', 'User Updated', 'User account updated successfully.');
      setModalState({ isOpen: false, mode: 'edit', user: null });
      fetchUsers();
    } catch (error: any) {
      addToast('error', 'Update Failed', error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalState.userId) return;
    setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));
    try {
      await userService.deleteUser(deleteModalState.userId);
      addToast('success', 'User Deleted', 'User deleted successfully.');
      setDeleteModalState({ isOpen: false, userId: null, userName: '', isDeleting: false });
      fetchUsers();
    } catch (error: any) {
      addToast('error', 'Deletion Failed', error.response?.data?.message || 'Failed to delete user');
      setDeleteModalState((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <UsersIcon className="w-6 h-6 text-cyan-400" /> User Management
          </h1>
          <p className="text-sm text-slate-400">Admin control panel for managing CRM staff accounts and roles</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className={`p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 transition-all ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Refresh Users"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setModalState({ isOpen: true, mode: 'create', user: null })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-400">Loading user accounts...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-300">No Users Found</h4>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] font-semibold bg-slate-950/40">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-100 flex items-center gap-2">
                        {u.name}
                        {isSelf && (
                          <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                            You
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <Badge type="role" value={u.role} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{formatDate(u.createdAt)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setModalState({ isOpen: true, mode: 'edit', user: u })}
                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            disabled={isSelf}
                            onClick={() =>
                              setDeleteModalState({
                                isOpen: true,
                                userId: u.id,
                                userName: u.name,
                                isDeleting: false,
                              })
                            }
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                            title={isSelf ? 'Cannot delete yourself' : 'Delete User'}
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
      </div>

      {/* User Form Modal */}
      <UserModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        user={modalState.user}
        onClose={() => setModalState({ isOpen: false, mode: 'create', user: null })}
        onSubmit={modalState.mode === 'create' ? handleCreateUser : handleUpdateUser}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete user account "${deleteModalState.userName}"?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModalState({ isOpen: false, userId: null, userName: '', isDeleting: false })}
        isDeleting={deleteModalState.isDeleting}
      />
    </div>
  );
};
