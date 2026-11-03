import React, { useState } from 'react';
import { toast } from 'sonner';
import { ExternalLink, Check, X, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../../services/api';
import { useJob } from '../../context/JobContext';
import { useQueryClient } from '@tanstack/react-query';

export interface CandidateItem {
  _id: string;
  name: string;
  currentRole?: string;
  score?: number;
  scoreReason?: string;
  profileUrl?: string;
  skills?: string[];
  status: string;
}

interface CandidateReviewCardProps {
  candidates: CandidateItem[];
}

export const CandidateReviewCard: React.FC<CandidateReviewCardProps> = ({ candidates: initialCandidates }) => {
  const { activeJobId } = useJob();
  const queryClient = useQueryClient();
  const [candidates, setCandidates] = useState<CandidateItem[]>(initialCandidates);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleDecision = async (id: string, decision: 'accepted' | 'rejected') => {
    setUpdatingId(id);
    try {
      await api.patch(`/candidates/${id}/status`, {
        status: decision,
        actor: 'recruiter',
      });

      setCandidates((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: decision } : c))
      );

      queryClient.invalidateQueries({ queryKey: ['candidates', activeJobId] });
      queryClient.invalidateQueries({ queryKey: ['stats', activeJobId] });
      queryClient.invalidateQueries({ queryKey: ['activities', activeJobId] });
      toast.success(`Candidate status updated to ${decision}`);
    } catch (err: any) {
      toast.error(`Failed to update candidate: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'bg-slate-100 text-slate-700';
    if (score >= 80) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (score >= 60) return 'bg-amber-50 text-amber-700 border border-amber-200';
    return 'bg-rose-50 text-rose-700 border border-rose-200';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 my-2.5 shadow-sm max-w-lg space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Candidate Evaluation Review ({candidates.length})
          </span>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {candidates.map((candidate) => {
          const isExpanded = expandedId === candidate._id;
          const isUpdating = updatingId === candidate._id;

          return (
            <div key={candidate._id} className="py-2.5 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getScoreColor(candidate.score)}`}>
                    {candidate.score ?? 'N/A'}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-slate-900 truncate flex items-center gap-1.5">
                      {candidate.name}
                      {candidate.profileUrl && (
                        <a
                          href={candidate.profileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-indigo-600"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    {candidate.currentRole && (
                      <p className="text-[11px] text-slate-500 truncate">{candidate.currentRole}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {candidate.status === 'accepted' ? (
                    <span className="text-[11px] font-semibold text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded">
                      Accepted
                    </span>
                  ) : candidate.status === 'rejected' ? (
                    <span className="text-[11px] font-semibold text-slate-400 px-2 py-0.5 bg-slate-50 rounded">
                      Rejected
                    </span>
                  ) : (
                    <>
                      <button
                        disabled={isUpdating}
                        onClick={() => handleDecision(candidate._id, 'accepted')}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 border border-emerald-200 rounded text-xs transition flex items-center gap-1 px-2"
                        title="Accept candidate"
                      >
                        <Check className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button
                        disabled={isUpdating}
                        onClick={() => handleDecision(candidate._id, 'rejected')}
                        className="p-1 text-slate-500 hover:bg-slate-50 border border-slate-200 rounded text-xs transition flex items-center gap-1 px-1.5"
                        title="Reject candidate"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {candidate.scoreReason && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : candidate._id)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              {isExpanded && candidate.scoreReason && (
                <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
                  <span className="font-semibold text-slate-700">AI Scoring Rationale: </span>
                  {candidate.scoreReason}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

