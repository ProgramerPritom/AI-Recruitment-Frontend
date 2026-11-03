import React, { useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ConfirmModal } from '../common/ConfirmModal';
import { useJob } from '../../context/JobContext';
import { api } from '../../services/api';
import { Job } from '../../types';
import {
  Briefcase,
  Trash2,
  Edit3,
  Check,
  MapPin,
  Award,
  Clock,
  CheckCircle2,
  X,
  Plus,
} from 'lucide-react';

interface JobManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateJob: () => void;
}

export const JobManagementModal: React.FC<JobManagementModalProps> = ({
  isOpen,
  onClose,
  onOpenCreateJob,
}) => {
  const { jobs, activeJobId, selectJob, refreshJobs } = useJob();

  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSeniority, setEditSeniority] = useState('');
  const [editExperience, setEditExperience] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editSkills, setEditSkills] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete modal state
  const [deleteTargetJob, setDeleteTargetJob] = useState<Job | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const startEditing = (job: Job) => {
    setEditingJobId(job._id);
    setEditTitle(job.title);
    setEditSeniority(job.seniority || 'Senior');
    setEditExperience(job.experience || `${job.minExperienceYears || 5}+ years`);
    setEditLocation(job.location || 'Remote');
    setEditSkills(job.mustHaveSkills.join(', '));
  };

  const cancelEditing = () => {
    setEditingJobId(null);
  };

  const handleSaveEdit = async (jobId: string) => {
    setIsSavingEdit(true);
    try {
      const parsedSkills = editSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const expNum = parseInt(editExperience.match(/\d+/)?.[0] || '5', 10);

      await api.put(`/jobs/${jobId}`, {
        title: editTitle,
        seniority: editSeniority,
        experience: editExperience,
        minExperienceYears: expNum,
        location: editLocation,
        mustHaveSkills: parsedSkills,
      });

      toast.success('Job requisition updated successfully');
      setEditingJobId(null);
      refreshJobs();
    } catch (err: any) {
      toast.error(`Update failed: ${err.message}`);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetJob) return;
    setIsDeleting(true);
    try {
      await api.delete(`/jobs/${deleteTargetJob._id}`);
      toast.success(`Job "${deleteTargetJob.title}" deleted from database`);
      setDeleteTargetJob(null);
      refreshJobs();
    } catch (err: any) {
      toast.error(`Failed to delete job: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Manage Job Requisitions" maxWidth="xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              View, edit, switch, or delete job requisitions in your recruitment database ({jobs.length} total).
            </p>
            <Button
              size="sm"
              variant="outline"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                onClose();
                onOpenCreateJob();
              }}
            >
              Add New Job
            </Button>
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No jobs found. Create your first job using the Copilot or "+ New Job" button.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto pr-1 space-y-2">
              {jobs.map((job) => {
                const isActive = job._id === activeJobId;
                const isThisEditing = editingJobId === job._id;

                if (isThisEditing) {
                  return (
                    <div
                      key={job._id}
                      className="p-3 bg-slate-50 border border-indigo-200 rounded-xl space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="font-semibold text-slate-800">Edit Requisition</span>
                        <button onClick={cancelEditing} className="text-slate-400 hover:text-slate-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        <div>
                          <label className="font-semibold text-slate-700">Job Title</label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full mt-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="font-semibold text-slate-700">Seniority</label>
                            <input
                              type="text"
                              value={editSeniority}
                              onChange={(e) => setEditSeniority(e.target.value)}
                              className="w-full mt-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="font-semibold text-slate-700">Experience</label>
                            <input
                              type="text"
                              value={editExperience}
                              onChange={(e) => setEditExperience(e.target.value)}
                              className="w-full mt-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="font-semibold text-slate-700">Location</label>
                            <input
                              type="text"
                              value={editLocation}
                              onChange={(e) => setEditLocation(e.target.value)}
                              className="w-full mt-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700">Skills (comma-separated)</label>
                          <input
                            type="text"
                            value={editSkills}
                            onChange={(e) => setEditSkills(e.target.value)}
                            className="w-full mt-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                        <Button size="sm" variant="outline" onClick={cancelEditing}>
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          isLoading={isSavingEdit}
                          onClick={() => handleSaveEdit(job._id)}
                        >
                          <Check className="w-3.5 h-3.5 mr-1" /> Save Changes
                        </Button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={job._id}
                    className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-4 ${
                      isActive
                        ? 'bg-indigo-50/40 border-indigo-200 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{job.title}</h4>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                            <CheckCircle2 className="w-3 h-3" /> Active Pipeline
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Award className="w-3 h-3 text-slate-400" /> {job.seniority || 'Senior'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />{' '}
                          {job.experience || (job.minExperienceYears ? `${job.minExperienceYears}+ yrs` : '5+ yrs')}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> {job.location || 'Remote'}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {job.mustHaveSkills?.slice(0, 5).map((skill, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isActive && (
                        <button
                          onClick={() => {
                            selectJob(job._id);
                            toast.success(`Switched active job to "${job.title}"`);
                          }}
                          className="px-2.5 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                          title="Set as active workspace job"
                        >
                          Select
                        </button>
                      )}

                      <button
                        onClick={() => startEditing(job)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                        title="Edit job requirements"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteTargetJob(job)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete job requisition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetJob)}
        onClose={() => setDeleteTargetJob(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Job Requisition"
        message={`Are you sure you want to delete "${deleteTargetJob?.title}"? This will permanently remove this job requisition from the database.`}
        confirmText="Delete Job"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
};
