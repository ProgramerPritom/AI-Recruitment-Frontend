import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Campaign, CampaignDelivery } from '../types';
import { useJob } from '../context/JobContext';
import { useSse } from '../context/SseContext';

export const useCampaigns = () => {
  const { activeJobId } = useJob();
  const { subscribeToTask } = useSse();
  const queryClient = useQueryClient();

  const {
    data: campaigns = [],
    isLoading,
    refetch,
  } = useQuery<Campaign[]>({
    queryKey: ['campaigns', activeJobId],
    queryFn: async () => {
      if (!activeJobId) return [];
      const res: any = await api.get(`/jobs/${activeJobId}/campaigns`);
      return res.data?.data || res.data || [];
    },
    enabled: Boolean(activeJobId),
  });

  const createDraftMutation = useMutation({
    mutationFn: async (name?: string) => {
      if (!activeJobId) throw new Error('No active job');
      const res: any = await api.post(`/jobs/${activeJobId}/campaigns`, { name });
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', activeJobId] });
      queryClient.invalidateQueries({ queryKey: ['activities', activeJobId] });
    },
  });

  const updateDraftMutation = useMutation({
    mutationFn: async ({ campaignId, steps }: { campaignId: string; steps: any[] }) => {
      const res: any = await api.patch(`/campaigns/${campaignId}`, { steps });
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', activeJobId] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const res: any = await api.post(`/campaigns/${campaignId}/approve`, { approvedBy: 'recruiter' });
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', activeJobId] });
      queryClient.invalidateQueries({ queryKey: ['activities', activeJobId] });
    },
  });

  const sendMutation = useMutation({
    mutationFn: async ({ campaignId, stepNumber }: { campaignId: string; stepNumber: number }) => {
      const res: any = await api.post(`/campaigns/${campaignId}/send`, { stepNumber });
      return res.data?.data || res.data;
    },
    onSuccess: (task: { taskId?: string }) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', activeJobId] });
      queryClient.invalidateQueries({ queryKey: ['candidates', activeJobId] });
      queryClient.invalidateQueries({ queryKey: ['stats', activeJobId] });
      queryClient.invalidateQueries({ queryKey: ['activities', activeJobId] });
      if (task?.taskId) subscribeToTask(task.taskId);
    },
  });

  return {
    campaigns,
    activeCampaign: campaigns[0] || null,
    isLoading,
    refetch,
    createDraft: createDraftMutation.mutateAsync,
    isCreatingDraft: createDraftMutation.isPending,
    updateDraft: updateDraftMutation.mutateAsync,
    isUpdatingDraft: updateDraftMutation.isPending,
    approveCampaign: approveMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    sendCampaign: sendMutation.mutateAsync,
    isSending: sendMutation.isPending,
  };
};
