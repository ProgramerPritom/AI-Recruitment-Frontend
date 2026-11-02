import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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

    const sseUrl = `http://localhost:5000/api/tasks/${taskId}/events`;
    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    es.addEventListener('task.progress', (e) => {
      try {
        const payload: TaskProgress = JSON.parse(e.data);
        setActiveTask(payload);
      } catch {}
    });

    es.addEventListener('task.completed', (e) => {
      try {
        const payload: TaskProgress = JSON.parse(e.data);
        setActiveTask(payload);
        // Invalidate queries so candidate tables and dashboard reflect the new data!
        queryClient.invalidateQueries({ queryKey: ['candidates'] });
        queryClient.invalidateQueries({ queryKey: ['stats'] });
        queryClient.invalidateQueries({ queryKey: ['activities'] });
      } catch {}
    });

    es.addEventListener('task.failed', (e) => {
      try {
        const payload: TaskProgress = JSON.parse(e.data);
        setActiveTask(payload);
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

