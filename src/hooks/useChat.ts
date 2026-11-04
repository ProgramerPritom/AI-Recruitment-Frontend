import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { ChatMessage } from '../types';
import { useJob } from '../context/JobContext';
import { useQueryClient } from '@tanstack/react-query';

const SESSION_STORAGE_KEY = 'aironauts_chat_session_id';

export const useChat = () => {
  const { activeJobId } = useJob();
  const queryClient = useQueryClient();

  const [sessionId, setSessionId] = useState<string>(() => {
    let stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) {
      stored = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(SESSION_STORAGE_KEY, stored);
    }
    return stored;
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load history on mount or when activeJobId changes
  const loadHistory = useCallback(async () => {
    try {
      const res = await api.get<ChatMessage[]>(`/chat/history/${sessionId}`);
      if (Array.isArray(res.data)) {
        setMessages(res.data);
      }
    } catch {
      // If no history exists yet, keep empty array
    }
  }, [sessionId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      sessionId,
      jobId: activeJobId || undefined,
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res: any = await api.post('/chat/message', {
        sessionId,
        message: content.trim(),
        jobId: activeJobId || undefined,
      });

      const assistantMsg: ChatMessage = {
        sessionId,
        jobId: activeJobId || undefined,
        role: 'assistant',
        content: res.data?.message || 'Done.',
        cardPayload: res.data?.cardPayload,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Invalidate relevant query caches so the workspace updates instantly
      queryClient.invalidateQueries({ queryKey: ['candidates', activeJobId] });
      queryClient.invalidateQueries({ queryKey: ['stats', activeJobId] });
      queryClient.invalidateQueries({ queryKey: ['activities', activeJobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        sessionId,
        jobId: activeJobId || undefined,
        role: 'assistant',
        content: `Sorry, I encountered an issue processing that: ${err.response?.data?.message || err.message}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewSession = useCallback(() => {
    const newId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(SESSION_STORAGE_KEY, newId);
    setSessionId(newId);
    setMessages([]);
  }, []);

  const deleteSession = useCallback(async () => {
    try {
      await api.delete(`/chat/history/${sessionId}`);
    } catch (err) {
      console.warn('Failed to delete session on backend:', err);
    }
    const newId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(SESSION_STORAGE_KEY, newId);
    setSessionId(newId);
    setMessages([]);
  }, [sessionId]);

  const clearChat = deleteSession;

  return {
    sessionId,
    messages,
    isLoading,
    sendMessage,
    clearChat,
    startNewSession,
    deleteSession,
    reloadHistory: loadHistory,
  };
};

