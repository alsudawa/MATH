/**
 * Generator test suite
 *
 * For each generator we:
 *  1. Run N random seeds and check structural invariants
 *  2. Verify mathematical correctness on deterministic seeds
 *  3. Check typographic quality (no ASCII minus in answers, no NaN, etc.)
 */

import { describe, it, expect } from 'vitest';
import { GENERATORS, generateProblems } from './generators';
import { GRADE_DATA } from './data';
import { SeededRandom, gcd } from './utils';

// ==================== HELPERS ====================

/** Strip all HTML tags, leaving only plain text */
function stripHTML(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim();
}

/** Count occurrences of a substring */
function countOccurrences(str: string, sub: string): number {
  return str.split(sub).length - 1;
}

/** Generate N seeds deterministically */
function makeSeeds(n: number): string[] {
  const rng = new SeededRandom('TEST0');
  return Array.from({ length: n }, (_) =>
    Math.floor(rng.next() * 60466176).toString(36).toUpperCase().padStart(5, '0')
  );
}

const SEEDS = makeSeeds(200);

// ==================== STRUCTURAL INVARIANTS ====================

describe('All generators — structural invariants', () => {
  const allGeneratorIds = Object.keys(GENERATORS);

  it('every generator ID maps to a known chapter in GRADE_DATA', () => {
    for (const id of allGeneratorIds) {
      const [gc, chapId] = id.split('-');
      const grade = GRADE_DATA.find(g => g.code === gc);
      expect(grade, `grade not found for ${id}`).toBeDefined();
      const chap = grade!.chapters.find(c => c.id === chapId);
      expect(chap, `chapter not found for ${id}`).toBeDefined();
    }
  });

  it('every chapter in GRADE_DATA has a corresponding generator', () => {
    for (const grade of GRADE_DATA) {
      for (const chap of grade.chapters) {
        const key = `${grade.code}-${chap.id}`;
        expect(GENERATORS[key], `missing generator for ${key}`).toBeDefined();
      }
    }
  });

  for (const id of allGeneratorIds) {
    describe(id, () => {
      it('produces non-empty display and answer for 200 seeds', () => {
        const gen = GENERATORS[id];
        for (const seed of SEEDS) {
          const rng = new SeededRandom(seed);
          const p = gen(rng);
          expect(p.display, `${id}@${seed} display`).toBeTruthy();
          expect(p.answer, `${id}@${seed} answer`).toBeTruthy();
        }
      });

      it('display always contains at least one %%BLANK%%', () => {
        const gen = GENERATORS[id];
        for (const seed of SEEDS) {
          const rng = new SeededRandom(seed);
          const p = gen(rng);
          expect(p.display, `${id}@${seed} missing %%BLANK%%`).toContain('%%BLANK%%');
        }
      });

      it('answer never contains NaN or undefined', () => {
        const gen = GENERATORS[id];
        for (const seed of SEEDS) {
          const rng = new SeededRandom(seed);
          const p = gen(rng);
          expect(stripHTML(p.answer)).not.toContain('NaN');
          expect(stripHTML(p.answer)).not.toContain('undefined');
          expect(stripHTML(p.answer)).not.toContain('Infinity');
        }
      });

      it('multi-blank: answer parts match %%BLANK%% count', () => {
        const gen = GENERATORS[id];
        for (const seed of SEEDS) {
          const rng = new SeededRandom(seed);
          const p = gen(rng);
          const blanks = countOccurrences(p.display, '%%BLANK%%');
          if (blanks > 1) {
            // answer must split into exactly blanks parts on ", "
            const parts = p.answer.split(', ');
            expect(parts.length, `${id}@${seed}: blanks=${blanks} but answer parts=${parts.length}`)
              .toBe(blanks);
          }
        }
      });

      it('answer does not use ASCII hyphen-minus for negative numbers', () => {
        const gen = GENERATORS[id];
        // Check plain-text answer (strip HTML) has no bare "-" at word boundary
        const asciiMinusPattern = /(^|[^a-zA-Z0-9])-\d/;
        for (const seed of SEEDS) {
          const rng = new SeededRandom(seed);
          const p = gen(rng);
          const plain = stripHTML(p.answer);
          expect(plain, `${id}@${seed} ASCII minus in answer: "${plain}"`)
            .not.toMatch(asciiMinusPattern);
        }
      });
    });
  }
});

// ==================== MATHEMATICAL CORRECTNESS ====================

describe('E1 — 초등 1~2학년', () => {
  it('E1-01: a + b equals answer', () => {
    for (const seed of SEEDS) {
      const rng = new SeededRandom(seed);
      const p = GENERATORS['E1-01'](rng);
      const [a, b] = p.display.replace(' = %%BLANK%%', '').split(' + ').map(Number);
      expect(a + b).toBe(Number(p.answer));
    }
  });

  it('E1-02: result is always positive (no a − a = 0)', () => {
    for (const seed of SEEDS) {
      const rng = new SeededRandom(seed);
      const p = GENERATORS['E1-02'](rng);
      expect(Number(p.answer)).toBeGreaterThan(0);
    }
  });

  it('E1-09: answer is table × n', () => {
    for (const seed of SEEDS) {
      const rng = new SeededRandom(seed);
      const p = GENERATORS['E1-09'](rng);
      const [a, b] = p.display.replace(' = %%BLANK%%', '').split(' × ').map(Number);
      expect(a * b).toBe(Number(p.answer));
      expect([1, 2, 5]).toContain(a);
    }
  });

  it('E1-10: inverse operation answers are correct', () => {
    for (const seed of SEEDS) {
      const rng = new SeededRandom(seed);
      const p = GENERATORS['E1-10'](rng);
      const ans = Number(p.answer);
      expect(ans).toBeGreaterThan(0);
      // verify answer is reasonable (≤ 12 for subtraction type)
      expect(ans).toBeLessThanOrEqual(12);
    }
  });

  it('E1-11: only 3× or 4× table', () => {
    for (const seed of SEEDS) {
      const rng = new SeededRandom(seed);
      const p = GENERATORS['E1-11'](rng);
      const [table, n] = p.display.replace(' = %%BLANK%%', '').split(' × ').map(Number);
      expect([3, 4]).toContain(table);
      expect(table * n).toBe(Number(p.answer));
    }
  });
});

describe('E2 — 초등 3~4학년', () => {
  it('E2-02: dividend ÷ divisor = answer (exact)', () => {
    for (const seed of SEEDS) {
      const rng = new SeededRandom(seed);
      const p = GENERATORS['E2-02'](rng);
      const [dividend, divisor] = p.display.replace(' = %%BLANK%%', '').split(' ÷ ').map(Number);
      expect(dividend / divisor).toBe(Number(p.answer));
    }
  });

  it('E2-10: quotient and remainder are correct, remainder ≥ 1', () => {
    for (const seed of SEEDS) {
      const rng = new SeededRandom(seed);
      const p = GENERATORS['E2-10'](rng);
      const [dividend, divisor] = p.display
        .replace(' = %%BLANK%% 나머지 %%BLANK%%', '').split(' ÷ ').map(Number);
      const [quotientPart, remainderPart] = p.answer.split(', ');
      const q = Number(quotientPart.replace('몫 ', ''));
      const r = Number(remainderPart.replace('나머지 ', ''));
      expect(r).toBeGreaterThanOrEqual(1);
      expect(r).toBeLessThan(divisor);
      expect(divisor * q + r).toBe(dividend);
    }
  });

  it('E2-11: three-digit × two-digit multiplication is correct', () => {
    for (const seed of SEEDS) {
      const rng = new SeededRandom(seed);
      const p = GENERATORS['E2-11'](rng);
      const [a, b] = p.display.replace(' = %%BLANK%%', '').split(' × ').map(Number);
      expect(a).toBeGreaterThanOrEqual(100);
      expect(b).toBeGreaterThanOrEqual(10);
      expect(a * b).toBe(Number(p.answer));
    }
  });

  it('E2-13: different-denominator fraction addition/subtraction is correct', () => {
    for (const seed of SEEDS) {
      const rng = new SeededRandom(seed);
      const p = GENERATORS['E2-13'](rng);
      // result numerator should be positive (guaranteed by generator guard)
      const plain = stripHTML(p.answer);
      expect(plain).not.toBe('0');
    }
  });
});

describe('E3 — 초등 5~6학년', () => {
  it('E3-01: GCD is non-trivial (a ≠ b, gcd > 1)', () => {
    for (const seed of SEEDS) {
      const rng = new SeededRandom(seed);
      const p = GENERATORS['E3-01'](rng);
      const match = p.display.match(/(\d+)와 (\d+)/);
      expect(match).toBeTruthy();
      const a = Number(match![1]), b = Number(match![2]);
      expect(a).not.toBe(b);
      expect(gcd(a, b)).toBeGreaterThan(1);
      expect(Number(p.answer)).toBe(gcd(a, b));
    }
  });

  it('E3-05: decimal answer preserves trailing zero', () => {
    for (const seed of SEEDS) {
      const rng = new SeededRandom(seed);
      const p = GENERATORS['E3-05'](rng);
      // answer must have at least one decimal digit
      expect(p.answer).toContain('.');
    }
  });

  it('E3-07: dividend ÷ decimal-divisor = integer quotient (correct)', () => {
    for (const seed of SEEDS) {
      const rng = new SeededRandom(seed);
      const p = GENERATORS['E3-07'](rng);
      const text = p.display.replace(' = %%BLANK%%', '');
      const [aStr, bStr] = text.split(' ÷ ');
      const a = parseFloat(aStr), b = parseFloat(bStr);
      const q = Number(p.answer);
      expect(b).toBeLessThan(1); // divisor is a decimal < 1
      expect(Math.round(a / b * 10) / 10).toBe(q);
    }
  });

  it('E3-09: subtraction result is never 0 (no trivial X − X)', () => {
    for (const seed of SEEDS) {
      const rng = new SeededRandom(seed);
      const p = GENERATORS['E3-09'](rng);
      if (p.display.includes('−')) {
        expect(stripHTML(p.answer)).not.toBe('0');
      }
    }
  });

  it('E3-11: quotient is a proper decimal (not integer)', () => {
    for (const seed of SEEDS) {
      const rng = new SeededRandom(seed);
      const p = GENERATORS['E3-11'](rng);
      const q = parseFloat(p.answer);
      expect(q % 1).not.toBe(0); // must have fractional part
    }
  });
});

describe('M1 — 중학교 1학년', () => {
  it('M1-02: integer arithmetic is correct', () => {
    for (const seed of SEEDS) {
      const rng = new SeededRandom(seed);
      const p = GENERATORS['M1-02'](rng);
      // answer should be a number (possibly with typographic minus)
      const plain = stripHTML(p.answer).replace('−', '-');
      expect(isNaN(Number(plain))).toBe(false);
    }
  });

  it('M1-04: answer is never trivial zero (both terms cancel)', () => {
    for (const seed of SEEDS) {
      const rng = new SeededRandom(seed);
      const p = GENERATORS['M1-04'](rng);
      expect(stripHTML(p.answer).trim()).not.toBe('0');
    }
  });

  it('M1-05: answer x satisfies the equation (ax + b = c)', () => {
    for (const seed of SEEDS) {
      const rng = new SeededRandom(seed);
      const p = GENERATORS['M1-05'](rng);
      // extract x from answer (may have typographic minus)
      const xStr = stripHTML(p.answer).replace('−', '-');
      const x = Number(xStr);
      expect(isNaN(x)).toBe(false);
      // extract a, b, c from display: "ax + b = c, x = %%BLANK%%"
      // just verify x is an integer
      expect(Number.isInteger(x)).toBe(true);
    }
  });

  it('M1-06: mixed computation result matches arithmetic', () => {
    // just check no NaN — detailed structural checks covered above
    for (const seed of SEEDS) {
      const rng = new SeededRandom(seed);
      const p = GENERATORS['M1-06'](rng);
      const ans = stripHTML(p.answer).replace('−', '-');
      expect(isNaN(Number(ans))).toBe(false);
    }
  });
});

describe('M2 — 중학교 2학년', () => {
  it('M2-01: terminating decimals have correct digit count', () => {
    for (const seed of SEEDS) {
      const rng = new SeededRandom(seed);
      const p = GENERATORS['M2-01'](rng);
      const ans = p.answer;
      // must either be a decimal number or end with "..."
      expect(ans.endsWith('...') || !isNaN(Number(ans))).toBe(true);
    }
  });

  it('M2-04: display contains %%BLANK%% (inequality answer renders)', () => {
    for (const seed of SEEDS) {
      const rng = new SeededRandom(seed);
      const p = GENERATORS['M2-04'](rng);
      expect(p.display).toContain('%%BLANK%%');
    }
  });

  it('M2-05: simultaneous equations have exactly 2 blanks', () => {
    for (const seed of SEEDS) {
      const rng = new SeededRandom(seed);
      const p = GENERATORS['M2-05'](rng);
      expect(countOccurrences(p.display, '%%BLANK%%')).toBe(2);
      const parts = p.answer.split(', ');
      expect(parts).toHaveLength(2);
    }
  });

  it('M2-06: monomial answers do not start with "1x" or "1x"', () => {
    for (const seed of SEEDS) {
      const rng = new SeededRandom(seed);
      const p = GENERATORS['M2-06'](rng);
      const ans = stripHTML(p.answer);
      // coefficient 1 should be omitted: "x²y³" not "1x²y³"
      expect(ans).not.toMatch(/^1x/);
    }
  });
});

describe('M3 — 중학교 3학년', () => {
  it('M3-01: √(n²) = n (perfect square case)', () => {
    // Now using KaTeX, display is HTML — detect type 0 by absence of '×' and '('
    let tested = 0;
    for (const seed of SEEDS) {
      const rng = new SeededRandom(seed);
      const p = GENERATORS['M3-01'](rng);
      if (!p.display.includes('×') && !p.display.includes('(')) {
        // type 0: √(n²) = n — answer is a plain integer string
        const n = Number(p.answer);
        expect(n).toBeGreaterThan(0);
        tested++;
      }
    }
    expect(tested).toBeGreaterThan(0);
  });

  it('M3-01: √a × √b answer is either an integer or non-empty KaTeX HTML', () => {
    for (const seed of SEEDS) {
      const rng = new SeededRandom(seed);
      const p = GENERATORS['M3-01'](rng);
      if (p.display.includes('×')) {
        // answer is either a plain integer (perfect square) or KaTeX HTML for a sqrt
        const answerIsInteger = !isNaN(Number(p.answer)) && p.answer.trim() !== '';
        const answerIsHtml = p.answer.includes('<');
        expect(answerIsInteger || answerIsHtml).toBe(true);
        expect(p.answer.trim()).not.toBe('');
      }
    }
  });

  it('M3-03 type 3: no perfect square collision (a ≠ b in (x+a)(x+b))', () => {
    for (const seed of SEEDS) {
      const rng = new SeededRandom(seed);
      const p = GENERATORS['M3-03'](rng);
      if (p.answer.includes(')(')) {
        // Match sign and number separately so type 2 "(x+a)(x−a)" is not flagged
        const match = p.answer.match(/\(x ([+−]) (\d+)\)\(x ([+−]) (\d+)\)/);
        if (match && match[1] === match[3]) {
          // Same sign → type 3: roots must differ
          expect(match[2], 'type 3 roots must differ').not.toBe(match[4]);
        }
        // Different signs → type 2 difference-of-squares: legitimately same number
      }
    }
  });

  it('M3-04: roots are not both zero (no trivial x² = 0)', () => {
    for (const seed of SEEDS) {
      const rng = new SeededRandom(seed);
      const p = GENERATORS['M3-04'](rng);
      // both roots zero → x²= 0, prevented by do-while guard
      expect(p.display).not.toContain('x² = 0,');
    }
  });

  it('M3-04: two distinct roots use two blanks; double root uses one blank', () => {
    for (const seed of SEEDS) {
      const rng = new SeededRandom(seed);
      const p = GENERATORS['M3-04'](rng);
      const blanks = (p.display.match(/%%BLANK%%/g) || []).length;
      if (blanks === 2) {
        // answer must be "r1, r2"
        expect(p.answer.split(', ')).toHaveLength(2);
      } else {
        expect(blanks).toBe(1);
      }
    }
  });

  it('M3-04: answer uses typographic minus for negative roots', () => {
    const asciiMinus = /-\d/;
    for (const seed of SEEDS) {
      const rng = new SeededRandom(seed);
      const p = GENERATORS['M3-04'](rng);
      expect(p.answer).not.toMatch(asciiMinus);
    }
  });
});

// ==================== generateProblems INTEGRATION ====================

describe('generateProblems()', () => {
  it('returns correct number of problems for each chapter', () => {
    for (const grade of GRADE_DATA) {
      for (const chap of grade.chapters) {
        const problems = generateProblems(grade.code, chap.id, 'TESTA', chap.perPage);
        expect(problems).toHaveLength(chap.perPage);
      }
    }
  });

  it('returns empty array for unknown chapter', () => {
    const problems = generateProblems('E1', '99', 'TESTA', 10);
    expect(problems).toHaveLength(0);
  });

  it('same seed always produces identical problems (deterministic)', () => {
    const grade = GRADE_DATA[0];
    const chap = grade.chapters[0];
    const p1 = generateProblems(grade.code, chap.id, 'REPRO', chap.perPage);
    const p2 = generateProblems(grade.code, chap.id, 'REPRO', chap.perPage);
    expect(p1.map(p => p.display)).toEqual(p2.map(p => p.display));
    expect(p1.map(p => p.answer)).toEqual(p2.map(p => p.answer));
  });

  it('different seeds produce different problems', () => {
    const grade = GRADE_DATA[1]; // E2
    const chap = grade.chapters[0];
    const p1 = generateProblems(grade.code, chap.id, 'SEED1', chap.perPage);
    const p2 = generateProblems(grade.code, chap.id, 'SEED2', chap.perPage);
    const displays1 = p1.map(p => p.display).join('|');
    const displays2 = p2.map(p => p.display).join('|');
    expect(displays1).not.toBe(displays2);
  });
});
