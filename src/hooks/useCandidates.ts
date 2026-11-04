import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Candidate, CandidateStatus } from '../types';
import { useJob } from '../context/JobContext';

export const useCandidates = (statusFilter?: string) => {
  const { activeJobId } = useJob();
  const queryClient = useQueryClient();

  const {
    data: candidates = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<Candidate[]>({
    queryKey: ['candidates', activeJobId, statusFilter],
    queryFn: async () => {
      if (!activeJobId) return [];
      const params: Record<string, string> = {};
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const res: any = await api.get(`/jobs/${activeJobId}/candidates`, { params });
      return res.data?.data || res.data || [];
    },
    enabled: Boolean(activeJobId),
  });

  const statusMutation = useMutation({
    mutationFn: async ({
      candidateId,
      status,
      reason,
    }: {
      candidateId: string;
      status: CandidateStatus;
      reason?: string;
    }) => {
      const res: any = await api.patch(`/candidates/${candidateId}/status`, {
        status,
        actor: 'recruiter',
        reason,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates', activeJobId] });
      queryClient.invalidateQueries({ queryKey: ['stats', activeJobId] });
      queryClient.invalidateQueries({ queryKey: ['activities', activeJobId] });
    },
  });

  const bulkReviewMutation = useMutation({
    mutationFn: async ({
      candidateIds,
      decision,
    }: {
      candidateIds: string[];
      decision: 'accept' | 'reject';
    }) => {
      if (!activeJobId) throw new Error('No active job');
      const res: any = await api.post(`/jobs/${activeJobId}/candidates/bulk-review`, {
        candidateIds,
        decision,
        actor: 'recruiter',
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates', activeJobId] });
      queryClient.invalidateQueries({ queryKey: ['stats', activeJobId] });
      queryClient.invalidateQueries({ queryKey: ['activities', activeJobId] });
    },
  });

  const startScoringMutation = useMutation({
    mutationFn: async () => {
      if (!activeJobId) throw new Error('No active job');
      const res: any = await api.post(`/jobs/${activeJobId}/scoring`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates', activeJobId] });
    },
  });

  const startSourcingMutation = useMutation({
    mutationFn: async (limit: number = 8) => {
      if (!activeJobId) throw new Error('No active job');
      const res: any = await api.post(`/jobs/${activeJobId}/sourcing`, { limit });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates', activeJobId] });
    },
  });

  const deleteCandidateMutation = useMutation({
    mutationFn: async (candidateId: string) => {
      const res: any = await api.delete(`/candidates/${candidateId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates', activeJobId] });
      queryClient.invalidateQueries({ queryKey: ['stats', activeJobId] });
      queryClient.invalidateQueries({ queryKey: ['activities', activeJobId] });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (candidateIds: string[]) => {
      if (!activeJobId) throw new Error('No active job');
      const res: any = await api.post(`/jobs/${activeJobId}/candidates/bulk-delete`, { candidateIds });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates', activeJobId] });
      queryClient.invalidateQueries({ queryKey: ['stats', activeJobId] });
      queryClient.invalidateQueries({ queryKey: ['activities', activeJobId] });
    },
  });

  return {
    candidates,
    isLoading: isLoading || isRefetching,
    refetch,
    updateStatus: statusMutation.mutateAsync,
    isUpdatingStatus: statusMutation.isPending,
    bulkReview: bulkReviewMutation.mutateAsync,
    isBulkReviewing: bulkReviewMutation.isPending,
    deleteCandidate: deleteCandidateMutation.mutateAsync,
    isDeletingCandidate: deleteCandidateMutation.isPending,
    bulkDelete: bulkDeleteMutation.mutateAsync,
    isBulkDeleting: bulkDeleteMutation.isPending,
    startScoring: startScoringMutation.mutateAsync,
    isStartingScoring: startScoringMutation.isPending,
    startSourcing: startSourcingMutation.mutateAsync,
    isStartingSourcing: startSourcingMutation.isPending,
  };
};

