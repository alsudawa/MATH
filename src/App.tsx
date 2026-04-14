import { useState, useCallback, useEffect } from 'react';
import { GRADE_DATA, parseWid, buildWid, buildURL, colsForPerPage } from './data';
import { newSeed, deriveSeeds } from './utils';
import { generateProblems, Problem } from './generators';
import Header from './components/Header';
import GradeSelector from './components/GradeSelector';
import ChapterSelector from './components/ChapterSelector';
import GenerateControls from './components/GenerateControls';
import PreviewSection from './components/PreviewSection';
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
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [currentSheet, setCurrentSheet] = useState(0);
  const [showAnswers, setShowAnswers] = useState(false);
  const [answersMode, setAnswersMode] = useState(false);

  const grade = GRADE_DATA.find(g => g.code === gradeCode) ?? GRADE_DATA[0];
  const chapter = grade.chapters[chapIdx] ?? grade.chapters[0];

  // URL에서 WID 복원
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const wid = params.get('wid');
    const n = Math.max(1, Math.min(20, parseInt(params.get('n') ?? '1') || 1));
    const isAnswers = params.get('answers') === '1';
    if (!wid) return;
    const parsed = parseWid(wid);
    if (!parsed) return;
    const g = GRADE_DATA.find(x => x.code === parsed.gradeCode);
    if (!g) return;
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectGrade = useCallback((code: string) => {
    setGradeCode(code);
    setChapIdx(0);
  }, []);

  const handleGenerate = useCallback(() => {
    const baseSeed = newSeed();
    const allSeeds = [baseSeed, ...deriveSeeds(baseSeed, sheetCount - 1)];
    const newSheets = allSeeds.map(seed => ({
      wid: buildWid(gradeCode, chapter.id, seed),
      seed,
      problems: generateProblems(gradeCode, chapter.id, seed, chapter.perPage),
    }));
    setSheets(newSheets);
    setCurrentSheet(0);
    setShowAnswers(false);
    history.replaceState(null, '', buildURL(newSheets[0].wid, sheetCount));
    setTimeout(() => {
      document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, [gradeCode, chapter, sheetCount]);

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

  // 정답 화면 모드
  if (answersMode && sheets.length > 0) {
    return (
      <>
        <AnswersPage sheets={sheets} grade={grade} chapter={chapter} />
        <PrintArea sheets={sheets} grade={grade} chapter={chapter} cols={cols} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header gradeColor={grade.color} onWidNavigate={handleWidNavigate} />

      <main className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-12">

        {/* Step 1: 학년 */}
        <section className="flex flex-col gap-5">
          <StepLabel num={1} text="학년을 선택하세요" color={grade.color} />
          <GradeSelector selected={gradeCode} onSelect={handleSelectGrade} />
        </section>

        {/* Step 2: 챕터 */}
        <section className="flex flex-col gap-5">
          <StepLabel num={2} text="챕터를 선택하세요" color={grade.color} />
          <ChapterSelector
            chapters={grade.chapters}
            selected={chapIdx}
            onSelect={setChapIdx}
            color={grade.color}
          />
        </section>

        {/* Step 3: 생성 */}
        <section className="flex flex-col gap-5">
          <StepLabel num={3} text="몇 장 출력할까요?" color={grade.color} />
          <GenerateControls
            sheetCount={sheetCount}
            onChangeCount={setSheetCount}
            onGenerate={handleGenerate}
            color={grade.color}
          />
        </section>

        {/* 미리보기 */}
        {sheets.length > 0 && (
          <PreviewSection
            sheets={sheets}
            currentSheet={currentSheet}
            onNavigate={setCurrentSheet}
            showAnswers={showAnswers}
            onToggleAnswers={() => setShowAnswers(v => !v)}
            grade={grade}
            chapter={chapter}
            cols={cols}
            sheetCount={sheetCount}
          />
        )}
      </main>

      {sheets.length > 0 && (
        <PrintArea sheets={sheets} grade={grade} chapter={chapter} cols={cols} />
      )}
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
