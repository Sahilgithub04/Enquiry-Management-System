export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const getRoleBadgeColor = (role: string): string => {
  switch (role) {
    case 'ADMIN':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    case 'MANAGER':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    case 'AGENT':
      return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
};

export const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case 'NEW':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'IN_PROGRESS':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'CLOSED':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
};
