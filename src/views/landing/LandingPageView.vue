<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-[#c2ef4e] selection:text-slate-950">
    <!-- Ambient Background Depth & Subtle Radial Bleed -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
      <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-indigo-100/60 via-purple-50/40 to-transparent blur-3xl"></div>
      <div class="absolute top-[900px] -left-48 w-[500px] h-[500px] bg-blue-100/30 blur-3xl rounded-full"></div>
      <div class="absolute top-[1800px] -right-48 w-[600px] h-[600px] bg-indigo-100/30 blur-3xl rounded-full"></div>
    </div>

    <!-- Main Navigation Bar (Clean Institutional White Surface) -->
    <header class="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <!-- Brand Logo -->
        <a href="#hero" class="flex items-center gap-3 group" aria-label="EXAMIND Beranda">
          <div class="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black tracking-wider text-sm shadow-sm group-hover:bg-[#c2ef4e] group-hover:text-slate-950 transition-colors">
            EX
          </div>
          <div class="flex flex-col">
            <span class="font-bold text-base tracking-tight text-slate-900 leading-none">EXAMIND</span>
            <span class="text-[11px] font-medium text-slate-500 tracking-wider uppercase mt-0.5">Platform Ujian AI</span>
          </div>
        </a>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
          <a href="#keunggulan" class="hover:text-slate-900 transition-colors">Fitur Unggulan</a>
          <a href="#peran" class="hover:text-slate-900 transition-colors">Peran Pengguna</a>
          <a href="#proctoring" class="hover:text-slate-900 transition-colors">Dual-Camera AI</a>
          <a href="#pricing" class="hover:text-slate-900 transition-colors flex items-center gap-1.5">
            <span>Paket & Lisensi</span>
            <span class="px-1.5 py-0.5 text-[11px] font-bold bg-[#c2ef4e] text-slate-950 rounded-xs font-mono">B2B SaaS</span>
          </a>
          <a href="#faq" class="hover:text-slate-900 transition-colors">Tanya Jawab</a>
        </nav>

        <!-- Right Header Actions -->
        <div class="flex items-center gap-3">
          <button
            @click="openInquiryModal('demo')"
            class="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
          >
            <PhoneCall class="w-3.5 h-3.5 text-slate-900" />
            <span>Konsultasi Lisensi</span>
          </button>

          <template v-if="authStore.isAuthenticated">
            <router-link
              :to="dashboardRoute"
              class="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-sm transition-all"
            >
              <span>Dashboard ({{ userName }})</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </router-link>
          </template>
          <template v-else>
            <router-link
              to="/login"
              class="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs transition-colors"
            >
              <Lock class="w-3.5 h-3.5" />
              <span>Masuk Portal CBT</span>
            </router-link>
          </template>

          <!-- Mobile Menu Button -->
          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Buka menu navigasi"
          >
            <Menu v-if="!isMobileMenuOpen" class="w-5 h-5" />
            <X v-else class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Mobile Dropdown Menu -->
      <div v-if="isMobileMenuOpen" class="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
        <nav class="flex flex-col space-y-2 text-xs font-semibold text-slate-700">
          <a @click="isMobileMenuOpen = false" href="#keunggulan" class="py-2 hover:text-slate-900 transition-colors">Fitur Unggulan</a>
          <a @click="isMobileMenuOpen = false" href="#peran" class="py-2 hover:text-slate-900 transition-colors">Peran Pengguna</a>
          <a @click="isMobileMenuOpen = false" href="#proctoring" class="py-2 hover:text-slate-900 transition-colors">Dual-Camera AI</a>
          <a @click="isMobileMenuOpen = false" href="#pricing" class="py-2 hover:text-slate-900 transition-colors flex items-center justify-between">
            <span>Paket & Lisensi</span>
            <span class="px-1.5 py-0.5 text-[11px] font-bold bg-[#c2ef4e] text-slate-950 rounded-xs font-mono">B2B SaaS</span>
          </a>
          <a @click="isMobileMenuOpen = false" href="#faq" class="py-2 hover:text-slate-900 transition-colors">Tanya Jawab</a>
        </nav>
        <div class="pt-2 border-t border-slate-200 flex flex-col gap-2">
          <button
            @click="openInquiryModal('demo'); isMobileMenuOpen = false"
            class="w-full py-2.5 px-3 rounded-lg text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-800 text-center flex items-center justify-center gap-2 cursor-pointer"
          >
            <PhoneCall class="w-3.5 h-3.5 text-slate-900" />
            <span>Konsultasi Lisensi</span>
          </button>
        </div>
      </div>
    </header>

    <!-- HERO SECTION (Light Daylight Canvas & Electric Lime Highlight Chip) -->
    <section id="hero" class="relative z-10 pt-16 pb-24 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8">
      <div class="max-w-5xl mx-auto text-center space-y-8">
        <!-- Display Headline with Electric Lime Highlight Chip -->
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Satu Platform Ujian Berstandar Institusi.<br class="hidden sm:inline" />
          <span class="bg-[#c2ef4e] text-slate-950 px-2.5 py-0.5 rounded-xs inline-block font-black mt-1">Bebas Kecurangan</span>,
          Adil bagi Siswa, Efisien bagi Guru.
        </h1>

        <!-- Subtitle -->
        <p class="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
          Menggabungkan pengawasan AI Dual-Camera beretika, pembuatan soal adaptif, dan koreksi esai otomatis rubrik 4 dimensi. Menjamin objektivitas penilaian dan ketenangan peserta ujian tanpa risiko diskualifikasi sepihak.
        </p>

        <!-- CTA Action Cluster -->
        <div class="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <button
            @click="openInquiryModal('demo')"
            class="px-6 py-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Jadwalkan Demo Sekolah</span>
            <ArrowRight class="w-4 h-4" />
          </button>

          <a
            href="#pricing"
            class="px-5 py-3.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-sm transition-all shadow-xs"
          >
            Lihat Skema Biaya & Lisensi
          </a>
        </div>

        <!-- Trust Badges Row -->
        <div class="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs sm:text-sm text-slate-600 font-medium border-t border-slate-200 max-w-4xl mx-auto">
          <div class="flex items-center gap-2">
            <ShieldCheck class="w-4 h-4 text-emerald-600" />
            <span>Standar Integritas 2026</span>
          </div>
          <div class="flex items-center gap-2">
            <ShieldCheck class="w-4 h-4 text-emerald-600" />
            <span>Human-in-the-Loop Proctoring</span>
          </div>
          <div class="flex items-center gap-2">
            <Laptop class="w-4 h-4 text-indigo-600" />
            <span>Penyimpanan Offline Aman (IndexedDB)</span>
          </div>
          <div class="flex items-center gap-2">
            <Brain class="w-4 h-4 text-purple-600" />
            <span>Koreksi Esai Objektif (Rubrik 4D)</span>
          </div>
        </div>
      </div>

      <!-- INTERACTIVE HERO STAGE / MOCKUP SHOWCASE -->
      <div id="keunggulan" class="max-w-6xl mx-auto mt-14 scroll-mt-24">
        <div class="rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden backdrop-blur-md">
          <!-- Window Header Bar -->
          <div class="px-5 py-3.5 bg-slate-100 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="flex gap-1.5">
                <span class="w-3 h-3 rounded-full bg-slate-300"></span>
                <span class="w-3 h-3 rounded-full bg-slate-300"></span>
                <span class="w-3 h-3 rounded-full bg-slate-300"></span>
              </div>
              <span class="text-xs font-mono text-slate-500">cbt.examind.sch.id/workspace</span>
            </div>

            <!-- Stage Mode Switcher (Siswa, Pengawas, Grading) -->
            <div class="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200 text-xs sm:text-sm font-semibold overflow-x-auto shadow-xs">
              <button
                @click="activeHeroTab = 'exam'"
                class="px-3.5 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap"
                :class="activeHeroTab === 'exam' ? 'bg-slate-900 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'"
              >
                Ruang Ujian Siswa
              </button>
              <button
                @click="activeHeroTab = 'monitor'"
                class="px-3.5 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap"
                :class="activeHeroTab === 'monitor' ? 'bg-slate-900 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'"
              >
                Live Proctoring Pengawas
              </button>
              <button
                @click="activeHeroTab = 'grading'"
                class="px-3.5 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap"
                :class="activeHeroTab === 'grading' ? 'bg-slate-900 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'"
              >
                Koreksi Esai & Socratic Tutor
              </button>
            </div>
          </div>

          <!-- Showcase Content Body -->
          <div class="p-6 md:p-8 bg-slate-50/60 min-h-[420px]">
            <!-- 1. TAB: RUANG UJIAN SISWA -->
            <div v-if="activeHeroTab === 'exam'" class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <!-- Left: Exam Question & Answers -->
              <div class="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-xs">
                <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <span class="text-sm font-bold text-slate-900">Penilaian Akhir Semester — Fisika Terapan XII</span>
                    <p class="text-xs text-slate-500 mt-0.5">Peserta: Andi Pratama (NISN: 0081234567)</p>
                  </div>
                  <div class="text-right">
                    <span class="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">01:34:20 Tersisa</span>
                    <p class="text-xs text-slate-500 flex items-center justify-end gap-1 mt-0.5">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {{ autosaveStatus }}
                    </p>
                  </div>
                </div>

                <div class="space-y-3">
                  <div class="flex items-center gap-2 text-xs">
                    <span class="px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-bold text-xs">Soal #4</span>
                    <span class="text-slate-500">• Pilihan Ganda (Bobot: 10 Poin)</span>
                  </div>
                  <p class="text-sm sm:text-base text-slate-900 leading-relaxed font-normal">
                    Sebuah transformator memiliki efisiensi 80% dengan daya keluaran 160 Watt. Jika tegangan primer 220 Volt, berapakah kuat arus primer transformator tersebut?
                  </p>
                </div>

                <div class="space-y-2.5 pt-2">
                  <button
                    type="button"
                    @click="selectOption('A')"
                    class="w-full p-3.5 rounded-lg border text-left text-sm transition-colors flex items-center justify-between cursor-pointer"
                    :class="selectedOption === 'A' ? 'border-slate-900 bg-slate-900 text-white font-medium shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'"
                  >
                    <span>A. 0,91 Ampere</span>
                    <span v-if="selectedOption === 'A'" class="text-xs bg-white text-slate-900 px-2.5 py-0.5 rounded font-bold">Jawaban Dipilih</span>
                  </button>
                  <button
                    type="button"
                    @click="selectOption('B')"
                    class="w-full p-3.5 rounded-lg border text-left text-sm transition-colors flex items-center justify-between cursor-pointer"
                    :class="selectedOption === 'B' ? 'border-slate-900 bg-slate-900 text-white font-medium shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'"
                  >
                    <span>B. 1,14 Ampere</span>
                    <span v-if="selectedOption === 'B'" class="text-xs bg-white text-slate-900 px-2.5 py-0.5 rounded font-bold">Jawaban Dipilih</span>
                  </button>
                  <button
                    type="button"
                    @click="selectOption('C')"
                    class="w-full p-3.5 rounded-lg border text-left text-sm transition-colors flex items-center justify-between cursor-pointer"
                    :class="selectedOption === 'C' ? 'border-slate-900 bg-slate-900 text-white font-medium shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'"
                  >
                    <span>C. 0,72 Ampere</span>
                    <span v-if="selectedOption === 'C'" class="text-xs bg-white text-slate-900 px-2.5 py-0.5 rounded font-bold">Jawaban Dipilih</span>
                  </button>
                </div>
              </div>

              <!-- Right: Dual-Camera Feed Indicator -->
              <div class="lg:col-span-4 space-y-4">
                <div class="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs">
                  <div class="flex items-center justify-between text-xs font-bold">
                    <span class="text-slate-900">Kamera Primer (Laptop)</span>
                    <span class="text-emerald-700 font-mono text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">● WAJAH TERVERIFIKASI</span>
                  </div>
                  <div class="h-28 bg-slate-50 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-slate-500 text-xs gap-1.5 font-mono">
                    <Camera class="w-5 h-5 text-slate-400" />
                    <span>Sudut Pandang Wajah Peserta (0°)</span>
                  </div>
                </div>

                <div class="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs">
                  <div class="flex items-center justify-between text-xs font-bold">
                    <span class="text-slate-900">Kamera Sekunder (HP)</span>
                    <span class="text-indigo-700 font-mono text-[11px] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">● MEJA & LAYAR AKTIF</span>
                  </div>
                  <div class="h-28 bg-slate-50 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-slate-500 text-xs gap-1.5 font-mono">
                    <Smartphone class="w-5 h-5 text-slate-400" />
                    <span>Sudut Pandang Meja & Layar (45°)</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. TAB: LIVE MONITORING GURU -->
            <div v-else-if="activeHeroTab === 'monitor'" class="space-y-5">
              <div class="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
                <div>
                  <h3 class="font-bold text-slate-900 text-base">Konsol Pengawas Kelas XII MIPA 1 (34 Siswa)</h3>
                  <p class="text-slate-500 text-xs mt-0.5">WebSocket Hub Aktif • Status Integritas Rata-Rata: 98.2%</p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Pengawasan Realtime
                  </span>
                </div>
              </div>

              <!-- Incident Flagging Stream -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  class="bg-white rounded-xl border p-4 sm:p-5 space-y-3 transition-colors shadow-xs"
                  :class="incidentStatus === 'tolerated' ? 'border-emerald-300' : (incidentStatus === 'flagged' ? 'border-rose-300' : 'border-amber-300')"
                >
                  <div class="flex items-center justify-between text-xs sm:text-sm">
                    <span
                      class="font-bold flex items-center gap-1.5"
                      :class="incidentStatus === 'tolerated' ? 'text-emerald-700' : (incidentStatus === 'flagged' ? 'text-rose-700' : 'text-amber-700')"
                    >
                      <AlertCircle class="w-4 h-4 shrink-0" />
                      <span v-if="incidentStatus === 'idle'">AI Flag: Gerakan Kepala ke Kanan (8 Detik)</span>
                      <span v-else-if="incidentStatus === 'tolerated'">Status: Diverifikasi Wajar oleh Pengawas</span>
                      <span v-else>Status: Ditandai untuk Klarifikasi Lanjutan</span>
                    </span>
                    <span class="font-mono text-slate-500 text-xs">10:18:04 WIB</span>
                  </div>
                  <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    Siswa <strong>Rudi Hermawan</strong> terdeteksi menoleh ke luar frame. Snapshot tersimpan otomatis.
                    <span v-if="incidentStatus === 'tolerated'" class="block mt-1 text-emerald-700 font-medium">Catatan pengawas: Siswa membetulkan posisi kacamata, integritas valid.</span>
                    <span v-else-if="incidentStatus === 'flagged'" class="block mt-1 text-rose-700 font-medium">Catatan pengawas: Memerlukan klarifikasi interkom pengawas.</span>
                  </p>
                  <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      @click="previewSnapshot = !previewSnapshot"
                      class="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer transition-colors border border-slate-200"
                    >
                      {{ previewSnapshot ? 'Tutup Bukti Snapshot' : 'Buka Bukti Snapshot' }}
                    </button>
                    <button
                      type="button"
                      @click="incidentStatus = 'tolerated'"
                      class="px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                      :class="incidentStatus === 'tolerated' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'"
                    >
                      Toleransi Insiden (Bukan Curang)
                    </button>
                    <button
                      type="button"
                      @click="incidentStatus = 'flagged'"
                      class="px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                      :class="incidentStatus === 'flagged' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'"
                    >
                      Minta Klarifikasi Siswa
                    </button>
                  </div>

                  <!-- Snapshot Expanded View -->
                  <div v-if="previewSnapshot" class="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2 mt-2">
                    <div class="flex items-center justify-between text-xs text-slate-500 font-mono">
                      <span>Bukti #084-RUDI</span>
                      <span>Kamera Primer + Sekunder</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2 text-center text-xs text-slate-600 font-mono">
                      <div class="p-3 bg-white rounded border border-slate-200 flex flex-col items-center justify-center">
                        <Camera class="w-4 h-4 text-amber-600 mb-1" />
                        <span>Wajah Menoleh (Laptop)</span>
                      </div>
                      <div class="p-3 bg-white rounded border border-slate-200 flex flex-col items-center justify-center">
                        <Smartphone class="w-4 h-4 text-emerald-600 mb-1" />
                        <span>Meja Bersih (HP)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-3 shadow-xs">
                  <div class="flex items-center justify-between text-xs sm:text-sm">
                    <span class="font-bold text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 class="w-4 h-4 text-emerald-600" />
                      33 Siswa Terkonfirmasi Wajar
                    </span>
                    <span class="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs font-bold">● Tanpa Pelanggaran</span>
                  </div>
                  <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Tidak terdeteksi perpindahan tab, suara mencurigakan, atau perangkat sekunder. Seluruh autosave lokal tersinkronisasi.
                  </p>
                  <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Otoritas Diskualifikasi:</span>
                    <span class="text-slate-900 font-bold">Otoritas Penuh Pengawas (Human-in-the-Loop)</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. TAB: KOREKSI ESAI & TUTOR -->
            <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div class="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
                <div class="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <span class="text-sm font-bold text-slate-900">Evaluasi Esai AI Rubrik 4 Dimensi</span>
                  <span class="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded">Skor: 18.5 / 20.0</span>
                </div>
                <div class="grid grid-cols-2 gap-2.5 text-xs sm:text-sm">
                  <div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div class="font-bold text-slate-900">Pemahaman Konsep (5.0/5.0)</div>
                    <div class="text-xs text-slate-600 mt-1 leading-relaxed">Penjelasan hukum termodinamika tepat dan menyeluruh.</div>
                  </div>
                  <div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div class="font-bold text-slate-900">Runtutan Argumen (4.5/5.0)</div>
                    <div class="text-xs text-slate-600 mt-1 leading-relaxed">Alur logika sebab-akibat mesin Carnot runtut.</div>
                  </div>
                  <div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div class="font-bold text-slate-900">Ketepatan Istilah (4.5/5.0)</div>
                    <div class="text-xs text-slate-600 mt-1 leading-relaxed">Kosakata fisika kalor baku sesuai kaidah.</div>
                  </div>
                  <div class="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div class="font-bold text-slate-900">Kejelasan Bahasa (4.5/5.0)</div>
                    <div class="text-xs text-slate-600 mt-1 leading-relaxed">Struktur kalimat efektif dan mudah dipahami.</div>
                  </div>
                </div>
              </div>

              <div class="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 space-y-3.5 shadow-xs">
                <div class="flex items-center justify-between border-b border-slate-200 pb-2.5 text-xs sm:text-sm">
                  <span class="font-bold text-slate-900 flex items-center gap-1.5">
                    <Brain class="w-4 h-4 text-purple-600" />
                    Socratic Tutor AI (Bimbingan Belajar Siswa)
                  </span>
                  <span class="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded font-mono font-bold">Konsultasi Mandiri</span>
                </div>

                <!-- Prompt Selection Chips -->
                <div class="flex flex-wrap gap-2 pt-1">
                  <button
                    v-for="(p, pIdx) in tutorPrompts"
                    :key="pIdx"
                    type="button"
                    @click="activeTutorPromptIdx = pIdx"
                    class="px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left"
                    :class="activeTutorPromptIdx === pIdx ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'"
                  >
                    {{ p.q }}
                  </button>
                </div>

                <div class="p-4 bg-slate-50 rounded-lg text-xs sm:text-sm space-y-2.5 border border-slate-200">
                  <div class="text-indigo-700 font-bold">
                    Siswa: "{{ tutorPrompts[activeTutorPromptIdx].q }}"
                  </div>
                  <div class="text-slate-800 leading-relaxed">
                    Tutor AI: "{{ tutorPrompts[activeTutorPromptIdx].a }}"
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TIGA PILAR PENGGUNA (ROLE SPECIFIC VALUE) -->
    <section id="peran" class="relative z-10 py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-200 bg-white scroll-mt-20">
      <div class="max-w-7xl mx-auto space-y-14">
        <div class="max-w-3xl space-y-3">
          <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Tiga Sudut Pandang, Satu Ekosistem Harmonis
          </h2>
          <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
            Dirancang adil untuk peserta ujian, efisien bagi pendidik, dan akuntabel bagi pengambil kebijakan sekolah.
          </p>
        </div>

        <!-- Role Selectors -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- CARD SISWA -->
          <div class="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-4 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between">
            <div class="space-y-3.5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold shrink-0">
                  <GraduationCap class="w-5 h-5" />
                </div>
                <h3 class="text-xl font-bold text-slate-900 tracking-tight">Siswa (Peserta Ujian)</h3>
              </div>
              <p class="text-sm text-slate-600 leading-relaxed">
                Fokus mengerjakan ujian tanpa kecemasan teknis. Autosave IndexedDB menjamin jawaban tidak pernah hilang meski aliran listrik atau koneksi WiFi terputus. Setelah ujian, Socratic Tutor memandu pemahaman konsep secara mendalam.
              </p>
            </div>
            <ul class="space-y-2.5 text-sm text-slate-700 pt-3 border-t border-slate-200">
              <li class="flex items-start gap-2.5">
                <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Zero Data-Loss: Jawaban tersimpan di peramban seketika</span>
              </li>
              <li class="flex items-start gap-2.5">
                <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Ketenangan Mental: Tanpa penutupan paksa ujian sepihak</span>
              </li>
              <li class="flex items-start gap-2.5">
                <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Socratic Tutor: Pembahasan interaktif langkah demi langkah</span>
              </li>
            </ul>
          </div>

          <!-- CARD GURU -->
          <div class="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-4 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between">
            <div class="space-y-3.5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center justify-center font-bold shrink-0">
                  <BookOpen class="w-5 h-5" />
                </div>
                <h3 class="text-xl font-bold text-slate-900 tracking-tight">Guru & Tim Pengawas</h3>
              </div>
              <p class="text-sm text-slate-600 leading-relaxed">
                Memangkas hingga 80% beban administrasi koreksi. Generator soal berbasis kurikulum merumuskan paket soal dalam hitungan detik. AI mengevaluasi esai secara objektif, sementara guru tetap memegang otoritas penuh penyesuaian nilai.
              </p>
            </div>
            <ul class="space-y-2.5 text-sm text-slate-700 pt-3 border-t border-slate-200">
              <li class="flex items-start gap-2.5">
                <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Generator Paket Soal: Pilihan ganda & esai siap pakai</span>
              </li>
              <li class="flex items-start gap-2.5">
                <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Live Proctoring: Pantau seluruh kelas dalam satu layar konsol</span>
              </li>
              <li class="flex items-start gap-2.5">
                <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Otoritas Mutlak: Guru bebas merevisi nilai draf AI kapan saja</span>
              </li>
            </ul>
          </div>

          <!-- CARD SEKOLAH -->
          <div class="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-4 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between">
            <div class="space-y-3.5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-purple-100 text-purple-800 border border-purple-200 flex items-center justify-center font-bold shrink-0">
                  <Building2 class="w-5 h-5" />
                </div>
                <h3 class="text-xl font-bold text-slate-900 tracking-tight">Kepala Sekolah & Tim Asesmen</h3>
              </div>
              <p class="text-sm text-slate-600 leading-relaxed">
                Menjamin reputasi integritas dan kepatuhan hukum institusi. Seluruh data biometrik terlindungi sesuai UU Pelindungan Data Pribadi (UU PDP). Cetak Berita Acara dan Transkrip Nilai resmi instansi dalam satu klik.
              </p>
            </div>
            <ul class="space-y-2.5 text-sm text-slate-700 pt-3 border-t border-slate-200">
              <li class="flex items-start gap-2.5">
                <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Kepatuhan Hukum: Tunduk penuh pada UU PDP No. 27/2022</span>
              </li>
              <li class="flex items-start gap-2.5">
                <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Dokumentasi Legal: Berita Acara & Transkrip Nilai PDF resmi</span>
              </li>
              <li class="flex items-start gap-2.5">
                <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Analitik Mutu: Komparasi capaian kompetensi antar-kelas</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- TEKNOLOGI DUAL-CAMERA DETAIL -->
    <section id="proctoring" class="relative z-10 py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-200 bg-slate-50 scroll-mt-20">
      <div class="max-w-7xl mx-auto space-y-12">
        <div class="max-w-3xl space-y-3">
          <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Bagaimana AI Dual-Camera Mengamankan Ruang Ujian
          </h2>
          <p class="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
            Menutup titik buta kamera tunggal secara menyeluruh tanpa mewajibkan instalasi aplikasi rumit di ponsel peserta.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <!-- Visual Architecture Schematic -->
          <div class="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
              <span class="font-bold text-slate-900">Topologi Pengawasan Kamera Ganda</span>
              <span class="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 font-mono font-bold">● Sinkronisasi Aktif</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div class="flex items-center gap-2 text-indigo-700 font-mono text-xs font-bold">
                  <Camera class="w-4 h-4" />
                  <span>Kamera Primer (0°)</span>
                </div>
                <div class="text-sm text-slate-900 font-bold">Webcam Laptop Peserta</div>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Memantau kehadiran wajah, arah tatapan mata, serta mendeteksi jika peserta meninggalkan meja ujian.
                </p>
              </div>

              <div class="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div class="flex items-center gap-2 text-emerald-700 font-mono text-xs font-bold">
                  <Smartphone class="w-4 h-4" />
                  <span>Kamera Sekunder (45°)</span>
                </div>
                <div class="text-sm text-slate-900 font-bold">Ponsel Siswa via QR Code</div>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Memantau permukaan meja, keyboard, tangan, dan layar tanpa perlu memasang aplikasi tambahan.
                </p>
              </div>
            </div>
            <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <span>Transmisi Data: Protokol WebSocket Terenkripsi SSL</span>
              <span class="font-mono text-slate-900 font-bold text-xs">Latensi Teruji &lt; 200 ms</span>
            </div>
          </div>

          <!-- Institutional Guarantees (List Layout, Clean Spacing) -->
          <div class="lg:col-span-6 space-y-6">
            <div class="space-y-1.5">
              <h3 class="text-base font-bold text-slate-900 flex items-center gap-2.5">
                <span class="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs font-mono font-bold">1</span>
                Kemudahan Akses Tanpa Instalasi Aplikasi
              </h3>
              <p class="text-sm text-slate-600 leading-relaxed pl-8.5 max-w-xl">
                Peserta cukup membuka kamera bawaan ponsel dan memindai QR Code di layar ujian. Streaming langsung aktif di peramban tanpa membebani memori penyimpanan perangkat siswa.
              </p>
            </div>

            <div class="space-y-1.5">
              <h3 class="text-base font-bold text-slate-900 flex items-center gap-2.5">
                <span class="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs font-mono font-bold">2</span>
                Cakupan Meja dan Layar Menyeluruh
              </h3>
              <p class="text-sm text-slate-600 leading-relaxed pl-8.5 max-w-xl">
                Penempatan sudut 45 derajat memastikan seluruh area kerja tangan peserta dan sisi layar terpantau jelas, menutup celah pemakaian catatan fisik maupun ponsel sekunder.
              </p>
            </div>

            <div class="space-y-1.5">
              <h3 class="text-base font-bold text-slate-900 flex items-center gap-2.5">
                <span class="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs font-mono font-bold">3</span>
                Otoritas Penuh Pengawas Manusia
              </h3>
              <p class="text-sm text-slate-600 leading-relaxed pl-8.5 max-w-xl">
                AI berfungsi sebagai sistem peringatan dini, bukan penentu hukuman. Setiap peristiwa disajikan dalam bentuk bukti snapshot dan cap waktu agar pengawas dapat mengambil keputusan yang adil dan beretika.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PRICING & LISENSI SAAS (B2B SPK RESMI) -->
    <section id="pricing" class="relative z-10 py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-200 bg-white text-slate-900 scroll-mt-20">
      <div class="max-w-7xl mx-auto space-y-14">
        <div class="max-w-3xl space-y-3">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-slate-100 text-slate-800 text-xs font-mono font-bold uppercase tracking-wider border border-slate-200">
            Pengadaan Institusi B2B
          </div>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Paket & Lisensi SaaS Resmi Sekolah
          </h2>
          <p class="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
            EXAMIND bermitra resmi melalui Surat Perjanjian Kerja (SPK) atau MOU sekolah.
            <strong class="text-slate-900">Kami tidak menyediakan sistem pembayaran kartu kredit publik</strong>. Seluruh proses pengadaan diurus melalui penawaran resmi, faktur pajak institusi, dan transfer antar-rekening instansi dengan pendampingan Konsultan Edukasi.
          </p>
        </div>

        <!-- 3 Tier Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          <!-- TIER 1: STARTER -->
          <div class="p-7 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-6 shadow-xs hover:border-slate-300 transition-all text-slate-900">
            <div class="space-y-5">
              <div>
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Sekolah Mandiri</span>
                <h3 class="text-xl font-bold text-slate-900 mt-1">Paket Rintisan & Bimbel</h3>
                <p class="text-sm text-slate-600 mt-1.5 leading-relaxed">Untuk sekolah rintisan, SMP swasta, atau bimbel persiapan ujian.</p>
              </div>

              <div class="py-4 border-y border-slate-200 space-y-1">
                <div class="text-xs text-slate-500 font-bold uppercase tracking-wider font-mono">Investasi Semester</div>
                <div class="text-3xl font-extrabold font-mono text-slate-900 tracking-tight">Rp 3.500.000 <span class="text-xs font-normal text-slate-500">/ smt</span></div>
                <div class="text-xs text-slate-500">Hingga 300 siswa aktif</div>
              </div>

              <ul class="space-y-3 text-sm text-slate-700">
                <li class="flex items-start gap-2.5">
                  <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span class="text-slate-900 font-medium">Kamera Tunggal (Webcam Laptop)</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Koreksi Pilihan Ganda Instan</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>IndexedDB Zero Data-Loss Autosave</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Ekspor Rekapitulasi Nilai Excel</span>
                </li>
              </ul>
            </div>

            <div class="pt-4 border-t border-slate-200 space-y-2">
              <button
                @click="openInquiryModal('Paket Rintisan & Bimbel')"
                class="w-full py-3 px-4 rounded-lg bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-bold text-sm transition-colors cursor-pointer shadow-xs"
              >
                Konsultasikan Paket Dasar
              </button>
              <p class="text-xs text-center text-slate-500">Terhubung langsung dengan Konsultan Edukasi</p>
            </div>
          </div>

          <!-- TIER 2: INSTITUSI PRO (FEATURED) -->
          <div class="p-7 rounded-xl bg-white border-2 border-slate-900 flex flex-col justify-between space-y-6 shadow-xl relative text-slate-900">
            <div class="absolute -top-3.5 right-6 px-3 py-0.5 rounded-full text-xs font-bold bg-[#c2ef4e] text-slate-950 shadow-sm font-mono border border-slate-900">
              Paling Direkomendasikan
            </div>

            <div class="space-y-5">
              <div>
                <span class="text-xs font-bold text-indigo-700 uppercase tracking-wider font-mono">Standar Institusi</span>
                <h3 class="text-xl font-bold text-slate-900 mt-1">Institusi Terpadu</h3>
                <p class="text-sm text-slate-600 mt-1.5 leading-relaxed">Solusi komprehensif untuk SMP, SMA, dan SMK terakreditasi.</p>
              </div>

              <div class="py-4 border-y border-slate-200 space-y-1">
                <div class="text-xs text-slate-500 font-bold uppercase tracking-wider font-mono">Investasi Semester</div>
                <div class="text-3xl font-extrabold font-mono text-slate-900 tracking-tight">Rp 7.800.000 <span class="text-xs font-normal text-slate-500">/ smt</span></div>
                <div class="text-xs text-slate-500">Hingga 1.500 siswa aktif</div>
              </div>

              <ul class="space-y-3 text-sm text-slate-800">
                <li class="flex items-start gap-2.5">
                  <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong class="text-slate-900">AI Dual-Camera Proctoring</strong> (Laptop + HP)</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong class="text-slate-900">AI Essay Grading Rubrik 4 Dimensi</strong></span>
                </li>
                <li class="flex items-start gap-2.5">
                  <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong class="text-slate-900">Socratic Tutor AI</strong> Pembahasan Pasca-Ujian</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Live Proctoring WebSocket & Flag Snapshot</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Berita Acara & Transkrip Hasil PDF Resmi</span>
                </li>
              </ul>
            </div>

            <div class="pt-4 border-t border-slate-200 space-y-2">
              <button
                @click="openInquiryModal('Institusi Terpadu')"
                class="w-full py-3 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                Jadwalkan Demo & Ajukan Penawaran SPK
              </button>
              <p class="text-xs text-center text-slate-500">Sudah termasuk sesi pelatihan guru dan pengawas</p>
            </div>
          </div>

          <!-- TIER 3: ENTERPRISE -->
          <div class="p-7 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-6 shadow-xs hover:border-slate-300 transition-all text-slate-900">
            <div class="space-y-5">
              <div>
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Konsorsium & Yayasan</span>
                <h3 class="text-xl font-bold text-slate-900 mt-1">Enterprise & Dinas Pendidikan</h3>
                <p class="text-sm text-slate-600 mt-1.5 leading-relaxed">Untuk yayasan besar multi-cabang atau dinas pendidikan wilayah.</p>
              </div>

              <div class="py-4 border-y border-slate-200 space-y-1">
                <div class="text-xs text-slate-500 font-bold uppercase tracking-wider font-mono">Skema Kemitraan</div>
                <div class="text-3xl font-extrabold font-mono text-slate-900 tracking-tight">Kustom SPK <span class="text-xs font-normal text-slate-500">/ tahun</span></div>
                <div class="text-xs text-slate-500">Kapasitas Siswa Tanpa Batas (Multi-Sekolah)</div>
              </div>

              <ul class="space-y-3 text-sm text-slate-700">
                <li class="flex items-start gap-2.5">
                  <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span class="text-slate-900 font-medium">Seluruh Fitur Paket Institusi Terpadu</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Private Server / On-Premise MySQL Sync</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Integrasi Database Siswa & Dapodik</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Pendampingan On-Site Ujian Serentak</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>SLA 99.9% & Dedicated Support Engineer</span>
                </li>
              </ul>
            </div>

            <div class="pt-4 border-t border-slate-200 space-y-2">
              <button
                @click="openInquiryModal('Enterprise & Dinas')"
                class="w-full py-3 px-4 rounded-lg bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-bold text-sm transition-colors cursor-pointer shadow-xs"
              >
                Hubungi Tim Kemitraan Strategis
              </button>
              <p class="text-xs text-center text-slate-500">Konsultasi nota kesepahaman dan pengadaan institusi</p>
            </div>
          </div>
        </div>

        <!-- Procurement Guarantee Callout -->
        <div class="p-6 rounded-xl bg-slate-50 border border-slate-200 shadow-xs flex items-center gap-4 text-sm text-slate-900">
          <ShieldCheck class="w-6 h-6 text-emerald-600 shrink-0" />
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
            <div>
              <span class="font-bold text-slate-900 text-base">Tata Kelola Pengadaan B2B Resmi (Tanpa Payment Gateway)</span>
              <p class="text-slate-600 mt-1 text-xs sm:text-sm">Pengadaan lisensi EXAMIND menggunakan dokumen legal SPK/MOU resmi sekolah, faktur pajak institusi, dan transfer antar-rekening instansi.</p>
            </div>
            <button
              @click="openInquiryModal('spk')"
              class="shrink-0 px-4 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-semibold text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap shadow-xs"
            >
              Konsultasi Draf SPK / MOU
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ SECTION (LIGHT DAYLIGHT CANVAS) -->
    <section id="faq" class="relative z-10 py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-200 bg-slate-50 scroll-mt-20">
      <div class="max-w-4xl mx-auto space-y-12">
        <div class="text-center space-y-3">
          <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Pertanyaan Umum Pengadaan EXAMIND
          </h2>
          <p class="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Jawaban transparan seputar aspek teknis, hukum, dan operasional ujian sekolah.
          </p>
        </div>

        <div class="divide-y divide-slate-200 border-y border-slate-200">
          <div
            v-for="(item, idx) in faqs"
            :key="idx"
            class="py-4"
          >
            <button
              @click="toggleFaq(idx)"
              class="w-full py-2 text-left font-bold text-base sm:text-lg text-slate-900 flex items-center justify-between gap-4 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <span class="leading-snug">{{ item.q }}</span>
              <span class="w-7 h-7 rounded-md bg-white border border-slate-200 text-slate-600 flex items-center justify-center font-mono text-base shrink-0 shadow-xs">{{ activeFaq === idx ? '−' : '+' }}</span>
            </button>
            <div
              v-show="activeFaq === idx"
              class="pt-3 pb-2 text-sm text-slate-600 leading-relaxed max-w-2xl"
            >
              {{ item.a }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SIGNATURE SQUIGGLY ACCENT DIVIDER -->
    <div class="relative w-full overflow-hidden leading-none bg-slate-50 pt-4">
      <svg class="w-full h-4 sm:h-5 text-[#c2ef4e]" viewBox="0 0 1200 24" fill="none" preserveAspectRatio="none">
        <path d="M0,12 Q30,0 60,12 T120,12 T180,12 T240,12 T300,12 T360,12 T420,12 T480,12 T540,12 T600,12 T660,12 T720,12 T780,12 T840,12 T900,12 T960,12 T1020,12 T1080,12 T1140,12 T1200,12" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none" />
      </svg>
    </div>

    <!-- FOOTER (Institutional Authority White Surface) -->
    <footer class="relative z-10 bg-white border-t border-slate-200 text-slate-600 text-xs py-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        <div class="space-y-3 md:col-span-1">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-sm">
              EX
            </div>
            <span class="font-bold text-slate-900 text-base tracking-tight">EXAMIND</span>
          </div>
          <p class="text-sm text-slate-600 leading-relaxed">
            Platform Ujian Daring AI Berintegritas Institusional. Mengamankan ujian sekolah dengan martabat, keadilan, dan teknologi pedagogis.
          </p>
        </div>

        <div class="space-y-3">
          <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Teknologi Utama</h4>
          <ul class="space-y-2.5 text-sm text-slate-600">
            <li><a href="#proctoring" class="hover:text-slate-900 transition-colors">AI Dual-Camera Proctoring</a></li>
            <li><a href="#peran" class="hover:text-slate-900 transition-colors">AI Essay Grading Rubrik 4D</a></li>
            <li><a href="#peran" class="hover:text-slate-900 transition-colors">Socratic Tutor Pembahasan</a></li>
            <li><a href="#hero" class="hover:text-slate-900 transition-colors">IndexedDB Autosave Engine</a></li>
          </ul>
        </div>

        <div class="space-y-3">
          <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Pengadaan Sekolah</h4>
          <ul class="space-y-2.5 text-sm text-slate-600">
            <li><a href="#pricing" class="hover:text-slate-900 transition-colors">Paket Lisensi Institusi</a></li>
            <li><button @click="openInquiryModal('demo')" class="hover:text-slate-900 transition-colors text-left cursor-pointer">Jadwalkan Demo Sekolah</button></li>
            <li><button @click="openInquiryModal('spk')" class="hover:text-slate-900 transition-colors text-left cursor-pointer">Draf Kontrak SPK / MOU</button></li>
            <li><button @click="openInquiryModal('cs')" class="hover:text-slate-900 transition-colors text-left cursor-pointer">Konsultasi Lisensi Institusi</button></li>
          </ul>
        </div>

        <div class="space-y-3">
          <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Kepatuhan Hukum</h4>
          <p class="text-sm text-slate-600 leading-relaxed">
            Tunduk pada ketentuan UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP). Snapshot terenkripsi dan dihapus otomatis dalam 60 hari.
          </p>
          <div class="pt-2 text-xs text-slate-500 font-mono">
            FastAPI • PyTorch • Gemini 2.5 • Vue 3
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          © 2026 EXAMIND Technologies. Seluruh hak cipta dilindungi.
        </div>
        <div>
          Dirancang Khusus untuk Sekolah & Institusi di Indonesia
        </div>
      </div>
    </footer>

    <!-- SAAS CUSTOMER SERVICE INQUIRY MODAL (NO PAYMENT GATEWAY) -->
    <div
      v-if="isInquiryModalOpen"
      @click.self="isInquiryModalOpen = false"
      @keydown.esc="isInquiryModalOpen = false"
      class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inquiry-title"
    >
      <div class="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-slate-900">
        <!-- Modal Header -->
        <div class="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center justify-center font-bold text-xs">
              CS
            </div>
            <div>
              <h3 id="inquiry-title" class="text-base font-bold text-slate-900 tracking-tight">Konsultasi Pengadaan Lisensi Sekolah</h3>
              <p class="text-xs text-slate-500">Konsultan Edukasi EXAMIND Siap Membantu Kebutuhan Institusi Anda</p>
            </div>
          </div>
          <button
            @click="isInquiryModalOpen = false"
            class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Form Body -->
        <div class="p-6 space-y-4">
          <div class="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs sm:text-sm leading-relaxed flex items-start gap-2.5">
            <AlertCircle class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong class="text-amber-950">Tata Kelola Resmi:</strong> Pengadaan lisensi diproses menggunakan Surat Perjanjian Kerja (SPK) resmi sekolah dan transfer antar-rekening instansi.
            </div>
          </div>

          <form @submit.prevent="submitInquiry" class="space-y-4 text-xs sm:text-sm">
            <div>
              <label class="block font-semibold text-slate-700 mb-1.5">Paket yang Dipilih</label>
              <input
                type="text"
                v-model="inquiryForm.packageType"
                readonly
                class="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 font-semibold text-sm outline-hidden"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label class="block font-semibold text-slate-700 mb-1.5">Nama Lengkap & Gelar Akademik *</label>
                <input
                  type="text"
                  required
                  v-model="inquiryForm.fullName"
                  placeholder="Contoh: Drs. Bambang Sutrisno, M.Pd."
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-slate-900 text-slate-900 placeholder:text-slate-400 text-sm outline-hidden"
                />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1.5">Jabatan di Sekolah *</label>
                <select
                  v-model="inquiryForm.role"
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-slate-900 text-slate-900 text-sm outline-hidden"
                >
                  <option value="Kepala Sekolah">Kepala Sekolah</option>
                  <option value="Wakil Kepala Sekolah Bidang Kurikulum">Wakil Kepala Sekolah Bidang Kurikulum</option>
                  <option value="Koordinator Asesmen / Ujian">Koordinator Asesmen / Ujian</option>
                  <option value="Kepala Laboratorium Komputer / IT">Kepala Laboratorium Komputer / IT</option>
                  <option value="Pengurus Yayasan Pendidikan">Pengurus Yayasan Pendidikan</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label class="block font-semibold text-slate-700 mb-1.5">Nama Sekolah / Institusi Pendidikan *</label>
                <input
                  type="text"
                  required
                  v-model="inquiryForm.schoolName"
                  placeholder="Contoh: SMA Negeri 1 Teladan"
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-slate-900 text-slate-900 placeholder:text-slate-400 text-sm outline-hidden"
                />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1.5">Nomor WhatsApp Kontak Resmi *</label>
                <input
                  type="tel"
                  required
                  v-model="inquiryForm.whatsapp"
                  placeholder="Contoh: 081234567890"
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-slate-900 text-slate-900 placeholder:text-slate-400 text-sm outline-hidden"
                />
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1.5">Estimasi Jumlah Siswa Peserta Ujian</label>
              <select
                v-model="inquiryForm.studentCount"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-slate-900 text-slate-900 text-sm outline-hidden"
              >
                <option value="< 300 Siswa (Paket Rintisan)">&lt; 300 Siswa (Paket Rintisan)</option>
                <option value="300 - 800 Siswa (Paket Menengah)">300 - 800 Siswa (Paket Menengah)</option>
                <option value="800 - 1.500 Siswa (Paket Institusi Terpadu)">800 - 1.500 Siswa (Paket Institusi Terpadu)</option>
                <option value="> 1.500 Siswa (Konsorsium / Multi-Sekolah)">&gt; 1.500 Siswa (Konsorsium / Multi-Sekolah)</option>
              </select>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1.5">Kebutuhan Khusus / Jadwal Ujian Terdekat</label>
              <textarea
                v-model="inquiryForm.notes"
                rows="2"
                placeholder="Contoh: Rencana Penilaian Akhir Semester bulan depan untuk 650 siswa, memerlukan pelatihan teknis pengawas..."
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-slate-900 text-slate-900 placeholder:text-slate-400 text-sm outline-hidden"
              ></textarea>
            </div>

            <!-- Action Buttons -->
            <div class="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                class="w-full sm:flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Send class="w-4 h-4" />
                <span>Ajukan Jadwal Demo & Konsultasi</span>
              </button>

              <button
                type="button"
                @click="directWhatsAppChat"
                class="w-full sm:w-auto py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <MessageSquare class="w-4 h-4" />
                <span>Hubungi via WhatsApp Resmi</span>
              </button>
            </div>
          </form>

          <!-- Feedback Success State -->
          <div v-if="submissionStatus" class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs text-center space-y-1">
            <p class="font-bold text-emerald-950">Permohonan Anda Berhasil Terkirim!</p>
            <p class="text-xs text-emerald-700">Konsultan Edukasi EXAMIND akan menghubungi nomor WhatsApp Anda dalam waktu maksimal 1x24 jam kerja untuk penjadwalan demo dan pengiriman draf penawaran.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import {
  ShieldCheck,
  Laptop,
  Brain,
  Camera,
  Smartphone,
  GraduationCap,
  BookOpen,
  Building2,
  Lock,
  AlertCircle,
  PhoneCall,
  ArrowRight,
  CheckCircle2,
  X,
  Send,
  MessageSquare,
  Menu,
} from 'lucide-vue-next'

const authStore = useAuthStore()

const userName = computed(() => {
  return authStore.user?.full_name || authStore.user?.username || 'Pengguna'
})

const dashboardRoute = computed(() => {
  if (authStore.isSuperAdmin) return '/superadmin/dashboard'
  if (authStore.isAdmin) return '/admin/dashboard'
  if (authStore.isStudent) return '/student/dashboard'
  return '/teacher/dashboard'
})

// Mobile Menu State
const isMobileMenuOpen = ref(false)

// Interactive Hero Tab State
const activeHeroTab = ref<'exam' | 'monitor' | 'grading'>('exam')

// Hero Interactive State - Tab 1 (Ruang Ujian Siswa)
const selectedOption = ref<'A' | 'B' | 'C'>('A')
const autosaveStatus = ref('Tersimpan di IndexedDB (<1s)')
function selectOption(opt: 'A' | 'B' | 'C') {
  selectedOption.value = opt
  autosaveStatus.value = 'Menyimpan...'
  setTimeout(() => {
    autosaveStatus.value = 'Tersimpan di IndexedDB (<1s)'
  }, 250)
}

// Hero Interactive State - Tab 2 (Live Proctoring Guru)
const incidentStatus = ref<'idle' | 'tolerated' | 'flagged'>('idle')
const previewSnapshot = ref(false)

// Hero Interactive State - Tab 3 (Koreksi Esai & Socratic Tutor)
const tutorPrompts = [
  {
    q: 'Kenapa opsi B kurang tepat?',
    a: 'Bagus sekali pertanyaannya! Pada opsi B, kamu menghitung daya tanpa memperhitungkan efisiensi transformator 80%. Rumus yang tepat: Daya Masukan = Daya Keluaran / Efisiensi = 160 W / 0.8 = 200 W. Maka Kuat Arus Primer = 200 W / 220 V = 0,91 Ampere.',
  },
  {
    q: 'Bagaimana kaitan efisiensi dengan hukum termodinamika?',
    a: 'Berdasarkan Hukum Termodinamika II, tidak ada mesin kalor yang mampu mengubah seluruh energi kalor menjadi usaha mekanik secara sempurna (efisiensi 100%). Selalu ada energi yang terbuang ke reservoir dingin sebagai peningkatan entropi sistem.',
  },
  {
    q: 'Bagaimana AI menilai esai saya secara transparan?',
    a: 'EXAMIND mengoreksi draf esai berbasis Rubrik 4 Dimensi objektif: Pemahaman Konsep (5.0), Runtutan Argumen (5.0), Ketepatan Istilah Baku (5.0), dan Kejelasan Bahasa (5.0). Guru mata pelajaran memegang hak mutlak untuk meninjau dan mengubah skor.',
  },
]
const activeTutorPromptIdx = ref(0)

// FAQ Accordion State
const activeFaq = ref<number | null>(0)
function toggleFaq(index: number) {
  activeFaq.value = activeFaq.value === index ? null : index
}

const faqs = [
  {
    q: 'Apakah peserta ujian yang menoleh otomatis didiskualifikasi oleh AI?',
    a: 'Tidak. AI EXAMIND tidak memiliki kewenangan memutus ujian siswa. Sistem hanya mencatat cap waktu dan snapshot bukti ke konsol pengawas. Keputusan verifikasi dan sanksi sepenuhnya berada di tangan guru pengawas (prinsip Human-in-the-Loop).',
  },
  {
    q: 'Bagaimana jika jaringan internet sekolah atau rumah peserta terputus saat ujian berlangsung?',
    a: 'Ujian berjalan lancar tanpa kehilangan data. Mesin IndexedDB di peramban peserta merekam setiap perubahan jawaban seketika. Begitu sambungan internet pulih, sistem secara otomatis menyinkronkan data jawaban ke server.',
  },
  {
    q: 'Bagaimana EXAMIND melindungi privasi rekaman video peserta sesuai ketentuan hukum?',
    a: 'EXAMIND tunduk penuh pada UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP). Kamera hanya diaktifkan atas persetujuan eksplisit peserta, berkas snapshot dienkripsi, dan seluruh data biometrik dihapus permanen secara otomatis setelah 60 hari.',
  },
  {
    q: 'Apakah guru memiliki wewenang merevisi nilai esai yang diberikan oleh AI?',
    a: 'Ya, mutlak. AI hanya menyajikan draf penilaian awal berdasarkan rubrik 4 dimensi objektif beserta alasannya. Guru mata pelajaran memegang kendali penuh untuk meninjau, menyunting, atau merevisi nilai sebelum hasil diumumkan.',
  },
  {
    q: 'Mengapa pengadaan EXAMIND tidak menyediakan pembayaran kartu kredit langsung?',
    a: 'Sebagai penyedia platform institusi, kami menghormati tata kelola anggaran sekolah dan yayasan. Pembayaran diproses melalui mekanisme penawaran resmi, penerbitan SPK/MOU, faktur pajak institusi, dan transfer antar-rekening bank instansi.',
  },
]

// Modal & Inquiry State
const isInquiryModalOpen = ref(false)
const submissionStatus = ref(false)

const inquiryForm = ref({
  packageType: 'Paket Institusi Terpadu',
  fullName: '',
  role: 'Wakil Kepala Sekolah Bidang Kurikulum',
  schoolName: '',
  whatsapp: '',
  studentCount: '300 - 800 Siswa (Paket Menengah)',
  notes: '',
})

function openInquiryModal(pkgName?: string) {
  if (pkgName && pkgName !== 'demo' && pkgName !== 'tech' && pkgName !== 'spk' && pkgName !== 'cs') {
    inquiryForm.value.packageType = pkgName
  } else {
    inquiryForm.value.packageType = 'Paket Institusi Terpadu (Konsultasi Demo)'
  }
  submissionStatus.value = false
  isInquiryModalOpen.value = true
}

function submitInquiry() {
  submissionStatus.value = true
}

function directWhatsAppChat() {
  const phone = (import.meta.env.VITE_CS_WHATSAPP as string) || '6281234567890'
  const text = encodeURIComponent(
    `Halo Tim Konsultan Edukasi EXAMIND, saya ${inquiryForm.value.fullName || 'Pihak Sekolah'} (${inquiryForm.value.role || 'Perwakilan Sekolah'}) dari ${inquiryForm.value.schoolName || 'Institusi Pendidikan'}. Kami ingin berkonsultasi mengenai pengadaan ${inquiryForm.value.packageType} untuk estimasi ${inquiryForm.value.studentCount}. Mohon info penjadwalan demo dan pengiriman draf penawaran resminya. Terima kasih.`
  )
  window.open(`https://wa.me/${phone}?text=${text}`, '_blank')
}
</script>

<style scoped>
:focus-visible {
  outline: 2px solid #0f172a;
  outline-offset: 2px;
}
</style>
