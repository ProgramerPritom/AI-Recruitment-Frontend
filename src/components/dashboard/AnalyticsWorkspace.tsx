import React from 'react';
import { useJob } from '../../context/JobContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { StatCard } from './StatCard';
import { FunnelChart } from './FunnelChart';
import { AiSummaryCard } from './AiSummaryCard';
import { MessageSquare, ThumbsUp, Calendar, Trophy, RefreshCw } from 'lucide-react';
import { Button } from '../common/Button';

export const AnalyticsWorkspace: React.FC = () => {
  const { activeJobId, activeJob } = useJob();
  const {
    stats,
    isStatsLoading,
    refetchStats,
    generateSummary,
    isGeneratingSummary,
    aiSummary,
  } = useAnalytics();

  if (!activeJobId) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center text-slate-500">
        <p className="text-xs">Please select an active job from the top bar to inspect analytics.</p>
      </div>
    );
  }

  const replyRate = stats?.metrics?.replyRate ?? 0;
  const interestedRate = stats?.metrics?.interestedRate ?? 0;
  const meetingRate = stats?.metrics?.meetingRate ?? 0;
  const hiresCount = stats?.stageCounts?.hired ?? 0;
  const totalCount = stats?.totalCandidates ?? 0;

  return (
    <div className="flex flex-col h-full space-y-4 p-4 bg-slate-50 overflow-y-auto">
      {/* Workspace Header */}
      <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm shrink-0">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Recruitment Analytics & Funnel</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Role: <span className="font-semibold text-slate-700">{activeJob?.title}</span>
          </p>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => refetchStats()}
          title="Refresh analytics data"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* 4 Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        <StatCard
          title="Reply Rate"
          value={`${replyRate}%`}
          subtitle="replied / contacted"
          variant="sky"
          icon={<MessageSquare className="w-4 h-4" />}
        />
        <StatCard
          title="Interest Rate"
          value={`${interestedRate}%`}
          subtitle="positive / replied"
          variant="emerald"
          icon={<ThumbsUp className="w-4 h-4" />}
        />
        <StatCard
          title="Meeting Rate"
          value={`${meetingRate}%`}
          subtitle="meetings / interested"
          variant="indigo"
          icon={<Calendar className="w-4 h-4" />}
        />
        <StatCard
          title="Total Hired"
          value={hiresCount}
          subtitle={`from ${totalCount} candidates`}
          variant="amber"
          icon={<Trophy className="w-4 h-4" />}
        />
      </div>

      {/* Visual Funnel */}
      <div className="shrink-0">
        <FunnelChart
          stageCounts={stats?.stageCounts}
          totalCandidates={totalCount}
        />
      </div>

      {/* AI Executive Summary Card */}
      <div className="shrink-0">
        <AiSummaryCard
          summary={aiSummary}
          onGenerate={generateSummary}
          isLoading={isGeneratingSummary}
        />
      </div>
    </div>
  );
};

