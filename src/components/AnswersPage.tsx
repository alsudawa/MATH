import { Sheet } from '../App';
import { GradeGroup, Chapter } from '../data';

interface Props {
  sheets: Sheet[];
  grade: GradeGroup;
  chapter: Chapter;
}

export default function AnswersPage({ sheets, grade, chapter }: Props) {
  return (
    <>
      <header className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
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

      <main className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-black text-slate-700">정답 확인</h1>
          <p className="text-slate-400 text-sm mt-1">총 {sheets.length}장 · {sheets[0]?.problems.length}문제/장</p>
        </div>

        {sheets.map((sheet, si) => (
          <div key={si} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
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
            <div className="p-6">
              <div className="grid grid-cols-5 gap-x-3 gap-y-1">
                {sheet.problems.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 py-2 border-b border-dashed border-slate-100 leading-loose text-sm"
                  >
                    <span className="text-slate-300 text-[11px] font-bold flex-shrink-0">{i + 1}.</span>
                    <span
                      className="font-bold"
                      style={{ color: grade.color }}
                      dangerouslySetInnerHTML={{ __html: p.answer }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </main>
    </>
  );
}
