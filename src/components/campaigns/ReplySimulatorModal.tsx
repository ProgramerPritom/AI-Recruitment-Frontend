import React, { useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Candidate } from '../../types';
import { MessageSquare, Sparkles, Send, Check, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import { useQueryClient } from '@tanstack/react-query';
import { MeetingSlotCard } from '../cards/MeetingSlotCard';

interface ReplySimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: Candidate[];
  jobId: string;
}

const SAMPLE_REPLIES = [
  {
    label: 'Interested in Role',
    text: "Hi, thanks for reaching out! The role sounds like a great match for my experience. I'd love to learn more.",
  },
  {
    label: 'Wants a Meeting',
    text: 'Hello, I reviewed the opportunity and would like to schedule a quick 15-minute call this week.',
  },
  {
    label: 'Question on Compensation',
    text: 'Hi there, could you share the salary range and remote flexibility for this position before we talk?',
  },
  {
    label: 'Not Interested',
    text: 'Thank you for contacting me, but I am very happy at my current company and not looking to make a move.',
  },
  {
    label: 'Unsubscribe',
    text: 'Please remove me from your candidate outreach list and do not contact me again.',
  },
];

export const ReplySimulatorModal: React.FC<ReplySimulatorModalProps> = ({
  isOpen,
  onClose,
  candidates,
  jobId,
}) => {
  const queryClient = useQueryClient();
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(
    candidates[0]?._id || ''
  );
  const [replyText, setReplyText] = useState(SAMPLE_REPLIES[0].text);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedResult, setSimulatedResult] = useState<any>(null);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replySentSuccess, setReplySentSuccess] = useState(false);
  const [showCalendarBooking, setShowCalendarBooking] = useState(false);

  const selectedCandidate = candidates.find((c) => c._id === selectedCandidateId) || candidates[0];

  const handleSimulate = async () => {
    if (!selectedCandidateId || !replyText.trim()) return;

    setIsSimulating(true);
    setSimulatedResult(null);
    setReplySentSuccess(false);
    setShowCalendarBooking(false);

    try {
      const res: any = await api.post(`/candidates/${selectedCandidateId}/simulate-reply`, {
        content: replyText.trim(),
      });

      setSimulatedResult(res.data?.data || res.data);
      queryClient.invalidateQueries({ queryKey: ['candidates', jobId] });
      queryClient.invalidateQueries({ queryKey: ['stats', jobId] });
      queryClient.invalidateQueries({ queryKey: ['activities', jobId] });
      toast.success('Candidate reply simulated and classified!');
    } catch (err: any) {
      toast.error(`Simulation failed: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSendResponse = async () => {
    if (!simulatedResult?.reply?._id) return;
    setIsSendingReply(true);
    try {
      await api.post(`/replies/${simulatedResult.reply._id}/send`);
      setReplySentSuccess(true);
      toast.success('Auto-drafted response sent to candidate!');
      queryClient.invalidateQueries({ queryKey: ['candidates', jobId] });
      queryClient.invalidateQueries({ queryKey: ['stats', jobId] });
      queryClient.invalidateQueries({ queryKey: ['activities', jobId] });
    } catch (err: any) {
      toast.error(`Failed to send response: ${err.message}`);
    } finally {
      setIsSendingReply(false);
    }
  };

  const getClassificationBadgeClass = (cls: string) => {
    switch (cls) {
      case 'Interested':
      case 'Wants a meeting':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Question':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Not interested':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'Unsubscribe':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Simulate Candidate Inbound Reply" maxWidth="lg">
      <div className="space-y-4 text-xs">
        {/* Candidate Selector */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Select Candidate</label>
          <select
            value={selectedCandidateId}
            onChange={(e) => setSelectedCandidateId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {candidates.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.email || 'No email'}) - Status: {c.status}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Select Intent Buttons */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1.5">Quick Inbound Intent Templates</label>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_REPLIES.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setReplyText(item.text)}
                className={`px-2.5 py-1 rounded-full border text-[11px] font-medium transition ${
                  replyText === item.text
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reply text input */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Inbound Message Content</label>
          <textarea
            rows={3}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Action Button */}
        {!simulatedResult && (
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSimulating}
              onClick={handleSimulate}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" /> Classify & Generate Co-Worker Response
            </Button>
          </div>
        )}

        {/* Simulation Output */}
        {simulatedResult && (
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Classification Result:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold text-xs border ${getClassificationBadgeClass(
                  simulatedResult.classification
                )}`}
              >
                {simulatedResult.classification}
              </span>
            </div>

            {simulatedResult.responseDraft && (
              <div className="space-y-1.5">
                <span className="font-semibold text-slate-700">AI Suggested Response:</span>
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-slate-800 font-mono text-[11.5px] whitespace-pre-wrap leading-relaxed">
                  {simulatedResult.responseDraft}
                </div>
              </div>
            )}

            {showCalendarBooking && selectedCandidate && (
              <MeetingSlotCard
                candidateId={selectedCandidate._id}
                candidateName={selectedCandidate.name}
                onBooked={() => setShowCalendarBooking(false)}
              />
            )}

            {replySentSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center gap-2 text-xs text-emerald-800">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Response approved and delivered to {selectedCandidate?.name}. Pipeline updated!</span>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                {simulatedResult.classification === 'Wants a meeting' && !showCalendarBooking && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCalendarBooking(true)}
                  >
                    <Calendar className="w-3.5 h-3.5 mr-1" /> Open Meeting Slot Picker
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="primary"
                  isLoading={isSendingReply}
                  onClick={handleSendResponse}
                >
                  <Send className="w-3.5 h-3.5 mr-1" /> Approve & Send Response
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

