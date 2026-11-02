import React, { useState } from 'react';
import { Activity } from '../../types';
import { Bot, User, Cpu, History, RefreshCw } from 'lucide-react';
import { Badge } from '../common/Badge';

interface ActivityTimelineProps {
  activities: Activity[];
  isLoading: boolean;
  onRefresh?: () => void;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  isLoading,
  onRefresh,
}) => {
  const [actorFilter, setActorFilter] = useState<'all' | 'recruiter' | 'agent' | 'system'>('all');

  const filtered = activities.filter((act) => {
    if (actorFilter === 'all') return true;
    return act.actor === actorFilter;
  });

  const getActorIcon = (actor: string) => {
    switch (actor) {
      case 'agent':
        return <Bot className="w-3.5 h-3.5 text-indigo-600" />;
      case 'recruiter':
        return <User className="w-3.5 h-3.5 text-slate-700" />;
      default:
        return <Cpu className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getActorBadge = (actor: string) => {
    switch (actor) {
      case 'agent':
        return <Badge variant="info">AI Agent</Badge>;
      case 'recruiter':
        return <Badge variant="purple">Recruiter</Badge>;
      default:
        return <Badge variant="default">System</Badge>;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-600" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Governance & Audit Trail ({filtered.length})
          </h4>
        </div>

        <div className="flex items-center gap-2">
          {/* Actor filter buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
            {(['all', 'recruiter', 'agent', 'system'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActorFilter(filter)}
                className={`px-2 py-0.5 rounded capitalize text-[11px] font-medium transition ${
                  actorFilter === filter
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              title="Refresh timeline"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Activity Items List */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading audit trail events...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center space-y-1">
            <History className="w-6 h-6 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">No activity records logged yet</p>
            <p className="text-[11px] text-slate-400">
              State transitions and AI tool executions will appear here in chronological order.
            </p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 ml-4 space-y-4">
            {filtered.map((activity, idx) => (
              <div key={activity._id || idx} className="relative pl-5">
                {/* Node marker */}
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                </div>

                <div className="bg-slate-50/80 hover:bg-slate-100/80 transition border border-slate-200 rounded-lg p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {getActorIcon(activity.actor)}
                      {getActorBadge(activity.actor)}
                      <span className="font-semibold text-slate-900">{activity.action}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {activity.timestamp ? new Date(activity.timestamp).toLocaleTimeString() : ''}
                    </span>
                  </div>

                  {(activity.previousValue || activity.newValue) && (
                    <div className="text-[11px] text-slate-600 font-mono bg-white p-1.5 rounded border border-slate-100 mt-1">
                      {activity.previousValue ? `From: ${activity.previousValue} ` : ''}
                      {activity.newValue ? `→ To: ${activity.newValue}` : ''}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

