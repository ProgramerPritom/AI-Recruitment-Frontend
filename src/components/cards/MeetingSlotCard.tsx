import React, { useState } from 'react';
import { Calendar, Check, Clock } from 'lucide-react';
import { Button } from '../common/Button';
import { api } from '../../services/api';
import { useJob } from '../../context/JobContext';
import { useQueryClient } from '@tanstack/react-query';

interface MeetingSlotCardProps {
  candidateId: string;
  candidateName: string;
  onBooked?: (meeting: any) => void;
}

const DEFAULT_SLOTS = [
  'Tomorrow, 2:00 PM - 2:45 PM EST',
  'Tomorrow, 4:30 PM - 5:15 PM EST',
  'Thursday, 10:00 AM - 10:45 AM EST',
  'Friday, 1:00 PM - 1:45 PM EST',
];

export const MeetingSlotCard: React.FC<MeetingSlotCardProps> = ({
  candidateId,
  candidateName,
  onBooked,
}) => {
  const { activeJobId } = useJob();
  const queryClient = useQueryClient();
  const [selectedSlot, setSelectedSlot] = useState(DEFAULT_SLOTS[0]);
  const [isBooking, setIsBooking] = useState(false);
  const [confirmedSlot, setConfirmedSlot] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsBooking(true);
    try {
      const res = await api.post(`/candidates/${candidateId}/book-meeting`, {
        slotTime: selectedSlot,
        notes: `Initial technical screening booked via AI Co-Worker`,
      });

      setConfirmedSlot(selectedSlot);
      queryClient.invalidateQueries({ queryKey: ['candidates', activeJobId] });
      queryClient.invalidateQueries({ queryKey: ['stats', activeJobId] });
      queryClient.invalidateQueries({ queryKey: ['activities', activeJobId] });
      if (onBooked) onBooked(res.data);
    } catch (err: any) {
      alert(`Meeting booking failed: ${err.message}`);
    } finally {
      setIsBooking(false);
    }
  };

  if (confirmedSlot) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 my-2.5 max-w-lg flex items-center gap-2.5 text-xs text-emerald-800">
        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
          <Check className="w-3 h-3" />
        </div>
        <div>
          <span className="font-semibold">Interview Confirmed:</span> Scheduled with{' '}
          <span className="font-semibold">{candidateName}</span> for{' '}
          <span className="underline">{confirmedSlot}</span>. Candidate moved to{' '}
          <span className="font-semibold">Meeting Booked</span>.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 my-2.5 shadow-sm max-w-lg space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Schedule Technical Screen
          </span>
        </div>
        <span className="text-xs text-slate-500 font-medium">{candidateName}</span>
      </div>

      <p className="text-xs text-slate-600">
        Candidate replied expressing interest in speaking. Select a calendar slot to finalize the interview:
      </p>

      <div className="space-y-1.5">
        {DEFAULT_SLOTS.map((slot) => {
          const isSelected = selectedSlot === slot;
          return (
            <button
              key={slot}
              type="button"
              onClick={() => setSelectedSlot(slot)}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs text-left transition ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-medium'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                {slot}
              </span>
              {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
            </button>
          );
        })}
      </div>

      <div className="pt-2 border-t border-slate-100 flex justify-end">
        <Button size="sm" variant="primary" isLoading={isBooking} onClick={handleConfirm}>
          <Check className="w-3.5 h-3.5 mr-1" /> Confirm Interview Slot
        </Button>
      </div>
    </div>
  );
};

