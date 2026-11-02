import React from 'react';
import { useJob } from '../../context/JobContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { ActivityTimeline } from './ActivityTimeline';

export const ActivityWorkspace: React.FC = () => {
  const { activeJobId } = useJob();
  const { activities, isActivitiesLoading, refetchActivities } = useAnalytics();

  if (!activeJobId) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center text-slate-500">
        <p className="text-xs">Please select an active job from the top bar to inspect audit activities.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 bg-slate-50">
      <ActivityTimeline
        activities={activities}
        isLoading={isActivitiesLoading}
        onRefresh={() => refetchActivities()}
      />
    </div>
  );
};

