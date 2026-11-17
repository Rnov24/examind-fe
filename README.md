# EXAMIND Frontend

[![CI](https://github.com/Rnov24/examind-fe/actions/workflows/ci.yml/badge.svg)](https://github.com/Rnov24/examind-fe/actions/workflows/ci.yml)

Next.js frontend for EXAMIND, an AI-powered online examination platform (*Sistem Ujian Online Berbasis AI*). Students take exams in the browser with on-device dual-camera proctoring; teachers manage questions, exams, and grading; admins and superadmins manage schools, tenants, and secrets.

Companion repo: [Rnov24/examind-be](https://github.com/Rnov24/examind-be) (FastAPI backend).

## Live links

- App: https://examind.rijal.work
- API edge: https://examind-api.rijal.work
- Backend (Modal): https://rnov24--examind-be-api.us-east.modal.run

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript 5.7
- Tailwind CSS 3.4, design tokens in [`DESIGN.md`](./DESIGN.md): midnight-violet `#150f23` canvas, lime `#c2ef4e` accent, pedagogical violet `#6a5fc1`. Display face Outfit, body Plus Jakarta Sans (Rubik fallback), code and telemetry JetBrains Mono.
- Zustand stores (`authStore`, `examStore`, `proctoringStore`, `uiStore`)
- Axios API client, Lucide icons
- On-device proctoring with MediaPipe Tasks Vision (BlazeFace face detection, EfficientDet-Lite0 object detection), self-hosted models under `public/models/`
- pnpm for dependency management (`pnpm-lock.yaml`, `.npmrc`)

## Local setup

Prerequisites: Node.js 22 and pnpm 9 (same versions CI uses).

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

The app runs on http://localhost:3000. The backend must be running locally, or point `BACKEND_URL` at a deployed backend (see below).

## Environment variables

All four are documented in `.env.example`:

| Variable | What it does | Local dev | Production |
| --- | --- | --- | --- |
| `BACKEND_URL` | Backend base URL for the Next.js rewrites in `next.config.ts` | `http://localhost:8000` (default) | Modal backend URL |
| `NEXT_PUBLIC_API_URL` | API base URL used only for server-side rendering; browser requests use the relative `/api/v1` path instead | `http://localhost:8000/api/v1` | Modal backend URL + `/api/v1` |
| `NEXT_PUBLIC_WS_URL` | WebSocket base URL the browser connects to directly | Leave empty (falls back to the page's own host) | `wss://rnov24--examind-be-api.us-east.modal.run` |
| `NEXT_PUBLIC_CS_WHATSAPP` | Optional customer-service WhatsApp number; leave empty to hide the buttons | — | — |

How requests reach the backend: browser fetches use the relative path `/api/v1`, and the rewrites in `next.config.ts` proxy them to `BACKEND_URL` (`/api/health` maps to the backend's `/health`, `/uploads/*` is proxied too). WebSocket upgrades are not proxied by Next.js rewrites, so all WebSocket code goes through `wsBaseUrl()` in `src/lib/ws.ts`, which reads `NEXT_PUBLIC_WS_URL`.

## Tests and build

There is no test suite in this repo. Verification is the type check and the production build (CI runs the build on every push to `main` and every pull request):

```bash
pnpm exec tsc --noEmit
pnpm build
pnpm start
```

## Deploy

Deployed on Vercel at https://examind.rijal.work; pushes to `main` deploy. Set `BACKEND_URL`, `NEXT_PUBLIC_API_URL`, and `NEXT_PUBLIC_WS_URL` to the Modal backend in the Vercel project settings.

## Repo map

```text
src/app/
├── (marketing)/                 # Public landing page (/)
├── (auth)/                      # login, register, forgot-password, reset-password
├── (dashboard)/                 # Role-based shell (Navbar + Sidebar)
│   ├── dashboard/               # Role router
│   ├── admin/dashboard/         # School admin dashboard
│   ├── teacher/dashboard/       # Teacher overview
│   ├── student/dashboard/       # Student dashboard
│   ├── student/results/         # Riwayat Hasil Ujian (student exam history)
│   ├── student/exam/[examId]/result/  # Per-exam result view
│   ├── superadmin/dashboard/    # Tenant and multi-school management
│   ├── superadmin/tenants/      # Tenants
│   ├── superadmin/finance/      # Finance
│   ├── superadmin/pricing/      # Pricing
│   ├── superadmin/secrets/      # Encrypted secret management
│   ├── classes/ & [id]/         # Class roster and student management
│   ├── questions/ & [id]/       # Question bank workspace
│   ├── exams/                   # Exam catalog, creator (create/), editor ([id]/)
│   ├── exams/[id]/monitor/      # Real-time dual-camera proctoring monitor
│   ├── exams/[id]/grading/      # Per-exam grading workspace
│   ├── exams/[id]/analytics/    # Per-exam analytics
│   ├── grading/ & [sessionId]/  # AI and human-in-the-loop grading workspace
│   ├── results/[sessionId]/     # Session result detail
│   ├── proctoring/exam/[id]/    # Proctoring console
│   └── analytics/ & exam/[id]/  # Item analysis (difficulty p-index,
│                                 # discrimination d-index), score distribution,
│                                 # class averages, KKM completeness
├── (exam)/                      # Distraction-free full-screen exam shell
│   └── student/exam/[examId]/   # Exam runner with edge proctoring
└── (companion)/                 # Secondary mobile proctoring camera
    └── companion/               # Phone camera and gyroscope telemetry streamer
```

Proctoring and offline code in `src/utils/`:

- `proctoringEdge.ts` — primary camera engine: MediaPipe BlazeFace face detection and EfficientDet-Lite0 object detection via `mediapipeDetect.ts`, with a native FaceDetector / luma-heuristic fallback, plus fullscreen tracking.
- `companionEdge.ts` — secondary phone camera engine: EfficientDet-Lite0 person/phone detection, gyroscope/accelerometer telemetry, motion and glare heuristics. Runs fully on the device; no video is streamed to the server.
- `indexedDB.ts` — offline-first answer cache (`examind_offline_db`, `answers_cache` store) so student answers survive a dropped connection.
