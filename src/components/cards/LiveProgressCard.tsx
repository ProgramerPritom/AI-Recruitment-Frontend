import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle, AlertCircle, RefreshCw, UserCheck } from 'lucide-react';
import { api } from '../../services/api';
import { useJob } from '../../context/JobContext';
import { useQueryClient } from '@tanstack/react-query';

interface LiveProgressCardProps {
  taskId: string;
  initialType?: string;
  onFinished?: () => void;
}

export const LiveProgressCard: React.FC<LiveProgressCardProps> = ({ taskId, onFinished }) => {
  const { activeJobId } = useJob();
  const queryClient = useQueryClient();
  const [task, setTask] = useState<any>(null);
  const [status, setStatus] = useState<'running' | 'completed' | 'failed'>('running');

  useEffect(() => {
    let isMounted = true;
    let eventSource: EventSource | null = null;
    let pollInterval: any = null;

    const refreshData = () => {
      queryClient.invalidateQueries({ queryKey: ['candidates', activeJobId] });
      queryClient.invalidateQueries({ queryKey: ['stats', activeJobId] });
      queryClient.invalidateQueries({ queryKey: ['activities', activeJobId] });
    };

    const handleTaskUpdate = (data: any) => {
      if (!isMounted) return;
      setTask(data);
      if (data.status === 'completed') {
        setStatus('completed');
        refreshData();
        if (eventSource) eventSource.close();
        if (pollInterval) clearInterval(pollInterval);
        if (onFinished) onFinished();
      } else if (data.status === 'failed') {
        setStatus('failed');
        if (eventSource) eventSource.close();
        if (pollInterval) clearInterval(pollInterval);
      }
    };

    // 1. Try Server-Sent Events
    try {
      const sseUrl = `${api.defaults.baseURL || 'http://localhost:5000/api'}/tasks/${taskId}/events`;
      eventSource = new EventSource(sseUrl);

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          handleTaskUpdate(parsed);
        } catch {
          // ignore parse errors
        }
      };

      eventSource.onerror = () => {
        if (eventSource) eventSource.close();
      };
    } catch {
      // fallback to polling below
    }

    // 2. Resilient Polling Fallback (ensures progress updates even if SSE disconnects)
    const poll = async () => {
      try {
        const res = await api.get(`/tasks/${taskId}`);
        if (res.data) {
          handleTaskUpdate(res.data);
        }
      } catch {
        // ignore network error
      }
    };

    poll();
    pollInterval = setInterval(poll, 1500);

    return () => {
      isMounted = false;
      if (eventSource) eventSource.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [taskId, activeJobId, onFinished, queryClient]);

  const progressPercent = task?.progress ?? (status === 'completed' ? 100 : 25);
  const phaseLabel = task?.phase || (status === 'completed' ? 'Finished successfully' : 'Processing...');
  const processed = task?.processedCount ?? 0;
  const total = task?.totalCount ?? 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 my-2.5 shadow-sm max-w-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status === 'running' && <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />}
          {status === 'completed' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
          {status === 'failed' && <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            {task?.type === 'outreach' ? 'Outreach Dispatch' : 'Background Sourcing & Scoring'}
          </span>
        </div>
        <span className="text-xs font-medium text-slate-500">
          {progressPercent}%
        </span>
      </div>

      <div>
        <div className="flex justify-between text-xs text-slate-600 mb-1.5">
          <span className="capitalize">{phaseLabel}</span>
          {total > 0 && (
            <span className="font-medium text-slate-700">
              {processed} of {total} items
            </span>
          )}
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              status === 'completed'
                ? 'bg-emerald-500'
                : status === 'failed'
                ? 'bg-rose-500'
                : 'bg-indigo-600'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {status === 'completed' && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Task completed. Pipeline records updated.</span>
          </div>
          <button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['candidates', activeJobId] });
            }}
            className="flex items-center gap-1 text-emerald-700 font-semibold hover:underline"
          >
            <RefreshCw className="w-3 h-3" /> Refresh View
          </button>
        </div>
      )}

      {status === 'failed' && (
        <div className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
          Task encountered an error: {task?.error || 'Unknown error occurred'}
        </div>
      )}
    </div>
  );
};

