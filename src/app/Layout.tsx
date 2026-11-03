import React, { useState } from 'react';
import { useJob } from '../context/JobContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Briefcase,
  Users,
  Send,
  BarChart3,
  History,
  Plus,
  Bot,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';

interface LayoutProps {
  chatComponent: React.ReactNode;
  candidatesComponent: React.ReactNode;
  outreachComponent: React.ReactNode;
  analyticsComponent: React.ReactNode;
  activityComponent: React.ReactNode;
  onOpenCreateJob: () => void;
  onOpenManageJobs: () => void;
}

export type WorkspaceTab = 'candidates' | 'outreach' | 'analytics' | 'activity';

export const Layout: React.FC<LayoutProps> = ({
  chatComponent,
  candidatesComponent,
  outreachComponent,
  analyticsComponent,
  activityComponent,
  onOpenCreateJob,
  onOpenManageJobs,
}) => {
  const { jobs, activeJob, selectJob } = useJob();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('candidates');

  const tabs: Array<{ id: WorkspaceTab; label: string; icon: React.ReactNode }> = [
    { id: 'candidates', label: 'Candidates', icon: <Users className="w-4 h-4" /> },
    { id: 'outreach', label: 'Outreach', icon: <Send className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'activity', label: 'Audit Trail', icon: <History className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden text-slate-800">
      {/* Top Navigation Bar */}
      <header className="h-14 bg-white border-b border-slate-200 px-5 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 text-sm tracking-tight">
                  Aironauts
                </span>
                <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
                  AI Co-Worker
                </span>
              </div>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-200" />

          {/* Active Job Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Job:</span>
            <div className="relative">
              <select
                value={activeJob?._id || ''}
                onChange={(e) => selectJob(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-lg pl-3 pr-8 py-1.5 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title} ({job.location || 'Remote'})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {activeJob && (
              <Badge variant="success" size="sm">
                Active
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenManageJobs}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition flex items-center gap-1.5 shadow-xs"
            title="Manage all jobs (edit, delete, view)"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
            <span>Manage Jobs ({jobs.length})</span>
          </button>

          <Button
            size="sm"
            variant="outline"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={onOpenCreateJob}
          >
            New Job
          </Button>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            System Live
          </div>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Pane (AI Copilot & Conversational Chat) - 42% width */}
        <section className="w-[42%] min-w-[380px] max-w-[580px] border-r border-slate-200 bg-white flex flex-col h-full overflow-hidden">
          {chatComponent}
        </section>

        {/* Right Pane (Recruitment Workspace) - 58% width */}
        <main className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
          {/* Workspace Tabs Header */}
          <div className="h-11 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
            <nav className="flex space-x-1" aria-label="Tabs">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            {activeJob && (
              <div className="text-xs text-slate-500 font-medium">
                Seniority: <span className="text-slate-700">{activeJob.seniority || 'Mid-Senior'}</span>
              </div>
            )}
          </div>

          {/* Active Workspace View */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'candidates' && candidatesComponent}
            {activeTab === 'outreach' && outreachComponent}
            {activeTab === 'analytics' && analyticsComponent}
            {activeTab === 'activity' && activityComponent}
          </div>
        </main>
      </div>
    </div>
  );
};

