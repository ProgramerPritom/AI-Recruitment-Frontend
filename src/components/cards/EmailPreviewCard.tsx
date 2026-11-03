import React, { useState } from 'react';
import { toast } from 'sonner';
import { Mail, Check, Send, AlertTriangle } from 'lucide-react';
import { Button } from '../common/Button';
import { api } from '../../services/api';
import { useJob } from '../../context/JobContext';
import { useQueryClient } from '@tanstack/react-query';

interface Step {
  stepNumber: number;
  delayDays: number;
  subject: string;
  body: string;
}

interface EmailPreviewCardProps {
  campaignId: string;
  campaignName?: string;
  steps: Step[];
  eligibleCount?: number;
  initialApproved?: boolean;
}

export const EmailPreviewCard: React.FC<EmailPreviewCardProps> = ({
  campaignId,
  campaignName = 'Candidate Outreach Sequence',
  steps,
  eligibleCount = 0,
  initialApproved = false,
}) => {
  const { activeJobId } = useJob();
  const queryClient = useQueryClient();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isApproving, setIsApproving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isApproved, setIsApproved] = useState(initialApproved);
  const [isSent, setIsSent] = useState(false);

  const currentStep = steps[activeStepIndex] || steps[0];

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await api.post(`/campaigns/${campaignId}/approve`);
      setIsApproved(true);
      toast.success('Campaign approved and ready to dispatch!');
      queryClient.invalidateQueries({ queryKey: ['activities', activeJobId] });
    } catch (err: any) {
      toast.error(`Approval failed: ${err.message}`);
    } finally {
      setIsApproving(false);
    }
  };

  const handleSend = async () => {
    setIsSending(true);
    try {
      await api.post(`/campaigns/${campaignId}/send`, { stepNumber: currentStep.stepNumber });
      setIsSent(true);
      toast.success(`Dispatched step ${currentStep.stepNumber} outreach emails!`);
      queryClient.invalidateQueries({ queryKey: ['stats', activeJobId] });
      queryClient.invalidateQueries({ queryKey: ['activities', activeJobId] });
      queryClient.invalidateQueries({ queryKey: ['candidates', activeJobId] });
    } catch (err: any) {
      toast.error(`Dispatch failed: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 my-2.5 shadow-sm max-w-lg space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            {campaignName}
          </span>
        </div>
        <span className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
          {eligibleCount} eligible recipient{eligibleCount === 1 ? '' : 's'}
        </span>
      </div>

      {/* Step selector tabs */}
      {steps.length > 1 && (
        <div className="flex gap-1.5 border-b border-slate-100 pb-2">
          {steps.map((step, idx) => (
            <button
              key={step.stepNumber}
              onClick={() => setActiveStepIndex(idx)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition ${
                activeStepIndex === idx
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Step {step.stepNumber} {step.delayDays > 0 ? `(+${step.delayDays}d)` : '(Initial)'}
            </button>
          ))}
        </div>
      )}

      {currentStep && (
        <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div>
            <span className="text-slate-500 font-medium">Subject: </span>
            <span className="text-slate-900 font-semibold">{currentStep.subject}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 whitespace-pre-wrap text-slate-700 font-mono text-[11.5px] leading-relaxed">
            {currentStep.body}
          </div>
        </div>
      )}

      {isSent ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center gap-2 text-xs text-emerald-800">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Campaign Step {currentStep?.stepNumber} dispatched successfully! Emails queued in outbox.</span>
        </div>
      ) : isApproved ? (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Approved for delivery</span>
          </div>
          <Button size="sm" variant="primary" isLoading={isSending} onClick={handleSend}>
            <Send className="w-3.5 h-3.5 mr-1" /> Send Step {currentStep?.stepNumber}
          </Button>
        </div>
      ) : (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-amber-700">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Explicit recruiter approval required before sending.</span>
          </div>
          <Button size="sm" variant="primary" isLoading={isApproving} onClick={handleApprove}>
            <Check className="w-3.5 h-3.5 mr-1" /> Approve Sequence
          </Button>
        </div>
      )}
    </div>
  );
};

