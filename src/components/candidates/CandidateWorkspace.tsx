import React, { useState } from 'react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useJob } from '../../context/JobContext';
import { useCandidates } from '../../hooks/useCandidates';
import { CandidateTable } from './CandidateTable';
import { CandidateDetailModal } from './CandidateDetailModal';
import { CsvUploadModal } from './CsvUploadModal';
import { SourceCandidateModal } from './SourceCandidateModal';
import { Button } from '../common/Button';
import { Candidate } from '../../types';
import { api } from '../../services/api';
import { Upload, Sparkles, RefreshCw, Search, Globe } from 'lucide-react';

export const CandidateWorkspace: React.FC = () => {
  const { activeJobId, activeJob } = useJob();
  const queryClient = useQueryClient();
  const {
    candidates,
    isLoading,
    refetch,
    updateStatus,
    bulkReview,
    startScoring,
    isStartingScoring,
    startSourcing,
    isStartingSourcing,
  } = useCandidates();

  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);

  // Poll for active background tasks (e.g. Sourcing or Scoring)
  const { data: activeTask } = useQuery({
    queryKey: ['activeTask', activeJobId],
    queryFn: async () => {
      if (!activeJobId) return null;
      try {
        const res: any = await api.get(`/jobs/${activeJobId}/tasks/active`);
        return res.data?.data || res.data || null;
      } catch {
        return null;
      }
    },
    refetchInterval: (query) => {
      // Fast 1.5s polling while a task is running; 5s when idle
      return query.state.data ? 1500 : 5000;
    },
    enabled: Boolean(activeJobId),
  });

  const isTaskRunning = Boolean(
    activeTask && (activeTask.status === 'running' || activeTask.status === 'pending')
  );

  const handleStartScoring = async () => {
    try {
      await startScoring();
      toast.success('AI scoring initiated! Analyzing candidate qualifications.');
      queryClient.invalidateQueries({ queryKey: ['activeTask', activeJobId] });
    } catch (err: any) {
      toast.error(`Scoring failed to start: ${err.message}`);
    }
  };

  const handleConfirmSourcing = async () => {
    try {
      setIsSourceModalOpen(false);
      await startSourcing(8);
      toast.success('Live candidate sourcing initiated via Google Search (Serper API)!');
      queryClient.invalidateQueries({ queryKey: ['activeTask', activeJobId] });
      queryClient.invalidateQueries({ queryKey: ['candidates', activeJobId] });
    } catch (err: any) {
      toast.error(`Sourcing failed to start: ${err.message}`);
    }
  };

  if (!activeJobId) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center text-slate-500">
        <p className="text-xs">Please select an active job from the top bar to inspect candidates.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-3 p-4 bg-slate-50">
      {/* Workspace Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">Talent Pipeline</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {candidates.length} Profiles
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              <Globe className="w-2.5 h-2.5 text-indigo-500" /> Serper Live Search
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Role: <span className="font-semibold text-slate-700">{activeJob?.title}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => refetch()}
            title="Refresh candidate data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            isLoading={isStartingSourcing || (isTaskRunning && activeTask?.type === 'sourcing')}
            onClick={() => setIsSourceModalOpen(true)}
            title="Search and extract real candidate profiles using Serper Dev API"
          >
            <Search className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Source Web (8)
          </Button>

          <Button
            size="sm"
            variant="outline"
            isLoading={isStartingScoring || (isTaskRunning && activeTask?.type === 'scoring')}
            onClick={handleStartScoring}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Run Scoring
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsCsvModalOpen(true)}
          >
            <Upload className="w-3.5 h-3.5 mr-1" /> Upload CSV
          </Button>
        </div>
      </div>

      {/* Main Table View */}
      <div className="flex-1 min-h-0">
        <CandidateTable
          candidates={candidates}
          isLoading={isLoading}
          activeTask={activeTask}
          onStartSourcing={() => setIsSourceModalOpen(true)}
          onOpenUploadCsv={() => setIsCsvModalOpen(true)}
          onSelectCandidate={(c) => setSelectedCandidate(c)}
          onStatusChange={(id, status) => updateStatus({ candidateId: id, status })}
          onBulkReview={(ids, decision) => bulkReview({ candidateIds: ids, decision })}
        />
      </div>

      {/* Modals */}
      <CandidateDetailModal
        candidate={selectedCandidate}
        isOpen={Boolean(selectedCandidate)}
        onClose={() => setSelectedCandidate(null)}
        onStatusChange={(id, status) => updateStatus({ candidateId: id, status })}
      />

      <CsvUploadModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        jobId={activeJobId}
        jobTitle={activeJob?.title}
      />

      <SourceCandidateModal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        onConfirm={handleConfirmSourcing}
        isLoading={isStartingSourcing}
        jobTitle={activeJob?.title}
        mustHaveSkills={activeJob?.mustHaveSkills}
      />
    </div>
  );
};
