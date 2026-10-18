# EXAMIND — Logo guidelines

**Mark:** a shield whose silhouette is carved into an "E", with one lime integrity check in the lower counter.
Integrity (shield) + intelligence (the check, a verified/graded result) + human oversight (the check is the single
"approved" gesture inside the E).

## Colour
| Role | HEX | Use |
|---|---|---|
| Midnight violet | `#150F23` | Mark and wordmark on light; background for inverted |
| Electric lime | `#C2EF4E` | The check only. Never a fill, background or text |
| Pedagogical violet | `#6A5FC1` | Secondary variant (Socratic-tutor context) — `*-violet.svg` |
| White / Black | `#FFFFFF` / `#000000` | Monochrome versions (check takes the same colour; separation is the 10 u gap) |

Lime is ≈ 14 % of the symbol's ink. On white the lime has low contrast by design: the violet carries legibility, lime is the highlight.

## Geometry (256-unit grid, symbol bounds x 40–216, y 20–228 → 176 × 208 u)
**Shield + E (one path, `#150F23`):**
`M40 26 A6 6 0 0 1 46 20 H210 A6 6 0 0 1 216 26 V60 H88 V88 H124 V128 H88 V176 H180 L130.83 225.17 A4 4 0 0 1 125.17 225.17 L40 140 Z`
- Top bar 40 u (y 20–60) · stem 48 u (x 40–88) · middle arm 36 u long × 40 u (x 88–124, y 88–128)
- Shoulders at y 140; both lower sides run at exactly 45° to a 4 u-radius tip at (128, 228)
- Corner radii: 6 u (top), 4 u (tip); all other corners sharp

**Check (`#C2EF4E`, polygon):** `134,116 152,134 216,70 216,102 152,166 134,148`
- Legs at 45° / 45°, 32 u vertical thickness; right end flush with the shield edge (x = 216)
- Gap to everything else = 10 u (arm: x 124→134 · top bar: y 60→70 · floor: y 166→176)

**Small cut (< 24 px):** shield `M40 26A6 6 0 0 1 46 20H210A6 6 0 0 1 216 26V68H92V172H176L130.83 225.17A4 4 0 0 1 125.17 225.17L40 140Z`, check `112,110 136,134 216,54 216,96 136,176 112,152`.

**Wordmark:** EXAMIND in caps, constructed letterforms, cap height 100 u, stems 22 u, diagonals at 60°. Advance widths E60 X80 A90 M100 I22 N76 D78; gaps E-X 9, X-A 5, A-M 9, M-I 14, I-N 14, N-D 14 (≈ −0.02 em tracking feel). Outlines are in the SVGs.

**Lockups:** horizontal — wordmark cap height = 88 u (42 % of symbol height), 56 u gap, wordmark centred on the symbol's centre. Stacked — wordmark cap height 64 u, 44 u gap, symbol centred above.

## Clear space
X = height of the lime check (96 u = 46 % of symbol height). Keep **½ X (48 u)** free on all sides of every lockup and the symbol.

## Minimum sizes
| Asset | Digital | Print |
|---|---|---|
| Symbol, full | 24 px high | 8 mm |
| Symbol, small cut | 16–23 px | — |
| Horizontal lockup | 24 px high (≈ 85 px wide) | 8 mm high |
| Stacked lockup | 80 px wide | 20 mm |
| Wordmark alone | 64 px wide | 16 mm |

## Misuse
No gradients, glows, shadows or bevels · no lime fill, lime wordmark or lime background · don't recolour the check
(except monochrome) · don't stretch, skew or outline · don't separate the check from the shield · no wordmark in another
typeface · no placement inside the clear space or on low-contrast photos.

## Honest notes
- The wordmark is **custom-constructed** (geometric, in the spirit of Plus Jakarta Sans / Rubik ExtraBold), **not** outlines of either font — neither was available while building. For exact brand-font text elsewhere, use the licensed font; keep these outlines for the logo.
- Tested visually at 16 / 24 / 32 px, in colour, reversed and one colour. Not tested: print proofs, embroidery, trademark clearance (run a professional search before launch).
- SVGs contain no live text, raster, gradient or filter; two colours max.
