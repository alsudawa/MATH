import { useState, useCallback, useEffect } from 'react';
import { GRADE_DATA, parseWid, buildWid, buildURL, colsForPerPage } from './data';
import { newSeed, deriveSeeds } from './utils';
import { generateProblems, Problem, GeneratorOptions } from './generators';
import Header from './components/Header';
import GradeSelector from './components/GradeSelector';
import ChapterSelector from './components/ChapterSelector';
import PreviewSection from './components/PreviewSection';
import PracticeMode from './components/PracticeMode';
import PrintArea from './components/PrintArea';
import AnswersPage from './components/AnswersPage';

export interface Sheet {
  wid: string;
  seed: string;
  problems: Problem[];
}

export default function App() {
  const [gradeCode, setGradeCode] = useState('E2');
  const [chapIdx, setChapIdx] = useState(0);
  const [sheetCount, setSheetCount] = useState(1);
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(2);
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [currentSheet, setCurrentSheet] = useState(0);
  const [showAnswers, setShowAnswers] = useState(false);
  const [answersMode, setAnswersMode] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);

  const grade = GRADE_DATA.find(g => g.code === gradeCode) ?? GRADE_DATA[0];
  const chapter = grade.chapters[chapIdx] ?? grade.chapters[0];

  // 문제 생성 (explicit params → stale closure 없음)
  const generate = useCallback((gCode: string, chIdx: number, count: number, opts?: GeneratorOptions, scroll = false) => {
    const g = GRADE_DATA.find(x => x.code === gCode) ?? GRADE_DATA[0];
    const ch = g.chapters[chIdx] ?? g.chapters[0];
    const baseSeed = newSeed();
    const allSeeds = [baseSeed, ...deriveSeeds(baseSeed, count - 1)];
    const newSheets = allSeeds.map(seed => ({
      wid: buildWid(gCode, ch.id, seed),
      seed,
      problems: generateProblems(gCode, ch.id, seed, ch.perPage, opts),
    }));
    setSheets(newSheets);
    setCurrentSheet(0);
    setShowAnswers(false);
    setPracticeMode(false);
    history.replaceState(null, '', buildURL(newSheets[0].wid, count));
    if (scroll) {
      setTimeout(() => {
        document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }, []);

  // 초기 로드: URL WID 복원 or 기본값으로 자동 생성
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const wid = params.get('wid');
    if (wid) {
      const n = Math.max(1, Math.min(35, parseInt(params.get('n') ?? '1') || 1));
      const isAnswers = params.get('answers') === '1';
      const parsed = parseWid(wid);
      if (!parsed) { generate('E2', 0, 1); return; }
      const g = GRADE_DATA.find(x => x.code === parsed.gradeCode);
      if (!g) { generate('E2', 0, 1); return; }
      const ch = g.chapters[parsed.chapIdx];
      const allSeeds = [parsed.seed, ...deriveSeeds(parsed.seed, n - 1)];
      const newSheets = allSeeds.map(seed => ({
        wid: buildWid(parsed.gradeCode, ch.id, seed),
        seed,
        problems: generateProblems(parsed.gradeCode, ch.id, seed, ch.perPage),
      }));
      setGradeCode(parsed.gradeCode);
      setChapIdx(parsed.chapIdx);
      setSheetCount(n);
      setSheets(newSheets);
      setAnswersMode(isAnswers);
    } else {
      generate('E2', 0, 1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectGrade = useCallback((code: string) => {
    setGradeCode(code);
    setChapIdx(0);
    generate(code, 0, sheetCount, { difficulty });
  }, [sheetCount, difficulty, generate]);

  const handleSelectChapter = useCallback((idx: number) => {
    setChapIdx(idx);
    generate(gradeCode, idx, sheetCount, { difficulty });
  }, [gradeCode, sheetCount, difficulty, generate]);

  const handleChangeCount = useCallback((n: number) => {
    const clamped = Math.max(1, Math.min(35, n));
    setSheetCount(clamped);
    generate(gradeCode, chapIdx, clamped, { difficulty });
  }, [gradeCode, chapIdx, difficulty, generate]);

  const handleChangeDifficulty = useCallback((d: 1 | 2 | 3) => {
    setDifficulty(d);
    generate(gradeCode, chapIdx, sheetCount, { difficulty: d });
  }, [gradeCode, chapIdx, sheetCount, generate]);

  const handleWidNavigate = useCallback((wid: string): boolean => {
    const parsed = parseWid(wid);
    if (!parsed) return false;
    const g = GRADE_DATA.find(x => x.code === parsed.gradeCode);
    if (!g) return false;
    const ch = g.chapters[parsed.chapIdx];
    const newSheet: Sheet = {
      wid: buildWid(parsed.gradeCode, ch.id, parsed.seed),
      seed: parsed.seed,
      problems: generateProblems(parsed.gradeCode, ch.id, parsed.seed, ch.perPage),
    };
    setGradeCode(parsed.gradeCode);
    setChapIdx(parsed.chapIdx);
    setSheetCount(1);
    setSheets([newSheet]);
    setCurrentSheet(0);
    setShowAnswers(false);
    setAnswersMode(false);
    history.replaceState(null, '', buildURL(newSheet.wid, 1));
    setTimeout(() => {
      document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
    return true;
  }, []);

  const cols = colsForPerPage(chapter.perPage);

  if (answersMode && sheets.length > 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AnswersPage sheets={sheets} grade={grade} chapter={chapter} />
        <PrintArea sheets={sheets} grade={grade} chapter={chapter} cols={cols} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header gradeColor={grade.color} onWidNavigate={handleWidNavigate} />

      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-8 lg:items-start">

          {/* 왼쪽: 컨트롤 영역 */}
          <div className="flex flex-col gap-10">
            <section className="flex flex-col gap-5">
              <StepLabel num={1} text="학년을 선택하세요" color={grade.color} />
              <GradeSelector selected={gradeCode} onSelect={handleSelectGrade} />
            </section>

            <section className="flex flex-col gap-5">
              <StepLabel num={2} text="챕터를 선택하세요" color={grade.color} />
              <ChapterSelector
                chapters={grade.chapters}
                selected={chapIdx}
                onSelect={handleSelectChapter}
                color={grade.color}
              />
            </section>

            <section className="flex flex-col gap-5">
              <StepLabel num={3} text="난이도를 선택하세요" color={grade.color} />
              <DifficultySelector difficulty={difficulty} onChange={handleChangeDifficulty} color={grade.color} />
            </section>

            <section className="flex flex-col gap-5">
              <StepLabel num={4} text="몇 장 출력할까요?" color={grade.color} />
              <SheetCountControl count={sheetCount} onChange={handleChangeCount} color={grade.color} />
            </section>
          </div>

          {/* 오른쪽: 프리뷰 또는 연습 모드 */}
          {sheets.length > 0 && (
            <div id="preview-section" className="lg:sticky lg:top-4">
              {practiceMode ? (
                <PracticeMode
                  sheet={sheets[currentSheet]}
                  grade={grade}
                  chapter={chapter}
                  cols={cols}
                  onExit={() => setPracticeMode(false)}
                />
              ) : (
                <PreviewSection
                  sheets={sheets}
                  currentSheet={currentSheet}
                  onNavigate={setCurrentSheet}
                  showAnswers={showAnswers}
                  onToggleAnswers={() => setShowAnswers(v => !v)}
                  onStartPractice={() => setPracticeMode(true)}
                  grade={grade}
                  chapter={chapter}
                  cols={cols}
                  sheetCount={sheetCount}
                />
              )}
            </div>
          )}
        </div>
      </main>

      {sheets.length > 0 && (
        <PrintArea sheets={sheets} grade={grade} chapter={chapter} cols={cols} />
      )}
    </div>
  );
}

function SheetCountControl({ count, onChange }: { count: number; onChange: (n: number) => void; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 bg-white border-2 border-slate-200 rounded-xl px-3 py-2 shadow-sm">
        <button
          onClick={() => onChange(count - 1)}
          disabled={count <= 1}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600 transition-colors text-lg disabled:opacity-30"
        >
          −
        </button>
        <span className="w-10 text-center text-lg font-bold text-slate-800 tabular-nums">{count}</span>
        <button
          onClick={() => onChange(count + 1)}
          disabled={count >= 35}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600 transition-colors text-lg disabled:opacity-30"
        >
          +
        </button>
        <span className="text-sm text-slate-400 ml-1">장</span>
      </div>
      {count > 1 && (
        <span className="text-sm text-slate-400">{count}장이 한 세트로 생성됩니다</span>
      )}
    </div>
  );
}

function DifficultySelector({ difficulty, onChange, color }: { difficulty: 1 | 2 | 3; onChange: (d: 1 | 2 | 3) => void; color: string }) {
  const labels: Record<1 | 2 | 3, string> = { 1: '쉬움', 2: '보통', 3: '어려움' };
  return (
    <div className="flex gap-2">
      {([1, 2, 3] as const).map(d => (
        <button
          key={d}
          onClick={() => onChange(d)}
          className="px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all"
          style={difficulty === d
            ? { background: color, borderColor: color, color: '#fff' }
            : { background: '#fff', borderColor: '#e2e8f0', color: '#475569' }
          }
        >
          {labels[d]}
        </button>
      ))}
    </div>
  );
}

function StepLabel({ num, text, color }: { num: number; text: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-base font-black flex-shrink-0 shadow-md"
        style={{ background: color }}
      >
        {num}
      </span>
      <span className="text-xl font-black text-slate-700">{text}</span>
      <span className="flex-1 h-px bg-slate-200" />
    </div>
  );
}
