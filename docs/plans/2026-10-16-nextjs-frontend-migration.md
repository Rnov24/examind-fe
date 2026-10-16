# EXAMIND — Frontend Migration to Next.js (App Router) & pnpm Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `examind-fe` from Vue 3 + Vite to Next.js (App Router) + TypeScript + React with `pnpm`, maintaining 100% of the institutional EXAMIND UI/UX design system while modernizing routing, layouts, and state management.

**Architecture:** Next.js App Router with separated Route Groups `(marketing)`, `(auth)`, `(dashboard)`, `(exam)`, and `(companion)`. State management with Zustand (replacing Pinia) for `auth`, `exam`, and `proctoring`. Direct proxy rewrites in `next.config.ts` to FastAPI backend on `http://localhost:8000`. Edge CV and IndexedDB autosave ported cleanly to React client hooks/components with zero loss of offline resilience.

**Tech Stack:** Next.js 15, React 19, TypeScript 5, Tailwind CSS 3, Lucide React, Zustand, Axios, QRCode.react, clsx, tailwind-merge, pnpm.

**Spec:** `frontend/docs/plans/2026-10-16-nextjs-migration-and-hosting.md`, `frontend/DESIGN.md`, `frontend/PRODUCT.md`.

## Global Constraints

- **Dependency Management:** Must use `pnpm` (`pnpm-lock.yaml`).
- **UI/UX Consistency:** Preserve exact Sentri institutional color tokens (slate-900 `#0f172a`, accent lime `#c2ef4e`, violet `#4f46e5`, light backgrounds `#f8fafc`, typography Outfit, Plus Jakarta Sans, Rubik, JetBrains Mono).
- **Zero API Contract Breaks:** Backend REST endpoints at `/api/v1/*` and WebSocket endpoints at `/ws/*` remain completely untouched.
- **Offline Resilience:** Preserve IndexedDB local cache (<5ms response save) and 30s heartbeat autosave synchronization for exams.
- **Dual-Proctoring Integrity:** Preserve Edge CV heuristic engines (`proctoringEdge.ts` and `companionEdge.ts`) running in client browser.

## Review Focus

1. **Routing Parity & Clean URLs:** Transition from hash-history (`/#/login`, `/#/dashboard`) to clean App Router paths (`/login`, `/dashboard`, `/student/exam/[examId]`).
2. **Role-Based Auth Guard & Smart Redirection:** `/dashboard` cleanly redirects based on role (superadmin -> `/superadmin/dashboard`, admin -> `/admin/dashboard`, teacher -> `/teacher/dashboard`, student -> `/student/dashboard`). Unauthenticated users redirected to `/login` with `?redirect=`.
3. **Standalone Fullscreen Isolation:** Exam Workspace (`/student/exam/[examId]`) and Mobile Companion (`/companion`) must be completely isolated from standard Dashboard Shell (no sidebar, no navbar).
4. **Hydration & SSR Safety:** Browser-only APIs (`navigator.mediaDevices`, `localStorage`, `indexedDB`, `WebSocket`, `FaceDetector`) must run in client components (`'use client'`) without hydration mismatch.
5. **Production Build Verification:** `pnpm build` must succeed with zero TypeScript or Next.js build errors.

---

### Task 1: Package Management & Next.js Foundation Setup

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/next.config.ts`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tailwind.config.js` (update content paths for Next.js app directory)
- Create: `frontend/postcss.config.js`
- Test: `pnpm install` and verify dependencies

- [ ] **Step 1: Update package.json with Next.js, React, Zustand, Lucide React, and pnpm configuration**
- [ ] **Step 2: Configure next.config.ts with rewrites for /api, /uploads, and /ws**
- [ ] **Step 3: Update tsconfig.json and tailwind.config.js for Next.js App Router paths**
- [ ] **Step 4: Run `pnpm install` and verify lockfile generation**

---

### Task 2: Core Utilities, API Client, and Zustand Stores

**Files:**
- Create/Migrate: `frontend/src/lib/api.ts` (Axios with Bearer token interceptor and 401 handling)
- Create/Migrate: `frontend/src/lib/utils.ts` (cn helper and formatDate)
- Create/Migrate: `frontend/src/utils/indexedDB.ts` (IndexedDB offline answer storage)
- Create/Migrate: `frontend/src/utils/proctoringEdge.ts` (Primary camera CV heuristics)
- Create/Migrate: `frontend/src/utils/companionEdge.ts` (Secondary camera CV & sensors)
- Create: `frontend/src/stores/authStore.ts` (Zustand auth store with localStorage persistence & role getters)
- Create: `frontend/src/stores/examStore.ts` (Zustand exam store with timer, IndexedDB cache & autosave loop)
- Create: `frontend/src/stores/proctoringStore.ts` (Zustand proctoring store with WebSocket alert handling)

- [ ] **Step 1: Implement `src/lib/api.ts` and `src/lib/utils.ts` in TypeScript for Next.js**
- [ ] **Step 2: Verify `src/utils/indexedDB.ts`, `proctoringEdge.ts`, `companionEdge.ts` compatibility**
- [ ] **Step 3: Implement `src/stores/authStore.ts` using Zustand with role getters**
- [ ] **Step 4: Implement `src/stores/examStore.ts` using Zustand with IndexedDB integration**
- [ ] **Step 5: Implement `src/stores/proctoringStore.ts` using Zustand with WebSocket alerts**

---

### Task 3: Root Layout, Global Styles, and Shared Navigation Shell

**Files:**
- Create: `frontend/src/app/globals.css` (Port all Sentri CSS tokens, fonts, custom scrollbars, institutional classes)
- Create: `frontend/src/app/layout.tsx` (Root layout with fonts and metadata)
- Create: `frontend/src/components/layout/Navbar.tsx` (React component matching institutional header)
- Create: `frontend/src/components/layout/Sidebar.tsx` (React component matching role-based sidebar)
- Create: `frontend/src/components/AIAssistantWidget.tsx` (React floating Gemini AI assistant drawer)
- Create: `frontend/src/components/auth/AuthGuard.tsx` (Client-side route protection & role check wrapper)

- [ ] **Step 1: Create `src/app/globals.css` with all EXAMIND light-theme tokens and classes**
- [ ] **Step 2: Create `src/app/layout.tsx` with fonts (Plus Jakarta Sans, Outfit, JetBrains Mono, Rubik)**
- [ ] **Step 3: Port `Navbar.vue` to `Navbar.tsx` with active user info and logout**
- [ ] **Step 4: Port `Sidebar.vue` to `Sidebar.tsx` with role-aware menu items and active route detection**
- [ ] **Step 5: Port `AIAssistantWidget.vue` to `AIAssistantWidget.tsx` with chat history & memory**

---

### Task 4: Public Marketing & Auth Route Groups

**Files:**
- Create: `frontend/src/app/(marketing)/layout.tsx`
- Create: `frontend/src/app/(marketing)/page.tsx` (Landing page ported from `LandingPageView.vue`)
- Create: `frontend/src/app/(auth)/login/page.tsx` (Login page with demo credentials ported from `LoginView.vue`)
- Create: `frontend/src/app/(dashboard)/dashboard/page.tsx` (Universal `/dashboard` redirector based on role)

- [ ] **Step 1: Port Landing page to `(marketing)/page.tsx` with interactive demo elements and full fidelity**
- [ ] **Step 2: Port Login page to `(auth)/login/page.tsx` with quick fill demo logins, role redirect**
- [ ] **Step 3: Implement smart redirect page at `(dashboard)/dashboard/page.tsx`**

---

### Task 5: Authenticated Portal Shell & Dashboard Views

**Files:**
- Create: `frontend/src/app/(dashboard)/layout.tsx` (Dashboard layout embedding Navbar, Sidebar, AIAssistantWidget, AuthGuard)
- Create: `frontend/src/app/(dashboard)/superadmin/dashboard/page.tsx` (Institutions & Tenant management)
- Create: `frontend/src/app/(dashboard)/superadmin/secrets/page.tsx` (Secret manager tab)
- Create: `frontend/src/app/(dashboard)/superadmin/components/TenantTable.tsx`
- Create: `frontend/src/app/(dashboard)/superadmin/components/TenantModal.tsx`
- Create: `frontend/src/app/(dashboard)/superadmin/components/SecretManagerTab.tsx`
- Create: `frontend/src/app/(dashboard)/admin/dashboard/page.tsx` (School admin dashboard)
- Create: `frontend/src/app/(dashboard)/teacher/dashboard/page.tsx` (Teacher dashboard)
- Create: `frontend/src/app/(dashboard)/student/dashboard/page.tsx` (Student dashboard)

- [ ] **Step 1: Create `(dashboard)/layout.tsx` with shared dashboard shell**
- [ ] **Step 2: Implement SuperAdmin dashboard, TenantTable, TenantModal, and SecretManagerTab**
- [ ] **Step 3: Implement Admin dashboard with school metrics, active exams, teacher roster**
- [ ] **Step 4: Implement Teacher dashboard with academic overview, grading queue, question banks**
- [ ] **Step 5: Implement Student dashboard with exam cards, status badges, and past results**

---

### Task 6: Academic & Question Bank Management Views

**Files:**
- Create: `frontend/src/app/(dashboard)/classes/page.tsx` (Classes list & create)
- Create: `frontend/src/app/(dashboard)/classes/[id]/page.tsx` (Class detail, student roster, CSV import)
- Create: `frontend/src/app/(dashboard)/questions/page.tsx` (Question bank master list)
- Create: `frontend/src/app/(dashboard)/questions/[id]/page.tsx` (Question bank detail, question editor)
- Create: `frontend/src/app/(dashboard)/questions/components/AIGeneratorModal.tsx` (AI question generation modal)

- [ ] **Step 1: Implement `classes/page.tsx` and `classes/[id]/page.tsx`**
- [ ] **Step 2: Implement `questions/page.tsx` and `questions/[id]/page.tsx`**
- [ ] **Step 3: Implement `AIGeneratorModal.tsx` with prompt customization, preview, and import**

---

### Task 7: Exam Scheduling, Live Proctoring, Grading & Analytics

**Files:**
- Create: `frontend/src/app/(dashboard)/exams/page.tsx` (Exam schedules list)
- Create: `frontend/src/app/(dashboard)/exams/create/page.tsx` (Create exam with question bank picker & timer)
- Create: `frontend/src/app/(dashboard)/exams/[id]/page.tsx` (Exam detail & participant status)
- Create: `frontend/src/app/(dashboard)/exams/[id]/monitor/page.tsx` (Live dual-camera monitoring dashboard)
- Create: `frontend/src/app/(dashboard)/grading/page.tsx` and `frontend/src/app/(dashboard)/grading/[sessionId]/page.tsx` (AI Essay grading review & teacher override)
- Create: `frontend/src/app/(dashboard)/analytics/page.tsx` and `frontend/src/app/(dashboard)/analytics/exam/[id]/page.tsx` (Item analysis & psychometrics)

- [ ] **Step 1: Implement `exams/page.tsx`, `exams/create/page.tsx`, and `exams/[id]/page.tsx`**
- [ ] **Step 2: Implement `exams/[id]/monitor/page.tsx` with live proctoring grid and alert feed**
- [ ] **Step 3: Implement `grading/page.tsx` and `grading/[sessionId]/page.tsx` with 4D rubric scoring**
- [ ] **Step 4: Implement `analytics/page.tsx` and exam analytics charts**

---

### Task 8: Student Exam Workspace, Result View & Mobile Companion

**Files:**
- Create: `frontend/src/app/(exam)/student/exam/[examId]/page.tsx` (Fullscreen exam environment)
- Create: `frontend/src/app/(exam)/student/exam/[examId]/components/QuestionCard.tsx`
- Create: `frontend/src/app/(exam)/student/exam/[examId]/components/CompanionQrModal.tsx`
- Create: `frontend/src/app/(exam)/student/exam/[examId]/components/ExamSubmitModal.tsx`
- Create: `frontend/src/app/(exam)/student/exam/[examId]/components/SecurityWarningModal.tsx`
- Create: `frontend/src/app/(dashboard)/student/exam/[examId]/result/page.tsx` (Exam result breakdown)
- Create: `frontend/src/app/(dashboard)/student/exam/[examId]/result/components/QuestionExplanationChat.tsx`
- Create: `frontend/src/app/(companion)/companion/page.tsx` (Mobile companion dual-camera view)

- [ ] **Step 1: Implement `student/exam/[examId]/page.tsx` with timer, question navigator, autosave indicator**
- [ ] **Step 2: Implement QuestionCard, CompanionQrModal, ExamSubmitModal, SecurityWarningModal**
- [ ] **Step 3: Implement `student/exam/[examId]/result/page.tsx` with QuestionExplanationChat**
- [ ] **Step 4: Implement `companion/page.tsx` mobile-first camera & sensor view**

---

### Task 9: Clean Up Old Vue Artifacts & Verify Production Build

**Files:**
- Remove old Vue files (`src/App.vue`, `src/main.ts`, `src/router/`, `src/stores/`, `src/views/`, `vite.config.ts`, `index.html`)
- Update `frontend/README.md`
- Test: Run `pnpm build` and verify 0 errors
- Test: Verify routing and proxy configuration

- [ ] **Step 1: Remove deprecated Vue-specific files**
- [ ] **Step 2: Execute `pnpm build` to compile the Next.js application**
- [ ] **Step 3: Verify all routes compile and type checking passes**
- [ ] **Step 4: Update documentation with Next.js & pnpm commands**
