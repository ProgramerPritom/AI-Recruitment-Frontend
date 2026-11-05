import React, { useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Candidate, CandidateStatus } from '../../types';
import { ExternalLink, Mail, Award, CheckCircle, XCircle, Trash2, RotateCcw, Calendar } from 'lucide-react';
import { MeetingSlotCard } from '../cards/MeetingSlotCard';

interface CandidateDetailModalProps {
  candidate: Candidate | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: CandidateStatus) => Promise<any>;
  onDeleteCandidate?: (id: string) => Promise<any>;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  isOpen,
  onClose,
  onStatusChange,
  onDeleteCandidate,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!candidate) return null;

  const handleStatusUpdate = async (status: CandidateStatus) => {
    setIsUpdating(true);
    try {
      await onStatusChange(candidate._id, status);
      toast.success(`Candidate status updated to ${status}`);
      onClose();
    } catch (err: any) {
      toast.error(`Status update failed: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!onDeleteCandidate) return;
    if (!window.confirm(`Are you sure you want to permanently delete "${candidate.name}" from this recruitment workspace?`)) return;

    setIsDeleting(true);
    try {
      await onDeleteCandidate(candidate._id);
      toast.success(`Candidate "${candidate.name}" deleted permanently.`);
      onClose();
    } catch (err: any) {
      toast.error(`Delete failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const getScoreVariant = (score?: number) => {
    if (!score) return 'default';
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Candidate Profile & Evaluation" maxWidth="lg">
      <div className="space-y-4">
        {/* Header information */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">{candidate.name}</h2>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
              {candidate.email && (
                <span className="flex items-center gap-1 text-slate-600">
                  <Mail className="w-3.5 h-3.5" /> {candidate.email}
                </span>
              )}
              {candidate.profileUrl && (
                <a
                  href={candidate.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> LinkedIn Profile
                </a>
              )}
              <span className="capitalize px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px]">
                Source: {candidate.source}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <Badge status={candidate.status}>{candidate.status.replace('_', ' ')}</Badge>
            {candidate.score !== undefined && (
              <span className="text-xs font-bold text-slate-700">
                Score: <Badge variant={getScoreVariant(candidate.score)}>{candidate.score}/100</Badge>
              </span>
            )}
          </div>
        </div>

        {/* AI Scoring Rationale */}
        {candidate.scoreReason && (
          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>AI Evaluation Rationale</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-mono text-[11.5px]">
              {candidate.scoreReason}
            </p>
          </div>
        )}

        {/* Candidate Skills */}
        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Identified Skills</label>
          <div className="flex flex-wrap gap-1.5">
            {candidate.skills && candidate.skills.length > 0 ? (
              candidate.skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium border border-slate-200"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">No skills identified yet</span>
            )}
          </div>
        </div>

        {/* Experience Summary */}
        {candidate.experienceSummary && (
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">Experience Summary</label>
            <p className="text-xs text-slate-600 bg-white border border-slate-200 rounded-lg p-3 leading-relaxed">
              {candidate.experienceSummary}
            </p>
          </div>
        )}

        {/* Interview Scheduling / Meeting Slots */}
        {(candidate.status === 'interested' || candidate.status === 'meeting_booked' || candidate.status === 'contacted' || candidate.status === 'replied') && (
          <div className="pt-3 border-t border-slate-100">
            <MeetingSlotCard
              candidateId={candidate._id}
              candidateName={candidate.name}
            />
          </div>
        )}

        {/* Stage Transitions */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <label className="text-xs font-semibold text-slate-700 block">Move Pipeline Stage</label>
          <div className="flex flex-wrap gap-2">
            {candidate.status !== 'accepted' && (
              <Button
                size="sm"
                variant="primary"
                isLoading={isUpdating}
                onClick={() => handleStatusUpdate('accepted')}
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Accept Candidate
              </Button>
            )}

            {candidate.status !== 'interviewed' && (
              <Button
                size="sm"
                variant="outline"
                isLoading={isUpdating}
                onClick={() => handleStatusUpdate('interviewed')}
              >
                Mark Interviewed
              </Button>
            )}

            {candidate.status !== 'shortlisted' && (
              <Button
                size="sm"
                variant="outline"
                isLoading={isUpdating}
                onClick={() => handleStatusUpdate('shortlisted')}
              >
                Shortlist
              </Button>
            )}

            {candidate.status !== 'hired' && (
              <Button
                size="sm"
                variant="secondary"
                isLoading={isUpdating}
                onClick={() => handleStatusUpdate('hired')}
              >
                Mark Hired
              </Button>
            )}

            {candidate.status === 'rejected' && (
              <Button
                size="sm"
                variant="primary"
                isLoading={isUpdating}
                onClick={() => handleStatusUpdate('sourced')}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Restore to Sourced
              </Button>
            )}

            {candidate.status !== 'rejected' && (
              <Button
                size="sm"
                variant="danger"
                isLoading={isUpdating}
                onClick={() => handleStatusUpdate('rejected')}
              >
                <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
              </Button>
            )}

            {onDeleteCandidate && (
              <Button
                size="sm"
                variant="outline"
                className="text-rose-600 hover:bg-rose-50 border-rose-200 ml-auto"
                isLoading={isDeleting}
                onClick={handleDelete}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1 text-rose-600" /> Delete Permanently
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
