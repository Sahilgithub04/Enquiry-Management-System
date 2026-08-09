import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LayoutDashboard, Users, FileText } from "lucide-react";

export const Sidebar: React.FC = () => {
  const { isAdmin } = useAuth();

  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  const apiDocsUrl = apiBaseUrl.replace(/\/api\/?$/, "") + "/api/docs";

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/40 backdrop-blur-xl p-4 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Navigation
        </div>

        <nav className="space-y-1.5">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/5"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/5"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`
              }
            >
              <Users className="w-4 h-4" />
              User Management
            </NavLink>
          )}

          <a
            href={apiDocsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>API Docs (Swagger)</span>
          </a>
        </nav>
      </div>

      <div className="p-3 bg-slate-800/40 border border-slate-700/30 rounded-xl">
        <p className="text-xs font-medium text-slate-300">
          CloudBlitz CRM v1.0
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          Role-Based Access Active
        </p>
      </div>
    </aside>
  );
};
