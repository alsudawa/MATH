import { useEffect, useRef, useState } from 'react';
import { Sheet } from '../App';
import { GradeGroup, Chapter, buildAnswerURL } from '../data';
import { renderDisplay, renderWithAnswer } from '../utils';

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
  onRegenerate: () => void;
  isBookmarked: boolean;
  onBookmark: () => void;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function PreviewSection({
  sheets, currentSheet, onNavigate,
  showAnswers, onToggleAnswers,
  grade, chapter, cols, sheetCount,
  onRegenerate, isBookmarked, onBookmark,
}: Props) {
  const qrRef = useRef<HTMLDivElement>(null);
  const sheet = sheets[currentSheet];

  // ── 타이머 ──
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const sheetsKeyRef = useRef('');

  useEffect(() => {
    const key = sheets.map(s => s.wid).join(',');
    if (key !== sheetsKeyRef.current) {
      sheetsKeyRef.current = key;
      setIsTimerRunning(false);
      setElapsed(0);
    }
  }, [sheets]);

  useEffect(() => {
    if (!isTimerRunning) return;
    const id = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [isTimerRunning]);

  // ── QR 코드 ──
  useEffect(() => {
    if (!qrRef.current) return;
    qrRef.current.innerHTML = '';
    new QRCode(qrRef.current, {
      text: buildAnswerURL(sheet.wid, 1),
      width: 72, height: 72,
      colorDark: '#000000', colorLight: '#ffffff',
    });
  }, [sheet.wid]);

  const gridCls = `grid gap-0 ${cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-3' : 'grid-cols-4'}`;

  return (
    <section className="flex flex-col gap-4">
      {/* 툴바 */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-3 flex items-center gap-3 flex-wrap">

        {/* 페이지 내비 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onNavigate(Math.max(0, currentSheet - 1))}
            disabled={currentSheet === 0}
            className="w-8 h-8 rounded-full border-2 border-slate-200 bg-white flex items-center justify-center font-bold text-slate-500
              hover:border-slate-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm"
          >
            ◀
          </button>
          <span className="font-bold text-slate-700 min-w-[44px] text-center tabular-nums text-sm">
            {currentSheet + 1} / {sheets.length}
          </span>
          <button
            onClick={() => onNavigate(Math.min(sheets.length - 1, currentSheet + 1))}
            disabled={currentSheet === sheets.length - 1}
            className="w-8 h-8 rounded-full border-2 border-slate-200 bg-white flex items-center justify-center font-bold text-slate-500
              hover:border-slate-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm"
          >
            ▶
          </button>
        </div>

        {/* 타이머 */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex-shrink-0">
          <span className="text-slate-400 text-xs select-none">⏱</span>
          <span
            className="font-mono font-bold text-sm tabular-nums w-[46px] text-center"
            style={{ color: elapsed > 0 ? '#334155' : '#94a3b8' }}
          >
            {formatTime(elapsed)}
          </span>
          <button
            onClick={() => setIsTimerRunning(v => !v)}
            className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[11px] hover:border-slate-400 transition-all"
            title={isTimerRunning ? '일시정지' : '시작'}
          >
            {isTimerRunning ? '⏸' : '▶'}
          </button>
          <button
            onClick={() => { setIsTimerRunning(false); setElapsed(0); }}
            className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[11px] hover:border-slate-400 transition-all"
            title="리셋"
          >
            ↺
          </button>
        </div>

        <div className="flex-1" />

        {/* 액션 */}
        <div className="flex gap-2 flex-shrink-0 items-center">
          {/* 즐겨찾기 */}
          <button
            onClick={onBookmark}
            title={isBookmarked ? '즐겨찾기 해제' : '즐겨찾기에 추가'}
            className="w-8 h-8 rounded-lg border-2 border-slate-200 bg-white flex items-center justify-center text-base hover:border-slate-300 transition-all"
            style={isBookmarked ? { borderColor: '#f59e0b', color: '#f59e0b' } : { color: '#94a3b8' }}
          >
            {isBookmarked ? '★' : '☆'}
          </button>

          {/* 재생성 */}
          <button
            onClick={onRegenerate}
            title="같은 설정으로 새 문제 만들기"
            className="px-3 py-1.5 rounded-lg border-2 border-slate-200 bg-white text-slate-600 font-bold text-sm hover:border-slate-300 transition-all flex items-center gap-1"
          >
            <span className="text-base leading-none">↻</span>
            <span>새 문제</span>
          </button>

          <button
            onClick={onToggleAnswers}
            className="px-3 py-1.5 rounded-lg border-2 border-slate-200 bg-white text-slate-600 font-bold text-sm hover:border-slate-300 transition-all"
          >
            {showAnswers ? '정답 숨기기' : '정답 보기'}
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg text-white font-bold text-sm transition-all hover:opacity-90"
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
          <div className="flex items-start gap-3">
            <div className="text-right text-xs text-slate-400 mt-1">
              <div>총 {sheet.problems.length}문제</div>
              <div>{sheetCount}장 세트</div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div
                ref={qrRef}
                className="rounded-lg overflow-hidden"
                style={{ width: 72, height: 72 }}
              />
              <div className="font-mono font-bold tracking-widest text-[10px]" style={{ color: grade.color }}>
                {sheet.wid}
              </div>
            </div>
          </div>
        </div>

        {/* 문제 격자 */}
        <div className={`${gridCls} p-2`}>
          {sheet.problems.map((p, i) => (
            <div
              key={i}
              className="px-3 py-2 border-b border-slate-50 text-[13px] leading-loose"
            >
              <span className="text-slate-300 text-[11px] font-bold mr-1">{i + 1}.</span>
              <span
                dangerouslySetInnerHTML={{
                  __html: showAnswers
                    ? renderWithAnswer(p.display, p.answer, grade.color)
                    : renderDisplay(p.display, false),
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
