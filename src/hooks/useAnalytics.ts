import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { FunnelStats, Activity } from '../types';
import { useJob } from '../context/JobContext';

export const useAnalytics = () => {
  const { activeJobId } = useJob();
  const queryClient = useQueryClient();

  const {
    data: stats,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useQuery<FunnelStats>({
    queryKey: ['stats', activeJobId],
    queryFn: async () => {
      if (!activeJobId) return null as any;
      const res: any = await api.get(`/jobs/${activeJobId}/stats`);
      return res.data?.data || res.data;
    },
    enabled: Boolean(activeJobId),
    refetchInterval: 10000,
  });

  const {
    data: activities = [],
    isLoading: isActivitiesLoading,
    refetch: refetchActivities,
  } = useQuery<Activity[]>({
    queryKey: ['activities', activeJobId],
    queryFn: async () => {
      if (!activeJobId) return [];
      const res: any = await api.get(`/jobs/${activeJobId}/activity`);
      return res.data?.data || res.data || [];
    },
    enabled: Boolean(activeJobId),
    refetchInterval: 5000,
  });

  const generateSummaryMutation = useMutation({
    mutationFn: async () => {
      if (!activeJobId) throw new Error('No active job');
      const res: any = await api.get(`/jobs/${activeJobId}/summary`);
      return res.data?.data || res.data;
    },
  });

  return {
    stats,
    isStatsLoading,
    refetchStats,
    activities,
    isActivitiesLoading,
    refetchActivities,
    generateSummary: generateSummaryMutation.mutateAsync,
    isGeneratingSummary: generateSummaryMutation.isPending,
    aiSummary: generateSummaryMutation.data,
  };
};

