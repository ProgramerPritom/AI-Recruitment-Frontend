import React, { useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import { ChatMessageItem } from './ChatMessageItem';
import { ChatInput } from './ChatInput';
import { Bot, Trash2, Sparkles, Plus } from 'lucide-react';
import { useJob } from '../../context/JobContext';

export const ChatContainer: React.FC = () => {
  const { messages, isLoading, sendMessage, startNewSession, deleteSession } = useChat();
  const { activeJob } = useJob();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleDeleteSession = () => {
    if (window.confirm('Are you sure you want to delete this session and all its messages from the database?')) {
      deleteSession();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Chat Copilot Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-semibold text-slate-900">AI Recruiting Co-Worker</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-500">
              {activeJob ? `Co-working on: ${activeJob.title}` : 'Ready for instruction'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={startNewSession}
            className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 rounded-lg transition flex items-center gap-1 shadow-xs"
            title="Start a new chat session"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[11px] font-medium hidden sm:inline">New Session</span>
          </button>

          {messages.length > 0 && (
            <button
              onClick={handleDeleteSession}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition text-xs flex items-center gap-1"
              title="Delete this session from database"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium hidden sm:inline">Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="max-w-xs space-y-1">
              <h3 className="text-sm font-semibold text-slate-800">Recruitment Assistant</h3>
              <p className="text-xs text-slate-500">
                You can instruct me to extract requirements from a JD, source candidates, review scores, draft campaigns, and book interviews.
              </p>
            </div>
            <div className="pt-2 text-[11px] text-slate-400">
              Try typing: <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">Source candidates</span> or click a suggestion below.
            </div>
          </div>
        ) : (
          messages.map((msg, index) => <ChatMessageItem key={msg._id || index} message={msg} />)
        )}

        {/* ChatGPT / Claude style typing indicator */}
        {isLoading && (
          <div className="flex gap-3 my-3 justify-start items-center">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-2.5 shadow-sm flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
              </div>
              <span className="text-[11px] font-medium text-slate-400">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
    </div>
  );
};

