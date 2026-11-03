import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../common/Button';
import { Check, Edit3, Briefcase, MapPin, Award } from 'lucide-react';
import { api } from '../../services/api';
import { useJob } from '../../context/JobContext';

interface JobConfirmCardProps {
  draft: {
    title: string;
    description: string;
    mustHaveSkills: string[];
    niceToHaveSkills?: string[];
    seniority?: string;
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

  const [title, setTitle] = useState(draft.title || '');
  const [location, setLocation] = useState(draft.location || 'Remote');
  const [seniority, setSeniority] = useState(draft.seniority || 'Senior');
  const [skills, setSkills] = useState(draft.mustHaveSkills.join(', '));

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      const res: any = await api.post('/jobs', {
        title,
        description: draft.description || title,
        mustHaveSkills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        niceToHaveSkills: draft.niceToHaveSkills || [],
        seniority,
        location,
        salaryRange: draft.salaryRange,
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
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 my-2 flex items-center gap-2.5 text-xs text-emerald-800">
        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
          <Check className="w-3 h-3" />
        </div>
        <div>
          <span className="font-semibold">Job Confirmed:</span> "{title}" is now active and ready for candidate sourcing.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 my-2.5 shadow-sm space-y-3 max-w-lg">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Review Job Requirements
          </span>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
        >
          <Edit3 className="w-3 h-3" />
          {isEditing ? 'Cancel Edit' : 'Edit'}
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-2.5 text-xs">
          <div>
            <label className="font-medium text-slate-700">Job Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1 px-2.5 py-1.5 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-medium text-slate-700">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full mt-1 px-2.5 py-1.5 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="font-medium text-slate-700">Seniority</label>
              <input
                type="text"
                value={seniority}
                onChange={(e) => setSeniority(e.target.value)}
                className="w-full mt-1 px-2.5 py-1.5 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="font-medium text-slate-700">Must-Have Skills (comma-separated)</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full mt-1 px-2.5 py-1.5 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2 text-xs">
          <div className="font-semibold text-slate-900 text-sm">{title}</div>
          <div className="flex flex-wrap gap-3 text-slate-600">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {location}
            </span>
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-slate-400" /> {seniority}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Key Skills: </span>
            <span className="text-slate-700 font-medium">{skills}</span>
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
        <Button size="sm" variant="primary" isLoading={isSaving} onClick={handleConfirm}>
          <Check className="w-3.5 h-3.5 mr-1" /> Confirm & Create Job
        </Button>
      </div>
    </div>
  );
};

