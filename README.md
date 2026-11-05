# Aironauts AI Recruitment Co-Worker — Frontend Application

Production-grade, enterprise conversational hiring co-worker UI built with **React 18**, **TypeScript**, and **Tailwind CSS**.

The interface implements a high-throughput **Dual-Pane Split Layout**:
- **Left Pane (42%):** Conversational AI Recruitment Co-Worker with Claude/ChatGPT-style auto-scrolling message streams, subtle typing indicators, quick prompt chips, and rich interactive action cards.
- **Right Pane (58%):** Tabbed Workspace managing the Candidate Pipeline, Outreach Campaign Studio, Virtual Outbox Monitor, Recruitment Analytics & Funnel, and Governance Audit Trail.

---

## 1. Requirement & Feature Verification Matrix

All frontend components, workflows, and interactive cards directly correspond to the recruitment specification and checklist:

| Requirement / Item | Frontend Component | How It Works in UI |
|---|---|---|
| **UI Simulated Reply Button** (UI থেকে simulated reply দেওয়ার button) | `src/components/campaigns/ReplySimulatorModal.tsx`<br>`src/components/candidates/CandidateDetailModal.tsx` | Click "Simulate Reply" on any candidate card or outreach table to open the modal. Features 5 quick-fill preset buttons (`interested`, `not_interested`, `question`, `out_of_office`, `later`). Submitting updates candidate state instantly. |
| **Outreach Delivery Monitor** (একই candidate-কে দ্বিতীয়বার send না করা & Mock inbox) | `src/components/campaigns/DeliveryOutbox.tsx`<br>`src/components/campaigns/CampaignStudio.tsx` | Displays all outgoing messages in the sandboxed Virtual Outbox with recipient email, step number, send status (`sent`, `suppressed`), timestamp, and preview button verifying that `{{name}}` was replaced with the candidate's real name. |
| **Meeting Slot Picker** (Calendly অথবা mock time-slot picker implement করা) | `src/components/cards/MeetingSlotCard.tsx` | Appears in chat or candidate detail when an interested candidate is ready for an interview. Recruiter clicks any available 30-minute slot to confirm the meeting. |
| **Status Progression: `meeting_booked`** | `MeetingSlotCard.tsx` & `CandidateDetailModal.tsx` | Selecting an interview slot automatically updates the candidate's badge to `Meeting Booked` and logs the event in the audit trail. |
| **Status Progression: `interview`, `shortlisted`, `hired`, `rejected`** | `src/components/candidates/CandidateTable.tsx`<br>`src/components/candidates/CandidateDetailModal.tsx` | Recruiter can advance candidate stages via the dropdown selector in Candidate Detail modal or via quick action buttons in the candidate row. |
| **Chat Commands for Status Updates** (Chat command দিয়ে status update করা) | `src/components/chat/ChatContainer.tsx`<br>`src/components/chat/ChatInput.tsx` | Recruiter types instructions into chat (e.g. *"accept candidate who have above score 80"* or *"undo accepted to sourced"*). The candidate table in the right pane updates in real time. |
| **UI Quick Actions** (UI থেকে status update করা) | `CandidateTable.tsx` | Row-level action buttons: Quick Accept (`✓`), Quick Reject (`✕`), and Details Drawer (`Details ▾`). |
| **Activity Audit Trail** (প্রতিটি status change activity log-এ save করা) | `src/components/dashboard/ActivityWorkspace.tsx`<br>`src/components/dashboard/ActivityTimeline.tsx` | Live chronological log under the **Audit Trail** tab recording every status change, chat action, bulk decision, email dispatch, and reply ingestion. |
| **CV / Resume & CSV Upload** | `src/components/candidates/CsvUploadModal.tsx` | Drag-and-drop modal supporting **PDF, DOCX, DOC, and CSV** files. Automatically extracts candidate information and evaluates match against the active job rubric. |
| **Real-time Background Task Progress** | `src/components/cards/LiveProgressCard.tsx` | Server-Sent Events (SSE) progress bar showing real-time percentages for candidate sourcing and scoring jobs. |

---

## 2. Recruiter User Manual: Step-by-Step Walkthrough

Follow this step-by-step guide to run a complete end-to-end hiring workflow in the Aironauts UI:

### Step 1: Launching & Selecting an Active Job
1. Open the application in your browser (`http://localhost:5173`).
2. The top navigation bar displays the current **Active Job** (e.g. `Senior AI Engineer (MERN Stack)`).
3. To switch jobs or view requirements, click **Manage Jobs** in the top right.
4. To create a new job, either click **+ New Job** or tell the AI Co-Worker in the chat:
   > *"I need a Lead Full-Stack Engineer with 5+ years of experience in React, Node, and AWS."*
5. Review the extracted skills, seniority, and rubric in the `JobConfirmCard`, then click **Confirm & Activate Job**.

---

### Step 2: Sourcing Candidates
You have three ways to populate candidates for the active job:
- **Option A (AI Chat Prompt):** Type *"Find 4 candidates from the web for this job"*. The `LiveProgressCard` appears in chat showing live progress (0% $\rightarrow$ 100%) as Serper searches LinkedIn profiles.
- **Option B (One-Click UI Button):** In the **Candidates** tab of the right pane, click the **Source Web** button.
- **Option C (Upload CV / CSV):** Click **Upload CV / Resume** button. Drag and drop your `.pdf`, `.docx`, or `.csv` files. The system automatically parses candidate profiles and populates the table.

---

### Step 3: Candidate Scoring & AI Evaluation
1. In the **Candidates** tab, click **Run Scoring** (or type *"Score all candidates against the rubric"* in chat).
2. The AI Scoring Engine evaluates each candidate's experience and skills against the job requirements, producing:
   - A numerical match score between **0 and 100%**.
   - Color-coded badges: Green ($\ge 80\%$), Amber ($70-79\%$), Red ($< 70\%$).
   - Detailed justification bullets explaining why the candidate received the score.
3. Click the **Details** button on any candidate row to read their complete evaluation rationale.

---

### Step 4: Reviewing & Accepting Candidates
You can accept or reject candidates using either natural language or UI controls:
- **Using Natural Language (Chat):**
  - Type: *"accept candidate who have above score 80"* $\rightarrow$ All candidates with score $\ge 80\%$ are moved to `Accepted`.
  - Type: *"undo accepted status to sourced. only Badruzzaman Pritom candidate accepted"* $\rightarrow$ Reverts all others to `Sourced` while maintaining Pritom as `Accepted`.
- **Using Candidate Table Controls:**
  - Click the green checkmark (`✓`) on any row to Accept.
  - Click the red cross (`✕`) to Reject.
  - Check the checkboxes next to multiple candidates and use the **Bulk Action Toolbar** to accept or reject them at once.

---

### Step 5: Drafting & Approving Outreach Campaign
1. Switch to the **Outreach** tab in the right pane (or click the quick chip *"Draft outreach campaign"* in chat).
2. The **Campaign Studio** displays a 3-step automated follow-up sequence:
   - **Step 1 (Day 0):** Initial introduction email.
   - **Step 2 (+3 Days):** Polite follow-up email.
   - **Step 3 (+7 Days):** Final check-in email.
3. Edit the subject or body if desired. Notice the variable tokens like `{{name}}` and `{{jobTitle}}`.
4. **Mandatory Recruiter Approval Barrier:**
   - Click **Approve Campaign Copy**.
   - The system generates a cryptographic SHA-256 verification hash, unlocking the **Send Campaign** button.
   *(Safety Note: If you edit the email text after approving, the approval hash is automatically invalidated, requiring re-approval before sending).*

---

### Step 6: Dispatching to the Virtual Outbox
1. Click **Send Step 1 Now**.
2. The batch is sent to the backend BullMQ worker queue and delivered to the **Virtual Outbox**.
3. Under the campaign sequence, look at the **Virtual Outbox Delivery Monitor**:
   - Notice the status indicates `Sent`.
   - Click the preview icon to verify that `{{name}}` has been dynamically replaced with the candidate's actual name (e.g. *"Hello Badruzzaman Pritom"*).
   - Candidate status transitions automatically from `Accepted` $\rightarrow$ `Contacted`.

---

### Step 7: Simulating Inbound Candidate Replies
To test candidate responses without waiting for external emails:
1. In the **Outreach** tab or **Candidates** tab, click **Simulate Reply**.
2. In the `ReplySimulatorModal`, select an intent preset:
   - 🟢 **Interested:** *"Hi! I'd love to learn more about the Senior AI Engineer role. When can we talk?"*
   - 🔴 **Not Interested:** *"Thanks, but I'm currently happy with my current position."*
   - ❓ **Question:** *"What is the remote work policy and salary range for this role?"*
   - 🏖️ **Out of Office:** *"I am out of office until next Monday."*
   - ⏰ **Later:** *"I am busy this month, please check back with me next quarter."*
3. Click **Submit Simulated Reply**.
4. The AI analyzes the sentiment, moves the candidate to `Interested` (or `Not Interested`), and posts a notification in the chat.

---

### Step 8: Booking Interview & Confirming Calendar Slots
1. Once a candidate is in `Interested` status, a `MeetingSlotCard` appears in chat (or can be triggered from Candidate Details).
2. Select an available 30-minute interview slot (e.g. *"Tomorrow at 2:00 PM EST"*).
3. The candidate's status advances to **`Meeting Booked`**, and a calendar confirmation is saved.

---

### Step 9: Progressing Candidates: Interview $\rightarrow$ Shortlist $\rightarrow$ Hired
1. In the **Candidates** tab, click the **Filter by Status** pill (e.g. click `Meeting Booked` or `All Profiles`).
2. Click **Details** on the candidate.
3. Use the Stage Progression dropdown:
   - Move from `Meeting Booked` $\rightarrow$ **`Interview`** after conducting the technical screening.
   - Move from `Interview` $\rightarrow$ **`Shortlisted`** for top contenders.
   - Move from `Shortlisted` $\rightarrow$ **`Hired`** when the offer is accepted!

---

### Step 10: Recruitment Analytics & Audit Trail
1. Click the **Analytics** tab to view:
   - **Conversion Funnel:** Visual drop-off rate from Sourced $\rightarrow$ Accepted $\rightarrow$ Contacted $\rightarrow$ Replied $\rightarrow$ Interested $\rightarrow$ Meeting Booked $\rightarrow$ Hired.
   - **KPI Cards:** Response Rate, Interest Rate, Meeting Rate, and Average Time to Hire.
   - **AI Job Summary:** Click *Refresh AI Summary* for an executive briefing on candidate pipeline bottlenecks and next steps.
2. Click the **Audit Trail** tab to see an immutable timeline of every action taken by the recruiter, the AI co-worker, and background workers.

---

## 3. UI Component Architecture

```
src/
├── app/
│   └── Layout.tsx                 # Master dual-pane split container (42% chat / 58% workspace)
├── components/
│   ├── chat/                      # Conversational Co-Worker Pane
│   │   ├── ChatContainer.tsx      # Auto-scrolling message list with session persistence
│   │   ├── ChatMessageItem.tsx    # Message bubble rendering markdown & interactive action cards
│   │   └── ChatInput.tsx          # Recruiter input bar with prompt recommendation chips
│   ├── cards/                     # Interactive Action Cards (Embedded in Chat Stream)
│   │   ├── JobConfirmCard.tsx     # Extracted JD confirmation card
│   │   ├── LiveProgressCard.tsx   # SSE live background task progress bar
│   │   ├── CandidateReviewCard.tsx# Compact scored candidate evaluation card
│   │   ├── EmailPreviewCard.tsx   # Multi-step outreach preview with token highlights
│   │   ├── MeetingSlotCard.tsx    # Selectable calendar interview slot picker
│   │   └── ReplyReviewCard.tsx    # Inbound reply intent & draft response card
│   ├── candidates/                # Candidate Workspace Tab
│   │   ├── CandidateWorkspace.tsx # Workspace container & status filter tabs
│   │   ├── CandidateTable.tsx     # Data table with sorting, bulk actions, and quick buttons
│   │   ├── CandidateDetailModal.tsx# Profile drawer with score rationales & stage dropdown
│   │   └── CsvUploadModal.tsx     # PDF / DOCX / CSV drag-and-drop resume uploader
│   ├── campaigns/                 # Outreach Studio Tab
│   │   ├── OutreachWorkspace.tsx  # Campaign studio tab wrapper
│   │   ├── CampaignStudio.tsx     # 3-step sequence builder & SHA-256 approval barrier
│   │   ├── DeliveryOutbox.tsx     # Virtual Outbox real-time monitor & email inspector
│   │   └── ReplySimulatorModal.tsx# Inbound candidate reply simulator (5 intents)
│   ├── dashboard/                 # Analytics & Audit Tabs
│   │   ├── AnalyticsWorkspace.tsx # Recruitment funnel chart & KPI stat cards
│   │   ├── FunnelChart.tsx        # Horizontal conversion flow visualization
│   │   ├── AiSummaryCard.tsx      # On-demand LLM pipeline executive briefing
│   │   └── ActivityWorkspace.tsx  # Chronological recruiter audit trail
│   └── common/                    # Design System Primitives
│       ├── Button.tsx             # Enterprise button variants (primary, secondary, danger)
│       ├── Badge.tsx              # Status & score color-coded badges
│       ├── Modal.tsx              # Accessible modal dialog wrapper
│       └── Input.tsx              # Form input fields with validation states
├── context/
│   ├── JobContext.tsx             # Global active job state & session management
│   └── SseContext.tsx             # Server-Sent Events listener for live progress
├── hooks/
│   ├── useChat.ts                 # Chat message mutation & streaming hooks
│   ├── useCandidates.ts           # Candidate filtering, sorting, and bulk actions
│   ├── useCampaigns.ts            # Campaign sequence & approval state hooks
│   └── useAnalytics.ts            # Funnel statistics & AI summary fetching
└── services/
    └── api.ts                     # Axios REST client configured for backend on port 5000
```

---

## 4. Local Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Backend API**: Running on `http://localhost:5000`

### Installation & Run

```bash
# 1. Navigate to frontend directory
cd aironut-frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The frontend application will start at **`http://127.0.0.1:5173`** or **`http://localhost:5173`**.

### Production Build & Type Check

```bash
# Run TypeScript type check and build bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 5. Docker Deployment

To build and run the frontend inside a lightweight Nginx container:

```bash
# Build Docker image
docker build -t aironauts-frontend:latest .

# Run container on port 80
docker run -d -p 80:80 aironauts-frontend:latest
```
