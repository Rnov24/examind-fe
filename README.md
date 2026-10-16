# EXAMIND Frontend (Next.js 15 + App Router)

> Production Next.js 15 (React 19 + TypeScript + Tailwind CSS) frontend for the EXAMIND AI-Powered Online Examination Platform (*Sistem Ujian Online Berbasis AI*). Fully managed via **pnpm**.

Companion repo: [Rnov24/examind-be](https://github.com/Rnov24/examind-be) (FastAPI backend).

---

## ⚡ Tech Stack & Architecture

- **Next.js 15** (App Router) + **React 19** + **TypeScript 5.8**
- **pnpm** exclusively for deterministic dependency management (`pnpm-lock.yaml`, `.npmrc`)
- **Tailwind CSS 3.4** + `@tailwindcss/typography`, preserving 100% fidelity to [`DESIGN.md`](./DESIGN.md) (institutional slate/indigo/#c2ef4e aesthetic, Plus Jakarta Sans, Outfit, Rubik, JetBrains Mono)
- **Zustand** reactive stores (`authStore`, `examStore`, `proctoringStore`)
- **Lucide React** icon library
- **Edge AI & Computer Vision Proctoring**:
  - `src/utils/proctoringEdge.ts`: Primary camera face detection heuristics & fullscreen tracking
  - `src/utils/companionEdge.ts`: Secondary phone camera edge CV, gyroscope/accelerometer telemetry, glare detection
  - `src/utils/indexedDB.ts`: Offline-first question/answer caching

---

## 📁 App Router Organization

Routing has been upgraded from legacy hash history to structured Next.js route groups:

```text
frontend/src/app/
├── (marketing)/                # Public landing & feature marketing
│   ├── layout.tsx
│   └── page.tsx                # http://localhost:3000/
├── (auth)/                     # Authentication
│   ├── layout.tsx
│   └── login/page.tsx          # http://localhost:3000/login
├── (dashboard)/                # Role-based dashboard & administration
│   ├── layout.tsx              # Shell with institutional Navbar & Sidebar
│   ├── dashboard/page.tsx      # Role router redirector
│   ├── superadmin/dashboard/   # Tenant & multi-school management
│   ├── superadmin/secrets/     # KMS & encrypted secret management
│   ├── admin/dashboard/        # School admin dashboard
│   ├── teacher/dashboard/      # Teacher overview & quick actions
│   ├── student/dashboard/      # Student schedule & exam history
│   ├── classes/ & [id]/        # Class roster & student management
│   ├── questions/ & [id]/      # AI-assisted question bank workspace
│   ├── exams/                  # Exam catalog, creator & editor
│   ├── exams/[id]/monitor/     # Real-time dual-camera proctoring monitor
│   ├── grading/                # AI & human-in-the-loop grading workspace
│   └── analytics/              # Psychometric IRT & Bloom analytics
├── (exam)/                     # High-security exam workspace
│   ├── layout.tsx              # Distraction-free full-screen shell
│   └── student/exam/[examId]/  # Exam runner with edge proctoring & offline IndexedDB
└── (companion)/                # Secondary mobile proctoring camera
    ├── layout.tsx
    └── companion/page.tsx      # Mobile phone camera & gyroscope telemetry streamer
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+ or 10+ (`npm install -g pnpm`)
- EXAMIND Backend running at `http://localhost:8000`

### Setup & Development

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies with pnpm
pnpm install

# Start Next.js development server
pnpm dev
```

The application runs on `http://localhost:3000`. API and WebSocket calls route automatically to the backend (`http://localhost:8000`).

### Production Build & Verification

```bash
# Type check without emitting
pnpm exec tsc --noEmit

# Optimized production Next.js build
pnpm build

# Run production server
pnpm start
```
