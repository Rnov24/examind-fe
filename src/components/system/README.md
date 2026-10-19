# EXAMIND Unified Design System

Dokumentasi resmi sistem desain institusional EXAMIND untuk platform Computer-Based Testing (CBT) dan pengawasan ujian sekolah berbasis kecerdasan buatan (AI).

---

## 1. Filosofi & Polarisasi Kanvas

EXAMIND mengadopsi model **Polarisasi Dua Kanvas** (*Two-Polarity Canvas System*):

1. **Daylight Paper Surfaces (`#ffffff`, `bg-slate-50/70`)**:
   - Digunakan untuk 90% permukaan operasional: lembar pengerjaan ujian siswa, tabel data analitik nilai, formulir administrasi sekolah, dan peninjauan log proctoring.
   - Menghasilkan keterbacaan (*legibility*) maksimal untuk penggunaan jangka panjang di lingkungan sekolah.
   - Menolak *dark-mode* pada modul ujian dan penilaian demi menjaga kejelasan cetak dan fokus psikomotorik siswa.

2. **Midnight Authority Canvas (`#150f23`)**:
   - Kanvas midnight-violet digunakan sebagai jangkar otoritas: navigasi samping (*Ribbon*), *TopPillNav* aktif, *header status bar*, modal backdrop, dan tombol aksi primer.
   - Memberikan kesan kredibel, aman, dan institusional berstandar tinggi.

3. **Electric Lime Signature Highlight (`#c2ef4e`)**:
   - Warna aksen utama (*primary brand highlighter*). Digunakan untuk chip status aktif, highlight kata kunci, fokus interaktif, indikator proctoring aktif, dan tombol aksi primer bertaraf tinggi.

4. **Pedagogical AI Violet (`#6a5fc1`)**:
   - Digunakan secara eksklusif untuk menandai kapabilitas cerdas platform: asistensi penilaian esai AI, analisis butir soal psikometrik, dan saran rubrik guru.

---

## 2. Standar Integritas Desain (Craft Floor Rules)

Setiap implementasi antarmuka di EXAMIND wajib mematuhi aturan berikut:
- **Ikonografi Lucide Saja**: DILARANG keras menyematkan emoji mentah (`🌟`, `⚠️`, `💡`, dll.) atau simbol unicode (`✓`, `✕`, `→`) sebagai ikon UI. Seluruh ikon wajib menggunakan pustaka `lucide-react`.
- **Bahasa Baku Institusional (Bahasa Indonesia)**: Semua salinan antarmuka (*microcopy*), label tombol, notifikasi, dan pesan kegagalan menggunakan Bahasa Indonesia formal dan empati tinggi.
- **Ambang Kontras WCAG AA**: Seluruh pasangan teks dan latar belakang wajib memenuhi rasio kontras minimal 4.5:1 untuk teks normal dan 3.0:1 untuk teks tebal/display.
- **Konsistensi Radius & Bayangan**: Menggunakan skala terpusat dari `@/components/system/tokens`, dilarang mencampur nilai `rounded-*` dan `shadow-*` sembarangan di luar pedoman.

---

## 3. Matriks Semantik Warna

| Peran | Hex | Token Class | Penggunaan Utama |
|---|---|---|---|
| **Primary / Highlight** | `#c2ef4e` | `tokens.semantic.lime` | Chip status aktif, tombol aksi sorotan, batas fokus seleksi |
| **Authority Canvas** | `#150f23` | `tokens.surface.midnight` | Bilah navigasi samping, tombol utama sistem, teks judul hero |
| **AI / Info** | `#6a5fc1` | `tokens.semantic.violet` | Asistensi koreksi AI, penjelasan tutor, telemetri kecerdasan |
| **Success** | `#10b981` | `tokens.semantic.emerald` | Status server online, ujian terkumpul, siswa hadir, nilai tuntas |
| **Warning** | `#f59e0b` | `tokens.semantic.amber` | Kuota mendekati batas, siswa terindikasi mencurigakan, verifikasi tertunda |
| **Error / Critical** | `#e11d48` | `tokens.semantic.rose` | Pelanggaran proctoring, kegagalan jaringan, tindakan destruktif |
| **Neutral / Muted** | `#64748b` | `tokens.semantic.neutral` | Garis tepi sekunder, teks deskripsi, placeholder, badge default |

---

## 4. Skala Ukuran & Geometri

### Skala Sudut Bulat (Border Radius)

| Tingkat | Token Class | Ukuran | Komponen Sasaran |
|---|---|---|---|
| **`xs`** | `rounded` | 4px | `Stamp` kredensial, `Chip` kata kunci, badge mikro |
| **`sm`** | `rounded-md` | 6px | Sub-indikator status, badge tabel data |
| **`md`** | `rounded-lg` | 8px | Tombol ukuran `xs`, tooltip, kotak aksi baris |
| **`lg`** | `rounded-xl` | 12px | `Button` (sm/md/lg), `Input`, `Select`, ikon kontainer 40px |
| **`xl`** | `rounded-2xl` | 16px | `Card`, `DashboardCard`, `Modal`, `TableContainer`, `BentoBlock` |
| **`full`**| `rounded-full`| 9999px | `Ribbon`, `TopPillNav`, avatar pengguna, tombol aksi bulat 40px |

### Skala Bayangan & Elevasi (Box Shadow)

- **`shadow-2xs` / `tokens.shadow.micro`**: Badge, chip kecil, dan indikator mikro.
- **`shadow-xs` / `tokens.shadow.subtle`**: Tombol floating pill, dropdown menu, dan kartu sekunder.
- **`shadow-card` / `tokens.shadow.card`**: Seluruh kontainer data utama (`Card`, `DashboardCard`, `BentoBlock`).
- **`shadow-card-hover`**: Efek elevasi interaktif kartu saat disentuh kursor (`hover:-translate-y-0.5`).
- **`shadow-subtle-elevated`**: Kartu terfokus atau panel mengambang bertingkat sedang.
- **`shadow-2xl` / `tokens.shadow.modal`**: Jendela dialog `Modal`.
- **`shadow-glow-lime`**: Pancaran tombol `variant="lime"`.
- **`shadow-glow-indigo`**: Pancaran tombol `variant="violet"`.

### Skala Ruang & Spasi (Spacing Scale)

Mengikuti grid modular kelipatan 4px/8px:
- **`p-3` / `p-3.5`**: Sub-kartu ringkas (`PlanDistributionGrid`, `TelemetryBarChart`).
- **`p-4`**: Padding kartu kecil / dialog ringkas.
- **`p-5 sm:p-6`**: Standar padding konten kartu (`CardContent`, `DashboardCard`, `ModalBody`).
- **`p-8 sm:p-12`**: Padding halaman kosong terisolasi (`EmptyState`).
- **`gap-2`**: Jarak antar ikon dan teks.
- **`gap-3 sm:gap-4`**: Jarak antar kartu statistik / grid metrik.
- **`gap-6`**: Jarak antar blok seksi besar di dashboard.

---

## 5. Katalog Primitives & Panduan Pemilihan

### 1. Kontainer & Kartu (Surfaces)

- **`Card` (`@/components/ui/Card`)**:
  - Primitif serbaguna dengan sub-komponen terstruktur: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
  - Pilihan varian: `default` (putih bersih), `subtle` (abu-abu pudar), `midnight` (gelap otoritatif), `paper` (dengan bayangan dokumen), `elevated` (bayangan tinggi).
  - Garis aksen atas 3px opsional via prop `accent="lime" | "violet" | "midnight" | "emerald" | "rose"`.

- **`DashboardCard` (`@/components/dashboard/DashboardCard`)**:
  - Digunakan untuk membungkus kartu metrik atau modul pada dashboard utama dengan header judul terintegrasi dan opsi footer.

- **`BentoBlock` (`@/components/ui/BentoBlock`)**:
  - Digunakan khusus pada tata letak Bento Grid yang membutuhkan status pemuatan mandiri (*self-loading state*: idle → skeleton → ready/error dengan tombol coba lagi inline).

- **`StatCard` (`@/components/dashboard/StatCard` & `@/components/ui/Card`)**:
  - Menampilkan angka KPI kuantitatif, tren persentase (+/-), dan ikon tone semantik.

### 2. Aksi & Tombol (`Button`)

Komponen `@/components/ui/Button` memiliki varian semantik:
- `primary`: Latar midnight-violet (`#150f23`), teks putih. Digunakan untuk aksi konfirmasi utama.
- `secondary`: Latar putih dengan garis hairline slate. Digunakan untuk aksi netral sekunder.
- `lime`: Latar Electric Lime (`#c2ef4e`), teks midnight-violet. Digunakan untuk ajakan tindakan (CTA) tertinggi.
- `violet`: Latar Accent Violet (`#6a5fc1`), teks putih. Digunakan untuk pemicu fitur AI/koreksi esai.
- `destructive`: Latar rose lembut dengan garis merah. Digunakan untuk tindakan penghapusan atau penangguhan akun.
- `inverted`: Latar putih untuk penempatan di atas permukaan midnight canvas.
- `ghost`: Transparan, aktif saat kursor di atasnya. Digunakan untuk tombol tabel atau navigasi ringkas.
- `outline`: Latar transparan dengan batas garis tipis.

### 3. Tanda Pengenal & Status (`Badge`, `Chip`, `Stamp`)

- **`Badge` (`@/components/ui/Badge`)**:
  - Indikator status umum (`lime`, `violet`, `emerald`, `amber`, `rose`, `midnight`, `neutral`, `outline`).
  - Mendukung prop `dot={true}` dan `dotPulse={true}` untuk telemetri realtime.
- **`Chip` (`@/components/ui/Badge`)**:
  - Digunakan khusus untuk menyorot kata kunci atau tag kategori dengan gaya Electric Lime (`keyword={true}`).
- **`Stamp` (`@/components/ui/Badge`)**:
  - Cap integritas ganda (*Institutional Integrity Stamp*) dengan garis ganda 2px tebal dan tipografi JetBrains Mono kapital berjarak renggang. Digunakan untuk segel sertifikasi hasil ujian atau verifikasi anti-kecurangan proctoring.

### 4. Kontrol Formulir (`Input`, `Select`, `Textarea`)

- Konsisten menggunakan sudut `rounded-xl`, latar `bg-slate-50/70`, garis tepi `border-slate-200`, dan status fokus `focus:border-[#150f23] focus:ring-2 focus:ring-[#6a5fc1]/25`.
- `SearchInput`: Menyediakan ikon pencarian terintegrasi dan tombol bersihkan teks `X` otomatis.

### 5. Komponen Data & Umpan Balik

- **`TableContainer` & `Table` (`@/components/ui/Table`)**:
  - Menyediakan wadah tabel bertepi bulat `rounded-2xl` dengan pengguliran horizontal yang aman di ponsel, garis pembatas halus, serta bar aksen opsional.
- **`EmptyState` (`@/components/ui/EmptyState`)**:
  - Penanda kondisi kosong berpusat rapi dengan ikon dalam kontainer bertingkat ganda dan tombol panduan tindakan lanjut.
- **`Skeleton` (`@/components/ui/Skeleton`)**:
  - Kerangka pemuatan dengan efek shimmer halus untuk tabel, kartu statistik, dan metrik bento tanpa menyebabkan pergeseran tata letak (*layout shift*).

### 6. Navigasi & Shell Dashboard

- **`DashboardShell`**: Kerangka pembungkus halaman dashboard yang mengintegrasikan bilah atas, tombol drawer mobile, dan ucapan selamat datang waktu lokal.
- **`Ribbon`**: Bilah navigasi vertikal samping berbentuk kapsul (*pill*) terisolasi yang mengelola tautan rute per peran pengguna (*Role-Based Access*).
- **`TopPillNav`**: Bilah navigasi tab berbentuk kapsul horizontal dengan lencana hitungan aktif.
- **`TopRightCluster`**: Sekelompok tombol tindakan utilitas: pencarian global, lonceng notifikasi bersinyal aktif, bantuan, dan menu profil akun pengguna.

---

## 6. Contoh Penggunaan Singkat

```tsx
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui'
import { Sparkles, ShieldCheck } from 'lucide-react'

export function ExampleWidget() {
  return (
    <Card accent="violet" className="hover:shadow-card-hover transition-all">
      <CardHeader
        eyebrow="MODUL PROCTORING AI"
        badge={<Badge variant="violet" dot dotPulse>Aktif</Badge>}
        action={
          <Button variant="ghost" size="xs">
            Detail
          </Button>
        }
      >
        <CardTitle>Integritas Ruang Ujian</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-slate-600 leading-relaxed">
          Kamera ganda mendeteksi 32 peserta didik berada dalam kondisi siap dan terverifikasi.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <Button variant="primary" size="sm" leftIcon={<ShieldCheck className="w-4 h-4" />}>
            Mulai Ujian
          </Button>
          <Button variant="violet" size="sm" leftIcon={<Sparkles className="w-4 h-4" />}>
            Asistensi AI
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

*Hak Cipta © 2026 Tim Pengembang EXAMIND. Panduan ini mengikat seluruh implementasi primitif dan antarmuka masa depan.*
