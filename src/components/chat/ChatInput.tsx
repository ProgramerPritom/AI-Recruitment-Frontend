import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const ACTION_CHIPS = [
  'Source candidates',
  'Score candidates',
  'Accept top 3 candidates',
  'Draft outreach campaign',
  'Show hiring stats',
];

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, disabled = false }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || isLoading || disabled) return;
    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChipClick = (prompt: string) => {
    if (isLoading || disabled) return;
    onSendMessage(prompt);
  };

  return (
    <div className="border-t border-slate-200 bg-white p-3 space-y-2.5">
      {/* Quick Action Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
        {ACTION_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            disabled={isLoading || disabled}
            onClick={() => handleChipClick(chip)}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input box */}
      <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          disabled={disabled || isLoading}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled
              ? 'Select or create a job to begin...'
              : 'Ask recruiter co-worker or give instruction (e.g. "Source candidates")...'
          }
          className="w-full resize-none rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400 max-h-32"
        />

        <button
          type="submit"
          disabled={!text.trim() || isLoading || disabled}
          className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 hover:bg-indigo-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed shadow-sm"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

