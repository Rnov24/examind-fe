---
version: 1.0.0
name: EXAMIND-Design-System
description: An authoritative, high-integrity design language for EXAMIND — an AI-powered school examination platform. Built on a two-polarity canvas system (deep midnight-violet canvas for high-stakes authority and daylight-white paper surfaces for dense exam taking and procurement), electrified by signature lime highlight chips, pedagogical violet accents, and sharp typography.

colors:
  primary: "#150f23"
  ink-deep: "#1f1633"
  on-primary: "#ffffff"
  accent-lime: "#c2ef4e"
  accent-pink: "#fa7faa"
  accent-rose: "#e11d48"
  accent-violet: "#6a5fc1"
  accent-violet-deep: "#422082"
  accent-violet-mid: "#79628c"
  accent-emerald: "#10b981"
  surface-canvas-dark: "#1f1633"
  surface-canvas-light: "#ffffff"
  surface-night: "#150f23"
  surface-subtle: "#f8fafc"
  surface-press-light: "#f0f0f0"
  surface-press-stronger: "#efefef"
  hairline-violet: "#362d59"
  hairline-cool: "#cfcfdb"
  hairline-cloud: "#e5e7eb"
  ink: "#1f1633"
  ink-press: "#1a1a1a"
  on-dark-muted: "#bdb8c0"
  on-dark-faint: "rgba(255, 255, 255, 0.18)"
  ring-focus: "rgba(59, 130, 246, 0.5)"

typography:
  display-hero:
    fontFamily: "Outfit, Plus Jakarta Sans, Rubik, system-ui, sans-serif"
    fontSize: "72px"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  display-large:
    fontFamily: "Outfit, Plus Jakarta Sans, Rubik, system-ui, sans-serif"
    fontSize: "48px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  heading-xl:
    fontFamily: "Outfit, Plus Jakarta Sans, Rubik, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  heading-lg:
    fontFamily: "Outfit, Plus Jakarta Sans, Rubik, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  heading-md:
    fontFamily: "Outfit, Plus Jakarta Sans, Rubik, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "0"
  heading-sm:
    fontFamily: "Outfit, Plus Jakarta Sans, Rubik, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0"
  body-lg:
    fontFamily: "Plus Jakarta Sans, Rubik, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "0"
  body-strong:
    fontFamily: "Plus Jakarta Sans, Rubik, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0"
  body-md:
    fontFamily: "Plus Jakarta Sans, Rubik, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0"
  eyebrow:
    fontFamily: "Plus Jakarta Sans, Rubik, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.08em"
  button-cap:
    fontFamily: "Plus Jakarta Sans, Rubik, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.02em"
  button-cap-light:
    fontFamily: "Plus Jakarta Sans, Rubik, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.02em"
  caption:
    fontFamily: "Plus Jakarta Sans, Rubik, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  micro-cap:
    fontFamily: "Plus Jakarta Sans, Rubik, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.05em"
  nano-cap:
    fontFamily: "Plus Jakarta Sans, Rubik, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.05em"
  pico-cap:
    fontFamily: "Plus Jakarta Sans, Rubik, system-ui, sans-serif"
    fontSize: "9px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.05em"
  code:
    fontFamily: "JetBrains Mono, Monaco, Menlo, Consolas, monospace"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0"
  code-strong:
    fontFamily: "JetBrains Mono, Monaco, Menlo, Consolas, monospace"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "0"

rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  xxl: "24px"
  full: "9999px"

spacing:
  xxs: "2px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
  section: "96px"

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-cap}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  button-primary-pressed:
    backgroundColor: "{colors.surface-press-stronger}"
    textColor: "{colors.ink-press}"
    typography: "{typography.button-cap}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  button-inverted:
    backgroundColor: "{colors.on-primary}"
    textColor: "{colors.ink-deep}"
    typography: "{typography.button-cap}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  button-inverted-pressed:
    backgroundColor: "{colors.surface-press-light}"
    textColor: "{colors.ink-press}"
    typography: "{typography.button-cap}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  button-ghost-on-dark:
    backgroundColor: "{colors.on-dark-faint}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-cap}"
    rounded: "{rounded.lg}"
    padding: "10px 18px"
  button-violet-token:
    backgroundColor: "{colors.accent-violet-mid}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-cap-light}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  button-disabled:
    backgroundColor: "{colors.hairline-cloud}"
    textColor: "{colors.on-dark-muted}"
    typography: "{typography.button-cap}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  pill-neutral-dark:
    backgroundColor: "{colors.surface-night}"
    textColor: "{colors.on-primary}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: "4px 8px"
  chip-lime-keyword:
    backgroundColor: "{colors.accent-lime}"
    textColor: "{colors.ink-deep}"
    typography: "{typography.heading-xl}"
    rounded: "{rounded.xs}"
    padding: "0 10px"
  text-input:
    backgroundColor: "{colors.surface-canvas-light}"
    textColor: "{colors.ink-deep}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
  text-input-focused:
    backgroundColor: "{colors.surface-canvas-light}"
    textColor: "{colors.ink-deep}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
  select-violet:
    backgroundColor: "{colors.accent-violet-deep}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  card-pricing:
    backgroundColor: "{colors.surface-canvas-light}"
    textColor: "{colors.ink-deep}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: "32px"
  card-pricing-featured:
    backgroundColor: "{colors.surface-night}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: "32px"
  card-feature-dark:
    backgroundColor: "{colors.ink-deep}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: "28px"
  card-spotlight-violet:
    backgroundColor: "{colors.accent-violet-deep}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: "28px"
  proctoring-console:
    backgroundColor: "{colors.surface-night}"
    textColor: "{colors.on-primary}"
    typography: "{typography.code}"
    rounded: "{rounded.xl}"
    padding: "20px"
  code-block:
    backgroundColor: "{colors.surface-night}"
    textColor: "{colors.on-primary}"
    typography: "{typography.code}"
    rounded: "{rounded.md}"
    padding: "16px"
  link-on-dark:
    backgroundColor: "{colors.surface-canvas-dark}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xs}"
    padding: "0px"
  link-on-light:
    backgroundColor: "{colors.surface-canvas-light}"
    textColor: "{colors.ink-deep}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xs}"
    padding: "0px"
  nav-bar-light:
    backgroundColor: "{colors.surface-canvas-light}"
    textColor: "{colors.ink-deep}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xs}"
    padding: "16px 24px"
  footer-light:
    backgroundColor: "{colors.surface-canvas-light}"
    textColor: "{colors.ink-deep}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: "48px 24px"
---

## Overview

EXAMIND mengadaptasi bahasa desain Sentri menjadi identitas visual **"High-Integrity Academic Command & Pedagogical AI"**. Alih-alih mengadopsi klise visual AI umum (seperti gradien pelangi mengambang atau partikel ungu mainan), sistem ini memadukan **kanvas ganda dua-polaritas (*two-polarity canvas*)** yang tegas:
1. **Midnight Violet Canvas** (`{colors.surface-canvas-dark}` / `{colors.surface-night}`): Merefleksikan otoritas ruang pengawasan ujian nasional, keamanan kriptografis, dan konsol proctoring berstandar tinggi.
2. **Daylight Paper Canvas** (`{colors.surface-canvas-light}` / `{colors.surface-subtle}`): Permukaan putih bersih yang dirancang khusus untuk kenyamanan membaca soal ujian siswa berdurasi 90+ menit, evaluasi rubrik esai guru, dan dokumen pengadaan resmi institusi (SPK/MOU).

Ciri khas utama sistem ini adalah **Electric Lime Keyword Chip** (`{colors.accent-lime}`). Di EXAMIND, aksen kapur/stabilo elektrik ini berfungsi layaknya **pena highlighter pendidik** yang menandai konsep esensial atau status integritas (`Integritas Ujian`, `AI Dual-Camera`, `Zero Data-Loss`) tepat di tengah aliran teks display, memberikan ketegasan tipografis tanpa merusak ritme baca.

Sistem ilustrasi stiker pengembang dari Sentri diadaptasi menjadi **Institutional Integrity Seals & Certification Stamps** — stempel verifikasi dengan garis tepi tegas (seperti "UU PDP No. 27/2022 Patuh", "IndexedDB Engine Terverifikasi", "Human-in-the-Loop AI") yang diletakkan di persimpangan antar-seksi untuk memecah kebekuan grid kaku dengan wibawa institusional.

Hierarki aksi tunggal (*single primary CTA*) diterapkan konsisten: tombol hitam-violet pekat (`{colors.primary}`) di atas kanvas terang, dan tombol putih murni (`{colors.on-primary}`) di atas kanvas gelap. Seluruh alur pengadaan SaaS diarahkan langsung ke konsultasi resmi SPK sekolah / Customer Service WhatsApp tanpa payment gateway kartu kredit publik.

**Karakteristik Kunci:**
- **Sistem Kanvas Dua Polaritas**: Kanvas gelap untuk presentasi teknologi pengawasan AI dan konsol live-monitoring; kanvas terang untuk ruang pengerjaan soal ujian, lembar rubrik guru, dan tabel komparasi paket lisensi sekolah.
- **Pena Highlighter Elektrik (`{colors.accent-lime}`)**: Menandai kata kunci penting dalam judul utama layaknya stabilo guru penguji, mengunci fokus perhatian pembaca.
- **Pedagogical Violet (`{colors.accent-violet}` & `{colors.accent-violet-deep}`)**: Aksen khusus untuk dialog Socratic Tutor AI, rubrik esai multi-dimensi, dan badge evaluasi konsep.
- **Stempel Integritas Institusi**: Stempel sertifikasi dengan sudut kemiringan ringan (±2°) di persimpangan seksi menggantikan maskot generik, menegaskan jaminan legalitas dan kepatuhan UU PDP.
- **Tipografi Tegas & Telemetri Monospace**: Kombinasi `Plus Jakarta Sans` / `Rubik` untuk teks instruksi dan `JetBrains Mono` / `Monaco` untuk timer ujian, NISN, latency WebSocket (< 200ms), dan confidence score AI.
- **Skema Harga Inversi**: Tiga kartu lisensi sekolah berlatar putih bersih dengan satu kartu unggulan (*Institusi Terpadu*) yang diinversi penuh ke kanvas gelap `{colors.surface-night}`, menghindari garis aksen murahan.

---

## Colors

### Brand & Accent
- **Midnight Violet** (`{colors.primary}` — `#150f23`): Warna aksi utama dan permukaan konsol terdalam. Digunakan untuk tombol utama pada kanvas terang, latar bilah navigasi resmi, dan footer institusi.
- **Ink Violet** (`{colors.ink-deep}` — `#1f1633`): Kanvas gelap utama untuk hero marketing dan konsol pengawasan ujian, sekaligus berfungsi ganda sebagai warna tipografi teks utama pada kanvas terang.
- **Electric Lime** (`{colors.accent-lime}` — `#c2ef4e`): Chip highlight stabilo tanda bukti integritas. Melingkupi kata kunci display dengan padding horizontal `{spacing.md}` tanpa padding vertikal agar pas dengan cap-height font. Juga digunakan sebagai garis divider bergelombang khas di atas footer.
- **Rose / Pink Incident** (`{colors.accent-rose}` — `#e11d48` / `{colors.accent-pink}` — `#fa7faa`): Indikator bendera insiden kecurangan (*flag snapshot*) dan penanda peringatan kritis bagi pengawas.
- **Pedagogical Violet** (`{colors.accent-violet}` — `#6a5fc1` & `{colors.accent-violet-deep}` — `#422082`): Aksen dialog asisten tutor Socratic, evaluasi rubrik esai 4-dimensi, dan kartu sorotan fitur AI.
- **Emerald Integrity** (`{colors.accent-emerald}` — `#10b981`): Indikator sinkronisasi autosave IndexedDB tersimpan seketika, kamera ganda aktif, dan status koneksi aman.

### Surface
- **Dark Canvas** (`{colors.surface-canvas-dark}` — `#1f1633`): Latar belakang hero pengenalan sistem dan live monitor pengawas.
- **Night Surface** (`{colors.surface-night}` — `#150f23`): Kartu konsol pengawasan, blok telemetri ujian, dan kartu paket lisensi unggulan (*Featured Tier*).
- **Light Canvas** (`{colors.surface-canvas-light}` — `#ffffff`): Meja pengerjaan ujian siswa, tabel rekap nilai ujian, formulir pendaftaran SPK, dan kartu lisensi sekolah.
- **Subtle Surface** (`{colors.surface-subtle}` — `#f8fafc`): Area latar belakang sekunder pada alur evaluasi guru.
- **Hairline Violet** (`{colors.hairline-violet}` — `#362d59`): Garis batas 1px pada kartu dan konsol di atas kanvas gelap.
- **Hairline Cool** (`{colors.hairline-cool}` — `#cfcfdb`): Garis batas pada kolom input formulir pendaftaran institusi.
- **Hairline Cloud** (`{colors.hairline-cloud}` — `#e5e7eb`): Garis batas kartu lisensi pada kanvas terang.

### Text
- **On Primary** (`{colors.on-primary}` — `#ffffff`): Seluruh teks pada kanvas gelap dan label tombol utama.
- **Ink** (`{colors.ink}` — `#1f1633`): Teks paragraf pada meja ujian dan kanvas terang.
- **On Dark Muted** (`{colors.on-dark-muted}` — `#bdb8c0`): Teks sekunder, deskripsi teknis proctoring, dan metadata cap waktu.
- **On Dark Faint** (`{colors.on-dark-faint}` — `rgba(255, 255, 255, 0.18)`): Isian tombol sekunder transparan di atas kanvas gelap.

### Semantic
- **Focus Ring** (`{colors.ring-focus}` — `rgba(59, 130, 246, 0.5)`): Cincin fokus keyboard untuk aksesibilitas siswa tuna-netra/parsial dan navigasi papan tombol cepat.

---

## Typography

### Font Family
- **Display & Headline Tier**: `Outfit` (fallback `Plus Jakarta Sans` / `Rubik`; bobot 700–800, siluet tegas berkarakter modern dan berwibawa). Diputuskan 2026-10-31: Outfit dipertahankan sebagai display face, dan tier ini di DESIGN.md diamendemen dari Plus Jakarta Sans/Rubik ke Outfit agar dokumen sesuai dengan yang dirender.
- **UI & Reading Tier**: `Plus Jakarta Sans` / `Rubik` (keterbacaan jernih untuk lembar soal ujian, teks instruksi, dan opsi jawaban).
- **Code & Telemetry Tier**: `JetBrains Mono` / `Monaco` / `Consolas` (digunakan untuk hitungan mundur timer ujian, NISN siswa, payload WebSocket proctoring, dan latency).

### Hierarki Skala Tipografi

| Token | Ukuran | Bobot | Line Height | Tracking | Penggunaan |
|---|---|---|---|---|---|
| `{typography.display-hero}` | 72px | 800 | 1.15 | -0.02em | Judul display pembuka landing page |
| `{typography.display-large}` | 48px | 700 | 1.2 | -0.02em | Pembuka seksi utama pada kanvas gelap |
| `{typography.heading-xl}` | 32px | 700 | 1.25 | -0.01em | Judul seksi halaman lisensi dan paket sekolah |
| `{typography.heading-lg}` | 24px | 700 | 1.3 | -0.01em | Judul kartu peran, judul pilar teknologi |
| `{typography.heading-md}` | 20px | 600 | 1.35 | 0 | Judul kartu lisensi, judul dialog Socratic |
| `{typography.heading-sm}` | 18px | 600 | 1.4 | 0 | Sub-judul soal, nama siswa pada konsol pengawas |
| `{typography.body-lg}` | 18px | 400 | 1.75 | 0 | Paragraf pengantar hero & narasi institusi |
| `{typography.body-strong}` | 16px | 600 | 1.5 | 0 | Teks penekanan penting, panduan ujian, lead |
| `{typography.body-md}` | 15px | 400 | 1.6 | 0 | Teks soal ujian, penjelasan tutor, opsi jawaban |
| `{typography.eyebrow}` | 13px | 600 | 1.4 | 0.08em | Label kategori atau status penanda di atas judul |
| `{typography.button-cap}` | 14px | 700 | 1.2 | 0.02em | Label tombol aksi utama (huruf tegas) |
| `{typography.button-cap-light}`| 14px | 600 | 1.25 | 0.02em | Label tombol sekunder / tab navigasi |
| `{typography.caption}` | 13px | 400 | 1.5 | 0 | Catatan kaki, bantuan ujian, metadata legal |
| `{typography.micro-cap}` | 11px | 700 | 1.4 | 0.05em | Label status kamera, NISN, pill tag |
| `{typography.code}` | 14px | 500 | 1.5 | 0 | Timer ujian, log pengawasan, format JSON soal |
| `{typography.code-strong}` | 14px | 700 | 1.5 | 0 | Indikator waktu kritis (< 5 menit), latency < 200ms |

### Prinsip Tipografi
- **Panjang Baris Optimal (45–75 Karakter)**: Paragraf pengantar dan butir soal dibatasi maksimal 65–75ch (`max-w-xl` atau `max-w-2xl`) guna mencegah kelelahan pandangan saat membaca soal panjang.
- **Pena Highlighter Sebagai Elemen Glif**: Chip `{colors.accent-lime}` diaplikasikan membungkus frasa kunci langsung di dalam teks judul, bukan sebagai banner terpisah.
- **Kontras WCAG AA Mutlak (≥ 4.5:1)**: Teks sekunder pada kanvas gelap wajib menggunakan `#bdb8c0` atau `#94a3b8` (kontras > 5.8:1), melarang penggunaan warna redup `#64748b` pada latar malam.

---

## Layout & Tata Ruang

### Sistem Spasi (Base 8px)
- **Token Spasi**: `{spacing.xxs}` 2px · `{spacing.xs}` 4px · `{spacing.sm}` 8px · `{spacing.md}` 12px · `{spacing.lg}` 16px · `{spacing.xl}` 24px · `{spacing.xxl}` 32px · `{spacing.section}` 96px.
- **Pemisah Antar Seksi**: 96px (`{spacing.section}`) di layar desktop, menyusut ke 48px–64px di layar tablet/ponsel.
- **Padding Internal Kartu**: 28px–32px pada kartu paket lisensi dan kartu teknologi pengawasan; 16px–20px pada panel konsol ujian.

### Filosofi Ruang Bersih
Kanvas malam (`{colors.surface-canvas-dark}`) diberikan ruang napas longgar agar visual topologi kamera ganda dan konsol pengawasan tampil berwibawa. Sebaliknya, kanvas siang (`{colors.surface-canvas-light}`) dioptimalkan untuk kepadatan informasi yang teratur (*high-density scanability*), memudahkan perbandingan paket dan kecepatan membaca lembar soal.

---

## Elevation & Depth

| Tingkat | Perlakuan Visual | Penggunaan |
|---|---|---|
| Elevasi 0 | Rata di atas kanvas, batas 1px hairline | Kartu kanvas malam, kartu fitur standar |
| Elevasi 1 | `box-shadow: rgba(0,0,0,0.08) 0 2px 8px 0` | Tombol terinversi di atas kanvas malam |
| Elevasi 2 | `box-shadow: rgba(0,0,0,0.1) 0 10px 15px -3px` | Kartu lisensi di atas kanvas terang, jendela dialog |
| Elevasi 3 | `box-shadow: rgba(21,15,35,0.6) 0 0 16px 4px` | Halo cahaya lembut mengelilingi tombol CTA utama di hero |
| Elevasi 4 | `box-shadow: rgba(0,0,0,0.2) 0 20px 25px -5px` | Modal konsultasi pengadaan SPK / formulir WhatsApp |

---

## Shapes & Radius Sudut

| Token | Nilai | Penggunaan |
|---|---|---|
| `{rounded.xs}` | 4px | Chip highlight stabilo, badge status mini, kode tag |
| `{rounded.sm}` | 6px | Bidang input teks ujian, dropdown filter kelas |
| `{rounded.md}` | 8px | Tombol aksi utama, tab panel, blok kode telemetri |
| `{rounded.lg}` | 12px | Kotak dialog Socratic Tutor, tombol sekunder |
| `{rounded.xl}` | 16px | Kartu paket lisensi, jendela konsol dual proctoring |
| `{rounded.xxl}` | 24px | Kontainer simulasi ujian interaktif hero |
| `{rounded.full}` | 9999px | Avatar profil siswa, penanda kamera aktif |

---

## Komponen Spesifik EXAMIND

### 1. Buttons
- **`button-primary`**: Latar `{colors.primary}` (`#150f23`), teks putih `{colors.on-primary}`, tipografi `{typography.button-cap}`, sudut `{rounded.md}`. Tombol aksi paling berwenang di atas kanvas terang.
- **`button-inverted`**: Latar putih `{colors.on-primary}`, teks ink `{colors.ink-deep}`. Tombol aksi paling mencolok di atas kanvas malam hero.
- **`button-ghost-on-dark`**: Latar `{colors.on-dark-faint}`, teks `{colors.on-primary}`, sudut `{rounded.lg}` untuk tombol sekunder "Pelajari Alur Proctoring".

### 2. Highlighting & Badges
- **`chip-lime-keyword`**: Chip stabilo elektrik `{colors.accent-lime}` dengan teks `{colors.ink-deep}` di tengah judul display.
- **Stempel Integritas Institusi**: Lencana legalitas bertinta tajam (contoh: "UU PDP PASAL 27/2022 COMPLIANT" atau "ZERO DATA-LOSS INDEXEDDB") yang ditempatkan secara asimetris di perbatasan seksi.

### 3. Cards & Surfaces
- **`card-pricing`**: Latar putih bersih `{colors.surface-canvas-light}`, teks `{colors.ink-deep}`, border `{colors.hairline-cloud}`, padding `{spacing.xxl}` (32px). Fitur dirinci dengan tanda centang hijau emerald `{colors.accent-emerald}`.
- **`card-pricing-featured`**: Latar gelap `{colors.surface-night}` (`#150f23`), teks putih `{colors.on-primary}`, menonjolkan paket **Institusi Terpadu** sebagai standar sekolah terakreditasi.
- **`proctoring-console`**: Latar `{colors.surface-night}`, border `{colors.hairline-violet}`, menampilkan streaming kamera 0° dan 45°, latensi WebSocket, serta riwayat penanda insiden bagi pengawas.

### 4. Signature Institutional Elements
- **Lime Squiggly Divider**: Garis pemisah bergelombang beraksen stabilo `{colors.accent-lime}` (ketebalan 3px) di atas footer resmi, memberikan sentuhan khas pedagogis.
- **Starfield Institutional Grid**: Pola titik-titik mikro berulang tipis (*pinprick grid*) di kanvas malam hero yang melambangkan jaringan pengawasan multi-sekolah.
- **Socratic Tutor Dialog Surface**: Balon percakapan berlatar `{colors.surface-night}` dengan aksen `{colors.accent-violet}` yang ramah namun berorientasi pembelajaran mendalam.

---

## Do's and Don'ts

### Do's:
- Gunakan `{colors.accent-lime}` secara hemat dan selektif: maksimal 1–2 elemen highlight per tampilan layar (sebagai chip kata kunci atau garis pemisah).
- Pastikan seluruh tombol CTA pembelian mengarah ke konsultasi **Surat Perjanjian Kerja (SPK) / MOU resmi sekolah** atau WhatsApp Konsultan Edukasi.
- Pertahankan prinsip **Human-in-the-Loop**: AI hanya menandai dan mendokumentasikan bukti foto/waktu, sedangkan pengawas manusia yang berhak menentukan status ujian.
- Berikan batas lebar baris teks bacaan (`45–75 karakter`) agar siswa dan pengajar tidak cepat lelah saat membaca teks panjang.
- Terapkan kontras rasio minimal **4.5:1** (WCAG AA) pada seluruh teks instruksi dan dialog.

### Don'ts:
- Dilarang menggunakan gradien pelangi mengambang (*purple-to-pink gradient blur*) atau animasi berputar yang mengalihkan konsentrasi ujian.
- Dilarang menggunakan `{colors.accent-lime}` sebagai warna latar tombol utama atau warna paragraf teks (karena merusak kontras baca).
- Dilarang memasang payment gateway kartu kredit publik instan pada halaman lisensi sekolah.
- Dilarang membuat AI mendiskualifikasi siswa secara sepihak tanpa tinjauan pengawas manusia.
- Dilarang menumpuk kartu di dalam kartu (*nested card boxiness*) pada komponen daftar harga atau daftar tanya-jawab.

---

## Responsive Behavior

- **Desktop (≥ 1152px)**: Tampilan penuh 3-kolom paket lisensi sekolah, konsol simulasi kamera ganda berdampingan secara horizontal, dan stempel integritas mengambang di persimpangan seksi.
- **Tablet (768px – 1151px)**: Tata letak paket lisensi berganti ke 2-kolom (dengan paket unggulan membentang penuh), bilah navigasi memadat.
- **Mobile (< 768px)**: Seluruh grid runtuh menjadi 1-kolom teratur; judul display mengecil secara proporsional ke 40–48px; stempel integritas berubah menjadi lencana inline; tombol aksi utama memenuhi lebar layar (*full-width*) dengan tinggi sentuh minimal 44px.

---

## Iterasi & Pemeliharaan

1. Saat menambahkan komponen baru, selalu rujuk token formal yang telah didefinisikan (`{colors.accent-lime}`, `{typography.body-md}`, `{rounded.xl}`).
2. Jalankan pemeriksaan linter desain dan verifikasi deteksi berkala:
   ```bash
   .agents\skills\impeccable\scripts\bin\windows-x64\impeccable.exe detect --json http://localhost:3000/
   ```
3. Pastikan setiap penyesuaian gaya tetap lolos kompilasi produksi Vite:
   ```bash
   npm --prefix frontend run build
   ```
