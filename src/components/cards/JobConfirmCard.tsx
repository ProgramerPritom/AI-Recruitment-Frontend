import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../common/Button';
import {
  Check,
  Edit3,
  Briefcase,
  MapPin,
  Award,
  Clock,
  DollarSign,
  ListChecks,
  GraduationCap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { api } from '../../services/api';
import { useJob } from '../../context/JobContext';

interface JobConfirmCardProps {
  draft: {
    title: string;
    description: string;
    mustHaveSkills: string[];
    niceToHaveSkills?: string[];
    seniority?: string;
    experience?: string;
    minExperienceYears?: number;
    responsibilities?: string[];
    qualifications?: string[];
    location?: string;
    salaryRange?: { min?: number; max?: number; currency?: string };
    remotePolicy?: string;
  };
  onConfirmed?: (job: any) => void;
}

export const JobConfirmCard: React.FC<JobConfirmCardProps> = ({ draft, onConfirmed }) => {
  const { refreshJobs, selectJob } = useJob();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(true);

  // Editable state
  const [title, setTitle] = useState(draft.title || 'Senior Software Engineer');
  const [location, setLocation] = useState(draft.location || 'Remote');
  const [seniority, setSeniority] = useState(draft.seniority || 'Senior');
  const [experience, setExperience] = useState(
    draft.experience || (draft.minExperienceYears ? `${draft.minExperienceYears}+ years` : '5+ years')
  );
  const [mustHaveSkills, setMustHaveSkills] = useState(
    Array.isArray(draft.mustHaveSkills) ? draft.mustHaveSkills.join(', ') : 'Python, PyTorch, RAG'
  );
  const [niceToHaveSkills, setNiceToHaveSkills] = useState(
    Array.isArray(draft.niceToHaveSkills) ? draft.niceToHaveSkills.join(', ') : 'Docker, AWS, FastAPI'
  );
  const [description, setDescription] = useState(draft.description || '');
  const [responsibilities, setResponsibilities] = useState(
    Array.isArray(draft.responsibilities) && draft.responsibilities.length > 0
      ? draft.responsibilities.join('\n')
      : 'Architect and build production AI agents\nImplement high-performance RAG pipelines\nOptimize models and integrate with backend services'
  );
  const [qualifications, setQualifications] = useState(
    Array.isArray(draft.qualifications) && draft.qualifications.length > 0
      ? draft.qualifications.join('\n')
      : '5+ years of software engineering or ML experience\nDeep proficiency in Python, PyTorch, and LLM frameworks\nStrong background in production system design and testing'
  );
  const [salaryMin, setSalaryMin] = useState<number | undefined>(draft.salaryRange?.min || 120000);
  const [salaryMax, setSalaryMax] = useState<number | undefined>(draft.salaryRange?.max || 180000);

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      const parsedMustHave = mustHaveSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const parsedNiceToHave = niceToHaveSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const parsedResp = responsibilities
        .split('\n')
        .map((s) => s.trim().replace(/^[-*•]\s*/, ''))
        .filter(Boolean);
      const parsedQual = qualifications
        .split('\n')
        .map((s) => s.trim().replace(/^[-*•]\s*/, ''))
        .filter(Boolean);

      const expNum = parseInt(experience.match(/\d+/)?.[0] || '5', 10);

      const res: any = await api.post('/jobs', {
        title,
        description: description || title,
        mustHaveSkills: parsedMustHave.length > 0 ? parsedMustHave : ['TypeScript'],
        niceToHaveSkills: parsedNiceToHave,
        seniority,
        experience,
        minExperienceYears: expNum,
        responsibilities: parsedResp,
        qualifications: parsedQual,
        location,
        salaryRange:
          salaryMin || salaryMax
            ? { min: salaryMin, max: salaryMax, currency: draft.salaryRange?.currency || 'USD' }
            : undefined,
        remotePolicy: draft.remotePolicy || 'Remote',
      });

      setIsConfirmed(true);
      toast.success(`Job "${title}" successfully created and activated!`);
      refreshJobs();
      if (res.data?._id) {
        selectJob(res.data._id);
      }
      if (onConfirmed) onConfirmed(res.data);
    } catch (err: any) {
      toast.error(`Failed to save job: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isConfirmed) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 my-2.5 flex items-center gap-3 text-xs text-emerald-800 shadow-xs">
        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
          <Check className="w-3.5 h-3.5" />
        </div>
        <div>
          <span className="font-semibold text-emerald-900">Job Active:</span> "{title}" ({experience}) is now persisted and selected in your recruitment workspace.
        </div>
      </div>
    );
  }

  const parsedMustHaveList = mustHaveSkills.split(',').map((s) => s.trim()).filter(Boolean);
  const parsedNiceToList = niceToHaveSkills.split(',').map((s) => s.trim()).filter(Boolean);
  const parsedRespList = responsibilities.split('\n').map((s) => s.trim().replace(/^[-*•]\s*/, '')).filter(Boolean);
  const parsedQualList = qualifications.split('\n').map((s) => s.trim().replace(/^[-*•]\s*/, '')).filter(Boolean);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 my-2.5 shadow-sm space-y-3 max-w-xl text-xs">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Briefcase className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            AI Extracted Requirements
            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-700 text-[10px] rounded font-medium">Ready</span>
          </span>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
        >
          <Edit3 className="w-3 h-3" />
          {isEditing ? 'Cancel Edit' : 'Edit Details'}
        </button>
      </div>

      {isEditing ? (
        /* Edit Mode Form */
        <div className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700">Job Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-semibold text-slate-700">Seniority</label>
              <input
                type="text"
                value={seniority}
                onChange={(e) => setSeniority(e.target.value)}
                className="w-full mt-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Experience</label>
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g. 5+ years"
                className="w-full mt-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full mt-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700">Must-Have Skills (comma-separated)</label>
            <input
              type="text"
              value={mustHaveSkills}
              onChange={(e) => setMustHaveSkills(e.target.value)}
              className="w-full mt-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700">Nice-to-Have Skills (comma-separated)</label>
            <input
              type="text"
              value={niceToHaveSkills}
              onChange={(e) => setNiceToHaveSkills(e.target.value)}
              className="w-full mt-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700">Key Responsibilities (one per line)</label>
            <textarea
              rows={3}
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              className="w-full mt-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs leading-relaxed"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700">Qualifications & Criteria (one per line)</label>
            <textarea
              rows={3}
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
              className="w-full mt-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-slate-700">Min Salary (USD/yr)</label>
              <input
                type="number"
                value={salaryMin || ''}
                onChange={(e) => setSalaryMin(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full mt-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Max Salary (USD/yr)</label>
              <input
                type="number"
                value={salaryMax || ''}
                onChange={(e) => setSalaryMax(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full mt-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      ) : (
        /* View Mode (Rich ATS Job Card) */
        <div className="space-y-3">
          {/* Title and Key Badges */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium text-[11px] border border-indigo-100">
                <Award className="w-3 h-3" /> {seniority}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-medium text-[11px] border border-amber-100">
                <Clock className="w-3 h-3" /> {experience}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                <MapPin className="w-3 h-3" /> {location}
              </span>
              {salaryMin && salaryMax && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium text-[11px] border border-emerald-100">
                  <DollarSign className="w-3 h-3" /> ${Math.round(salaryMin / 1000)}k - ${Math.round(salaryMax / 1000)}k
                </span>
              )}
            </div>
          </div>

          {/* Description / Mission summary */}
          {description && (
            <p className="text-slate-600 text-xs leading-relaxed italic border-l-2 border-indigo-200 pl-2.5 py-0.5">
              "{description}"
            </p>
          )}

          {/* Must-Have Skills */}
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Must-Have Skills
            </div>
            <div className="flex flex-wrap gap-1.5">
              {parsedMustHaveList.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-medium text-[11px] shadow-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Nice-to-Have Skills */}
          {parsedNiceToList.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Nice-to-Have / Preferred
              </div>
              <div className="flex flex-wrap gap-1.5">
                {parsedNiceToList.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Toggle for Detailed Responsibilities & Qualifications */}
          <div className="pt-1">
            <button
              onClick={() => setShowFullDetails(!showFullDetails)}
              className="text-[11px] text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 transition"
            >
              {showFullDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {showFullDetails ? 'Hide Responsibilities & Criteria' : 'Show Responsibilities & Criteria'}
            </button>

            {showFullDetails && (
              <div className="mt-2.5 space-y-2.5 bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                {/* Responsibilities */}
                {parsedRespList.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 mb-1">
                      <ListChecks className="w-3.5 h-3.5 text-indigo-600" /> Key Responsibilities:
                    </div>
                    <ul className="space-y-1 pl-4 list-disc text-slate-600 text-[11px]">
                      {parsedRespList.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Qualifications */}
                {parsedQualList.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 mb-1">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-600" /> Requirements & Qualifications:
                    </div>
                    <ul className="space-y-1 pl-4 list-disc text-slate-600 text-[11px]">
                      {parsedQualList.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Action Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          Requires recruiter confirmation before pipeline activation.
        </span>
        <Button size="sm" variant="primary" isLoading={isSaving} onClick={handleConfirm}>
          <Check className="w-3.5 h-3.5 mr-1" /> Confirm & Create Job
        </Button>
      </div>
    </div>
  );
};
