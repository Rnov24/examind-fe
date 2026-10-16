# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

1. **Siswa (Peserta Ujian)**:
   - Siswa SMP/SMA/SMK yang mengerjakan ujian terjadwal di lingkungan sekolah atau jarak jauh dengan pengawasan kamera.
   - Kebutuhan: Ruang ujian yang tenang, minim distraksi, bebas lag, autosave jawaban terjamin (resilien terhadap gangguan koneksi), dan pembahasan soal interaktif pasca-ujian melalui Socratic Tutor AI.

2. **Guru / Tenaga Pendidik**:
   - Guru mata pelajaran yang membuat paket soal, menentukan rubrik penilaian, memantau integritas siswa selama ujian secara realtime, dan meninjau/mengoreksi hasil esai.
   - Kebutuhan: Generator soal AI dari materi/silabus, review log proctoring dengan bukti snapshot, penilaian esai otomatis berbantuan rubrik 4 dimensi, serta wewenang mutlak untuk override nilai AI.

3. **Admin / Kepala Sekolah**:
   - Pengelola akademik yang mengatur kelas, rombel, akun siswa/guru, dan analitik rekapitulasi nilai sekolah.

## Product Purpose

EXAMIND adalah platform ujian online cerdas berstandar institusi pendidikan yang memadukan AI Question Generator, AI Dual-Camera Proctoring dengan prinsip Human-in-the-Loop, dan AI Essay Grading dengan penjelasan interaktif Socratic Tutor. Sukses bagi EXAMIND berarti:
- Ujian terlaksana dengan integritas tinggi tanpa menghukum siswa secara keliru.
- Beban administratif guru dalam membuat soal dan mengoreksi esai berkurang hingga 80%.
- Siswa mendapatkan pengalaman belajar bermakna pasca-ujian melalui pembahasan konsep mendalam.

## Positioning

**"Human-in-the-Loop AI Proctoring & Pedagogical Essay Evaluation"**
Berbeda dengan platform CBT konvensional (yang hanya berupa form pilihan ganda statis) atau software proctoring komersial invasif (yang mendiskualifikasi siswa secara otomatis lewat algoritma hitam), EXAMIND:
1. Menjadikan AI sebagai asisten pengawas yang mengumpulkan bukti terverifikasi (snapshot + timestamp) namun menyerahkan keputusan diskualifikasi sepenuhnya kepada guru/manusia.
2. Mengoreksi esai secara transparan menggunakan rubrik 4 dimensi (Konsep, Argumen, Terminologi, Kejelasan) dan menyediakan pendampingan belajar Socratic pasca-ujian.

## Operating Context

- **Lingkungan Ujian**: Perangkat laptop/PC desktop dengan webcam utama (dan opsi kamera ganda smartphone untuk sudut meja/lingkungan). Fullscreen locked dengan deteksi tab-switching.
- **Konektivitas**: Mengantisipasi fluktuasi jaringan sekolah melalui edge autosave (IndexedDB lokal) dan sinkronisasi berkala (30s heartbeat sync).
- **Kepatuhan Privasi**: Mematuhi UU Pelindungan Data Pribadi (UU PDP) Indonesia dengan consent kamera eksplisit dan pembersihan otomatis snapshot proctoring setelah 60 hari.

## Capabilities and Constraints

- **Kapabilitas Utama**:
  - AI Question Generator (Pilihan ganda dengan distractor analysis dan esai dengan rubrik 4D).
  - Evaluasi Pilihan Ganda Instan & Evaluasi Esai Asinkron via LLM (Google Gemini).
  - Socratic Tutor AI untuk diskusi butir soal dan penjelasan konsep pasca-ujian.
  - Asisten Akademik AI Global terintegrasi data database realtime ber-caching cepat.
  - Dual-Camera Proctoring & Live Teacher Monitoring via WebSockets.
  - Ekspor Berita Acara & Transkrip Hasil Ujian format PDF resmi.
- **Batasan & Non-Goals**:
  - BUKAN Learning Management System (LMS) penuh: Tidak ada materi belajar mingguan, forum diskusi publik, atau pengumpulan tugas harian.
  - BUKAN School Information System (SIS): Tidak mencakup absensi harian umum atau administrasi SPP.
  - Tidak mendukung penilaian lembar kertas fisik yang discan untuk v1.
- **Stack & Batasan Teknis**:
  - Frontend: Vue 3 + TypeScript + Vite + Tailwind CSS + shadcn-vue (Radix Vue) + Pinia.
  - Backend: FastAPI (Python 3.10+) + Pydantic v2 + SQLAlchemy 2.0.
  - Database: MySQL via XAMPP (port 3306).

## Brand Commitments

- **Tone & Identity**: Institusional, otoritatif, terpercaya, elegan, dan akademik ("Slate-900 Institutional").
- **Anti-Slop Directives**:
  - Menolak visual AI murahan: Dilarang menggunakan gradien pelangi mencolok (`indigo-to-purple`), efek partikel/glow berlebih, border radius membulat berlebihan (`rounded-3xl` / pill pada container besar), dan animasi berputar lambat (`animate-spin-slow`).
  - Mengutamakan kontras tinggi, micro-borders tajam (`border-slate-200` / `border-slate-800`), font sans & mono terstruktur, dan tata letak padat fungsional (high-density scanability).
- **Bahasa**: Bahasa Indonesia formal-edukatif, lugas, dan suportif.

## Evidence on Hand

- Database schema lengkap & migrations SQLAlchemy/Alembic di `backend/app/models/`.
- Seed data demo terverifikasi: Siswa Andi Pratama (`0081234567`), Guru Budi Santoso, Admin Sekolah, dan Superadmin.
- Live backend API di `http://127.0.0.1:8000` dan frontend portal di `http://localhost:3000`.
- Modul AI teruji: `gemini_adapter.py`, `retrieval.py`, `cache.py`, `safety_guardrails.py`.

## Product Principles

1. **Human Oversight is Absolute**: AI hanya mendeteksi dan mengusulkan bukti; manusia (guru) memegang wewenang mutlak untuk diskualifikasi dan nilai akhir.
2. **Zero Exam-State Loss**: Integritas data jawaban siswa diutamakan di atas segalanya — autosave multi-layer lokal dan server.
3. **Calm, High-Focus Exam Workspace**: Antarmuka pengerjaan ujian harus hening, bebas ornamen visual yang mengalihkan perhatian, dan responsif tanpa lag.
4. **Pedagogical Feedback over Black-Box Scoring**: Siswa berhak memahami alasan di balik setiap penilaian dan kesalahan yang dibuat.
5. **Data Privacy & Institutional Dignity**: Citra wajah dan video siswa diperlakukan sebagai data sensitif dengan protokol keamanan ketat.

## Accessibility & Inclusion

- Keyboard navigasi lengkap pada ruang ujian (tombol pintas navigasi butir soal, tombol pilihan A-E, dan penanda ragu-ragu).
- Kontras rasio teks minimum WCAG AA pada teks soal, opsi jawaban, dan status proctoring.
- Penanda visual ganda (ikon + teks label) untuk status koneksi, baterai, dan pengawasan kamera.
