import React, { useState } from 'react';
import { useJob } from '../../context/JobContext';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useCandidates } from '../../hooks/useCandidates';
import { CampaignStudio } from './CampaignStudio';
import { DeliveryOutbox } from './DeliveryOutbox';
import { ReplySimulatorModal } from './ReplySimulatorModal';
import { Button } from '../common/Button';
import { MessageSquare, RefreshCw } from 'lucide-react';

export const OutreachWorkspace: React.FC = () => {
  const { activeJobId, activeJob } = useJob();
  const {
    activeCampaign,
    isLoading: isCampaignsLoading,
    refetch: refetchCampaigns,
    createDraft,
    isCreatingDraft,
    updateDraft,
    approveCampaign,
    isApproving,
    sendCampaign,
    isSending,
  } = useCampaigns();

  const { candidates } = useCandidates();
  const [isReplySimulatorOpen, setIsReplySimulatorOpen] = useState(false);

  const outreachCandidateCount = candidates.filter(
    (candidate) => candidate.status === 'accepted' || candidate.status === 'contacted'
  ).length;

  if (!activeJobId) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center text-slate-500">
        <p className="text-xs">Please select an active job from the top bar to inspect outreach campaigns.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4 p-4 bg-slate-50 overflow-y-auto">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm shrink-0">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Outreach Campaign Studio</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Job: <span className="font-semibold text-slate-700">{activeJob?.title}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => refetchCampaigns()}
            title="Refresh campaign data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsReplySimulatorOpen(true)}
          >
            <MessageSquare className="w-3.5 h-3.5 mr-1" /> Simulate Candidate Reply
          </Button>
        </div>
      </div>

      {/* Main Campaign Sequence Studio */}
      <div className="shrink-0">
        <CampaignStudio
          campaign={activeCampaign}
          acceptedCandidatesCount={outreachCandidateCount}
          onApprove={(id) => approveCampaign(id)}
          onSend={(id, step) => sendCampaign({ campaignId: id, stepNumber: step })}
          onUpdateDraft={(id, steps) => updateDraft({ campaignId: id, steps })}
          onCreateCampaign={() => createDraft()}
          isApproving={isApproving}
          isSending={isSending}
          isCreating={isCreatingDraft}
        />
      </div>

      {/* Virtual Outbox Delivery Monitor */}
      <div className="flex-1 min-h-[300px]">
        <DeliveryOutbox jobId={activeJobId} />
      </div>

      {/* Reply Simulator Modal */}
      <ReplySimulatorModal
        isOpen={isReplySimulatorOpen}
        onClose={() => setIsReplySimulatorOpen(false)}
        candidates={candidates}
        jobId={activeJobId}
      />
    </div>
  );
};
