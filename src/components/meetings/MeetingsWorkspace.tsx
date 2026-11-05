import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, Mail } from 'lucide-react';
import { useJob } from '../../context/JobContext';
import { api } from '../../services/api';
import { Meeting } from '../../types';
import { MeetingInviteAction } from './MeetingInviteAction';

export const MeetingsWorkspace: React.FC = () => {
  const { activeJobId, activeJob } = useJob();
  const queryClient = useQueryClient();
  const { data: meetings = [], isLoading, isError, error } = useQuery<Meeting[]>({
    queryKey: ['meetings', activeJobId],
    queryFn: async () => {
      if (!activeJobId) return [];
      const response: any = await api.get(`/jobs/${activeJobId}/meetings`);
      return response.data?.data || response.data || [];
    },
    enabled: Boolean(activeJobId),
  });

  if (!activeJobId) {
    return <p className="p-6 text-center text-xs text-slate-500">Select a job to view its meetings.</p>;
  }

  return (
    <div className="flex h-full flex-col space-y-4 bg-slate-50 p-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">Scheduled Meetings</h2>
        <p className="mt-1 text-xs text-slate-500">
          {activeJob?.title} · {meetings.length} saved interview{meetings.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <p className="p-8 text-center text-xs text-slate-500">Loading saved meetings...</p>
        ) : isError ? (
          <p className="p-8 text-center text-xs text-rose-600">
            Could not load meetings: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        ) : meetings.length === 0 ? (
          <div className="p-10 text-center">
            <Calendar className="mx-auto h-7 w-7 text-slate-300" />
            <p className="mt-2 text-sm font-medium text-slate-700">No meetings scheduled yet</p>
            <p className="mt-1 text-xs text-slate-500">
              Confirm an interview slot from a candidate profile; it will be saved here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {meetings.map((meeting) => (
              <article key={meeting._id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {typeof meeting.candidateId === 'string' ? 'Candidate' : meeting.candidateId.name}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-600">
                    {typeof meeting.candidateId === 'string'
                      ? 'Candidate details unavailable'
                      : meeting.candidateId.email || 'No email address'}
                  </p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-indigo-700">
                    <Calendar className="h-3.5 w-3.5" /> {meeting.slotTime}
                  </p>
                  {meeting.notes && <p className="mt-1 text-xs text-slate-500">{meeting.notes}</p>}
                </div>
                <div className="shrink-0">
                  <MeetingInviteAction
                    meeting={meeting}
                    onSent={() => queryClient.invalidateQueries({ queryKey: ['meetings', activeJobId] })}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <p className="flex items-start gap-2 text-[11px] text-slate-500">
        <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Email uses the backend provider: configure SMTP to email candidates, or use mock mode to test in the virtual outbox.
      </p>
    </div>
  );
};
