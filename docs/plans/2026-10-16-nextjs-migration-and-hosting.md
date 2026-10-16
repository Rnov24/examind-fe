# EXAMIND — Rencana Migrasi Next.js + Hosting

Tanggal: 2026-10-16
Status: DRAFT — menunggu persetujuan Jal sebelum eksekusi
Repo terkait: `examind-fe` (Vue 3 saat ini), `examind-be` (FastAPI, tidak berubah)

---

## 0. Premis yang diluruskan dulu

**Migrasi framework BUKAN syarat teknis untuk AI proctoring di browser.**
`onnxruntime-web` dan MediaPipe Tasks Vision jalan di framework apa pun, termasuk
Vue 3 yang sekarang. Kalau tujuannya murni "bisa load ONNX YOLO / MediaPipe",
itu bisa dikerjakan langsung di codebase Vue tanpa migrasi.

Alasan yang valid untuk tetap pindah ke Next.js + React:

1. **Hosting paling mulus di Vercel** (zero-config buat Next.js; Jal sudah punya
   koneksi Vercel yang verified).
2. **Ekosistem contoh React untuk ML-web lebih kaya** (contoh YOLO + onnxruntime-web
   kebanyakan ditulis di React).
3. **SSR/App Router** berguna untuk landing page dan halaman publik yang butuh SEO.
4. React lebih umum di hiring / kolaborasi.

Keputusan: migrasi tetap jalan, tapi ekspektasinya benar — ini investasi
ekosistem & hosting, bukan prasyarat ONNX.

---

## 1. Arsitektur AI Proctoring (diputuskan SEBELUM migrasi)

Ini keputusan paling penting. Framework belakangan; arsitektur inferensi duluan.

### Opsi A — Inferensi di browser (client-side) ✅ direkomendasikan

- **YOLOv8n/s** (export ke ONNX, ~6–20 MB) via `onnxruntime-web` untuk deteksi
  objek: HP, orang tambahan di frame.
- **MediaPipe Tasks Vision** (WASM, ringan, official) untuk face detection,
  face landmarks (arah tatap/gaze), dan pose. Untuk deteksi HP, MediaPipe juga
  punya task **ObjectDetector** (EfficientDet-Lite) yang jauh lebih ringan dari
  YOLO — cukup untuk kasus "ada HP di meja", YOLO baru dipakai kalau butuh
  akurasi lebih tinggi.
- Kelebihan: privasi (video tidak pernah keluar dari laptop siswa), tidak butuh
  GPU di server, scaling murah (komputasi ditanggung client).
- Kekurangan: butuh WebGPU (Chrome/Edge modern) untuk kecepatan layak; fallback
  WASM di laptop kentang hanya ~2–5 fps.
- Mitigasi: **inference WAJIB di Web Worker** (jangan di main thread),
  frame-skipping (infer tiap N frame), input di-downscale ke 320–416px,
  execution provider `webgpu` → fallback `wasm`.

### Opsi B — Inferensi di server

- Snapshot dikirim ke backend, YOLO jalan di server.
- Kekurangan: butuh GPU server (mahal), latensi upload, masalah privasi video.
- Peran yang masuk akal: **verifikasi sekunder** — hanya snapshot yang di-flag
  oleh client yang dikirim untuk dicek ulang, bukan semua frame.

### Keputusan arsitektur

**KEPUTUSAN Jal (2026-10-16): Opsi A, full client-side.** ONNX (YOLO) dan
MediaPipe jalan di browser via Web Worker — tidak ada inferensi di server.

Konsekuensi penting dari keputusan ini: **`torch` bisa dicopot dari
`requirements.txt` backend.** Backend tinggal FastAPI + SQLAlchemy + Pydantic,
jadi ringan dan muat di free tier 512 MB (lihat 3.2). Model PyTorch tetap
dibutuhkan di sisi training (export YOLO → ONNX), tapi tidak ikut di-deploy.

**Opsi A sebagai primary** (event ringan: wajah hilang, wajah >1, HP terdeteksi),
**Opsi B opsional** untuk verifikasi snapshot yang di-flag. Kontrak event antara
frontend–backend didefinisikan dulu (lihat Fase 0), supaya migrasi framework
tidak mengulang kerjaan proctoring dua kali.

---

## 2. Rencana migrasi Vue 3 → Next.js + React

### Strategi: strangler, bukan big-bang

Vue app yang sekarang tetap jadi referensi hidup sampai tiap rute selesai
dipindah dan lolos smoke test. Jangan hapus sebelum penggantinya terbukti jalan.

### Urutan migrasi (berdasarkan nilai & risiko)

| Fase | Cakupan | Kenapa urutan ini |
|------|---------|-------------------|
| 1 | Shell: auth, layout, landing page | Fondasi routing + session |
| 2 | Student exam flow (inti produk) | Jalur paling kritis, paling sering dipakai |
| 3 | **Proctoring + ONNX/MediaPipe** | Bukti konsep AI dulu di satu halaman terisolasi, baru diintegrasi ke exam flow |
| 4 | Teacher/admin (question bank, grading, monitoring) | Pengguna lebih sedikit, toleran |
| 5 | Analytics & reporting | Paling akhir, read-heavy |

### Pemetaan teknis Vue → Next.js

- **Framework**: Next.js 15+ (App Router) + React 19 + TypeScript strict
- **Routing**: `vue-router` → App Router. Grup rute: `(auth)`, `(student)`,
  `(teacher)`, `(admin)` — sejajar dengan folder `views/` yang sekarang.
- **State**: Pinia stores (`auth`, `exam`, `proctoring`) → **Zustand**
  (paling dekat secara mental model dengan Pinia).
- **Styling**: Tailwind CSS tetap; `shadcn-vue` → `shadcn/ui` (React).
- **Ikon**: `lucide-vue-next` → `lucide-react`.
- **API layer**: `axios` + `src/lib/api.ts` → fetch wrapper tipis (atau tetap
  axios, tidak wajib ganti). Kontrak REST `/api/v1` **tidak berubah** — backend
  tidak disentuh.
- **Dev proxy**: `vite.config.ts` proxy `/api`, `/ws`, `/uploads` →
  `next.config.ts` `rewrites()` ke `http://localhost:8000`.
- **Realtime**: WebSocket proctoring tetap langsung ke backend (`ws://localhost:8000`).
- **Offline-first**: `src/utils/indexedDB.ts` (autosave jawaban) diport ke TS —
  ini fitur kritis ujian, jangan sampai hilang di migrasi.
- **Halaman proctoring**: full client component (`'use client'`) + `dynamic()`
  dengan `ssr: false` untuk modul ONNX/MediaPipe (tidak bisa di-SSR).
- **Model assets**: file `.onnx` dan model MediaPipe taruh di `public/models/`
  atau CDN (lihat bagian hosting). Jangan di-bundle ke JS.

### Kriteria selesai per fase

1. Rute baru di Next.js parity dengan Vue (fitur + tampilan).
2. Smoke test manual lolos (login → kerjakan ujian → submit).
3. Rute lama di Vue ditandai deprecated, dimatikan setelah 1 fase tenggang.

### Yang TIDAK berubah

- `examind-be`: API contract, schema database, auth (JWT) tetap.
- `database/`: schema, migrasi, seed tetap.
- `docs/` dan `GEMINI.md`: tetap jadi acuan.

---

## 3. Rencana hosting (best practice)

Prinsip: **pisahkan sesuai sifat bebannya** — frontend statis/edge, backend
proses always-on, database managed/mandel, file besar di object storage.

### 3.1 Frontend (Next.js) → Vercel ✅

- **Pilihan utama: Vercel Hobby (gratis).** Angka 2026: 100 GB bandwidth/bulan,
  1 juta function invocation, 6000 menit build — sangat cukup untuk tahap
  pengembangan dan demo. Jal sudah punya koneksi Vercel yang verified
  (project `icrt` live di sana).
- Batasan jujur: Hobby **non-komersial**; kalau EXAMIND dipakai komersial
  (dijual ke sekolah), naik ke Pro ($20/user/bulan) atau pindah.
- Praktik: model `.onnx` yang besar **jangan** diserve dari Vercel (menggerus
  bandwidth) — taruh di object storage (3.4).
- Alternatif: Cloudflare Pages (juga gratis, boleh komersial di free tier tapi
  bandwidth jauh lebih kecil).

### 3.2 Backend (FastAPI) → Render free + keep-alive (Rp0)

Syarat Jal: **gratis**. Realita free tier 2026 (dicek 2026-10-16): hampir semua
yang "beneran gratis" sudah mati atau butuh kartu kredit — Koyeb free tier
retired, Hugging Face Docker Spaces sekarang butuh PRO, Railway praktis
berbayar, Oracle/GCP/Fly.io butuh kartu untuk verifikasi.

- **Pilihan utama: Render free web service (tanpa kartu kredit).**
  Native Python/FastAPI, RAM 512 MB. Syarat muat: **copot `torch` dari
  `requirements.txt`** — sudah tidak dibutuhkan karena inferensi pindah ke
  browser (keputusan Opsi A). Sisanya (FastAPI, SQLAlchemy, Pydantic) muat
  nyaman di 512 MB.
- **Kelemahan jujur**: service sleep setelah ~15 menit idle, bangunnya
  ~30–60 detik. Mitigasi: **cron-job.org** (gratis, tanpa kartu) ping
  `/api/health` tiap 10 menit supaya tidak pernah idle. Trik ini umum dipakai
  dan cukup untuk demo/pengembangan. Untuk hari-H ujian beneran dengan puluhan
  siswa serentak, free tier bukan tempatnya — siapkan upgrade saat itu tiba.
- **Alternatif kalau nanti punya kartu kredit**: Oracle Cloud Always Free —
  VM ARM 2 OCPU/12 GB selamanya + managed MySQL HeatWave 50 GB, tidak pernah
  sleep. Tapi butuh kartu untuk verifikasi, dan ada risiko idle-reclamation
  (VM bisa dihapus kalau 7 hari berturut-turut di bawah 20% CPU/memori).
- Praktik: healthcheck di `/health`, env var via Render dashboard (secret
  jangan di-commit, Secret Manager backend tetap dipakai).

### 3.3 Database → TiDB Cloud Starter (MySQL-compatible, gratis)

- **Pilihan utama: TiDB Cloud Starter** — free tier tanpa kartu kredit:
  5 GB row storage, 50 juta Request Unit/bulan, wire-compatible MySQL 8.0.
  SQLAlchemy + PyMySQL yang sekarang **tidak perlu ganti driver**; yang berubah
  hanya connection string (host TiDB, port 4000, SSL wajib).
- Backup otomatis dari dashboard TiDB. Schema dan migrasi Alembic tetap jalan
  seperti biasa.
- Catatan jujur: `GEMINI.md` menyebut MySQL via XAMPP sebagai syarat proyek
  kampus. Kalau EXAMIND ini untuk tugas kampus, **skenario XAMPP tetap
  dipertahankan untuk demo di kampus**; TiDB adalah jalur deployment beneran.
  Dua-duanya bisa hidup berdampingan, ganti env var saja.
- Alternatif gratis: MySQL di VM Oracle Always Free (butuh kartu kredit),
  atau SQLite untuk dev lokal.

### 3.4 File besar (model ONNX, snapshot proctoring) → Object storage

- **Cloudflare R2** (free tier 10 GB, tanpa biaya egress) untuk: file `.onnx`,
  model MediaPipe, snapshot bukti proctoring.
- Jangan simpan snapshot di database (membengkakkan backup) atau di Vercel.

### 3.5 Domain, TLS, dan keamanan

- Cloudflare di depan sebagai DNS + WAF: `app.examind.id` → Vercel,
  `api.examind.id` → Railway/VPS.
- Secret (JWT key, LLM API key) via Secret Manager yang sudah ada di backend
  (`app/core/secret_manager.py`), bukan hardcode.
- CORS backend hanya allow origin frontend production.

### Ringkasan arsitektur target

```
Siswa (browser)
 ├── Next.js di Vercel ──→ app.examind.id
 │     ├── /api/* ──rewrite──→ FastAPI di Railway/VPS (api.examind.id)
 │     ├── /ws ───websocket──→ FastAPI (proctoring realtime)
 │     └── model .onnx ──→ Cloudflare R2 (CDN)
 └── ONNX/MediaPipe jalan lokal di Web Worker (privasi terjaga)

FastAPI (Render free, keep-alive via cron-job.org)
 ├── TiDB Cloud Starter (MySQL-compatible, gratis) — backup otomatis
 └── snapshot flag ──→ R2
```

---

## 4. Estimasi urutan kerja

| Tahap | Isi | Estimasi |
|-------|-----|----------|
| Fase 0 | Putuskan arsitektur proctoring (A/B) + PoC ONNX/MediaPipe di satu halaman terisolasi + definisikan kontrak event proctoring | 1–2 minggu |
| Fase 1 | Scaffold Next.js, migrasi shell (auth/layout/landing) | 1–2 minggu |
| Fase 2 | Migrasi student exam flow + indexedDB autosave | 2–3 minggu |
| Fase 3 | Integrasi proctoring AI ke exam flow | 2 minggu |
| Fase 4–5 | Teacher/admin + analytics | 3–4 minggu |
| Paralel | Setup hosting: Vercel (fe), Railway (be+db), R2, domain | 1 minggu (di sela fase 1–2) |

Estimasi kasar total: **2,5–4 bulan** dengan eksekusi via agy di kuota Jal,
bapak yang review diff-nya seperti biasa.

---

## 5. Keputusan yang butuh jawaban Jal sebelum eksekusi

1. **Arsitektur proctoring**: ✅ DIPUTUSKAN (2026-10-16) — Opsi A, full client-side.
   ONNX (YOLO) + MediaPipe jalan di browser via Web Worker.
2. **YOLO vs MediaPipe ObjectDetector** untuk deteksi HP: mulai dari yang ringan
   (MediaPipe) dulu, atau langsung YOLO?
3. **Hosting**: ✅ DIPUTUSKAN (2026-10-16) — full gratis: Vercel (fe) + Render
   free + keep-alive (be) + TiDB Cloud Starter (db) + Cloudflare R2 (storage).
4. **Mulai dari Fase 0 (PoC proctoring) atau Fase 1 (scaffold Next.js)?**
   Rekomendasi bapak: Fase 0 dulu — kalau PoC proctoring gagal di laptop
   kentang, seluruh rencana berubah dan kita hemat berminggu-minggu kerja sia-sia.
