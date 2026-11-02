import React, { useState } from 'react';
import { MessageSquare, Check, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';
import { MeetingSlotCard } from './MeetingSlotCard';

interface ReplyReviewCardProps {
  reply: {
    _id?: string;
    candidateId?: string;
    candidateName?: string;
    classification: 'Interested' | 'Not interested' | 'Question' | 'Wants a meeting' | 'Unsubscribe';
    responseDraft?: string;
    content?: string;
  };
}

export const ReplyReviewCard: React.FC<ReplyReviewCardProps> = ({ reply }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const getBadgeColor = (cls: string) => {
    switch (cls) {
      case 'Interested':
      case 'Wants a meeting':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Question':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Not interested':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Unsubscribe':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (showCalendar && reply.candidateId) {
    return (
      <MeetingSlotCard
        candidateId={reply.candidateId}
        candidateName={reply.candidateName || 'Candidate'}
      />
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 my-2.5 shadow-sm max-w-lg space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Inbound Candidate Reply
          </span>
        </div>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getBadgeColor(reply.classification)}`}>
          {reply.classification}
        </span>
      </div>

      {reply.content && (
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs text-slate-700 italic">
          "{reply.content}"
        </div>
      )}

      {reply.responseDraft && (
        <div className="space-y-1.5 text-xs">
          <span className="font-semibold text-slate-700">Recommended Co-Worker Reply:</span>
          <div className="bg-indigo-50/40 p-2.5 rounded-lg border border-indigo-100 text-slate-800 whitespace-pre-wrap leading-relaxed">
            {reply.responseDraft}
          </div>
        </div>
      )}

      {isSent ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center gap-2 text-xs text-emerald-800">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Reply draft approved and sent to candidate.</span>
        </div>
      ) : (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
          {reply.classification === 'Wants a meeting' && (
            <Button size="sm" variant="outline" onClick={() => setShowCalendar(true)}>
              <Calendar className="w-3.5 h-3.5 mr-1" /> Pick Interview Slot
            </Button>
          )}
          <Button size="sm" variant="primary" onClick={() => setIsSent(true)}>
            <ArrowRight className="w-3.5 h-3.5 mr-1" /> Approve & Send Response
          </Button>
        </div>
      )}
    </div>
  );
};

