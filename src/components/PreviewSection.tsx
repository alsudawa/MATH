import { useEffect, useRef } from 'react';
import { Sheet } from '../App';
import { GradeGroup, Chapter, buildURL } from '../data';
import { renderDisplay } from '../utils';

declare const QRCode: new (el: HTMLElement, opts: object) => void;

interface Props {
  sheets: Sheet[];
  currentSheet: number;
  onNavigate: (i: number) => void;
  showAnswers: boolean;
  onToggleAnswers: () => void;
  grade: GradeGroup;
  chapter: Chapter;
  cols: number;
  sheetCount: number;
}

export default function PreviewSection({
  sheets, currentSheet, onNavigate,
  showAnswers, onToggleAnswers,
  grade, chapter, cols, sheetCount,
}: Props) {
  const qrRef = useRef<HTMLDivElement>(null);
  const sheet = sheets[currentSheet];

  useEffect(() => {
    if (!qrRef.current) return;
    qrRef.current.innerHTML = '';
    new QRCode(qrRef.current, {
      text: buildURL(sheet.wid, 1),
      width: 72, height: 72,
      colorDark: '#000000', colorLight: '#ffffff',
    });
  }, [sheet.wid]);

  const gridCls = `grid gap-0 ${cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-3' : 'grid-cols-4'}`;

  return (
    <section id="preview-section" className="flex flex-col gap-4">
      {/* 툴바 */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-4 flex items-center gap-4 flex-wrap">
        {/* 페이지 내비 */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => onNavigate(Math.max(0, currentSheet - 1))}
            disabled={currentSheet === 0}
            className="w-9 h-9 rounded-full border-2 border-slate-200 bg-white flex items-center justify-center font-bold text-slate-500
              hover:border-slate-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ◀
          </button>
          <span className="font-bold text-slate-700 min-w-[52px] text-center tabular-nums">
            {currentSheet + 1} / {sheets.length}
          </span>
          <button
            onClick={() => onNavigate(Math.min(sheets.length - 1, currentSheet + 1))}
            disabled={currentSheet === sheets.length - 1}
            className="w-9 h-9 rounded-full border-2 border-slate-200 bg-white flex items-center justify-center font-bold text-slate-500
              hover:border-slate-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ▶
          </button>
        </div>

        {/* WID */}
        <div className="flex-1 min-w-0">
          <div className="font-mono font-bold tracking-widest text-base" style={{ color: grade.color }}>
            {sheet.wid}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            번호를 공유하면 같은 문제를 다시 볼 수 있어요
          </div>
        </div>

        {/* 액션 */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onToggleAnswers}
            className="px-4 py-2 rounded-lg border-2 border-slate-200 bg-white text-slate-600 font-bold text-sm hover:border-slate-300 transition-all"
          >
            {showAnswers ? '정답 숨기기' : '정답 보기'}
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-lg text-white font-bold text-sm transition-all hover:opacity-90"
            style={{ background: grade.color }}
          >
            🖨️ 인쇄
          </button>
        </div>
      </div>

      {/* 문제 카드 */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* 카드 헤더 */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ background: `color-mix(in srgb, ${grade.color} 7%, white)` }}
        >
          <div>
            <div className="font-bold text-slate-700">{grade.fullLabel}</div>
            <div className="text-sm text-slate-500 mt-0.5">{chapter.name}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-xs text-slate-400">
              <div>총 {sheet.problems.length}문제</div>
              <div>{sheetCount}장 세트</div>
            </div>
            <div
              ref={qrRef}
              className="rounded-lg overflow-hidden"
              style={{ width: 72, height: 72 }}
            />
          </div>
        </div>

        {/* 문제 격자 */}
        <div className={`${gridCls} p-2`}>
          {sheet.problems.map((p, i) => (
            <div
              key={i}
              className="px-4 py-3 border-b border-slate-50 flex items-center gap-1.5 text-[15px] leading-loose"
            >
              <span className="text-slate-300 text-[11px] font-bold min-w-[18px] flex-shrink-0">
                {i + 1}.
              </span>
              <span
                dangerouslySetInnerHTML={{ __html: renderDisplay(p.display, false) }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 정답 카드 */}
      {showAnswers && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pb-3 border-b border-slate-100">
            정답
          </h4>
          <div className="grid grid-cols-5 gap-x-3 gap-y-2">
            {sheet.problems.map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-1 text-sm py-1.5 border-b border-dashed border-slate-100 leading-loose"
              >
                <span className="text-slate-300 text-[11px] font-bold flex-shrink-0">{i + 1}.</span>
                <span dangerouslySetInnerHTML={{ __html: p.answer }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
