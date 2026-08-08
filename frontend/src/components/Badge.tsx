import React from 'react';
import { getRoleBadgeColor, getStatusBadgeColor } from '../utils/formatters';

interface BadgeProps {
  type: 'status' | 'role';
  value: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, value }) => {
  const colorClass = type === 'status' ? getStatusBadgeColor(value) : getRoleBadgeColor(value);
  const formattedValue = value.replace('_', ' ');

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass}`}
    >
      {formattedValue}
    </span>
  );
};
