// ==================== SEEDED RANDOM ====================

export class SeededRandom {
  private state: number;

  constructor(seedStr: string) {
    this.state = (parseInt(seedStr, 36) ^ 0x12345678) | 0;
  }

  next(): number {
    this.state = (Math.imul(1664525, this.state) + 1013904223) | 0;
    return (this.state >>> 0) / 0x100000000;
  }

  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }
}

// ==================== SEED HELPERS ====================

export function newSeed(): string {
  return Math.floor(Math.random() * 60466175)
    .toString(36)
    .toUpperCase()
    .padStart(5, '0');
}

export function deriveSeeds(baseSeed: string, count: number): string[] {
  const rng = new SeededRandom(baseSeed);
  return Array.from({ length: count }, () =>
    Math.floor(rng.next() * 60466176)
      .toString(36)
      .toUpperCase()
      .padStart(5, '0')
  );
}

// ==================== MATH UTILS ====================

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

// ==================== FRACTION HTML ====================

import katex from 'katex';

function K(latex: string): string {
  return katex.renderToString(latex, { throwOnError: false, output: 'html' });
}

/** 분수 HTML — GCD 약분 적용 (answer용) */
export function fracHTML(n: number, d: number): string {
  const g = gcd(Math.abs(n), Math.abs(d));
  n /= g; d /= g;
  if (d < 0) { n = -n; d = -d; }
  if (d === 1) return K(String(n));
  const latex = n < 0 ? `-\\dfrac{${Math.abs(n)}}{${d}}` : `\\dfrac{${n}}{${d}}`;
  return K(latex);
}

/** 분수 HTML — 약분 없음 (display용) */
export function fracHTMLRaw(n: number, d: number): string {
  if (d === 1) return K(String(n));
  const latex = n < 0 ? `-\\dfrac{${Math.abs(n)}}{${d}}` : `\\dfrac{${n}}{${d}}`;
  return K(latex);
}

/** 음수 분수에 괄호 붙이기 (display용) */
export function fracHTMLParenRaw(n: number, d: number): string {
  if (d === 1) return K(n < 0 ? `(${n})` : String(n));
  const latex = n < 0
    ? `\\left(-\\dfrac{${Math.abs(n)}}{${d}}\\right)`
    : `\\dfrac{${n}}{${d}}`;
  return K(latex);
}

/** 근호 (vinculum 포함), coef=1은 표시 안 함 */
export function kSqrt(n: number, coef = 1): string {
  const prefix = coef === 1 ? '' : String(coef);
  return K(`${prefix}\\sqrt{${n}}`);
}

// ==================== BLANK RENDER ====================

export function renderDisplay(display: string, forPrint: boolean): string {
  if (forPrint) {
    return display.replace(
      /%%BLANK%%/g,
      '<span class="print-answer-blank">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>'
    );
  }
  return display.replace(
    /%%BLANK%%/g,
    '<span class="answer-blank">&nbsp;&nbsp;&nbsp;</span>'
  );
}

/** Replace %%BLANK%% markers with the answer rendered inline in grade colour.
 *  For multi-blank problems (e.g. simultaneous equations), the answer string
 *  is split on ", " so each blank gets its own value. */
export function renderWithAnswer(display: string, answer: string, color: string): string {
  const blanks = (display.match(/%%BLANK%%/g) || []).length;
  if (blanks === 0) return display;

  const styled = (val: string) =>
    `<span style="color:${color};font-weight:700;">${val}</span>`;

  if (blanks === 1) {
    return display.replace('%%BLANK%%', styled(answer));
  }

  // Multi-blank: split "x = 3, y = -2" → values by stripping variable prefixes
  const vals = answer.split(', ').map(s => s.replace(/^[a-z]\s*=\s*/, ''));
  let idx = 0;
  return display.replace(/%%BLANK%%/g, () => styled(vals[idx++] ?? answer));
}

// ==================== GRADING ====================

function stripHTML(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim();
}

function normalizeAnswer(s: string): string {
  return s
    .replace(/\s+/g, '')
    .replace(/[−–—]/g, '-')  // typographic minus → ASCII
    .replace(/,/g, '')
    .toLowerCase();
}

export function checkAnswer(userInput: string, correctHTML: string): boolean {
  const correct = normalizeAnswer(stripHTML(correctHTML));
  const user = normalizeAnswer(userInput);
  if (!user) return false;
  if (user === correct) return true;
  // fraction equivalence: 2/4 == 1/2
  const fracRe = /^(-?\d+)\/(\d+)$/;
  const um = fracRe.exec(user), cm = fracRe.exec(correct);
  if (um && cm) {
    return Number(um[1]) * Number(cm[2]) === Number(cm[1]) * Number(um[2]);
  }
  // numeric equivalence: 0.5 == .5 == 0.50
  const un = Number(user), cn = Number(correct);
  if (!isNaN(un) && !isNaN(cn) && un === cn) return true;
  return false;
}
