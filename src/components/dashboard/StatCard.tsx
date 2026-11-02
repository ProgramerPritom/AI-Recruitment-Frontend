import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: 'indigo' | 'emerald' | 'amber' | 'sky';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'indigo',
}) => {
  const getColors = () => {
    switch (variant) {
      case 'emerald':
        return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'amber':
        return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'sky':
        return 'text-sky-600 bg-sky-50 border-sky-100';
      default:
        return 'text-indigo-600 bg-indigo-50 border-indigo-100';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${getColors()}`}>
          {icon}
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
};

