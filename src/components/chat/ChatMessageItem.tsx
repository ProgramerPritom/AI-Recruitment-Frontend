import React from 'react';
import { ChatMessage } from '../../types';
import { Bot, User } from 'lucide-react';
import { JobConfirmCard } from '../cards/JobConfirmCard';
import { LiveProgressCard } from '../cards/LiveProgressCard';
import { CandidateReviewCard } from '../cards/CandidateReviewCard';
import { EmailPreviewCard } from '../cards/EmailPreviewCard';
import { MeetingSlotCard } from '../cards/MeetingSlotCard';
import { ReplyReviewCard } from '../cards/ReplyReviewCard';

interface ChatMessageItemProps {
  message: ChatMessage;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Format message text into paragraphs and bullet lists
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1 text-xs leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-1.5" />;
          }
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className="text-slate-400 select-none">•</span>
                <span>{line.replace(/^[-*]\s+/, '')}</span>
              </div>
            );
          }
          return <p key={idx}>{line}</p>;
        })}
      </div>
    );
  };

  const renderCard = (payload?: Record<string, any>) => {
    if (!payload) return null;

    if ((payload.cardType === 'job_draft' || payload.cardType === 'job_confirmation') && payload.draft) {
      return <JobConfirmCard draft={payload.draft} />;
    }

    if (payload.cardType === 'live_progress' && payload.taskId) {
      return <LiveProgressCard taskId={payload.taskId} />;
    }

    if (payload.cardType === 'campaign_preview' && payload.campaign) {
      return (
        <EmailPreviewCard
          campaignId={payload.campaign._id}
          campaignName={payload.campaign.name}
          steps={payload.campaign.steps || []}
          eligibleCount={payload.eligibleCandidateCount}
        />
      );
    }

    if (payload.cardType === 'reply_review' && payload.result) {
      return <ReplyReviewCard reply={payload.result} />;
    }

    if (payload.cardType === 'candidate_review' && Array.isArray(payload.candidates)) {
      return <CandidateReviewCard candidates={payload.candidates} />;
    }

    if (payload.cardType === 'meeting_booking' && payload.candidateId) {
      return (
        <MeetingSlotCard
          candidateId={payload.candidateId}
          candidateName={payload.candidateName || 'Candidate'}
        />
      );
    }

    return null;
  };

  return (
    <div className={`flex gap-3 my-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-3.5 py-2.5 shadow-sm text-xs ${
            isUser
              ? 'bg-indigo-600 text-white rounded-br-none'
              : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
          }`}
        >
          {renderFormattedText(message.content)}
        </div>

        {!isUser && renderCard(message.cardPayload)}
      </div>

      {isUser && (
        <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};

