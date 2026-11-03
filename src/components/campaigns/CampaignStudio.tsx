import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Campaign, CampaignStep } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Mail, Check, Send, AlertTriangle, Sparkles, Save, Edit3 } from 'lucide-react';

interface CampaignStudioProps {
  campaign: Campaign | null;
  acceptedCandidatesCount: number;
  onApprove: (id: string) => Promise<any>;
  onSend: (id: string, stepNumber: number) => Promise<any>;
  onUpdateDraft: (id: string, steps: CampaignStep[]) => Promise<any>;
  onCreateCampaign: () => Promise<any>;
  isApproving: boolean;
  isSending: boolean;
  isCreating: boolean;
}

export const CampaignStudio: React.FC<CampaignStudioProps> = ({
  campaign,
  acceptedCandidatesCount,
  onApprove,
  onSend,
  onUpdateDraft,
  onCreateCampaign,
  isApproving,
  isSending,
  isCreating,
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [steps, setSteps] = useState<CampaignStep[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (campaign?.steps) {
      setSteps(campaign.steps);
    }
  }, [campaign]);

  if (!campaign) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
          <Mail className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">No Outreach Campaign Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Generate an automated 3-step personalized outreach sequence for all accepted candidates.
          </p>
        </div>
        <div className="pt-2">
          <Button
            variant="primary"
            size="sm"
            isLoading={isCreating}
            onClick={onCreateCampaign}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Generate AI Campaign Sequence
          </Button>
        </div>
      </div>
    );
  }

  const currentStep = steps[activeStepIndex] || steps[0];

  const handleStepChange = (field: 'subject' | 'body', value: string) => {
    setSteps((prev) =>
      prev.map((step, idx) => (idx === activeStepIndex ? { ...step, [field]: value } : step))
    );
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await onUpdateDraft(campaign._id, steps);
      setIsEditing(false);
      toast.success('Campaign email draft saved successfully');
    } catch (err: any) {
      toast.error(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const isApproved = campaign.status === 'approved' || campaign.status === 'running';

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* Studio Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">{campaign.name}</h3>
            <Badge variant={isApproved ? 'success' : 'warning'}>
              {campaign.status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Target Audience: <span className="font-semibold text-slate-700">{acceptedCandidatesCount} accepted candidate{acceptedCandidatesCount === 1 ? '' : 's'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <Button size="sm" variant="primary" isLoading={isSaving} onClick={handleSaveDraft}>
              <Save className="w-3.5 h-3.5 mr-1" /> Save Sequence
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
              <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit Sequence
            </Button>
          )}
        </div>
      </div>

      {/* Step Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50/70 px-4 pt-2 gap-2">
        {steps.map((step, idx) => (
          <button
            key={step.stepNumber}
            type="button"
            onClick={() => setActiveStepIndex(idx)}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 flex items-center gap-1.5 ${
              activeStepIndex === idx
                ? 'bg-white border-indigo-600 text-indigo-700 shadow-sm -mb-[2px]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Step {step.stepNumber}</span>
            <span className="text-[10px] font-normal text-slate-400">
              {step.delayDays === 0 ? '(Day 0)' : `(+${step.delayDays} days)`}
            </span>
          </button>
        ))}
      </div>

      {/* Step Editor / Viewer */}
      {currentStep && (
        <div className="p-4 space-y-3.5 flex-1">
          {/* Subject Line */}
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">Subject Line</label>
            {isEditing ? (
              <input
                type="text"
                value={currentStep.subject}
                onChange={(e) => handleStepChange('subject', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            ) : (
              <div className="text-xs font-semibold text-slate-900 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                {currentStep.subject}
              </div>
            )}
          </div>

          {/* Body */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Email Template Body</label>
              <span className="text-[10px] text-slate-400">Supported variables: {'{{name}}'}, {'{{jobTitle}}'}</span>
            </div>
            {isEditing ? (
              <textarea
                rows={7}
                value={currentStep.body}
                onChange={(e) => handleStepChange('body', e.target.value)}
                className="w-full p-3 text-xs font-mono border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
              />
            ) : (
              <div className="p-3 text-xs font-mono text-slate-700 bg-slate-50 rounded-lg border border-slate-200 whitespace-pre-wrap leading-relaxed">
                {currentStep.body}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Safety Approval Banner & Dispatch Button */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/60 flex items-center justify-between">
        {isApproved ? (
          <>
            <div className="flex items-center gap-2 text-xs text-emerald-800">
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <div>
                <span className="font-semibold">Governance Approved:</span> Sequence is verified. Ready for safe dispatch.
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSending}
              onClick={() => onSend(campaign._id, currentStep?.stepNumber || 1)}
            >
              <Send className="w-3.5 h-3.5 mr-1" /> Dispatch Step {currentStep?.stepNumber}
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-semibold">Approval Required:</span> Candidate emails will not be sent until explicitly approved.
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              isLoading={isApproving}
              onClick={() => onApprove(campaign._id)}
            >
              <Check className="w-3.5 h-3.5 mr-1" /> Approve Campaign
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

