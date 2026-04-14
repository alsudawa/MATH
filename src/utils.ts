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

/** 분수 HTML (GCD 약분 적용, answer용) */
export function fracHTML(n: number, d: number): string {
  const g = gcd(Math.abs(n), Math.abs(d));
  n = n / g;
  d = d / g;
  if (d < 0) { n = -n; d = -d; }
  if (d === 1) return n < 0 ? `−${Math.abs(n)}` : String(n);
  const sign = n < 0 ? '−' : '';
  const absN = Math.abs(n);
  return `${sign}<span class="frac"><span class="frac-num">${absN}</span><span class="frac-den">${d}</span></span>`;
}

/** 분수 HTML (약분 없음, display용) */
export function fracHTMLRaw(n: number, d: number): string {
  if (d === 1) return n < 0 ? `−${Math.abs(n)}` : String(n);
  const sign = n < 0 ? '−' : '';
  const absN = Math.abs(n);
  return `${sign}<span class="frac"><span class="frac-num">${absN}</span><span class="frac-den">${d}</span></span>`;
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
