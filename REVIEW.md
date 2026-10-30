# REVIEW.md — EXAMIND frontend, rnov-improve-ui audit

Scope: repo `examind-fe` at HEAD `77e3e09` (the 2026-10-30 audit fixes are
in). Method: local `pnpm dev -p 3000` against real production data, logged
in via the API + localStorage token pattern with the three dummy test
accounts. 35 desktop pages (1440×900) + 6 mobile pages (390×844)
screenshotted; measurements by script, not eyeballed. Full evidence:
`~/workspace/examind-audit/sweep2-report.json`,
`~/workspace/examind-audit/shots2/`. DESIGN.md at the repo root is the
locked system; nothing here amends it or introduces a new direction.

## Pre-flight (summary; full cache in `.work/design-preflight.json`)

Preserved: midnight-violet + daylight-white two-polarity canvas, lime as
CTA/active accent, Plus Jakarta Sans body with JetBrains Mono telemetry,
Lucide icons only, no dark mode, single primary CTA pattern. Framework:
Next.js 15.5.28, React 19, Tailwind 3.4, motion 14.6.0, zustand.
Conflicts flagged, not silently resolved: (1) the code loads Outfit as the
display face (tailwind `font-display`, `globals.css` h1–h3 rule,
`layout.tsx` font load) while DESIGN.md names Plus Jakarta Sans/Rubik for
display; (2) DESIGN.md Don'ts forbid lime as a primary-button background
while the built UI uses lime CTAs throughout (login, register, landing);
(3) taste-core's 12px floor vs DESIGN.md's own 9–11px micro/nano/pico cap
tokens — DESIGN.md wins for labels. Legacy `--sentri-*` CSS aliases
(#0f172a family) are defined but unused (0 component references).

## Deterministic checks (all 13, measured)

1. Screenshots smallest + largest widths: 35 desktop + 6 mobile, all
   captured. No horizontal scrollbar at 1440 or 390 on any page
   (`scrollWidth == innerWidth` everywhere; table overflow is intentional
   inner `overflow-x-auto`, not page overflow).
2. Contrast: automated WCAG sampling over rendered text (sampler walks up
   to the first opaque background; gradient/video backgrounds defeat it —
   those pairs were re-verified visually, see FYI). Real failures: stepper
   labels 2.25–2.56:1 (Critical below), landing mock emerald 3.77:1 (Nit,
   mock only). No other real failures; all other flagged pairs are
   sampler artifacts over dark gradients/video (white-on-midnight,
   lime-on-midnight, light-grey-on-video all pass visually).
3. No clipped/overflowing text at any judged width, except the landing
   hero mock stat labels on mobile (Nit below).
4. Touch targets: systematic shortfall vs the suite 44px floor — 40×40
   rail/topbar icon buttons on every dashboard page, 36px primary CTAs,
   32–38px action/filter buttons (Required below). Inline text links
   excluded (inline pattern); bank checkboxes are 24×24 (WCAG 2.2 AA 24
   floor passes; suite 44 floor fails — deferred, see Nit).
5. Token tracing: dominant hexes are all DESIGN.md tokens. Unexplained
   values: `#584dae` (6 sites, Required below); near-white gradient
   washes and dark-slate mock panels (FYI/Nit).
6. States captured: default (all pages), focus (login + modal keyboard
   walks, focus visible at every stop), disabled (AI Generator Generate
   greyed without a topic, register Verifikasi greyed, reset Periksa
   disabled without token), loading (dashboard health "Memeriksa
   status…", user-table spinner, stat cards — see Required loading-zeros),
   empty (student dashboard, teacher exams/grading, grading zero-exam),
   error (result error state, wizard validation banner, monitor empty
   state). Hover: not screenshotted per element in this pass (see
   limitation); hover treatments are colour/shadow changes only.
7. Click-through: every exercised control did something real — landing
   inquiry CTA opens the modal, questions "AI Gen" opens the generator
   modal, admin "Tambah Pengguna" opens the add-user modal, sidebar help
   opens HelpModal, EXA trigger opens the EXA panel with onboarding +
   chips, exam-create "Lanjut" with empty title stays on step 1 with an
   inline validation banner. No dead controls found in the exercised set.
8. Keyboard walk: login tab order follows visual order (brand link,
   identifier, "Lupa kata sandi?" on the password label row, password,
   show-password, submit, register link), focus visible at every stop,
   no trap; inquiry modal contains focus across its 8 stops and Escape
   closes it. (The dev overlay portal appears as one tab stop; dev-only.)
9. Reduced motion: `MotionConfig reducedMotion="user"` plus
   `prefers-reduced-motion` CSS blocks; under reduced-motion emulation
   the landing hero h1 renders visible at opacity 1. No content exists
   only inside motion.
10. Layout shift: no above-fold jump observed on load; dashboard stat
    numbers swap 0 → real values in place (cards keep height); the user
    table populates below the fold (expected async fill). The 0-values
    themselves are the finding (Required below), not a shift.
11. Placeholder scan: no lorem ipsum anywhere; no grey-box imagery;
    landing stats come from the real `/public/landing` endpoint; landing
    hero mock bars are illustrative mock data, not presented as real
    stats (FYI).
12. Stamp-lies check: no macrostructure/theme/gate stamps in the product
    UI to lie about; the one numeric lie found is transient — dashboard
    stat cards showing "0" before data loads (Required below).
13. DESIGN.md drift check: Outfit display face (Required, flagged);
    questions spotlight dark gradient vs solid night surfaces (Required);
    `#584dae` (Required); lime CTAs vs Don'ts (Optional, contradiction);
    `--surface-subtle` #f1effa in CSS vs #f8fafc in DESIGN.md (FYI, CSS
    value is what renders and is consistent in use).

## Six-axis council (round 1; no round 2 needed)

- Product fit: every flow completes; wizard validation blocks empty
  advance with a named error; no dead controls in the exercised set.
- Typography/layout: stepper contrast (Critical), heading structure
  (Required), mock mobile clip (Nit). Dissent recorded: axis 2 would
  fix the Outfit drift to DESIGN.md, but the direction-change rule
  defers it to the human — not averaged away.
- Colour/tokens: `#584dae` (Required), spotlight gradient (Required),
  lime-CTA contradiction (Optional).
- Interaction/states: loading zeros (Required), touch floor (Required),
  unnamed eye toggle (Required); keyboard and modal behaviour clean.
- Accessibility: contrast (Critical), headings (Required), unnamed
  control (Required), focus visible everywhere walked, reduced motion
  resolves. Zoom 200%/400% pass not performed (limitation).
- Craft/anti-slop: `transition-all` (Required), missing `overflow-x:
  clip` (Required), no lorem/emoji-icons-except-two (Nit), no default
  purple gradients on heroes (the landing violet wash blob is a light
  atmospheric tint, FYI).

## Taste-core slop sweep

Motion mechanics: `transition-all` 144 sites (114 non-superadmin);
`hover:scale` only on small icons via `group-hover:scale-110/105`
(single-effect icons, acceptable); no layout-property animations; focus
rings animate in wherever `transition-all` meets `focus:ring` (fixed by
the same change). Colour mechanics: neutrals tinted (slate/violet
families, no zero-chroma oklch in use); accent area within limits; no
pure #000/#fff base surfaces (canvas is #faf9fd); accent fills carry
on-accent text. Layout safety: `overflow-x: clip` missing (Required);
grid tracks with images use `min-w-0`/`minmax` patterns already;
headings wrap (verified: full exam titles render). Structure/chrome:
no eyebrow-side-column heads, no default nav/footer bars (custom
pill navbar + rail sidebar), no re-drawn browser chrome (the landing
mock is a labelled product preview, not fake chrome presented as real),
no unmotivated middle-dot meta (the "·" separators in exam meta lines
are DESIGN.md-adjacent meta syntax, left alone). Type/token: Outfit
(Required, flagged), `#584dae` (Required), no placeholder names.

## Audit findings

[Critical] contrast-floor — `src/app/(auth)/register/page.tsx` stepper,
`src/app/(dashboard)/exams/create/page.tsx` stepper. Inactive step labels
in #94a3b8 on white measure 2.25–2.56:1 against the 4.5 floor. → Recolour
inactive step text to #64748b (4.76:1). IMPLEMENTED with slate-600
(#475569, 7.58:1 on white) instead of the planned slate-500, for margin
on the small 11–12px step text: register circle + label, create step-3
card text + number chip.

[Required] loading-zeros — `src/app/(dashboard)/admin/dashboard/page.tsx`
stat cards (lines ~332–351). Cards render the initial `0` values while
`/admin/stats` loads even though `isLoadingStats` exists; the sweep
caught "0 Pengguna / 0 Rombel / 0 Paket" mid-load before real values
(16 / 2 / 3) arrived. → Render "—" while `isLoadingStats` is true.
(Teacher/student dashboards gate content behind `isLoading`, so they do
not share this bug.) IMPLEMENTED: value and subtitle both guarded by
`isLoadingStats` ("—" / "Memuat data…" while loading).

[Required] overflow-x-clip — `src/app/globals.css`. No `overflow-x: clip`
on html/body (layout-safety gate). → Add `html, body { overflow-x: clip; }`.
IMPLEMENTED.

[Required] transition-all — 114 non-superadmin sites in `src/`. Every
transition animates all properties, including focus rings wherever
`transition-all` meets `focus:ring`. → Name properties: colours where
only colours change; add `box-shadow`/`transform` only where a hover
shadow/scale genuinely animates; `width` for the two progress bars
(reset-password strength, exam detail allocation); focus-ring elements
stay colour-only so rings appear instantly. IMPLEMENTED: all 114
non-superadmin sites replaced (100 colour-only, 11 shadow-inclusive,
2 transform-inclusive, 3 width — the two planned bars plus two more
found during implementation: the register strength bar and
`DashboardProgressBar`). Press-scale feedback (`active:scale-95` and
friends) keeps `transform` in its transition, including the Badge
interactive variant, which gained `transition-transform` on its own
string after the base token change would otherwise have snapped it.
0 `transition-all` remain outside superadmin files (grep-verified).

[Required] touch-target-floor — all dashboard pages (40×40 rail/topbar
icon buttons in `Sidebar.tsx`/`TopRightCluster.tsx`); primary CTAs at
36px (`Tambah Pengguna`, `Tambah Kelas Baru`, `Buat Paket Ujian`,
wizard `Lanjut`); action/filter buttons at 32–38px (`Peringatkan`,
`Log Bukti`, `Review & Beri Nilai`, `Cetak Rekap Nilai`, filter tabs).
Suite floor is 44px. → Raise the scoped set to 44px (icon buttons
w-11 h-11, CTAs h-11, action buttons h-11). IMPLEMENTED:
`min-h-[44px]` on the scoped buttons (the codebase's own floor pattern,
already used by the question-bank modals), w-11 h-11 on the rail/topbar
icon buttons, shared `Button` md size h-10 → h-11 (so the shared medium
size itself meets the floor), the student-dashboard "Periksa Jadwal
Terbaru" button sm → md, and the register affixed "Verifikasi" button
h-8 → h-11 with its input raised to py-3.5 so the button still fits
inside the field. Teacher segmented tabs, marketing billing toggle and
"Konsultasi Draf SPK / MOU" button, per-bank "AI Gen" and card link
included. Exam-page transient buttons (Scan Cam 2, Kumpulkan) were NOT
touched: that UI is unreachable from here (student enrolled nowhere)
and cannot be verified visually.

[Required] heading-structure — h1=0 on classes list/detail, exam
monitor, proctoring page, student result error state, companion; h1=2
on analytics/grading pages (greeting h1 + workspace h1). → Promote each
page's main title to h1 (classes `h2` → h1, monitor `h2` → h1, result
error `h2` → h1, sr-only h1 on companion); demote workspace titles in
`AnalyticsWorkspace.tsx:270` and `GradeReviewWorkspace.tsx:332` to h2
(the greeting stays the page h1; the print-only h1 at
`GradeReviewWorkspace.tsx:454` is left alone). IMPLEMENTED.

[Required] untokenised-colour — `#584dae` at 5 text sites (count
corrected from 6: `admin/dashboard/page.tsx:444`,
`student/dashboard/page.tsx:222,237`, `Sidebar.tsx:305`,
`Badge.tsx:146` violet variant). No DESIGN.md token
explains it. → Map to `#6a5fc1` (4.59:1 on #f1effa, 4.76:1 on violet-50
— passes). IMPLEMENTED. The 3 remaining `#584dae` occurrences are
deliberately left: a dead legacy `.sentri-chip-violet` class (0 usages),
the intentionally darker border of the violet `solid` token in
`tokens.ts` (same darker-border pattern as emerald-600/700), and the
unused `violetBorder` token.

[Required] unnamed-control — `src/app/(auth)/reset-password/page.tsx`
password-visibility eye toggle (line ~321; confirm field likewise if
unlabelled). Icon-only button with no accessible name. → Add
`aria-label="Tampilkan kata sandi"` (login's equivalent already has
one). IMPLEMENTED (one toggle exists; the confirm field has none).

[Required] design-drift-Outfit — `tailwind.config` font-display,
`src/app/globals.css` h1–h3 rule, `src/app/layout.tsx` font load. The
display face is Outfit; DESIGN.md's display tier was Plus Jakarta
Sans/Rubik. → RESOLVED BY HUMAN RULING 2026-10-31: Outfit kept as the
display face; DESIGN.md amended (display + heading tier registry entries
and the Font Family prose now name Outfit, with Plus Jakarta Sans/Rubik
as fallback). No code change needed; the drift is closed by the amendment.

[Required] design-drift-gradient — `src/app/(dashboard)/questions/page.tsx`
AI spotlight card (line ~202). Dark gradient panel vs DESIGN.md solid
night surfaces. → Solid `#150f23` (same border, same content); the
near-white `HeroCard` gradient goes solid white in the same pass.
IMPLEMENTED (spotlight solid `#150f23`, `HeroCard` solid white).

[Nit] mock-clip — landing hero mock at 390px. The first mock stat card
label loses its first letter to left clipping ("UJIAN BERLA…" renders
"JIAN BERLA…"). → Fix the mock grid/parallax on small screens.
RETRACTED after diagnosis, no code change: the missing "U" is the
Next.js dev overlay badge (fixed bottom-left) covering the label's
first letter in local screenshots, not a CSS clip. Measured: label box
x=46 (card x=33 + 13px padding, correctly inset), first character
rendered at x=46, left-aligned, no indent; with the page scrolled so
the badge no longer overlaps, the label reads "UJIAN BERLA…" in full
with correct right-side ellipsis. Production has no dev badge, so
production renders correctly.

[Nit] contrast-mock — landing hero mock emerald-600 status text
measures 3.77:1 on white (mock illustration only, not real data). →
Emerald-700 (5.48:1) inside the mock. IMPLEMENTED on the 5 text sites
(hero mock "Live" + "Selesai dinilai", floating proctoring card
"Sedang berjalan", mini-mock "Tersimpan", and the "PESERTA UJIAN"
eyebrow, which shares the failing pair on light ground). Icon usages
(CheckCircle2 etc.) left: icons need only 3:1 and pass.

[Nit] contrast-caption — companion helper text `text-white/35` over
video (~3.2:1). → `text-white/70`. IMPLEMENTED.

[Nit] placeholder-contrast — `placeholder:text-slate-400` (2.56:1)
across light inputs; every input has a real label, so impact is low. →
`placeholder:text-slate-500` (4.76:1); verified all usages sit on light
inputs. IMPLEMENTED (all non-superadmin files; the one superadmin
file, `TenantActivityTable.tsx`, excluded from the replacement).

[Nit] emoji-icons — `student/exam/[examId]/result/page.tsx:475`
(✅/❌ pass/fail) and `(exam)/student/exam/[examId]/page.tsx:990,1164`
(✓ "Terjawab" glyphs). Unicode glyphs standing in for icons. → Lucide
Check/X icons. IMPLEMENTED (result pass/fail now Lucide Check/X;
exam legend "Terjawab" glyphs now Lucide Check at w-2.5; 0 emoji glyphs
remain outside superadmin files).

[Nit] touch-deferred — dense-row text buttons (`Hapus` 38×16, `Lihat
Pembahasan Konsep` 185×17) and bank checkboxes 24×24 (WCAG 2.2 AA 24
floor passes). Enlarging these to 44px would distort dense data
tables; recorded, not changed. ("Periksa Jadwal Terbaru" was listed
here in the draft but was in fact raised sm → md in the touch pass.)

[Optional] design-contradiction-lime — DESIGN.md Don'ts forbid lime as a
primary-button background, but the built UI uses lime CTAs throughout
(login, register, landing) under the "lime = primary CTA" reading. →
Human to rule which reading wins; no change made.

[Optional] transition-all-superadmin — 30 `transition-all` sites in
superadmin files. Out of scope (superadmin pages excluded); recorded.

[FYI] sampler-limits — automated contrast sampling cannot resolve
gradient/image/video backgrounds, so white-on-midnight, lime-on-midnight
and light-grey-on-video pairs initially read as failures; all were
re-verified visually and pass (questions spotlight, `Kelola Kelas` /
`Master Bank Soal` banner buttons, Cam 2 chips on dark video).
[FYI] sub-12px-labels — 9–11px text on screen is DESIGN.md's own
micro/nano/pico cap tokens for labels, not body copy; not a taste-core
violation. [FYI] surface-subtle — CSS `--surface-subtle` #f1effa vs
DESIGN.md #f8fafc; the CSS value renders consistently, no action.
[FYI] landing-wash — the landing hero's light violet blur blob is an
atmospheric tint, not the banned purple-to-pink gradient; left alone.

## Yesterday's 16 fixes — regression check

No regressions found. Re-verified in this sweep: result error state
renders (no blank report), inquiry modal scrolls with reachable submit,
no stale exam-1 banner on analytics/grading, no superadmin tabs for
admin, no admin sidebar secrets link, zero `/academic/` API paths
(grep), exam titles wrap, completed maps to Selesai, steppers show
Selesai on existing exams, bank options wrap, no "/ 0" score
denominator, KKM pill single-line with full label, monitor badge
reflects status, mobile pages fit 390px without page overflow, reset
page uses AuthShell, short dashboard pages sit at viewport height.
(The register blank screenshot in this sweep was a dev-compile
transient; a re-check paints the page correctly. The student-exam
transient elements measured at 7s resolve to the honest not-found
state and are not counted as findings.)

## Limitations (not worked around)

- The 5 superadmin pages were not audited: no superadmin credentials
  exist and none were sought, guessed, or reset.
- The student exam flow past the not-found state is unreachable: the
  test student is enrolled in no class, so the camera wizard, question
  UI, and submit flow could not be exercised live from here.
- A 200%/400% zoom pass and per-element hover screenshots were not
  performed in this pass.
- Hover treatments were inspected in code (colour/shadow only), not
  screenshotted per element.

## Improvement (post-audit record, 2026-10-31)

Implemented: the Critical fix and every Required finding except the
Outfit drift (flagged for the human, unchanged), plus all safe Nits
except the retracted mock-clip. Not implemented: Outfit drift, lime-CTA
contradiction (Optional), superadmin transition-all (out of scope),
dense-row touch enlargement (Nit, deferred). Nothing committed; the
working tree is left for review. 48 files changed, +193/−184.

Incident during implementation, repaired and verified: the second
mechanical pass (adding `transform` to scale-animated transitions) used
a template-literal regex missing its closing backtick, which corrupted
173 `${...}` interpolations across 41 files (a backtick inserted before
each interpolation's closing brace). The corruption was caught in diff
review before any build, repaired with the exact inverse transform
(verified: 0 corruption signatures remain, and repaired lines match
HEAD except for their intended change), and the scale audit was redone
span-aware (0 spans still need a transform token). The clean production
build below is the final proof the tree parses.

Verification (re-shoot against local dev with real production data,
`~/workspace/examind-audit/verify3.mjs` + `verify3b.mjs`): 16/16 checks
pass — register stepper inactive label computes to slate-600
(rgb(71,85,105)); create step-3 card text slate-600; admin stats show
"— / Memuat data…" while `/admin/stats` is delayed and settle to real
values; h1==1 on classes list, class detail, monitor, analytics, and
grading; "Tambah Pengguna" measures 44px and the sidebar rail logout
44×44; questions spotlight computes to solid `#150f23` with no
gradient; landing mock "Live" text computes to emerald-700
(rgb(4,120,87)); reset eye toggle carries its aria-label; html/body
`overflow-x: clip`; companion sr-only h1 present with caption at
white/70. (Three first-run FAILs were finder bugs in the verify script
— wrong card text, wrong spotlight anchor, route-compile timing — all
three pass on corrected re-check.) Build: clean `pnpm build` passes
(exit 0, all routes rendered, no type errors) after killing dev and
`rm -rf .next`, with `BACKEND_URL` set at build time for the rewrites.

## Verdict

Verdict: improvement proceeds — implement the Critical stepper-contrast fix and all Required findings except the Outfit drift, which is flagged for the human and not changed; no route, IA, copy-intent, or visual-direction changes; superadmin pages and the live student-exam flow stay out of scope.

Ruling 2026-10-31: the human kept Outfit as the display face. The drift is closed by amending DESIGN.md (display + heading tier now name Outfit, Plus Jakarta Sans/Rubik as fallback); no code change. The lime-CTA contradiction (Optional) remains open pending the human's ruling on which reading wins.
