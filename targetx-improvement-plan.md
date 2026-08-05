# TargetX Frontend — Improvement Plan

> **Scope**: This plan covers ideas for improvising the pipeline and working mechanism of the TargetX CRISPR analysis platform. No production code changes are included here — this is a planning document only.

---

## Top-Level Overview

TargetX is a CRISPR guide-RNA analysis platform built as a full-stack monorepo (React 19 SPA + Express/tRPC backend + MySQL via Drizzle ORM). The platform has a well-designed schema and API surface, but the current frontend is **entirely disconnected from the backend**:

- The Pipeline page simulates execution with `setInterval` — no real API calls
- The Dashboard page renders hardcoded static arrays — no database queries
- The AIChatBox component exists but no LLM endpoint exists in the router
- All project/candidate/off-target data is mocked in-place

The improvement plan below addresses each of these layers in priority order, while respecting the existing architecture and conventions.

---

## Sub-Tasks

---

### Sub-Task 1 — Wire the Pipeline Page to the Real tRPC API

**Status**: `[ ] pending`

**Intent**
Replace the `setInterval`-based stage simulation in `Pipeline.tsx` with actual tRPC mutations so that pipeline runs are persisted to the database and can be resumed.

**Expected Outcomes**
- Clicking "Run Pipeline" calls `trpc.projects.create.useMutation` (or reuses an existing project if a project ID is in URL state) and then `trpc.pipeline.runPipeline.useMutation`
- Stage progress is polled via `trpc.pipeline.getStages.useQuery` with `refetchInterval` while project status is `"running"`
- Stage result panels display real `outputData` from each stage record rather than hardcoded strings
- "Re-run" resets project status and re-runs pipeline
- Project selection (new or existing) drives which projectId is used

**Todo List**
1. Add project creation form (name, organism, inputMode) that gates the "Run Pipeline" button
2. Replace `runPipeline()` function body with `trpc.pipeline.runPipeline.useMutation`
3. Add `trpc.pipeline.getStages.useQuery({ projectId }, { refetchInterval: 1500, enabled: status === "running" })` to poll stage updates
4. Map polled stages to `stageResults` state (status, outputData, outputSummary)
5. Stop polling when project status becomes `"complete"` or `"error"`
6. Render `outputData` in each stage result panel (fallback to empty state if null)
7. Remove all hardcoded stage result strings and replace with data-driven rendering

**Relevant Context**
- `client/src/pages/Pipeline.tsx` (lines 47–85): current simulation logic to replace
- `server/routers.ts` (lines 151–201): `pipeline.runPipeline`, `pipeline.getStages`, `pipeline.createStage`
- `drizzle/schema.ts` (lines ~80–110): `pipelineStages` table with `outputData` JSON, `outputSummary`, `status`

---

### Sub-Task 2 — Wire the Dashboard Page to the Real tRPC API

**Status**: `[ ] pending`

**Intent**
Replace every hardcoded data array in `Dashboard.tsx` with tRPC queries so the dashboard renders real project analytics.

**Expected Outcomes**
- Dashboard receives a `projectId` from URL params or a project selector dropdown
- `trpc.candidates.list.useQuery` powers the Efficiency tab bar chart, scatter chart, and Ranking table
- `trpc.shap.summary.useQuery` powers the SHAP Explainability tab
- `trpc.offtarget.stats.useQuery` and per-candidate off-target data powers the Off-target tab
- `trpc.projects.stats.useQuery` powers the top metrics strip (Total Guides, High Conf., Avg. Score, etc.)
- Loading skeletons replace current instant render while queries are pending
- Empty states handle no-data scenarios

**Todo List**
1. Read `projectId` from URL search params (`/dashboard?projectId=3`)
2. Add a project selector dropdown using `trpc.projects.list.useQuery` if no projectId in URL
3. Replace `efficiencyData` hardcoded array with `trpc.candidates.list.useQuery` results (map to chart format)
4. Replace `scatterData` with derived GC content vs ensemble score from candidates list
5. Replace `topCandidates` table rows with top-5 from candidates list sorted by ensembleScore
6. Replace `shapBeeswarmData` with `trpc.shap.summary.useQuery` feature rows
7. Replace `riskDistribution` with `trpc.offtarget.stats.useQuery` (safeCount, cautionCount, riskCount, criticalCount)
8. Replace chromosome distribution random array with real off-target site chromosome grouping
9. Replace metrics strip hardcoded values with `trpc.projects.stats.useQuery` aggregates
10. Add loading skeletons (shadcn Skeleton component) and empty state (shadcn Empty component)
11. Remove `Math.random()` calls that produce non-deterministic bar widths (lines 163, 176)

**Relevant Context**
- `client/src/pages/Dashboard.tsx` (lines 114–418): all hardcoded arrays to replace
- `server/routers.ts` (lines 203–270): `candidates.list`, `candidates.stats`, `shap.summary`, `offtarget.stats`
- `server/db.ts` (lines 280–380): `getProjectStats`, `getProjectCandidates`, `getProjectShapSummary`, `getOffTargetStats`

---

### Sub-Task 3 — Implement Real Backend Pipeline Execution

**Status**: `[ ] pending`

**Intent**
The current `pipeline.runPipeline` mutation simply inserts stage records with `status: "pending"` — it does not actually execute any analysis. This sub-task introduces a real asynchronous execution model where each stage runs sequentially and updates its record when done.

**Expected Outcomes**
- `pipeline.runPipeline` triggers a non-blocking background job that runs each stage in sequence
- Each stage updates its `status` to `"running"` then `"complete"` (or `"error"`) with real `outputData`
- The frontend's polling (Sub-Task 1) picks up these real status transitions
- Stage `outputData` for each stage contains structured results (gene candidates, PAM sites, gRNA sequences, ML scores, SHAP values, off-target results)
- ML model scoring (xgboost, lightgbm, randomforest ensemble) runs on server and writes to `grnaCandidates` table
- Completion of the report stage triggers `reports.create`

**Todo List**
1. Extract each of the 8 pipeline stages into individual async handler functions in a new `server/pipeline/` directory
2. Introduce a `runPipelineInBackground(projectId)` function that chains all 8 stage handlers sequentially using `async/await`
3. In `pipeline.runPipeline` mutation, call `runPipelineInBackground(projectId)` without `await` (fire-and-forget, update status via side effect)
4. Each stage handler:
   a. Calls `db.updatePipelineStage(stageId, { status: "running", startedAt: new Date() })`
   b. Executes its logic (NLP parsing, gene lookup, PAM scan, gRNA generation, ML scoring, off-target search, SHAP calculation, report generation)
   c. Calls `db.updatePipelineStage(stageId, { status: "complete", completedAt, outputSummary, outputData })`
   d. On error, calls `db.updatePipelineStage(stageId, { status: "error", error: err.message })` and calls `db.updateProjectStatus(projectId, "error")`
5. After all stages complete, call `db.updateProjectStatus(projectId, "complete")`
6. Wire in real ML model calls (from `models/` directory) or stub them with realistic mock computation if models not yet available

**Relevant Context**
- `server/routers.ts` (lines 151–201): `pipeline.runPipeline` mutation to extend
- `server/db.ts` (lines 191–230): `createPipelineStage`, `updatePipelineStage`, `getPipelineStages`
- `drizzle/schema.ts` (lines ~80–110): `pipelineStages` table schema
- `models/` directory: ML model artifacts to integrate
- `server/db.ts` (line 196): existing `stageName: input.stageName as any` type cast to fix

---

### Sub-Task 4 — Add an AI/LLM Route for the AIChatBox

**Status**: `[ ] pending`

**Intent**
The `AIChatBox` component is built and ready but there is no LLM backend route. This sub-task adds an `ai.chat` tRPC endpoint so the chat component can be connected to an LLM API and used from the Pipeline or Dashboard pages.

**Expected Outcomes**
- A `trpc.ai.chat.useMutation` endpoint accepts a `messages: Message[]` array and returns an assistant response string
- The endpoint calls an external LLM API (e.g., OpenAI-compatible, or the built-in Forge API key) with the message array
- The AIChatBox component can be mounted on the Pipeline page (as a "Research Assistant" sidebar panel) or on the Dashboard as a contextual explainer
- System prompt is domain-specific (CRISPR/gRNA context)

**Todo List**
1. Add `OPENAI_API_KEY` or appropriate LLM API key to `server/_core/env.ts`
2. Create `server/ai.ts` service that wraps the LLM API call (POST to OpenAI completions or compatible endpoint)
3. Add `ai` route group in `server/routers.ts` with `ai.chat` protectedProcedure mutation
   - Input: `z.object({ messages: z.array(messageSchema) })`
   - Calls `ai.ts` service, returns `{ content: string }`
4. Mount `AIChatBox` on the Pipeline page as a collapsible right-side panel
5. Wire `onSendMessage` to `trpc.ai.chat.useMutation` following the example usage in `AIChatBox.tsx` (lines 73–111)
6. Pre-load a CRISPR-domain system prompt as the first message in pipeline context

**Relevant Context**
- `client/src/components/AIChatBox.tsx` (lines 73–111): full usage example already documented
- `server/routers.ts` (lines 1–30): where to add new `ai` route group
- `server/_core/env.ts`: where to add new API key
- `client/src/pages/Pipeline.tsx`: where to mount the chat panel

---

### Sub-Task 5 — Add Route Guards and Project Context

**Status**: `[ ] pending`

**Intent**
Currently all routes are public with no authentication checks, and there is no project context shared between Pipeline and Dashboard. This sub-task adds auth-protected route wrappers and a shared "active project" context.

**Expected Outcomes**
- Unauthenticated users visiting `/pipeline` or `/dashboard` are redirected to login
- A `ProjectContext` provides `projectId` and `project` data to both Pipeline and Dashboard without prop-drilling
- The Sidebar shows the active project name when one is selected
- Navigation from Pipeline "complete" state automatically navigates to `/dashboard?projectId=X`

**Todo List**
1. Create a `ProtectedRoute` wrapper component that calls `trpc.auth.me.useQuery` and redirects to login via `startLogin()` if `user` is null
2. Wrap `/pipeline` and `/dashboard` routes in `App.tsx` with `ProtectedRoute`
3. Create `client/src/contexts/ProjectContext.tsx` providing `{ projectId, setProjectId, project }` via React Context
4. Wrap `DashboardLayout` (or the router) with `ProjectContextProvider`
5. Pipeline page reads/writes `projectId` from ProjectContext after project creation
6. After pipeline completion, navigate to `/dashboard?projectId=${projectId}` using wouter's `useLocation`
7. Dashboard page reads `projectId` from URL first, then from ProjectContext
8. Update Sidebar to display active project name below "TargetX" logo when project is selected

**Relevant Context**
- `client/src/App.tsx` (lines 11–23): route definitions to update
- `client/src/const.ts`: `startLogin()` function for redirect
- `client/src/components/Sidebar.tsx` (lines 38–57): logo area to extend with project name
- `client/src/pages/Pipeline.tsx` (lines 57–79): where to add post-completion navigation
- `server/routers.ts` (lines 22–26): `auth.me` public procedure

---

### Sub-Task 6 — Database Performance and Data Integrity

**Status**: `[ ] pending`

**Intent**
The current schema has no secondary indexes, no foreign key constraints at the MySQL level, no transactions for multi-step operations, and a boolean field stored as int. This sub-task improves the data layer without changing the API surface.

**Expected Outcomes**
- Common query patterns (project lookup by userId, candidate lookup by projectId, off-target lookup by candidateId) are backed by indexes
- Multi-step operations (create project + first pipeline stage) use database transactions
- `isInCodingRegion` stored as proper MySQL boolean
- Foreign key constraints prevent orphaned records
- `runPipeline` uses a single transaction for stage creation

**Todo List**
1. Add Drizzle index definitions to `drizzle/schema.ts` for:
   - `projects.userId` (most common filter)
   - `pipelineStages.projectId`
   - `grnaCandidates.projectId`, `grnaCandidates.ensembleScore` (sorting)
   - `offTargetSites.candidateId`, `offTargetSites.projectId`
   - `shapResults.candidateId`, `shapResults.projectId`
2. Change `isInCodingRegion` to `boolean()` type in Drizzle schema
3. Add foreign key references in Drizzle schema (projects → users, candidates → projects, etc.)
4. Wrap `pipeline.runPipeline` stage creation loop in a Drizzle transaction via `db.transaction()`
5. Run `npm run db:push` to apply schema changes
6. Update `db.ts` `createOffTargetSite` to pass boolean directly (remove 0/1 conversion)

**Relevant Context**
- `drizzle/schema.ts`: all table definitions to update
- `server/db.ts` (line ~320): `createOffTargetSite` boolean conversion
- `server/routers.ts` (lines 171–201): `runPipeline` stage creation loop to wrap in transaction
- `package.json`: `db:push` script for applying migrations

---

### Sub-Task 7 — Add Comprehensive Error Handling and Loading States to the UI

**Status**: `[ ] pending`

**Intent**
The current frontend assumes data is always available and renders instantly. When the backend is connected, queries can fail, be pending, or return empty. All pages need loading skeletons, empty states, and error banners.

**Expected Outcomes**
- Every `useQuery` result has three handled states: loading (skeleton), error (error banner with retry), and empty (empty state illustration)
- Every `useMutation` result shows a loading indicator on the trigger button and a toast on success/error
- Pipeline page shows an error state if `runPipeline` fails
- Dashboard shows per-chart loading skeletons while queries resolve
- Server errors (TRPCError) surface a user-readable message rather than a raw stack trace

**Todo List**
1. Add `DashboardSkeleton` sub-components for each metrics strip, chart, and table section
2. Wrap each Dashboard tab chart section with `isLoading ? <SkeletonPanel /> : <Chart />`
3. Add `isError` checks and `<Alert variant="destructive">` for failed queries in Dashboard
4. Add Pipeline stage error rendering: when a stage's `status === "error"`, show its `error` field inline in the stage result panel
5. Add mutation feedback: success toast (`sonner.toast.success`) and error toast (`sonner.toast.error`) for create/run operations
6. Use the existing shadcn `Empty` component (`client/src/components/ui/empty.tsx`) for zero-state panels
7. Add retry buttons that call `queryClient.invalidateQueries()` for specific query keys on error

**Relevant Context**
- `client/src/components/ui/skeleton.tsx`, `empty.tsx`, `alert.tsx`: existing UI primitives available
- `client/src/pages/Dashboard.tsx`: all chart and table sections
- `client/src/pages/Pipeline.tsx` (lines 258–491): stage result panels
- `client/src/main.tsx` (lines 24–38): existing global error handler for UNAUTHED_ERR_MSG

---

### Sub-Task 8 — Add Report Download and Export Functionality

**Status**: `[ ] pending`

**Intent**
The Pipeline Report stage shows "Download PDF" and "Copy Data" buttons with no `onClick` handlers. The backend has a `reports.create` endpoint and a `reports.get` endpoint, but the frontend never calls them. This sub-task connects the report UI to the real report data and implements a working export.

**Expected Outcomes**
- After pipeline completion, `trpc.reports.get.useQuery({ projectId })` populates the Report stage panel with real `executiveSummary`, `methodology`, `topCandidates`, and `recommendations`
- "Copy Data" copies the JSON `results` field from the report to the clipboard
- "Download PDF" triggers either: (a) server-side PDF generation and download, or (b) client-side PDF generation from the report JSON using a library like `jsPDF`
- Report content matches the actual candidates and SHAP results from the run

**Todo List**
1. In the Pipeline "Report" stage panel, call `trpc.reports.get.useQuery({ projectId })` when stage status is "complete"
2. Render `executiveSummary` and `recommendations` text in the report panel
3. Wire "Copy Data" button: `navigator.clipboard.writeText(JSON.stringify(report.results, null, 2))`
4. Wire "Download PDF" button:
   - Option A: Add a `reports.generatePdf` mutation on the server that serializes report data to PDF using `pdfkit` or similar, uploads to storage via `storagePut`, and returns a download URL
   - Option B: Use `jsPDF` on the client to generate a summary PDF from the report JSON
5. Show a loading spinner on "Download PDF" button during generation

**Relevant Context**
- `client/src/pages/Pipeline.tsx` (lines 476–491): Report stage result panel (buttons with no handlers)
- `server/routers.ts` (lines 340–380): `reports.get`, `reports.create` endpoints
- `server/storage.ts`: `storagePut` for uploading generated files
- `server/db.ts` (lines ~410–450): `createReport`, `getProjectReport`

---

## Architecture Diagram (Proposed Data Flow)

```
User
 │
 ▼
[Pipeline.tsx]
 │ trpc.projects.create.useMutation (new project)
 │ trpc.pipeline.runPipeline.useMutation (start)
 │ trpc.pipeline.getStages.useQuery [poll every 1.5s]
 │
 ▼
[server/routers.ts — pipeline.runPipeline]
 │ fire-and-forget → runPipelineInBackground(projectId)
 │
 ▼
[server/pipeline/*.ts — Stage Handlers]
 │ Stage 1: AI Understanding (LLM parse input)
 │ Stage 2: Gene ID (lookup gene DB)
 │ Stage 3: PAM Detection (scan sequence)
 │ Stage 4: gRNA Generation (produce candidates)
 │ Stage 5: Efficiency Scoring (ML ensemble)
 │ Stage 6: Off-target Analysis (BLAST/Cas-OFFinder)
 │ Stage 7: SHAP Explainability (ML interpretation)
 │ Stage 8: Report Generation
 │
 ▼
[MySQL via Drizzle ORM]
 │ pipelineStages (status, outputData per stage)
 │ grnaCandidates (30 features + 4 ML scores)
 │ offTargetSites (per candidate per site)
 │ shapResults (per feature per candidate)
 │ reports (compiled summary)
 │
 ▼
[Dashboard.tsx]
 │ trpc.projects.stats.useQuery
 │ trpc.candidates.list.useQuery
 │ trpc.shap.summary.useQuery
 │ trpc.offtarget.stats.useQuery
 │ trpc.reports.get.useQuery
 │
 ▼
[Recharts Visualizations — live data]
```

---

## Summary of Key Improvements

| # | Area | Current State | Improved State |
|---|------|--------------|---------------|
| 1 | Pipeline Execution | setInterval simulation | Real tRPC mutations + DB polling |
| 2 | Dashboard Data | 100% hardcoded | Live tRPC queries from DB |
| 3 | Backend Pipeline | Stage records created, no execution | Async per-stage handlers writing real output |
| 4 | AI Chat | Component exists, no endpoint | LLM route + mounted chat panel |
| 5 | Auth Guards | All routes public | ProtectedRoute + ProjectContext |
| 6 | Database | No indexes, no FK, no transactions | Indexes, FK, transaction wrapping |
| 7 | Error/Loading UI | None (assumes success) | Skeletons, empty states, error banners |
| 8 | Report Export | Buttons with no handlers | Live report data + clipboard + PDF download |
