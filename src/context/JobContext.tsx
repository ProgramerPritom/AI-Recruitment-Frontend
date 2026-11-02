import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Job } from '../types';

interface JobContextType {
  jobs: Job[];
  activeJob: Job | null;
  activeJobId: string | null;
  isLoading: boolean;
  selectJob: (jobId: string) => void;
  refreshJobs: () => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [activeJobId, setActiveJobId] = useState<string | null>(() => {
    return localStorage.getItem('aironauts_active_job_id');
  });

  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ['jobs'],
    queryFn: async () => {
      const res: any = await api.get('/jobs');
      return res.data || [];
    },
  });

  useEffect(() => {
    if (jobs.length > 0) {
      if (!activeJobId || !jobs.some((j) => j._id === activeJobId)) {
        const firstJobId = jobs[0]._id;
        setActiveJobId(firstJobId);
        localStorage.setItem('aironauts_active_job_id', firstJobId);
      }
    }
  }, [jobs, activeJobId]);

  const selectJob = (jobId: string) => {
    setActiveJobId(jobId);
    localStorage.setItem('aironauts_active_job_id', jobId);
  };

  const refreshJobs = () => {
    queryClient.invalidateQueries({ queryKey: ['jobs'] });
  };

  const activeJob = jobs.find((j) => j._id === activeJobId) || null;

  return (
    <JobContext.Provider
      value={{
        jobs,
        activeJob,
        activeJobId,
        isLoading,
        selectJob,
        refreshJobs,
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

export const useJob = (): JobContextType => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJob must be used within a JobProvider');
  }
  return context;
};

