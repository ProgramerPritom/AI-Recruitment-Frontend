import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '../services/api';
import { TaskProgress } from '../types';

interface SseContextType {
  activeTask: TaskProgress | null;
  subscribeToTask: (taskId: string) => void;
  clearTask: () => void;
}

const SseContext = createContext<SseContextType | undefined>(undefined);

export const SseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTask, setActiveTask] = useState<TaskProgress | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const queryClient = useQueryClient();

  const subscribeToTask = (taskId: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const sseUrl = `${api.defaults.baseURL}/tasks/${taskId}/events`;
    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    const refreshTaskQueries = () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaignDeliveries'] });
    };

    es.addEventListener('task.progress', (e) => {
      try {
        const payload: TaskProgress = JSON.parse(e.data);
        setActiveTask(payload);
        if (payload.status === 'completed') refreshTaskQueries();
        if (payload.status === 'failed') {
          toast.error(`Background task failed: ${payload.error || 'Unknown error occurred.'}`);
        }
      } catch {}
    });

    es.addEventListener('task.completed', (e) => {
      try {
        const payload: TaskProgress = JSON.parse(e.data);
        setActiveTask(payload);
        refreshTaskQueries();
      } catch {}
    });

    es.addEventListener('task.failed', (e) => {
      try {
        const payload: TaskProgress = JSON.parse(e.data);
        setActiveTask(payload);
        toast.error(`Background task failed: ${payload.error || 'Unknown error occurred.'}`);
        refreshTaskQueries();
      } catch {}
    });

    es.onerror = () => {
      // Reconnection handled natively by browser EventSource
    };
  };

  const clearTask = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setActiveTask(null);
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <SseContext.Provider value={{ activeTask, subscribeToTask, clearTask }}>
      {children}
    </SseContext.Provider>
  );
};

export const useSse = (): SseContextType => {
  const context = useContext(SseContext);
  if (!context) {
    throw new Error('useSse must be used within an SseProvider');
  }
  return context;
};
