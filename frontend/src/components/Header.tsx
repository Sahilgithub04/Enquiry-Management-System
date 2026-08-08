import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Badge } from './Badge';
import { LogOut, User as UserIcon, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-slate-100 text-lg leading-tight tracking-tight">
            CloudBlitz <span className="text-cyan-400 font-medium text-sm">CRM</span>
          </h1>
          <p className="text-xs text-slate-400">Enquiry Management System</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-1.5">
            <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-slate-200">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-slate-200">{user.name}</p>
              <p className="text-[10px] text-slate-400">{user.email}</p>
            </div>
            <Badge type="role" value={user.role} />
          </div>
        )}

        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 transition-all text-xs font-medium"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
