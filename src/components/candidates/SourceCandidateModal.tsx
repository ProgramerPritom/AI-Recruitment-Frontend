import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Globe, Sparkles, CheckCircle2, ShieldCheck, Database, Zap } from 'lucide-react';

interface SourceCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
  jobTitle?: string;
  mustHaveSkills?: string[];
}

export const SourceCandidateModal: React.FC<SourceCandidateModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  jobTitle = 'Active Role',
  mustHaveSkills = [],
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Source Candidates from Web"
      description="Perform a live web search to discover and extract real-time candidate profiles."
      maxWidth="md"
    >
      <div className="space-y-4 text-xs">
        {/* Source Configuration Card */}
        <div className="bg-gradient-to-br from-indigo-50/70 to-purple-50/50 border border-indigo-100 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Google Serper Dev Sourcing</h4>
                <p className="text-[11px] text-slate-500">Live LinkedIn Profile Extraction Engine</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
              <Zap className="w-3 h-3 text-emerald-600" /> 1 Credit
            </span>
          </div>

          <div className="bg-white/80 border border-indigo-100/70 rounded-lg p-3 space-y-2">
            <div className="flex items-start justify-between">
              <span className="text-slate-500 font-medium">Target Job Role:</span>
              <span className="font-semibold text-slate-900 text-right max-w-xs">{jobTitle}</span>
            </div>

            {mustHaveSkills.length > 0 && (
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-500 font-medium whitespace-nowrap">Filter Skills:</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {mustHaveSkills.slice(0, 4).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                  {mustHaveSkills.length > 4 && (
                    <span className="text-[10px] text-slate-400 self-center">
                      +{mustHaveSkills.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <span className="text-slate-500 font-medium">Candidate Limit:</span>
              <span className="font-bold text-indigo-700">Strictly 8 Candidates</span>
            </div>
          </div>
        </div>

        {/* Database Persistence Explanation */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            <span>Database Storage & Sourcing Workflow</span>
          </div>
          <ul className="space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Real Google search targeting active LinkedIn profiles is triggered via Serper API.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Found candidates are deduplicated against existing database records.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>All 8 candidate profiles are permanently saved to your MongoDB database.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
              <span>Your Talent Pipeline table loads and synchronizes all candidates directly from MongoDB.</span>
            </li>
          </ul>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={isLoading}
            onClick={onConfirm}
            className="shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-200" />
            Confirm & Source from Web (8 Profiles)
          </Button>
        </div>
      </div>
    </Modal>
  );
};
