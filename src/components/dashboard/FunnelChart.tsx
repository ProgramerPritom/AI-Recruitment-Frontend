import React from 'react';

interface FunnelChartProps {
  stageCounts?: Record<string, number>;
  totalCandidates: number;
}

const FUNNEL_STAGES = [
  { key: 'sourced', label: '1. Sourced', color: 'bg-slate-500' },
  { key: 'accepted', label: '2. Accepted', color: 'bg-indigo-500' },
  { key: 'contacted', label: '3. Contacted', color: 'bg-indigo-600' },
  { key: 'replied', label: '4. Replied', color: 'bg-sky-500' },
  { key: 'interested', label: '5. Interested', color: 'bg-emerald-500' },
  { key: 'meeting_booked', label: '6. Meeting Booked', color: 'bg-teal-500' },
  { key: 'hired', label: '7. Hired', color: 'bg-emerald-600' },
];

export const FunnelChart: React.FC<FunnelChartProps> = ({
  stageCounts = {},
  totalCandidates,
}) => {
  const maxCount = Math.max(totalCandidates, 1);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Recruitment Conversion Funnel</h3>
          <p className="text-xs text-slate-500">Candidate progression from sourcing to final hire</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          {totalCandidates} Total in Pipeline
        </span>
      </div>

      <div className="space-y-3 pt-1">
        {FUNNEL_STAGES.map((stage, idx) => {
          const count = stageCounts[stage.key] || 0;
          const percentage = Math.round((count / maxCount) * 100);

          return (
            <div key={stage.key} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">{stage.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{count}</span>
                  <span className="text-slate-400 text-[11px]">({percentage}%)</span>
                </div>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${stage.color}`}
                  style={{ width: `${Math.max(percentage, count > 0 ? 3 : 0)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

