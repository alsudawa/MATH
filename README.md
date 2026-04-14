# Math Problem Generator

A web app for generating printable Korean math worksheets for grades 1–9 (elementary through middle school). Problems are reproducible via a seeded random number generator, shareable by a short worksheet ID (WID), and printable as A4 sheets with QR codes linking to the answer page.

**Live:** https://alsudawa.github.io/MATH/

---

## Features

- **39 chapters** across 6 grade groups (초1–2, 초3–4, 초5–6, 중1, 중2, 중3)
- **Auto-generation** — selecting a grade or chapter immediately produces a new worksheet
- **Multi-sheet sets** — generate 1–20 sheets as a set, all derived from a single base seed
- **Reproducible** — every worksheet has a WID (e.g. `E2-03-X7K2M`); entering the same WID recreates identical problems
- **QR code** on each sheet links to the answer page for that sheet
- **Answer page** — shows problems with answers highlighted in grade colour; includes a print button to reprint the problem sheet
- **Print-ready** — A4 portrait, problems spread evenly across the page, no answer sheet in the print output
- **Inline answer preview** — toggle answers on/off directly in the web preview

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript 6 |
| Build | Vite 8 |
| Styling | Tailwind CSS 3 |
| QR codes | QRCode.js (CDN) |
| Fonts | Noto Sans KR (Google Fonts) |
| Deploy | GitHub Pages (`gh-pages` branch) |

---

## Project Structure

```
src/
├── App.tsx                   # Root component, state, routing between normal/answers mode
├── data.ts                   # Grade/chapter definitions, WID helpers, URL builders
├── generators.ts             # Problem generators for all 39 chapters
├── utils.ts                  # SeededRandom, math helpers, fracHTML, renderDisplay
├── index.css                 # Tailwind base + custom classes (frac, blank, print CSS)
└── components/
    ├── Header.tsx             # Top bar with WID lookup input
    ├── GradeSelector.tsx      # Grade cards (E1–M3)
    ├── ChapterSelector.tsx    # Chapter buttons for the selected grade
    ├── PreviewSection.tsx     # Worksheet preview + toolbar (nav, sheet count, QR, answers toggle)
    ├── PrintArea.tsx          # Hidden div rendered only during print (#print-root)
    └── AnswersPage.tsx        # Answer view (loaded via QR URL ?answers=1)
```

---

## Key Concepts

### WID Format

```
E2-03-X7K2M
│   │   └── 5-char base-36 seed (A–Z, 0–9)
│   └────── chapter ID (01–09)
└────────── grade code (E1–E3, M1–M3)
```

Regex: `/^([EM][1-3])-(\d{2})-([0-9A-Z]{5})$/`

### URL Parameters

| Param | Description |
|---|---|
| `wid` | Worksheet ID — restores the exact worksheet |
| `n` | Number of sheets in the set (default: 1) |
| `answers` | `1` to open the answer page view |

Example: `https://alsudawa.github.io/MATH/?wid=E2-03-X7K2M&n=3&answers=1`

### Seeded Random

`SeededRandom` uses a 32-bit LCG (`state = imul(1664525, state) + 1013904223`). The seed string is parsed as base-36 and XOR'd with a constant. The same seed always produces the same sequence of problems.

Multi-sheet sets derive additional seeds deterministically from the base seed via `deriveSeeds(baseSeed, n)`, so a single WID + `n` always recreates the full set.

### Problem Display

Problems use a `display` string with `%%BLANK%%` markers. `renderDisplay(display, forPrint)` replaces them with either a styled `<span>` (web) or a wider underline span (print). Fractions are rendered as vertical HTML stacks via `.frac` / `.frac-num` / `.frac-den` CSS classes.

### Print Architecture

```
body
└── #root
    └── div.min-h-screen          ← App wrapper
        ├── <header>              ← hidden in print
        ├── <main>                ← hidden in print
        └── div#print-root        ← shown in print (display:none on screen)
```

Print CSS (`@media print`) hides `header` and `main`, shows `#print-root`, and overrides `min-h-screen` to prevent blank pages. Each `.print-page` uses `page-break-after: always`; the last page uses `auto`.

---

## Grade & Chapter Reference

| Code | Label | Chapters |
|---|---|---|
| E1 | 초1–2 | 덧셈·뺄셈 (9이내), 두 자리 연산, 세 자리 연산, 곱셈 기초 |
| E2 | 초3–4 | 구구단, 나눗셈, 두/세 자리 곱셈·나눗셈, 분수, 소수 |
| E3 | 초5–6 | 최대공약수, 최소공배수, 약분·통분, 분수·소수 곱셈·나눗셈 |
| M1 | 중1 | 소인수분해, 정수·유리수 사칙연산, 일차식, 일차방정식 |
| M2 | 중2 | 순환소수, 지수법칙, 다항식 계산, 일차부등식, 연립방정식 |
| M3 | 중3 | 제곱근, 곱셈공식, 인수분해, 이차방정식 |

---

## Development

```bash
npm install
npm run dev       # dev server at http://localhost:5173/MATH/
npm run build     # production build → dist/
```

### Deploy to GitHub Pages

```bash
npm run build
npx gh-pages -d dist --dotfiles
```

The `vite.config.ts` sets `base: '/MATH/'` to match the GitHub repository name (case-sensitive).

---

## Adding a New Chapter

1. Add a `Chapter` entry in `GRADE_DATA` inside `src/data.ts` with a unique `id` and appropriate `perPage`.
2. Add a generator function in `src/generators.ts` under `GENERATORS['XX-YY']` where `XX` is the grade code and `YY` is the chapter id.
3. The generator receives a `SeededRandom` instance and must return `{ display: string, answer: string }`. Use `%%BLANK%%` in `display` for answer blanks, and `fracHTML` / `fracHTMLRaw` for fractions.

### perPage Guidelines

| Problem type | Suggested perPage | Cols |
|---|---|---|
| Simple arithmetic (1–2 digit) | 20 | 4 |
| Standard arithmetic (2–3 digit) | 16 | 3 |
| Fractions / GCD / LCM | 12 | 2 |
| Equations / inequalities | 10 | 2 |
| Simultaneous / quadratic | 8 | 2 |

`colsForPerPage`: ≤12 → 2 cols, ≤16 → 3 cols, >16 → 4 cols.
