# Aironauts AI Recruitment Co-Worker — Frontend Application

Production-grade, enterprise conversational hiring co-worker UI built with **React 18**, **TypeScript**, and **Tailwind CSS**.

The interface implements a high-throughput **Dual-Pane Split Layout**:
- **Left Pane (42%):** Conversational AI Recruitment Co-Worker with Claude/ChatGPT-style auto-scrolling message streams, subtle typing indicators, quick prompt chips, and rich interactive action cards.
- **Right Pane (58%):** Tabbed Workspace managing the Candidate Pipeline, Outreach Campaign Studio, Recruitment Analytics & Funnel, and Governance Audit Trail.

---

## 1. Key Capabilities

### 1.1 Conversational AI Co-Worker & Interactive Action Cards
- **Job Confirmation Card (`JobConfirmCard`):** Review AI-extracted JD fields (title, seniority, location, must-have skills), edit inline, and confirm job creation with explicit approval.
- **Live Background Progress Card (`LiveProgressCard`):** Real-time Server-Sent Events (SSE) progress bar with animated phase counters and resilient polling fallback.
- **Candidate Evaluation Card (`CandidateReviewCard`):** Compact scored candidate cards with 0-100 rubric badges, AI reasoning rationales, and instant Accept/Reject decisions.
- **Email Outreach Preview Card (`EmailPreviewCard`):** Multi-step preview with variable interpolation (`{{name}}`, `{{jobTitle}}`), recipient eligibility counter, and safety approval gate.
- **Meeting Slot Booking Card (`MeetingSlotCard`):** Selectable interview calendar slots that seamlessly move candidates to `meeting_booked`.
- **Inbound Reply Review Card (`ReplyReviewCard`):** Classifies candidate replies into 5 intents and generates automated AI response drafts.

### 1.2 Candidate Pipeline Workspace
- **Searchable & Filterable Data Table:** Real-time search across candidate names, emails, and skills with 11 pipeline status filter tabs.
- **Bulk Action Toolbar:** Select multiple candidates for bulk "Accept" or "Reject".
- **Candidate Detail Modal:** Full profile inspection with evidence-based scoring rationales and direct pipeline stage progression.
- **CSV Import Modal:** Drag-and-drop CSV importer with downloadable sample file and row-by-row error feedback.

### 1.3 Outreach Studio & Reply Simulator
- **Campaign Sequence Builder:** 3-step automated follow-up sequences (Day 0, Day 3, Day 7) with template editing and save capabilities.
- **Mandatory Recruiter Approval Gate:** Enforces SHA-256 verified safety checks preventing unauthorized email dispatch.
- **Virtual Outbox Monitor:** Real-time log of sent, pending, and automatically suppressed emails (e.g. if candidate already replied or unsubscribed).
- **Inbound Reply Simulator:** Test candidate replies across all 5 intents with quick-select templates.

### 1.4 Recruitment Analytics & Audit Trail
- **Funnel Visualization:** Horizontal candidate progression flow with percentage conversions.
- **Key Metric Indicators:** Reply Rate, Interest Rate, Meeting Booking Rate, and Total Hires.
- **AI Job Summary:** On-demand LLM executive briefing evaluating pipeline bottlenecks and actionable recommendations.
- **Audit Trail:** Chronological timeline tracking every recruiter, AI co-worker, and system action.

---

## 2. Design System & UI Architecture

- **Clean Codebase:** Pragmatic, standard React code without speculative abstractions or noisy boilerplate comments.
- **Enterprise Palette:** Neutral slate backgrounds (`bg-slate-50`, `border-slate-200`, `bg-white`) paired with refined indigo primary accents.
- **Design Focus:** Minimalist, high-productivity enterprise UI without neon glow, dark-mode clichés, or unnecessary gradients.
- **State Persistence:** Active job, session ID, and chat history persist cleanly across browser reloads (`F5`).

---

## 3. Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Aironauts Backend running on `http://localhost:5000`

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
The application will be running at `http://localhost:5173`.

### Production Build
```bash
# Type check and build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 4. Docker Deployment
```bash
# Build the Docker image
docker build -t aironauts-frontend:latest .

# Run container
docker run -p 80:80 aironauts-frontend:latest
```

