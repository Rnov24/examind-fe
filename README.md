# examind-fe — EXAMIND Frontend

> Vue 3 + TypeScript + Vite frontend for the EXAMIND AI-Powered Online Examination Platform (Sistem Ujian Online Berbasis AI).

Companion repo: [Rnov24/examind-be](https://github.com/Rnov24/examind-be) (FastAPI backend). Split from the original `Rnov24/examind` monorepo on 2026-10-16.

## Tech stack

- **Vue 3.5** + TypeScript, **Vite 5** dev server on port **3000**
- **Vue Router 4** (with auth navigation guards), **Pinia** stores (`auth`, `exam`, `proctoring`)
- **Tailwind CSS 3**, `lucide-vue-next` icons, `qrcode.vue`
- Offline-first exam flow helpers in `src/utils/` (`indexedDB.ts`, `companionEdge.ts`, `proctoringEdge.ts`)
- Design system & product notes: [`DESIGN.md`](./DESIGN.md), [`PRODUCT.md`](./PRODUCT.md)
- Full platform specs: [`docs/`](./docs) (PRD, SRS, UX, UML, tickets)

## Prerequisites

- Node.js 20+
- pnpm (or npm)
- Backend running at `http://localhost:8000` (see examind-be)

## Setup

```bash
pnpm install        # or: npm install
pnpm dev            # starts Vite on http://localhost:3000
```

The dev server proxies `/api`, `/ws` and `/uploads` to `http://localhost:8000`, so the frontend talks to the backend with zero CORS setup in development.

Production builds use an absolute backend URL (`http://<host>:8000/api/v1`) — see `src/lib/api.ts`.

## Build for XAMPP

```bash
pnpm build          # output goes to dist/
```

Then serve via Apache: [`index.php`](./index.php) at this repo root redirects straight to `dist/`, so you can drop this repo's contents into `c:\xampp\htdocs\examind-fe` and open it in the browser without `npm`.

## One-click launch (Windows)

`scripts/start_examind.bat` starts MySQL (XAMPP), the FastAPI backend and this Vite dev server, assuming both repos are cloned side by side:

```
<parent>/
├── examind-fe/
└── examind-be/
```

`scripts/stop_examind.bat` stops everything.
