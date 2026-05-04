import { useState, useEffect, useRef, useCallback } from 'react';
import { Sheet } from '../App';
import { GradeGroup, Chapter } from '../data';
import { Problem } from '../generators';
import { gcd } from '../utils';
import { colsForPerPage } from '../data';

// ──────────────── grading helpers ────────────────

function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return (div.textContent ?? '').trim();
}

function norm(s: string): string {
  return s
    .replace(/[−–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function gradeOne(userRaw: string, answerHtml: string): boolean {
  const user = norm(userRaw);
  const ansText = norm(stripHtml(answerHtml));

  if (user === ansText) return true;

  // spaces-collapsed comparison (KaTeX may insert thin-space between digits)
  if (user.replace(/\s/g, '') === ansText.replace(/\s/g, '')) return true;

  // user typed fraction "a/b" → compare with KaTeX-rendered fraction
  // KaTeX dfrac{a}{b} textContent = "ab" (no separator)
  const fracMatch = user.match(/^(-?\d+)\/(\d+)$/);
  if (fracMatch) {
    const n = parseInt(fracMatch[1], 10);
    const d = parseInt(fracMatch[2], 10);
    if (d !== 0) {
      const g = gcd(Math.abs(n), d);
      const sn = Math.abs(n) / g, sd = d / g;
      const sign = n < 0 ? '-' : '';
      // e.g. "-34" for -3/4 simplified
      if (sign + String(sn) + String(sd) === ansText.replace(/\s/g, '')) return true;
      // non-reduced form
      if (sign + String(Math.abs(n)) + String(d) === ansText.replace(/\s/g, '')) return true;
    }
  }

  return false;
}

function gradeAnswer(userInputs: string[], problem: Problem): boolean {
  const blanks = (problem.display.match(/%%BLANK%%/g) ?? []).length;
  if (blanks === 0) return true;

  if (blanks === 1) {
    return gradeOne(userInputs[0] ?? '', problem.answer);
  }

  // Multi-blank: split answer on ", " and strip variable prefixes
  const parts = problem.answer.split(', ').map(s =>
    s.replace(/^[a-zA-Z]\s*=\s*/, '').replace(/^[가-힣]+\s*/, '')
  );
  return userInputs.every((inp, i) => gradeOne(inp, parts[i] ?? problem.answer));
}

// ──────────────── sub-components ────────────────

interface ProblemRowProps {
  problem: Problem;
  inputs: string[];
  onChange: (blankIdx: number, val: string) => void;
  submitted: boolean;
  correct: boolean;
  index: number;
  color: string;
  onEnterLast?: () => void;
}

function ProblemRow({ problem, inputs, onChange, submitted, correct, index, color, onEnterLast }: ProblemRowProps) {
  const parts = problem.display.split('%%BLANK%%');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  return (
    <div
      className={`px-3 py-2 border-b border-slate-100 text-[13px] leading-loose transition-colors
        ${submitted ? (correct ? 'bg-green-50' : 'bg-red-50') : ''}`}
    >
      <span className="text-slate-300 text-[11px] font-bold mr-1">{index + 1}.</span>
      {parts.map((part, i) => (
        <span key={i}>
          <span dangerouslySetInnerHTML={{ __html: part }} />
          {i < parts.length - 1 && (
            <input
              ref={el => { inputRefs.current[i] = el; }}
              type="text"
              value={inputs[i] ?? ''}
              onChange={e => onChange(i, e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const next = inputRefs.current[i + 1];
                  if (next) {
                    next.focus();
                  } else {
                    onEnterLast?.();
                  }
                }
              }}
              disabled={submitted}
              className={`inline-block text-center border-b-2 bg-transparent outline-none font-bold mx-1
                text-[13px] transition-colors
                ${submitted
                  ? correct
                    ? 'border-green-400 text-green-700'
                    : 'border-red-400 text-red-600 line-through'
                  : 'border-slate-400 focus:border-blue-500 text-slate-800'
                }`}
              style={{ width: '52px' }}
              placeholder="?"
            />
          )}
        </span>
      ))}
      {submitted && !correct && (
        <span className="ml-2 text-[11px] font-bold" style={{ color }}>
          → <span dangerouslySetInnerHTML={{ __html: problem.answer }} />
        </span>
      )}
    </div>
  );
}

// ──────────────── main component ────────────────

interface Props {
  sheet: Sheet;
  grade: GradeGroup;
  chapter: Chapter;
  timerDuration: number;   // 0 = no timer, otherwise seconds
  onClose: () => void;
  onNewProblems: () => void;
}

export default function PracticeMode({ sheet, grade, chapter, timerDuration, onClose, onNewProblems }: Props) {
  const cols = colsForPerPage(chapter.perPage);
  const gridCls = `grid gap-0 ${cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-3' : 'grid-cols-4'}`;

  const blankCounts = sheet.problems.map(p => (p.display.match(/%%BLANK%%/g) ?? []).length);

  const [inputs, setInputs] = useState<string[][]>(() =>
    blankCounts.map(n => Array(n).fill(''))
  );
  const [submitted, setSubmitted] = useState(false);
  const [grades, setGrades] = useState<boolean[]>([]);
  const [timerKey, setTimerKey] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(timerDuration > 0 ? timerDuration : null);

  const inputsRef = useRef(inputs);
  inputsRef.current = inputs;
  const submittedRef = useRef(submitted);
  submittedRef.current = submitted;

  // countdown
  useEffect(() => {
    if (timerDuration <= 0) return;
    setTimeLeft(timerDuration);
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(id);
          if (!submittedRef.current) doSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerDuration, timerKey]);

  const doSubmit = useCallback(() => {
    const results = sheet.problems.map((p, i) => gradeAnswer(inputsRef.current[i] ?? [], p));
    setGrades(results);
    setSubmitted(true);
  }, [sheet.problems]);

  const handleInput = (pi: number, bi: number, val: string) => {
    setInputs(prev => {
      const next = prev.map(arr => [...arr]);
      next[pi][bi] = val;
      return next;
    });
  };

  const handleRetry = () => {
    setInputs(blankCounts.map(n => Array(n).fill('')));
    setSubmitted(false);
    setGrades([]);
    if (timerDuration > 0) setTimerKey(k => k + 1);
  };

  const score = grades.filter(Boolean).length;
  const total = sheet.problems.length;

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const resultEmoji = score === total ? '🎉 완벽해요!'
    : score >= total * 0.8 ? `👍 잘했어요! ${score}/${total}`
    : score >= total * 0.6 ? `😊 꽤 잘했어요! ${score}/${total}`
    : `💪 다시 도전해봐요! ${score}/${total}`;

  const resultBg = score === total ? 'bg-green-100 text-green-700'
    : score >= total * 0.6 ? 'bg-yellow-100 text-yellow-700'
    : 'bg-red-100 text-red-700';

  return (
    <div className="flex flex-col gap-4">
      {/* toolbar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-3 flex items-center gap-3 flex-wrap">
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg border-2 border-slate-200 bg-white text-slate-600 font-bold text-sm hover:border-slate-400 transition-all"
        >
          ← 뒤로
        </button>

        <div className="flex-1 min-w-0">
          <span className="font-bold text-slate-700 text-sm truncate block">
            {grade.fullLabel} · {chapter.name}
          </span>
          <span className="text-xs text-slate-400">{total}문제</span>
        </div>

        {timeLeft !== null && (
          <span
            className={`font-mono font-black text-xl tabular-nums transition-colors
              ${timeLeft <= 30 && !submitted ? 'text-red-500 animate-pulse' : 'text-slate-600'}`}
          >
            {fmt(timeLeft)}
          </span>
        )}

        {submitted ? (
          <span className="font-black text-lg" style={{ color: grade.color }}>
            {score} / {total}
          </span>
        ) : (
          <button
            onClick={doSubmit}
            className="px-4 py-1.5 rounded-lg text-white font-bold text-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: grade.color }}
          >
            채점하기
          </button>
        )}
      </div>

      {/* result banner */}
      {submitted && (
        <div className={`rounded-2xl px-6 py-4 text-center font-black text-lg ${resultBg}`}>
          {resultEmoji}
        </div>
      )}

      {/* problem grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className={`${gridCls} p-2`}>
          {sheet.problems.map((p, i) => (
            <ProblemRow
              key={i}
              problem={p}
              inputs={inputs[i] ?? []}
              onChange={(bi, val) => handleInput(i, bi, val)}
              submitted={submitted}
              correct={submitted ? (grades[i] ?? false) : false}
              index={i}
              color={grade.color}
              onEnterLast={i === sheet.problems.length - 1 ? doSubmit : undefined}
            />
          ))}
        </div>
      </div>

      {/* bottom actions */}
      {submitted && (
        <div className="flex gap-3 justify-center">
          <button
            onClick={onNewProblems}
            className="px-5 py-2 rounded-xl border-2 border-slate-200 bg-white text-slate-600 font-bold text-sm hover:border-slate-400 transition-all"
          >
            새 문제 만들기
          </button>
          <button
            onClick={handleRetry}
            className="px-5 py-2 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: grade.color }}
          >
            다시 풀기
          </button>
        </div>
      )}
    </div>
  );
}
