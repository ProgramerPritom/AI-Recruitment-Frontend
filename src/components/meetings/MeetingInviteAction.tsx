import React, { useState } from 'react';
import { toast } from 'sonner';
import { Mail, Send } from 'lucide-react';
import { api } from '../../services/api';
import { Meeting } from '../../types';
import { Button } from '../common/Button';

interface MeetingInviteActionProps {
  meeting: Meeting;
  onSent?: (meeting?: Meeting) => void;
}

export const MeetingInviteAction: React.FC<MeetingInviteActionProps> = ({ meeting, onSent }) => {
  const [isSending, setIsSending] = useState(false);
  const isSent = meeting.invitationStatus === 'sent';
  const candidate =
    typeof meeting.candidateId === 'string' ? undefined : meeting.candidateId;
  const hasEmail = Boolean(candidate?.email);

  const handleSend = async () => {
    setIsSending(true);
    try {
      const response: any = await api.post(`/meetings/${meeting._id}/send-invitation`);
      const provider = response.data?.provider || response.provider;
      toast.success(
        provider === 'smtp'
          ? `Interview invitation emailed to ${candidate?.email}.`
          : 'Interview invitation added to the virtual outbox (mock email mode).'
      );
      onSent?.();
    } catch (error: unknown) {
      toast.error(
        `Could not send interview invitation: ${
          error instanceof Error ? error.message : 'Please try again.'
        }`
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-1">
      <Button
        size="sm"
        variant={isSent ? 'outline' : 'primary'}
        isLoading={isSending}
        disabled={!hasEmail || isSent || meeting.invitationStatus === 'sending'}
        onClick={handleSend}
      >
        {isSent ? (
          <>
            <Mail className="w-3.5 h-3.5 mr-1" /> Invite Sent
          </>
        ) : (
          <>
            <Send className="w-3.5 h-3.5 mr-1" /> Send Interview Invite
          </>
        )}
      </Button>
      {!candidate && <p className="text-[11px] text-slate-500">Loading candidate details...</p>}
      {candidate && !hasEmail && <p className="text-[11px] text-rose-600">Candidate has no email address.</p>}
      {meeting.invitationStatus === 'failed' && meeting.invitationError && (
        <p className="text-[11px] text-rose-600">{meeting.invitationError}</p>
      )}
      {isSent && meeting.invitationSentAt && (
        <p className="text-[11px] text-slate-500">
          Sent {new Date(meeting.invitationSentAt).toLocaleString()}
        </p>
      )}
    </div>
  );
};
