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
}

const TIMER_PRESETS = [5, 10, 15, 20] as const;

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function PreviewSection({
  sheets, currentSheet, onNavigate,
  showAnswers, onToggleAnswers,
  grade, chapter, cols, sheetCount,
}: Props) {
  const qrRef = useRef<HTMLDivElement>(null);
  const sheet = sheets[currentSheet];

  const [copied, setCopied] = useState(false);
  const [checkedProblems, setCheckedProblems] = useState<Set<number>>(new Set());
  const [timerPresetMins, setTimerPresetMins] = useState<number | null>(null);
  const [timerSecs, setTimerSecs] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDone, setTimerDone] = useState(false);

  useEffect(() => {
    if (!qrRef.current) return;
    qrRef.current.innerHTML = '';
    new QRCode(qrRef.current, {
      text: buildAnswerURL(sheet.wid, 1),
      width: 72, height: 72,
      colorDark: '#000000', colorLight: '#ffffff',
    });
  }, [sheet.wid]);

  // 페이지 전환 시 체크 초기화
  useEffect(() => {
    setCheckedProblems(new Set());
  }, [currentSheet]);

  // 타이머 카운트다운
  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => {
      setTimerSecs(prev => {
        if (prev <= 1) {
          setTimerRunning(false);
          setTimerDone(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleTimerPreset = (mins: number) => {
    setTimerSecs(mins * 60);
    setTimerPresetMins(mins);
    setTimerRunning(false);
    setTimerDone(false);
  };

  const handleTimerToggle = () => {
    if (timerSecs === 0) return;
    setTimerRunning(r => !r);
    setTimerDone(false);
  };

  const handleTimerReset = () => {
    setTimerRunning(false);
    setTimerSecs(0);
    setTimerDone(false);
    setTimerPresetMins(null);
  };

  const toggleCheck = (i: number) => {
    setCheckedProblems(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const checkedCount = checkedProblems.size;
  const totalCount = sheet.problems.length;
  const allDone = checkedCount === totalCount;

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

        <div className="flex-1" />

        {/* 액션 버튼들 */}
        <div className="flex gap-2 flex-shrink-0 flex-wrap">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg border-2 border-slate-200 bg-white text-slate-600 font-bold text-sm hover:border-slate-300 transition-all"
          >
            {copied ? '✓ 복사됨!' : '링크 복사'}
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

      {/* 타이머 */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-3 flex items-center gap-3 flex-wrap">
        <span className="text-sm font-bold text-slate-500 flex-shrink-0">⏱ 타이머</span>
        <div className="flex gap-1.5 flex-shrink-0">
          {TIMER_PRESETS.map(m => (
            <button
              key={m}
              onClick={() => handleTimerPreset(m)}
              className="px-2.5 py-1 rounded-lg border text-xs font-bold transition-all"
              style={timerPresetMins === m
                ? { background: grade.color, color: '#fff', borderColor: grade.color }
                : { background: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0' }
              }
            >
              {m}분
            </button>
          ))}
        </div>
        {timerPresetMins !== null ? (
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className="font-mono font-black text-lg tabular-nums min-w-[72px] text-center"
              style={{ color: timerDone ? '#ef4444' : timerSecs <= 30 && !timerDone ? '#f97316' : '#1e293b' }}
            >
              {timerDone ? '시간 초과!' : formatTime(timerSecs)}
            </span>
            {!timerDone && (
              <button
                onClick={handleTimerToggle}
                className="px-3 py-1 rounded-lg text-white text-xs font-bold transition-all hover:opacity-90"
                style={{ background: grade.color }}
              >
                {timerRunning ? '⏸ 멈춤' : '▶ 시작'}
              </button>
            )}
            <button
              onClick={handleTimerReset}
              className="px-3 py-1 rounded-lg border border-slate-200 text-slate-500 text-xs font-bold hover:border-slate-300 transition-all"
            >
              초기화
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-400">시간을 선택하면 타이머가 시작됩니다</span>
        )}
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
            {checkedCount > 0 && (
              <div className="text-xs font-bold mt-1" style={{ color: allDone ? '#22c55e' : grade.color }}>
                {allDone ? '모두 완료!' : `${checkedCount} / ${totalCount} 완료`}
              </div>
            )}
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

        {/* 완료 진행률 바 */}
        <div className="h-1.5 bg-slate-100">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: totalCount > 0 ? `${(checkedCount / totalCount) * 100}%` : '0%',
              background: allDone ? '#22c55e' : grade.color,
            }}
          />
        </div>

        {/* 문제 격자 */}
        <div className={`${gridCls} p-2`}>
          {sheet.problems.map((p, i) => {
            const checked = checkedProblems.has(i);
            return (
              <div
                key={i}
                className={`px-3 py-2 border-b border-slate-50 text-[13px] leading-loose transition-colors ${
                  checked ? 'bg-slate-50' : ''
                }`}
              >
                <span
                  onClick={() => toggleCheck(i)}
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black mr-1 cursor-pointer select-none transition-all flex-shrink-0 align-middle"
                  style={checked
                    ? { background: grade.color, color: '#fff' }
                    : { color: '#cbd5e1' }
                  }
                  title={checked ? '체크 해제' : '완료 체크'}
                >
                  {checked ? '✓' : i + 1}
                </span>
                <span
                  className={`transition-opacity ${checked && !showAnswers ? 'opacity-40' : ''}`}
                  dangerouslySetInnerHTML={{
                    __html: showAnswers
                      ? renderWithAnswer(p.display, p.answer, grade.color)
                      : renderDisplay(p.display, false),
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
