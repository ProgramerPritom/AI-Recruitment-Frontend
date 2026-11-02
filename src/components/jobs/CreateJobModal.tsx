import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Sparkles, FileText } from 'lucide-react';
import { api } from '../../services/api';
import { JobConfirmCard } from '../cards/JobConfirmCard';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated?: (job: any) => void;
}

const SAMPLE_JD = `Role: Senior Backend Engineer (Distributed Systems)
Location: Remote (US / EMEA)
Experience: 5+ years
We are looking for a Senior Backend Engineer to architect, build, and scale high-throughput event-driven microservices.
Requirements:
- Strong proficiency in Node.js, TypeScript, and Go.
- Hands-on experience with Redis, BullMQ, Kafka, or RabbitMQ for asynchronous background queues.
- Deep expertise in MongoDB and PostgreSQL schema modeling and indexing.
- Experience with Docker, Kubernetes, and CI/CD pipelines.
Nice to have:
- Experience with LLM integrations (Gemini, OpenAI) and tool calling.`;

export const CreateJobModal: React.FC<CreateJobModalProps> = ({ isOpen, onClose, onJobCreated }) => {
  const [content, setContent] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedDraft, setExtractedDraft] = useState<any>(null);

  const handleExtract = async () => {
    if (!content.trim()) return;
    setIsExtracting(true);
    try {
      const res: any = await api.post('/jobs/extract', {
        content: content.trim(),
        isUrl: content.trim().startsWith('http'),
      });
      setExtractedDraft(res.data?.data || res.data);
    } catch (err: any) {
      alert(`Job extraction failed: ${err.message}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleConfirmed = (createdJob: any) => {
    setExtractedDraft(null);
    setContent('');
    if (onJobCreated) onJobCreated(createdJob);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Job Requirement" maxWidth="lg">
      {!extractedDraft ? (
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Paste a Job Description (or JD URL) below. The AI recruitment engine will parse the title, seniority, location, and must-have skills for your review before saving.
          </p>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-700">Job Description Text</label>
              <button
                type="button"
                onClick={() => setContent(SAMPLE_JD)}
                className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                <FileText className="w-3 h-3" /> Load Sample JD
              </button>
            </div>
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste job description text here..."
              className="w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!content.trim()}
              isLoading={isExtracting}
              onClick={handleExtract}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" /> Extract Requirements with AI
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <JobConfirmCard draft={extractedDraft} onConfirmed={handleConfirmed} />
        </div>
      )}
    </Modal>
  );
};

