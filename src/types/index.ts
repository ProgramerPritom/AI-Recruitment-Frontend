export type CandidateStatus =
  | 'sourced'
  | 'accepted'
  | 'rejected'
  | 'contacted'
  | 'replied'
  | 'interested'
  | 'not_interested'
  | 'meeting_booked'
  | 'interviewed'
  | 'shortlisted'
  | 'hired'
  | 'unsubscribed';

export interface Job {
  _id: string;
  title: string;
  description: string;
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  seniority?: string;
  location?: string;
  salaryRange?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  remotePolicy?: string;
  status: 'draft' | 'active' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  _id: string;
  jobId: string;
  name: string;
  email?: string;
  profileUrl?: string;
  source: 'web' | 'csv';
  skills: string[];
  experienceSummary?: string;
  score?: number;
  scoreReason?: string;
  status: CandidateStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignStep {
  stepNumber: number;
  delayDays: number;
  subject: string;
  body: string;
}

export interface Campaign {
  _id: string;
  jobId: string;
  name: string;
  steps: CampaignStep[];
  status: 'draft' | 'approved' | 'running' | 'paused' | 'completed';
  payloadHash?: string;
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignDelivery {
  _id: string;
  campaignId: string;
  candidateId: string;
  stepNumber: number;
  recipientEmail: string;
  subject: string;
  body: string;
  sentAt?: string;
  status: 'sent' | 'failed' | 'suppressed';
  error?: string;
}

export interface Reply {
  _id: string;
  candidateId: string;
  jobId: string;
  content: string;
  classification: 'Interested' | 'Not interested' | 'Question' | 'Wants a meeting' | 'Unsubscribe';
  responseDraft?: string;
  isApproved: boolean;
  receivedAt: string;
}

export interface Meeting {
  _id: string;
  candidateId: {
    _id: string;
    name: string;
    email?: string;
    status: string;
  };
  jobId: string;
  slotTime: string;
  status: 'requested' | 'confirmed' | 'cancelled';
  confirmedAt: string;
  notes?: string;
}

export interface Activity {
  _id: string;
  jobId: string;
  candidateId?: string;
  actor: 'recruiter' | 'agent' | 'system';
  action: string;
  previousValue?: any;
  newValue?: any;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface TaskProgress {
  taskId: string;
  jobId: string;
  type: 'sourcing' | 'scoring' | 'outreach';
  status: 'pending' | 'running' | 'completed' | 'failed';
  phase: string;
  progress: number;
  processedCount: number;
  totalCount: number;
  error?: string;
  resultSummary?: Record<string, any>;
}

export interface ChatMessage {
  _id?: string;
  sessionId: string;
  jobId?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  cardPayload?: Record<string, any>;
  timestamp: string;
}

export interface FunnelStats {
  jobId: string;
  jobTitle: string;
  totalCandidates: number;
  stageCounts: Record<CandidateStatus, number>;
  metrics: {
    replyRate: number;
    interestedRate: number;
    meetingRate: number;
    hireRate: number;
  };
  emailDeliveries: {
    sent: number;
    suppressed: number;
    failed: number;
  };
}

