import React from 'react';
import { clsx } from 'clsx';
import { CandidateStatus } from '../../types';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  status?: CandidateStatus | string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  status,
  size = 'sm',
}) => {
  // If status prop is supplied, derive semantic badge style
  let computedVariant = variant || 'default';

  if (status) {
    switch (status) {
      case 'accepted':
      case 'hired':
      case 'Interested':
        computedVariant = 'success';
        break;
      case 'rejected':
      case 'unsubscribed':
      case 'Not interested':
        computedVariant = 'danger';
        break;
      case 'meeting_booked':
      case 'Wants a meeting':
        computedVariant = 'purple';
        break;
      case 'contacted':
      case 'replied':
      case 'Question':
        computedVariant = 'info';
        break;
      case 'sourced':
      case 'interviewed':
      case 'shortlisted':
        computedVariant = 'warning';
        break;
      default:
        computedVariant = 'default';
    }
  }

  const styles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium border rounded-md capitalize',
        styles[computedVariant],
        sizes[size]
      )}
    >
      {children}
    </span>
  );
};

