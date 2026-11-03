import React, { useState } from 'react';
import { toast } from 'sonner';
import { useJob } from '../../context/JobContext';
import { useCandidates } from '../../hooks/useCandidates';
import { CandidateTable } from './CandidateTable';
import { CandidateDetailModal } from './CandidateDetailModal';
import { CsvUploadModal } from './CsvUploadModal';
import { Button } from '../common/Button';
import { Candidate } from '../../types';
import { Upload, Sparkles, RefreshCw, Search } from 'lucide-react';

export const CandidateWorkspace: React.FC = () => {
  const { activeJobId, activeJob } = useJob();
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

  const handleStartScoring = async () => {
    try {
      await startScoring();
      toast.success('AI scoring task initiated! Real-time progress is streaming.');
    } catch (err: any) {
      toast.error(`Scoring failed to start: ${err.message}`);
    }
  };

  const handleStartSourcing = async () => {
    try {
      await startSourcing(8);
      toast.success('Candidate sourcing started from Web Search!');
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
            isLoading={isStartingSourcing}
            onClick={handleStartSourcing}
          >
            <Search className="w-3.5 h-3.5 mr-1" /> Source Web (8)
          </Button>

          <Button
            size="sm"
            variant="outline"
            isLoading={isStartingScoring}
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
      />
    </div>
  );
};

