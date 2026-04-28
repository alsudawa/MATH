import { useState, useRef, useEffect, useCallback } from 'react';
import { Sheet } from '../App';
import { GradeGroup, Chapter } from '../data';
import { checkAnswer } from '../utils';
import { Problem } from '../generators';
import { addWrongEntries } from '../wrongNotes';

interface Props {
  sheet: Sheet;
  grade: GradeGroup;
  chapter: Chapter;
  cols: number;
  onExit: () => void;
}

interface ProblemResult {
  correct: boolean;
  userAnswers: string[];
}

function splitOnBlanks(display: string): string[] {
  return display.split('%%BLANK%%');
}

function ProblemRow({
  problem,
  index,
  result,
  inputRefs,
  onInputChange,
  onKeyDown,
  gradeColor,
  submitted,
}: {
  problem: Problem;
  index: number;
  result: ProblemResult | null;
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  onInputChange: (problemIdx: number, blankIdx: number, value: string) => void;
  onKeyDown: (e: React.KeyboardEvent, problemIdx: number, blankIdx: number) => void;
  gradeColor: string;
  submitted: boolean;
}) {
  const parts = splitOnBlanks(problem.display);
  const blankCount = parts.length - 1;

  let bgClass = '';
  if (submitted && result) {
    bgClass = result.correct ? 'bg-green-50' : 'bg-red-50';
  }

  return (
    <div className={`px-3 py-2.5 border-b border-slate-100 text-[13px] leading-loose flex items-center gap-1 ${bgClass} transition-colors`}>
      <span className="text-slate-300 text-[11px] font-bold mr-1 flex-shrink-0">{index + 1}.</span>
      <span className="flex items-center flex-wrap gap-0.5">
        {parts.map((part, pi) => (
          <span key={pi} className="inline-flex items-center">
            <span dangerouslySetInnerHTML={{ __html: part }} />
            {pi < blankCount && (
              <input
                ref={el => { inputRefs.current[index * 4 + pi] = el; }}
                type="text"
                inputMode="numeric"
                className={`mx-1 w-16 px-1.5 py-0.5 text-center text-sm font-bold border-2 rounded-lg outline-none transition-all ${
                  submitted && result
                    ? result.correct
                      ? 'border-green-400 bg-green-50 text-green-700'
                      : 'border-red-400 bg-red-50 text-red-700'
                    : 'border-slate-300 focus:border-blue-400 bg-white'
                }`}
                disabled={submitted}
                onChange={e => onInputChange(index, pi, e.target.value)}
                onKeyDown={e => onKeyDown(e, index, pi)}
                aria-label={`문제 ${index + 1} 답`}
              />
            )}
          </span>
        ))}
        {submitted && result && !result.correct && (
          <span className="ml-2 text-xs font-bold" style={{ color: gradeColor }}>
            <span dangerouslySetInnerHTML={{ __html: problem.answer }} />
          </span>
        )}
      </span>
      {submitted && result && !result.correct && problem.solution && problem.solution.length > 0 && (
        <div className="w-full mt-1 ml-5 pl-3 border-l-2 border-slate-200">
          {problem.solution.map((step, si) => (
            <div key={si} className="text-[11px] text-slate-500 leading-relaxed">
              <span className="text-slate-400">{step.explanation}: </span>
              <span dangerouslySetInnerHTML={{ __html: step.expression }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PracticeMode({ sheet, grade, chapter, cols, onExit }: Props) {
  const [answers, setAnswers] = useState<string[][]>(() =>
    sheet.problems.map(p => {
      const blankCount = (p.display.match(/%%BLANK%%/g) || []).length;
      return Array(Math.max(1, blankCount)).fill('');
    })
  );
  const [results, setResults] = useState<(ProblemResult | null)[]>(
    () => sheet.problems.map(() => null)
  );
  const [submitted, setSubmitted] = useState(false);
  const [startTime] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [startTime]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = useCallback((problemIdx: number, blankIdx: number, value: string) => {
    setAnswers(prev => {
      const next = [...prev];
      next[problemIdx] = [...next[problemIdx]];
      next[problemIdx][blankIdx] = value;
      return next;
    });
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, problemIdx: number, blankIdx: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextRef = inputRefs.current[(problemIdx + 1) * 4] ?? inputRefs.current[(problemIdx) * 4 + blankIdx + 1];
      if (nextRef) {
        nextRef.focus();
      }
    }
  }, []);

  const handleSubmit = useCallback(() => {
    clearInterval(timerRef.current);
    const newResults = sheet.problems.map((problem, i): ProblemResult => {
      const blanks = (problem.display.match(/%%BLANK%%/g) || []).length;
      const userAnswers = answers[i];

      if (blanks <= 1) {
        const correct = checkAnswer(userAnswers[0] || '', problem.answer);
        return { correct, userAnswers };
      }

      const answerParts = problem.answer.split(', ').map(s => s.replace(/^[a-z]\s*=\s*/, ''));
      const allCorrect = answerParts.every((part, j) =>
        checkAnswer(userAnswers[j] || '', part)
      );
      return { correct: allCorrect, userAnswers };
    });
    setResults(newResults);
    setSubmitted(true);

    const wrongIndices = newResults
      .map((r, i) => (!r.correct ? i : -1))
      .filter(i => i >= 0);
    if (wrongIndices.length > 0) {
      addWrongEntries(
        sheet.wid,
        grade.code,
        chapter.id,
        chapter.name,
        sheet.problems,
        wrongIndices,
        answers,
      );
    }
  }, [sheet, grade, chapter, answers]);

  const handleRetry = useCallback(() => {
    setAnswers(sheet.problems.map(p => {
      const blankCount = (p.display.match(/%%BLANK%%/g) || []).length;
      return Array(Math.max(1, blankCount)).fill('');
    }));
    setResults(sheet.problems.map(() => null));
    setSubmitted(false);
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  }, [sheet.problems]);

  const correctCount = results.filter(r => r?.correct).length;
  const totalCount = sheet.problems.length;
  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, '0')}`;
  };

  const gridCls = `grid gap-0 ${cols === 2 ? 'grid-cols-1 sm:grid-cols-2' : cols === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`;

  return (
    <section className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-500">
            {formatTime(elapsed)}
          </span>
        </div>

        <div className="flex-1" />

        {submitted && (
          <div className="flex items-center gap-2">
            <span className="text-lg font-black" style={{ color: grade.color }}>
              {correctCount}/{totalCount}
            </span>
            <span className="text-sm text-slate-400">
              ({Math.round((correctCount / totalCount) * 100)}%)
            </span>
          </div>
        )}

        <div className="flex gap-2 flex-shrink-0">
          {!submitted ? (
            <button
              onClick={handleSubmit}
              className="px-4 py-1.5 rounded-lg text-white font-bold text-sm transition-all hover:opacity-90"
              style={{ background: grade.color }}
            >
              채점하기
            </button>
          ) : (
            <button
              onClick={handleRetry}
              className="px-4 py-1.5 rounded-lg text-white font-bold text-sm transition-all hover:opacity-90"
              style={{ background: grade.color }}
            >
              다시 풀기
            </button>
          )}
          <button
            onClick={onExit}
            className="px-3 py-1.5 rounded-lg border-2 border-slate-200 bg-white text-slate-600 font-bold text-sm hover:border-slate-300 transition-all"
          >
            나가기
          </button>
        </div>
      </div>

      {/* Problem card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ background: `color-mix(in srgb, ${grade.color} 7%, white)` }}
        >
          <div>
            <div className="font-bold text-slate-700">{grade.fullLabel}</div>
            <div className="text-sm text-slate-500 mt-0.5">{chapter.name}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">총 {totalCount}문제</div>
            <div className="font-mono font-bold tracking-widest text-[10px]" style={{ color: grade.color }}>
              {sheet.wid}
            </div>
          </div>
        </div>

        {/* Problem grid */}
        <div className={`${gridCls} p-2`}>
          {sheet.problems.map((p, i) => (
            <ProblemRow
              key={i}
              problem={p}
              index={i}
              result={results[i]}
              inputRefs={inputRefs}
              onInputChange={handleInputChange}
              onKeyDown={handleKeyDown}
              gradeColor={grade.color}
              submitted={submitted}
            />
          ))}
        </div>

        {/* Summary bar when submitted */}
        {submitted && (
          <div
            className="px-6 py-4 flex items-center justify-between border-t"
            style={{ background: `color-mix(in srgb, ${grade.color} 5%, white)` }}
          >
            <div className="flex items-center gap-4">
              <div>
                <span className="text-2xl font-black" style={{ color: grade.color }}>
                  {correctCount}
                </span>
                <span className="text-slate-400 text-sm">/{totalCount} 정답</span>
              </div>
              <div className="text-sm text-slate-500">
                소요 시간: <span className="font-bold">{formatTime(elapsed)}</span>
              </div>
            </div>
            <div className="w-32 h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(correctCount / totalCount) * 100}%`,
                  background: grade.color,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
