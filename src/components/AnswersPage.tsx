import { useState } from 'react';
import { Sheet } from '../App';
import { GradeGroup, Chapter, colsForPerPage } from '../data';
import { renderWithAnswer } from '../utils';

interface Props {
  sheets: Sheet[];
  grade: GradeGroup;
  chapter: Chapter;
}

import { Problem } from '../generators';

function ProblemCell({ index, problem, color }: { index: number; problem: Problem; color: string }) {
  const [showSolution, setShowSolution] = useState(false);
  const hasSolution = problem.solution && problem.solution.length > 0;

  return (
    <div className="px-3 py-2 border-b border-slate-50 text-[13px] leading-loose">
      <span className="text-slate-300 text-[11px] font-bold mr-1">{index + 1}.</span>
      <span dangerouslySetInnerHTML={{ __html: renderWithAnswer(problem.display, problem.answer, color) }} />
      {hasSolution && (
        <div className="mt-1">
          <button
            onClick={() => setShowSolution(v => !v)}
            className="text-[11px] font-bold px-2 py-0.5 rounded-full border transition-all"
            style={showSolution
              ? { borderColor: color, color, background: `color-mix(in srgb, ${color} 8%, white)` }
              : { borderColor: '#e2e8f0', color: '#94a3b8', background: 'white' }
            }
          >
            {showSolution ? '풀이 접기 ▲' : '풀이 보기 ▼'}
          </button>
          {showSolution && (
            <div
              className="mt-1.5 rounded-lg p-2 text-[11px] flex flex-col gap-1"
              style={{ background: `color-mix(in srgb, ${color} 5%, white)`, borderLeft: `3px solid ${color}` }}
            >
              {problem.solution!.map((step, si) => (
                <div key={si} className="flex flex-col gap-0.5">
                  <span className="text-slate-500">{step.explanation}</span>
                  <span
                    className="font-mono text-slate-700"
                    dangerouslySetInnerHTML={{ __html: step.expression }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AnswersPage({ sheets, grade, chapter }: Props) {
  // answers page: max 2 cols on mobile, up to perPage-based cols on wider screens
  const cols = colsForPerPage(chapter.perPage);
  const gridCls = cols === 2
    ? 'grid grid-cols-1 sm:grid-cols-2'
    : cols === 3
      ? 'grid grid-cols-2 sm:grid-cols-3'
      : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';

  return (
    <>
      <header className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="w-2.5 h-8 rounded-full flex-shrink-0"
              style={{ background: grade.color }}
            />
            <div>
              <span className="font-black text-slate-700 text-base">{grade.fullLabel}</span>
              <span className="text-slate-400 mx-2">·</span>
              <span className="text-slate-600 text-sm">{chapter.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-lg text-white text-sm font-bold transition-all hover:opacity-90 flex items-center gap-1.5"
              style={{ background: grade.color }}
            >
              🖨️ 문제지 인쇄
            </button>
            <a
              href={location.origin + location.pathname}
              className="px-4 py-2 rounded-lg border-2 border-slate-200 bg-white text-slate-600 text-sm font-bold hover:border-slate-300 transition-all"
            >
              새 문제 만들기
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-black text-slate-700">정답 확인</h1>
          <p className="text-slate-400 text-sm mt-1">
            총 {sheets.length}장 · {sheets[0]?.problems.length}문제/장
          </p>
        </div>

        {sheets.map((sheet, si) => (
          <div key={si} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* 헤더 */}
            <div
              className="px-6 py-3 flex items-center justify-between"
              style={{ background: `color-mix(in srgb, ${grade.color} 7%, white)` }}
            >
              <span
                className="font-mono font-bold tracking-widest text-sm"
                style={{ color: grade.color }}
              >
                {sheet.wid}
              </span>
              {sheets.length > 1 && (
                <span className="text-xs text-slate-400 font-bold">{si + 1} / {sheets.length}</span>
              )}
            </div>

            {/* 문제+정답 격자 */}
            <div className={`${gridCls} p-2`}>
              {sheet.problems.map((p, i) => (
                <ProblemCell key={i} index={i} problem={p} color={grade.color} />
              ))}
            </div>
          </div>
        ))}
      </main>
    </>
  );
}
