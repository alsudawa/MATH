import { SeededRandom, gcd, lcm, fracHTML, fracHTMLRaw, fracHTMLParenRaw } from './utils';

// ==================== TYPES ====================

export interface Problem {
  display: string;  // HTML, %%BLANK%% 마커 포함
  answer: string;   // HTML
}

type Generator = (rng: SeededRandom) => Problem;

// ==================== HELPERS ====================

function coefXStr(n: number): string {
  if (n === 1) return 'x';
  if (n === -1) return '−x';
  if (n < 0) return `−${Math.abs(n)}x`;
  return `${n}x`;
}

/** Format a plain integer for display, using typographic minus for negatives */
function fmtN(n: number): string {
  return n < 0 ? `−${Math.abs(n)}` : String(n);
}

function signStr(n: number, withPlus = true): string {
  if (n > 0) return withPlus ? `+ ${n}` : String(n);
  if (n < 0) return `− ${Math.abs(n)}`;
  return '';
}

function signXStr(n: number): string {
  if (n === 1) return '+ x';
  if (n === -1) return '− x';
  if (n > 0) return `+ ${n}x`;
  if (n < 0) return `− ${Math.abs(n)}x`;
  return '';
}

function nonZeroInt(rng: SeededRandom, min: number, max: number): number {
  let v: number;
  do { v = rng.int(min, max); } while (v === 0);
  return v;
}

// ==================== GENERATORS ====================

export const GENERATORS: Record<string, Generator> = {

  // ===== E1 (초등 1~2학년) =====

  'E1-01': (rng) => {
    const a = rng.int(1, 8);
    const b = rng.int(1, 9 - a);
    return { display: `${a} + ${b} = %%BLANK%%`, answer: String(a + b) };
  },

  'E1-02': (rng) => {
    const a = rng.int(2, 9);
    const b = rng.int(1, a - 1); // 결과 > 0 보장
    return { display: `${a} − ${b} = %%BLANK%%`, answer: String(a - b) };
  },

  'E1-03': (rng) => {
    // 두 자리 덧셈, 받아올림 없음: ones 합 < 10
    let a: number, b: number;
    do {
      a = rng.int(10, 89);
      b = rng.int(10, 99 - a);
    } while ((a % 10) + (b % 10) >= 10);
    return { display: `${a} + ${b} = %%BLANK%%`, answer: String(a + b) };
  },

  'E1-04': (rng) => {
    // 두 자리 뺄셈, 받아내림 없음: ones(a) >= ones(b)
    let a: number, b: number;
    do {
      a = rng.int(11, 99);
      b = rng.int(10, a - 1);
    } while ((a % 10) < (b % 10));
    return { display: `${a} − ${b} = %%BLANK%%`, answer: String(a - b) };
  },

  'E1-05': (rng) => {
    // 두 자리 덧셈, 받아올림 있음: ones 합 >= 10
    let a: number, b: number;
    do {
      a = rng.int(10, 89);
      b = rng.int(10, 99 - a);
    } while ((a % 10) + (b % 10) < 10);
    return { display: `${a} + ${b} = %%BLANK%%`, answer: String(a + b) };
  },

  'E1-06': (rng) => {
    // 두 자리 뺄셈, 받아내림 있음: ones(a) < ones(b)
    let a: number, b: number;
    do {
      a = rng.int(11, 99);
      b = rng.int(10, a - 1);
    } while ((a % 10) >= (b % 10) || (b % 10) === 0);
    return { display: `${a} − ${b} = %%BLANK%%`, answer: String(a - b) };
  },

  'E1-07': (rng) => {
    // 세 수 덧뺄셈: a+b−c 또는 a−b+c, 결과 >= 0
    if (rng.int(0, 1) === 0) {
      const a = rng.int(1, 50);
      const b = rng.int(1, 99 - a);
      const c = rng.int(1, a + b);
      return { display: `${a} + ${b} − ${c} = %%BLANK%%`, answer: String(a + b - c) };
    } else {
      const a = rng.int(10, 99);
      const b = rng.int(1, a - 1);
      const c = rng.int(1, 99 - (a - b));
      return { display: `${a} − ${b} + ${c} = %%BLANK%%`, answer: String(a - b + c) };
    }
  },

  'E1-08': (rng) => {
    if (rng.int(0, 1) === 0) {
      const a = rng.int(100, 899);
      const b = rng.int(100, 999 - a);
      return { display: `${a} + ${b} = %%BLANK%%`, answer: String(a + b) };
    } else {
      const a = rng.int(200, 999);
      const b = rng.int(100, a - 100);
      return { display: `${a} − ${b} = %%BLANK%%`, answer: String(a - b) };
    }
  },

  'E1-09': (rng) => {
    const table = [1, 2, 5][rng.int(0, 2)];
    const n = rng.int(1, 9);
    return { display: `${table} × ${n} = %%BLANK%%`, answer: String(table * n) };
  },

  'E1-10': (rng) => {
    // 덧셈과 뺄셈의 관계 (역연산): □ 찾기
    const type = rng.int(0, 2);
    if (type === 0) {
      const a = rng.int(1, 9), b = rng.int(1, 9);
      return { display: `%%BLANK%% + ${b} = ${a + b}`, answer: String(a) };
    } else if (type === 1) {
      const a = rng.int(1, 9), b = rng.int(1, 9);
      return { display: `${a} + %%BLANK%% = ${a + b}`, answer: String(b) };
    } else {
      const c = rng.int(2, 12), b = rng.int(1, c - 1); // 초1-2 수 범위 12 이내
      return { display: `${c} − %%BLANK%% = ${c - b}`, answer: String(b) };
    }
  },

  'E1-11': (rng) => {
    // 곱셈 기초 (3단·4단)
    const table = rng.int(0, 1) === 0 ? 3 : 4;
    const n = rng.int(1, 9);
    return { display: `${table} × ${n} = %%BLANK%%`, answer: String(table * n) };
  },

  // ===== E2 (초등 3~4학년) =====

  'E2-01': (rng) => {
    const a = rng.int(2, 9);
    const b = rng.int(1, 9);
    return { display: `${a} × ${b} = %%BLANK%%`, answer: String(a * b) };
  },

  'E2-02': (rng) => {
    const a = rng.int(2, 9);
    const b = rng.int(1, 9);
    return { display: `${a * b} ÷ ${a} = %%BLANK%%`, answer: String(b) };
  },

  'E2-03': (rng) => {
    const a = rng.int(11, 99);
    const b = rng.int(2, 9);
    return { display: `${a} × ${b} = %%BLANK%%`, answer: String(a * b) };
  },

  'E2-04': (rng) => {
    const a = rng.int(100, 999);
    const b = rng.int(2, 9);
    return { display: `${a} × ${b} = %%BLANK%%`, answer: String(a * b) };
  },

  'E2-05': (rng) => {
    // 세 자리 ÷ 한 자리, 나머지 0
    const b = rng.int(2, 9);
    const q = rng.int(Math.ceil(100 / b), Math.floor(999 / b));
    return { display: `${b * q} ÷ ${b} = %%BLANK%%`, answer: String(q) };
  },

  'E2-06': (rng) => {
    const a = rng.int(11, 99);
    const b = rng.int(11, 99);
    return { display: `${a} × ${b} = %%BLANK%%`, answer: String(a * b) };
  },

  'E2-07': (rng) => {
    // 세 자리 ÷ 두 자리, 나머지 0
    const b = rng.int(11, 33);
    const q = rng.int(Math.ceil(100 / b), Math.floor(999 / b));
    return { display: `${b * q} ÷ ${b} = %%BLANK%%`, answer: String(q) };
  },

  'E2-08': (rng) => {
    // 분수 덧뺄셈 같은 분모
    const d = rng.int(3, 12);
    if (rng.int(0, 1) === 0) {
      const a = rng.int(1, d - 1);
      const b = rng.int(1, d - a);
      return {
        display: `${fracHTMLRaw(a, d)} + ${fracHTMLRaw(b, d)} = %%BLANK%%`,
        answer: fracHTML(a + b, d),
      };
    } else {
      const a = rng.int(2, d);
      const b = rng.int(1, a - 1);
      return {
        display: `${fracHTMLRaw(a, d)} − ${fracHTMLRaw(b, d)} = %%BLANK%%`,
        answer: fracHTML(a - b, d),
      };
    }
  },

  'E2-09': (rng) => {
    const a = rng.int(11, 99) / 10;
    const b = rng.int(11, 99) / 10;
    if (rng.int(0, 1) === 0) {
      return {
        display: `${a.toFixed(1)} + ${b.toFixed(1)} = %%BLANK%%`,
        answer: (a + b).toFixed(1),
      };
    } else {
      const [big, small] = a >= b ? [a, b] : [b, a];
      return {
        display: `${big.toFixed(1)} − ${small.toFixed(1)} = %%BLANK%%`,
        answer: (big - small).toFixed(1),
      };
    }
  },

  'E2-10': (rng) => {
    // 나머지가 있는 나눗셈
    const b = rng.int(2, 9);
    const q = rng.int(1, 9);
    const r = rng.int(1, b - 1);
    const a = b * q + r;
    return {
      display: `${a} ÷ ${b} = %%BLANK%% 나머지 %%BLANK%%`,
      answer: `몫 ${q}, 나머지 ${r}`,
    };
  },

  'E2-11': (rng) => {
    // 세 자리 × 두 자리
    const a = rng.int(101, 499);
    const b = rng.int(11, 49);
    return { display: `${a} × ${b} = %%BLANK%%`, answer: String(a * b) };
  },

  'E2-12': (rng) => {
    // 네 자리 ÷ 두 자리, 나머지 0
    const b = rng.int(12, 50);
    const q = rng.int(Math.ceil(1000 / b), Math.min(Math.floor(9999 / b), 200));
    return { display: `${b * q} ÷ ${b} = %%BLANK%%`, answer: String(q) };
  },

  'E2-13': (rng) => {
    // 분수 덧셈/뺄셈 (다른 분모, 통분 필요)
    let p: number, q: number;
    do { p = rng.int(2, 8); q = rng.int(2, 8); } while (p === q);
    if (rng.int(0, 1) === 0) {
      const a = rng.int(1, p - 1), b = rng.int(1, q - 1);
      return {
        display: `${fracHTMLRaw(a, p)} + ${fracHTMLRaw(b, q)} = %%BLANK%%`,
        answer: fracHTML(a * q + b * p, p * q),
      };
    } else {
      // ensure a/p > b/q: regenerate both until satisfied
      let a: number, b: number;
      do {
        a = rng.int(1, p - 1);
        b = rng.int(1, q - 1);
      } while (a * q <= b * p);
      return {
        display: `${fracHTMLRaw(a, p)} − ${fracHTMLRaw(b, q)} = %%BLANK%%`,
        answer: fracHTML(a * q - b * p, p * q),
      };
    }
  },

  'E2-14': (rng) => {
    // 소수 덧셈/뺄셈 (소수 둘째 자리)
    const a = rng.int(101, 999) / 100;
    const b = rng.int(101, 999) / 100;
    if (rng.int(0, 1) === 0) {
      const result = Math.round((a + b) * 100) / 100;
      return {
        display: `${a.toFixed(2)} + ${b.toFixed(2)} = %%BLANK%%`,
        answer: result.toFixed(2),
      };
    } else {
      const [big, small] = a >= b ? [a, b] : [b, a];
      const result = Math.round((big - small) * 100) / 100;
      return {
        display: `${big.toFixed(2)} − ${small.toFixed(2)} = %%BLANK%%`,
        answer: result.toFixed(2),
      };
    }
  },

  // ===== E3 (초등 5~6학년) =====

  'E3-01': (rng) => {
    let a: number, b: number;
    do {
      a = rng.int(2, 50);
      b = rng.int(2, 50);
    } while (a === b || gcd(a, b) === 1); // avoid trivial: identical or coprime
    return { display: `${a}와 ${b}의 최대공약수 = %%BLANK%%`, answer: String(gcd(a, b)) };
  },

  'E3-02': (rng) => {
    const a = rng.int(2, 20);
    const b = rng.int(2, 20);
    return { display: `${a}와 ${b}의 최소공배수 = %%BLANK%%`, answer: String(lcm(a, b)) };
  },

  'E3-03': (rng) => {
    if (rng.int(0, 1) === 0) {
      // 약분
      const g = rng.int(2, 6);
      const d = rng.int(2, 9);
      const n = rng.int(1, d - 1);
      return {
        display: `${fracHTMLRaw(n * g, d * g)} 약분 = %%BLANK%%`,
        answer: fracHTML(n * g, d * g),
      };
    } else {
      // 통분
      const a = rng.int(2, 8);
      const b = rng.int(2, 8);
      const na = rng.int(1, a - 1);
      const nb = rng.int(1, b - 1);
      const L = lcm(a, b);
      return {
        display: `${fracHTMLRaw(na, a)}과 ${fracHTMLRaw(nb, b)} 통분 = %%BLANK%%`,
        answer: `${fracHTMLRaw(na * (L / a), L)}, ${fracHTMLRaw(nb * (L / b), L)}`,
      };
    }
  },

  'E3-04': (rng) => {
    const an = rng.int(1, 6), ad = rng.int(2, 8);
    const bn = rng.int(1, 6), bd = rng.int(2, 8);
    return {
      display: `${fracHTMLRaw(an, ad)} × ${fracHTMLRaw(bn, bd)} = %%BLANK%%`,
      answer: fracHTML(an * bn, ad * bd),
    };
  },

  'E3-05': (rng) => {
    const a = rng.int(11, 99) / 10;
    const b = rng.int(11, 99) / 10;
    const result = Math.round(a * b * 100) / 100;
    // preserve trailing zero: e.g. 3.0 not 3
    const answerStr = result % 1 === 0 ? result.toFixed(1) : String(result);
    return {
      display: `${a.toFixed(1)} × ${b.toFixed(1)} = %%BLANK%%`,
      answer: answerStr,
    };
  },

  'E3-06': (rng) => {
    // 분수 ÷ 분수 = 분수 × 역수
    const an = rng.int(1, 6), ad = rng.int(2, 8);
    const bn = rng.int(1, 6), bd = rng.int(2, 8);
    return {
      display: `${fracHTMLRaw(an, ad)} ÷ ${fracHTMLRaw(bn, bd)} = %%BLANK%%`,
      answer: fracHTML(an * bd, ad * bn),
    };
  },

  'E3-07': (rng) => {
    // 소수 ÷ 소수, 나머지 0: a = (b/10) × q, 제수 bd = b/10
    const b = rng.int(2, 9);
    const q = rng.int(2, 9);
    const a = Math.round(b * q) / 10; // (b/10) * q = b*q/10
    const bd = b / 10;
    return {
      display: `${a.toFixed(1)} ÷ ${bd.toFixed(1)} = %%BLANK%%`,
      answer: String(q),
    };
  },

  'E3-08': (rng) => {
    // 분수의 곱셈 (정수 × 분수)
    const n = rng.int(2, 9);
    const an = rng.int(1, 6), ad = rng.int(2, 8);
    if (rng.int(0, 1) === 0) {
      return {
        display: `${n} × ${fracHTMLRaw(an, ad)} = %%BLANK%%`,
        answer: fracHTML(n * an, ad),
      };
    } else {
      return {
        display: `${fracHTMLRaw(an, ad)} × ${n} = %%BLANK%%`,
        answer: fracHTML(n * an, ad),
      };
    }
  },

  'E3-09': (rng) => {
    // 대분수의 덧셈과 뺄셈
    const d = rng.int(3, 8);
    const w1 = rng.int(1, 4), n1 = rng.int(1, d - 1);
    const w2 = rng.int(1, 3), n2 = rng.int(1, d - 1);
    const imp1 = w1 * d + n1, imp2 = w2 * d + n2;
    // helper: build mixed-number answer with properly reduced fractional part
    const mixedAns = (wr: number, nr: number) =>
      nr === 0 ? String(wr) : wr === 0 ? fracHTML(nr, d) : `${wr} ${fracHTML(nr, d)}`;

    if (imp1 === imp2) {
      // avoid trivial X − X = 0: bump n2 by 1 (mod d, keeping it a proper fraction)
      const n2b = (n2 % (d - 1)) + 1;
      const imp2b = w2 * d + n2b;
      const diff = Math.abs(imp1 - imp2b);
      const answer = mixedAns(Math.floor(diff / d), diff % d);
      const [bw, bn] = imp1 >= imp2b ? [w1, n1] : [w2, n2b];
      const [sw, sn] = imp1 >= imp2b ? [w2, n2b] : [w1, n1];
      return { display: `${bw} ${fracHTMLRaw(bn, d)} − ${sw} ${fracHTMLRaw(sn, d)} = %%BLANK%%`, answer };
    }

    if (rng.int(0, 1) === 0) {
      const total = imp1 + imp2;
      const answer = mixedAns(Math.floor(total / d), total % d);
      return {
        display: `${w1} ${fracHTMLRaw(n1, d)} + ${w2} ${fracHTMLRaw(n2, d)} = %%BLANK%%`,
        answer,
      };
    } else {
      const [big, small] = imp1 >= imp2 ? [imp1, imp2] : [imp2, imp1];
      const [bw, bn] = imp1 >= imp2 ? [w1, n1] : [w2, n2];
      const [sw, sn] = imp1 >= imp2 ? [w2, n2] : [w1, n1];
      const diff = big - small;
      const answer = mixedAns(Math.floor(diff / d), diff % d);
      return {
        display: `${bw} ${fracHTMLRaw(bn, d)} − ${sw} ${fracHTMLRaw(sn, d)} = %%BLANK%%`,
        answer,
      };
    }
  },

  'E3-10': (rng) => {
    // 소수의 곱셈 (둘째 자리 포함)
    if (rng.int(0, 1) === 0) {
      // 자연수 × 소수 둘째 자리
      const a = rng.int(2, 9);
      const b = rng.int(11, 99) / 100;
      const result = Math.round(a * b * 100) / 100;
      return {
        display: `${a} × ${b.toFixed(2)} = %%BLANK%%`,
        answer: result.toFixed(2),
      };
    } else {
      // 소수 첫째 자리 × 소수 둘째 자리 → 최대 3자리, trailing zero 유지
      const a = rng.int(11, 30) / 10;
      const b = rng.int(11, 50) / 100;
      const result = Math.round(a * b * 1000) / 1000;
      // toFixed(3) then strip trailing zeros but keep at least 1 decimal
      const answer = result.toFixed(3).replace(/(\.\d*[1-9])0+$/, '$1').replace(/\.0+$/, '.0');
      return {
        display: `${a.toFixed(1)} × ${b.toFixed(2)} = %%BLANK%%`,
        answer,
      };
    }
  },

  'E3-11': (rng) => {
    // 소수의 나눗셈 (소수 몫: 소수 ÷ 정수 = 소수)
    let q: number;
    do { q = rng.int(11, 99) / 10; } while (q % 1 === 0);
    const b = rng.int(2, 8);
    const a = Math.round(q * b * 10) / 10;
    return {
      display: `${a.toFixed(1)} ÷ ${b} = %%BLANK%%`,
      answer: q.toFixed(1),
    };
  },

  // ===== M1 (중학교 1학년) =====

  'M1-01': (rng) => {
    // 소인수분해: 2~3개 소수의 곱, 결과 < 500
    const primes = [2, 3, 5, 7, 11, 13];
    let n: number, factors: number[];
    do {
      const count = rng.int(2, 3);
      factors = Array.from({ length: count }, () => primes[rng.int(0, 5)]);
      n = factors.reduce((a, b) => a * b, 1);
    } while (n > 499 || n < 4);
    const factorMap: Record<number, number> = {};
    factors.forEach(p => { factorMap[p] = (factorMap[p] ?? 0) + 1; });
    const answerStr = Object.entries(factorMap)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([p, e]) => e > 1 ? `${p}<sup>${e}</sup>` : p)
      .join(' × ');
    return { display: `${n}을 소인수분해하면 %%BLANK%%`, answer: answerStr };
  },

  'M1-02': (rng) => {
    // 정수 사칙연산 (음수 포함) — 0 피연산자/몫 제외
    const ops = ['+', '−', '×', '÷'] as const;
    const op = ops[rng.int(0, 3)];
    let a = nonZeroInt(rng, -10, 10);
    let b = nonZeroInt(rng, -10, 10);
    let result: number;

    if (op === '÷') {
      const q = nonZeroInt(rng, -9, 9);
      a = b * q;
      result = q;
    } else if (op === '+') result = a + b;
    else if (op === '−') result = a - b;
    else result = a * b;

    const da = a < 0 ? `(−${Math.abs(a)})` : String(a);
    const db = b < 0 ? `(−${Math.abs(b)})` : String(b);
    const answerStr = result < 0 ? `−${Math.abs(result)}` : String(result);
    return { display: `${da} ${op} ${db} = %%BLANK%%`, answer: answerStr };
  },

  'M1-03': (rng) => {
    // 유리수 사칙연산
    const ops = ['+', '−', '×', '÷'] as const;
    const op = ops[rng.int(0, 3)];
    let an = rng.int(1, 5), ad = rng.int(2, 6);
    let bn = rng.int(1, 5), bd = rng.int(2, 6);
    // reduce operand fractions so the problem doesn't show e.g. (2/4)
    const ga = gcd(an, ad); an /= ga; ad /= ga;
    const gb = gcd(bn, bd); bn /= gb; bd /= gb;
    const signA = rng.int(0, 1) ? 1 : -1;
    const signB = rng.int(0, 1) ? 1 : -1;
    an *= signA; bn *= signB;

    let rn: number, rd: number;
    if (op === '+') { rn = an * bd + bn * ad; rd = ad * bd; }
    else if (op === '−') { rn = an * bd - bn * ad; rd = ad * bd; }
    else if (op === '×') { rn = an * bn; rd = ad * bd; }
    else { rn = an * bd; rd = ad * bn; }

    const dA = fracHTMLParenRaw(an, ad);
    const dB = fracHTMLParenRaw(bn, bd);
    return {
      display: `${dA} ${op} ${dB} = %%BLANK%%`,
      answer: fracHTML(rn, rd),
    };
  },

  'M1-04': (rng) => {
    // 일차식 동류항 정리: ax + b + cx + d (trivial 0 결과 제외)
    let a: number, b: number, c: number, d: number, rc: number, rk: number;
    do {
      a = nonZeroInt(rng, -7, 7);
      b = nonZeroInt(rng, -10, 10);
      c = nonZeroInt(rng, -7, 7);
      d = nonZeroInt(rng, -10, 10);
      rc = a + c; rk = b + d;
    } while (rc === 0 && rk === 0);

    const display = `${coefXStr(a)} ${signStr(b)} ${signXStr(c)} ${signStr(d)} = %%BLANK%%`;

    let answer: string;
    if (rc === 0 && rk === 0) answer = '0';
    else if (rc === 0) answer = fmtN(rk);
    else if (rk === 0) answer = coefXStr(rc);
    else answer = `${coefXStr(rc)} ${signStr(rk)}`;

    return { display, answer };
  },

  'M1-05': (rng) => {
    // 일차방정식: ax + b = c
    const a = rng.int(1, 8) * (rng.int(0, 1) ? 1 : -1);
    const x = nonZeroInt(rng, -10, 10);
    const b = nonZeroInt(rng, -9, 9);
    const c = a * x + b;
    const aStr = a === 1 ? 'x' : a === -1 ? '−x' : `${a}x`;
    return {
      display: `${aStr} ${signStr(b)} = ${fmtN(c)},&nbsp; x = %%BLANK%%`,
      answer: fmtN(x),
    };
  },

  'M1-06': (rng) => {
    // 정수의 혼합계산 (괄호 포함, 연산 순서)
    const type = rng.int(0, 2);
    const fmt = (n: number) => n < 0 ? `(−${Math.abs(n)})` : String(n);
    const ans = (n: number) => n < 0 ? `−${Math.abs(n)}` : String(n);
    if (type === 0) {
      // a + b × c (a nonzero to avoid trivial)
      const a = nonZeroInt(rng, -9, 9);
      const b = nonZeroInt(rng, -6, 6);
      const c = nonZeroInt(rng, -6, 6);
      return {
        display: `${fmt(a)} + ${fmt(b)} × ${fmt(c)} = %%BLANK%%`,
        answer: ans(a + b * c),
      };
    } else if (type === 1) {
      // (a + b) × c
      const a = nonZeroInt(rng, -8, 8);
      const b = nonZeroInt(rng, -8, 8);
      const c = nonZeroInt(rng, -6, 6);
      const inner = b < 0 ? `${fmtN(a)} − ${Math.abs(b)}` : `${fmtN(a)} + ${b}`;
      return {
        display: `(${inner}) × ${fmt(c)} = %%BLANK%%`,
        answer: ans((a + b) * c),
      };
    } else {
      // a × b − c (c nonzero)
      const a = nonZeroInt(rng, -7, 7);
      const b = nonZeroInt(rng, -7, 7);
      const c = nonZeroInt(rng, -10, 10);
      return {
        display: `${fmt(a)} × ${fmt(b)} − ${fmt(c)} = %%BLANK%%`,
        answer: ans(a * b - c),
      };
    }
  },

  'M1-07': (rng) => {
    // 부호가 있는 식의 계산 (이중 부호, 괄호 분배)
    const type = rng.int(0, 2);
    const ans = (n: number) => n < 0 ? `−${Math.abs(n)}` : String(n);
    if (type === 0) {
      // −(−a) + b
      const a = rng.int(1, 15);
      const b = rng.int(1, 10);
      return { display: `−(−${a}) + ${b} = %%BLANK%%`, answer: ans(a + b) };
    } else if (type === 1) {
      // a − (b − c): distribute minus sign
      const a = rng.int(1, 20);
      const b = rng.int(1, 15);
      const c = rng.int(1, 10);
      return {
        display: `${a} − (${b} − ${c}) = %%BLANK%%`,
        answer: ans(a - b + c),
      };
    } else {
      // −(a + b) + c
      const a = rng.int(1, 10);
      const b = rng.int(1, 10);
      const c = rng.int(1, 25);
      return {
        display: `−(${a} + ${b}) + ${c} = %%BLANK%%`,
        answer: ans(-(a + b) + c),
      };
    }
  },

  'M1-08': (rng) => {
    // 일차식의 덧셈과 뺄셈: (ax+b) ± (cx+d)
    const a = nonZeroInt(rng, -6, 6);
    const b = nonZeroInt(rng, -9, 9);
    const c = nonZeroInt(rng, -6, 6);
    const d = nonZeroInt(rng, -9, 9);
    const op = rng.int(0, 1) === 0 ? '+' : '−';
    const rc = op === '+' ? a + c : a - c;
    const rk = op === '+' ? b + d : b - d;

    let answer: string;
    if (rc === 0 && rk === 0) answer = '0';
    else if (rc === 0) answer = fmtN(rk);
    else if (rk === 0) answer = coefXStr(rc);
    else answer = `${coefXStr(rc)} ${signStr(rk)}`;

    return {
      display: `(${coefXStr(a)} ${signStr(b)}) ${op} (${coefXStr(c)} ${signStr(d)}) = %%BLANK%%`,
      answer,
    };
  },

  // ===== M2 (중학교 2학년) =====

  'M2-01': (rng) => {
    // 유리수→소수 변환
    const d = rng.int(2, 12);
    const n = rng.int(1, d - 1);
    const g = gcd(n, d);
    const sn = n / g, sd = d / g;
    const val = sn / sd;
    // 유한소수 판정
    let tmp = sd;
    while (tmp % 2 === 0) tmp /= 2;
    while (tmp % 5 === 0) tmp /= 5;
    const terminating = tmp === 1;
    let answer: string;
    if (terminating) {
      // 유한소수: 정확한 값 표시 (trailing zero 포함)
      const decimals = String(val).split('.')[1]?.length ?? 0;
      answer = val.toFixed(Math.max(decimals, 1));
    } else {
      // 무한소수: 4자리까지 보여주고 ...
      const digits = (sn / sd).toFixed(6).replace(/^.*\./, '');
      answer = '0.' + digits.slice(0, 4) + '...';
    }
    return {
      display: `${fracHTMLRaw(sn, sd)} 를 소수로 나타내면 %%BLANK%%`,
      answer,
    };
  },

  'M2-02': (rng) => {
    // 지수법칙
    const type = rng.int(0, 2);
    if (type === 0) {
      const m = rng.int(1, 5), n = rng.int(1, 5);
      return { display: `a<sup>${m}</sup> × a<sup>${n}</sup> = %%BLANK%%`, answer: `a<sup>${m + n}</sup>` };
    } else if (type === 1) {
      const m = rng.int(3, 8), n = rng.int(1, m - 1);
      return { display: `a<sup>${m}</sup> ÷ a<sup>${n}</sup> = %%BLANK%%`, answer: `a<sup>${m - n}</sup>` };
    } else {
      const m = rng.int(1, 4), n = rng.int(2, 4);
      return { display: `(a<sup>${m}</sup>)<sup>${n}</sup> = %%BLANK%%`, answer: `a<sup>${m * n}</sup>` };
    }
  },

  'M2-03': (rng) => {
    // 단항식·다항식 계산
    const a = rng.int(1, 5), b = rng.int(1, 5);
    const xCoef = (c: number, exp: number) => `${c === 1 ? '' : c}x<sup>${exp}</sup>`;
    if (rng.int(0, 1) === 0) {
      const m = rng.int(1, 3), n = rng.int(1, 3);
      return {
        display: `${a}x<sup>${m}</sup> × ${b}x<sup>${n}</sup> = %%BLANK%%`,
        answer: xCoef(a * b, m + n),
      };
    } else {
      const m = rng.int(2, 4), n = rng.int(1, m - 1);
      const coef = a * b;
      return {
        display: `${coef}x<sup>${m}</sup> ÷ ${b}x<sup>${n}</sup> = %%BLANK%%`,
        answer: xCoef(a, m - n),
      };
    }
  },

  'M2-04': (rng) => {
    // 일차부등식
    const ops = ['<', '>', '≤', '≥'] as const;
    const op = ops[rng.int(0, 3)];
    const a = rng.int(1, 8) * (rng.int(0, 1) ? 1 : -1);
    const b = nonZeroInt(rng, -10, 10);
    const c = nonZeroInt(rng, -15, 15);
    const flipMap: Record<string, string> = { '<': '>', '>': '<', '≤': '≥', '≥': '≤' };
    const solOp = a < 0 ? flipMap[op] : op;
    const aStr = a === 1 ? 'x' : a === -1 ? '−x' : `${a}x`;
    return {
      display: `${aStr} ${signStr(b)} ${op} ${fmtN(c)},&nbsp; x %%BLANK%%`,
      answer: `${solOp} ${fracHTML(c - b, a)}`,
    };
  },

  'M2-05': (rng) => {
    // 연립방정식: 정수해 역산 (음의 계수 포함)
    let a1: number, a2: number, b1: number, b2: number, x: number, y: number;
    do {
      x = nonZeroInt(rng, -5, 5); y = nonZeroInt(rng, -5, 5);
      a1 = nonZeroInt(rng, -4, 4); b1 = nonZeroInt(rng, -4, 4);
      a2 = nonZeroInt(rng, -4, 4); b2 = nonZeroInt(rng, -4, 4);
    } while (a1 * b2 - a2 * b1 === 0);
    const c1 = a1 * x + b1 * y;
    const c2 = a2 * x + b2 * y;

    const termStr = (coef: number, varName: string) => {
      if (coef === 1) return varName;
      if (coef === -1) return `−${varName}`;
      if (coef < 0) return `−${Math.abs(coef)}${varName}`;
      return `${coef}${varName}`;
    };

    const xTerm1 = termStr(a1, 'x'), yTerm1 = termStr(Math.abs(b1), 'y');
    const xTerm2 = termStr(a2, 'x'), yTerm2 = termStr(Math.abs(b2), 'y');
    const r1 = `${xTerm1}${b1 >= 0 ? ' + ' : ' − '}${yTerm1} = ${fmtN(c1)}`;
    const r2 = `${xTerm2}${b2 >= 0 ? ' + ' : ' − '}${yTerm2} = ${fmtN(c2)}`;

    const ansX = x < 0 ? `−${Math.abs(x)}` : String(x);
    const ansY = y < 0 ? `−${Math.abs(y)}` : String(y);
    return {
      display: `${r1}<br>${r2}<br>x = %%BLANK%%, &nbsp;y = %%BLANK%%`,
      answer: `x = ${ansX}, y = ${ansY}`,
    };
  },

  'M2-06': (rng) => {
    // 단항식의 곱셈/나눗셈 (이변수 x, y)
    const xyCoef = (c: number, xe: number, ye: number) =>
      `${c === 1 ? '' : c}x<sup>${xe}</sup>y<sup>${ye}</sup>`;
    if (rng.int(0, 1) === 0) {
      // axᵐyⁿ × bxᵖyᵍ
      const a = rng.int(1, 4), b = rng.int(1, 4);
      const m = rng.int(1, 3), n = rng.int(1, 3);
      const p = rng.int(1, 3), q = rng.int(1, 3);
      return {
        display: `${a}x<sup>${m}</sup>y<sup>${n}</sup> × ${b}x<sup>${p}</sup>y<sup>${q}</sup> = %%BLANK%%`,
        answer: xyCoef(a * b, m + p, n + q),
      };
    } else {
      // axᵐyⁿ ÷ bxᵖyᵍ (a divisible by b, m > p, n > q)
      const b = rng.int(1, 4);
      const qc = rng.int(1, 4);
      const a = b * qc;
      const m = rng.int(2, 5), n = rng.int(2, 5);
      const p = rng.int(1, m - 1), q = rng.int(1, n - 1);
      return {
        display: `${a}x<sup>${m}</sup>y<sup>${n}</sup> ÷ ${b}x<sup>${p}</sup>y<sup>${q}</sup> = %%BLANK%%`,
        answer: xyCoef(qc, m - p, n - q),
      };
    }
  },

  // ===== M3 (중학교 3학년) =====

  'M3-01': (rng) => {
    const type = rng.int(0, 2);
    if (type === 0) {
      const n = rng.int(2, 12);
      return { display: `√${n * n} = %%BLANK%%`, answer: String(n) };
    } else if (type === 1) {
      const a = rng.int(2, 7), b = rng.int(2, 7);
      const prod = a * b;
      const sqrtProd = Math.round(Math.sqrt(prod));
      const isPerfectSq = sqrtProd * sqrtProd === prod;
      return {
        display: `√${a} × √${b} = %%BLANK%%`,
        answer: isPerfectSq ? String(sqrtProd) : `√${prod}`,
      };
    } else {
      const a = rng.int(2, 15);
      return { display: `(√${a})² = %%BLANK%%`, answer: String(a) };
    }
  },

  'M3-02': (rng) => {
    const type = rng.int(0, 3);
    const a = rng.int(1, 8);
    if (type === 0) {
      return {
        display: `(x + ${a})² = %%BLANK%%`,
        answer: `x² + ${2 * a}x + ${a * a}`,
      };
    } else if (type === 1) {
      return {
        display: `(x − ${a})² = %%BLANK%%`,
        answer: `x² − ${2 * a}x + ${a * a}`,
      };
    } else if (type === 2) {
      return {
        display: `(x + ${a})(x − ${a}) = %%BLANK%%`,
        answer: `x² − ${a * a}`,
      };
    } else {
      // (ax+b)(cx+d), leading coefficient ≠ 1
      const p = rng.int(2, 4), q = rng.int(1, 5);
      const r = rng.int(2, 4), s = rng.int(1, 5);
      const A = p * r, B = p * s + q * r, C = q * s;
      const bStr = B > 0 ? ` + ${B}x` : ` − ${Math.abs(B)}x`;
      const cStr = C > 0 ? ` + ${C}` : ` − ${Math.abs(C)}`;
      return {
        display: `(${p}x + ${q})(${r}x + ${s}) = %%BLANK%%`,
        answer: `${A}x²${bStr}${cStr}`,
      };
    }
  },

  'M3-03': (rng) => {
    const type = rng.int(0, 3);
    const a = rng.int(1, 8);
    if (type === 0) {
      return {
        display: `x² + ${2 * a}x + ${a * a} = %%BLANK%%`,
        answer: `(x + ${a})²`,
      };
    } else if (type === 1) {
      return {
        display: `x² − ${2 * a}x + ${a * a} = %%BLANK%%`,
        answer: `(x − ${a})²`,
      };
    } else if (type === 2) {
      return {
        display: `x² − ${a * a} = %%BLANK%%`,
        answer: `(x + ${a})(x − ${a})`,
      };
    } else {
      // x² + (a+b)x + ab = (x+a)(x+b), a ≠ b (避免與完全平方 type 0/1 重複)
      let b: number;
      do { b = rng.int(1, 8); } while (b === a);
      const sumAB = a + b;
      const prodAB = a * b;
      return {
        display: `x² + ${sumAB}x + ${prodAB} = %%BLANK%%`,
        answer: `(x + ${a})(x + ${b})`,
      };
    }
  },

  'M3-04': (rng) => {
    // 이차방정식: (x−r1)(x−r2)=0 전개
    let r1: number, r2: number;
    do { r1 = rng.int(-8, 8); r2 = rng.int(-8, 8); } while (r1 === 0 && r2 === 0);
    const bCoef = -(r1 + r2);
    const cCoef = r1 * r2;
    const bStr = bCoef > 0 ? ` + ${bCoef}x` : bCoef < 0 ? ` − ${Math.abs(bCoef)}x` : '';
    const cStr = cCoef > 0 ? ` + ${cCoef}` : cCoef < 0 ? ` − ${Math.abs(cCoef)}` : '';
    if (r1 === r2) {
      return {
        display: `x²${bStr}${cStr} = 0,&nbsp; x = %%BLANK%%`,
        answer: fmtN(r1),
      };
    }
    return {
      display: `x²${bStr}${cStr} = 0,&nbsp; x = %%BLANK%% 또는 x = %%BLANK%%`,
      answer: `${fmtN(r1)}, ${fmtN(r2)}`,
    };
  },
};

// ==================== GENERATE SHEET ====================

export function generateProblems(
  gradeCode: string,
  chapId: string,
  seed: string,
  perPage: number
): Problem[] {
  const key = `${gradeCode}-${chapId}`;
  const gen = GENERATORS[key];
  if (!gen) return [];
  const rng = new SeededRandom(seed);
  return Array.from({ length: perPage }, () => gen(rng));
}
