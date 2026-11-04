import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  Upload,
  FileSpreadsheet,
  Check,
  AlertCircle,
  Download,
  FileText,
  Briefcase,
  Sparkles,
  UserCheck,
  Database,
  Award,
} from 'lucide-react';
import { api } from '../../services/api';
import { useQueryClient } from '@tanstack/react-query';

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle?: string;
}

const SAMPLE_RAW_CV = `Tanvir Ahmed
Email: tanvir.ahmed.dev@gmail.com
LinkedIn: https://linkedin.com/in/tanvir-ahmed-mern
Location: Remote / Dhaka

Summary:
Results-driven Senior Full-Stack Engineer with 7+ years of experience specializing in high-scale web applications, MERN stack, and applied AI systems. Proven track record architecting distributed cloud backends and responsive React frontends.

Technical Skills:
- Frontend: React, Next.js, TypeScript, Tailwind CSS, Redux Toolkit
- Backend: Node.js, Express, MongoDB, RESTful APIs, Redis, BullMQ
- AI & Data: Python, PyTorch, RAG Pipelines, LangChain, OpenAI & Gemini APIs
- DevOps: Docker, AWS (ECS, S3), CI/CD, Git

Professional Experience:
- Lead Software Engineer at CloudTech (2021 - Present): Designed scalable microservices in Node.js and MongoDB handling 2M+ requests/day. Integrated AI-driven document analysis pipelines.
- Senior Full-Stack Developer at TechCraft (2018 - 2021): Built enterprise SaaS dashboards using React and Express.`;

export const CsvUploadModal: React.FC<CsvUploadModalProps> = ({ isOpen, onClose, jobId, jobTitle }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab State: 'file' | 'paste'
  const [activeTab, setActiveTab] = useState<'file' | 'paste'>('file');

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileResult, setFileResult] = useState<any>(null);
  const [fileErrorMsg, setFileErrorMsg] = useState<string | null>(null);

  // Raw CV Paste State
  const [cvText, setCvText] = useState('');
  const [isParsingCv, setIsParsingCv] = useState(false);
  const [parsedCandidateResult, setParsedCandidateResult] = useState<any>(null);
  const [cvErrorMsg, setCvErrorMsg] = useState<string | null>(null);

  const handleDownloadSample = () => {
    const csvContent =
      'name,email,profileUrl,skills,experienceSummary\n' +
      'Tanvir Ahmed,tanvir.dev@gmail.com,https://linkedin.com/in/tanvir-ahmed,"React, Node.js, MongoDB, Express, TypeScript, Python",7 years MERN stack and AI engineering experience\n' +
      'Sohanur Rahman,sohanur.dev@gmail.com,https://linkedin.com/in/sohanur-rahman,"React, TypeScript, Redux, Next.js, Node.js",6 years senior frontend and full stack developer\n' +
      'Tariqul Islam,tariqul.ai@gmail.com,https://linkedin.com/in/tariqul-islam,"Python, PyTorch, FastAPI, Docker, LangChain",5 years AI machine learning and backend development';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'aironauts_candidates_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setFileErrorMsg(null);
      setFileResult(null);
    }
  };

  // Upload File handler
  const handleUploadFile = async () => {
    if (!selectedFile || !jobId) return;

    setIsUploading(true);
    setFileErrorMsg(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res: any = await api.post(`/jobs/${jobId}/candidates/import`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFileResult(res.data?.data || res.data);
      queryClient.invalidateQueries({ queryKey: ['candidates', jobId] });
      queryClient.invalidateQueries({ queryKey: ['stats', jobId] });
      queryClient.invalidateQueries({ queryKey: ['activities', jobId] });
    } catch (err: any) {
      setFileErrorMsg(err.response?.data?.message || err.message || 'File import failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Paste Raw CV handler
  const handleParseCv = async () => {
    if (!cvText.trim() || !jobId) return;

    setIsParsingCv(true);
    setCvErrorMsg(null);

    try {
      const res: any = await api.post(`/jobs/${jobId}/candidates/parse-cv`, {
        rawCvText: cvText.trim(),
      });

      setParsedCandidateResult(res.data?.data || res.data);
      queryClient.invalidateQueries({ queryKey: ['candidates', jobId] });
      queryClient.invalidateQueries({ queryKey: ['stats', jobId] });
      queryClient.invalidateQueries({ queryKey: ['activities', jobId] });
    } catch (err: any) {
      setCvErrorMsg(err.response?.data?.message || err.message || 'CV extraction failed');
    } finally {
      setIsParsingCv(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setFileResult(null);
    setFileErrorMsg(null);
    setCvText('');
    setParsedCandidateResult(null);
    setCvErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Candidate CVs & Resumes" maxWidth="lg">
      <div className="space-y-4 text-xs">
        {/* Active Target Job Indicator */}
        <div className="flex items-center justify-between p-2.5 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-900">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              Target Job: <strong className="font-semibold text-indigo-950">{jobTitle || 'Active Job'}</strong>
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-white/70 px-2 py-0.5 rounded border border-indigo-100">
            <Database className="w-3 h-3 text-indigo-500" /> Auto AI Scoring + MongoDB
          </span>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`pb-2 px-3 font-semibold text-xs transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'file'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload File (CSV / Resumes)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`pb-2 px-3 font-semibold text-xs transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'paste'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Paste Raw CV / Resume (AI Extractor)
          </button>
        </div>

        {/* TAB 1: File Upload */}
        {activeTab === 'file' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-600 text-[11px]">
              <span>Supports CSV with applicant details or raw resume text columns. AI extracts skills & scores match.</span>
              <button
                type="button"
                onClick={handleDownloadSample}
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-semibold shrink-0 ml-2"
              >
                <Download className="w-3.5 h-3.5" /> Sample CSV
              </button>
            </div>

            {!fileResult && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                  selectedFile
                    ? 'border-indigo-400 bg-indigo-50/20'
                    : 'border-slate-300 hover:border-slate-400 bg-white'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-600 mb-2">
                  {selectedFile ? <FileSpreadsheet className="w-5 h-5 text-indigo-600" /> : <Upload className="w-5 h-5" />}
                </div>
                {selectedFile ? (
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{selectedFile.name}</p>
                    <p className="text-[11px] text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Click to browse or drop CSV / Candidate file</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Automatic column detection & deduplication</p>
                  </div>
                )}
              </div>
            )}

            {fileErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{fileErrorMsg}</span>
              </div>
            )}

            {fileResult && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>File Processed & Candidates Saved to MongoDB</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500">Imported & AI Scored</span>
                    <p className="text-lg font-bold text-emerald-600">{fileResult.importedCount || 0}</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500">Duplicates Skipped</span>
                    <p className="text-lg font-bold text-amber-600">{fileResult.duplicateCount || 0}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Paste Raw CV */}
        {activeTab === 'paste' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span>Paste an applicant's raw CV or bio. AI will parse credentials, evaluate against requirements, and persist to database.</span>
              <button
                type="button"
                onClick={() => setCvText(SAMPLE_RAW_CV)}
                className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 shrink-0 ml-2"
              >
                <FileText className="w-3 h-3" /> Load Sample CV
              </button>
            </div>

            {!parsedCandidateResult ? (
              <div className="space-y-2">
                <textarea
                  rows={8}
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder="Paste candidate resume / CV text here (Name, Email, Skills, Experience)..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono leading-relaxed bg-white"
                />
              </div>
            ) : (
              /* Parsed Candidate Success Card */
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">
                        {parsedCandidateResult.candidate?.name || 'Applicant Candidate'}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {parsedCandidateResult.candidate?.email || 'Email captured'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      Match Score: {parsedCandidateResult.score}%
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-emerald-100 space-y-2">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-700">Extracted Skills:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(parsedCandidateResult.candidate?.skills || []).map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-semibold"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-700">AI Score Rationale:</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                      {parsedCandidateResult.scoreReason || 'Evaluated against job requirements.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {cvErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{cvErrorMsg}</span>
              </div>
            )}
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          {(fileResult || parsedCandidateResult) ? (
            <>
              <Button variant="outline" size="sm" onClick={handleReset}>
                Import Another Candidate
              </Button>
              <Button variant="primary" size="sm" onClick={onClose}>
                Done & View in Pipeline
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              {activeTab === 'file' ? (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!selectedFile}
                  isLoading={isUploading}
                  onClick={handleUploadFile}
                >
                  <FileText className="w-3.5 h-3.5 mr-1" /> Upload & Parse File
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!cvText.trim()}
                  isLoading={isParsingCv}
                  onClick={handleParseCv}
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-200" /> Extract & Score Candidate
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};
