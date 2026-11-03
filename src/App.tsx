import React, { useState } from 'react';
import { Toaster } from 'sonner';
import { JobProvider, useJob } from './context/JobContext';
import { SseProvider } from './context/SseContext';
import { Layout } from './app/Layout';
import { ChatContainer } from './components/chat/ChatContainer';
import { CreateJobModal } from './components/jobs/CreateJobModal';
import { JobManagementModal } from './components/jobs/JobManagementModal';
import { CandidateWorkspace } from './components/candidates/CandidateWorkspace';
import { OutreachWorkspace } from './components/campaigns/OutreachWorkspace';
import { AnalyticsWorkspace } from './components/dashboard/AnalyticsWorkspace';
import { ActivityWorkspace } from './components/dashboard/ActivityWorkspace';

const WorkspaceShell: React.FC = () => {
  const { activeJob } = useJob();
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const [isManageJobsOpen, setIsManageJobsOpen] = useState(false);

  const CandidatesView = <CandidateWorkspace />;
  const OutreachView = <OutreachWorkspace />;
  const AnalyticsView = <AnalyticsWorkspace />;
  const ActivityView = <ActivityWorkspace />;

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <Layout
        chatComponent={<ChatContainer />}
        candidatesComponent={CandidatesView}
        outreachComponent={OutreachView}
        analyticsComponent={AnalyticsView}
        activityComponent={ActivityView}
        onOpenCreateJob={() => setIsCreateJobOpen(true)}
        onOpenManageJobs={() => setIsManageJobsOpen(true)}
      />

      <CreateJobModal
        isOpen={isCreateJobOpen}
        onClose={() => setIsCreateJobOpen(false)}
      />

      <JobManagementModal
        isOpen={isManageJobsOpen}
        onClose={() => setIsManageJobsOpen(false)}
        onOpenCreateJob={() => setIsCreateJobOpen(true)}
      />
    </>
  );
};

export default function App() {
  return (
    <JobProvider>
      <SseProvider>
        <WorkspaceShell />
      </SseProvider>
    </JobProvider>
  );
}
