import { useState, useMemo } from 'react';
import { GRADE_DATA, GradeGroup } from '../data';

export interface ChapterSelection {
  gradeCode: string;
  chapId: string;
  chapName: string;
  count: number;
}

interface Props {
  color: string;
  onGenerate: (selections: ChapterSelection[]) => void;
  onClose: () => void;
}

export default function MultiChapterBuilder({ color, onGenerate, onClose }: Props) {
  const [selectedGrade, setSelectedGrade] = useState<GradeGroup>(GRADE_DATA[0]);
  const [selections, setSelections] = useState<ChapterSelection[]>([]);

  const totalCount = useMemo(() => selections.reduce((s, c) => s + c.count, 0), [selections]);

  const addChapter = (gradeCode: string, chapId: string, chapName: string) => {
    const existing = selections.find(s => s.gradeCode === gradeCode && s.chapId === chapId);
    if (existing) return;
    setSelections(prev => [...prev, { gradeCode, chapId, chapName, count: 4 }]);
  };

  const updateCount = (idx: number, count: number) => {
    setSelections(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], count: Math.max(1, Math.min(20, count)) };
      return next;
    });
  };

  const removeSelection = (idx: number) => {
    setSelections(prev => prev.filter((_, i) => i !== idx));
  };

  const isSelected = (gradeCode: string, chapId: string) =>
    selections.some(s => s.gradeCode === gradeCode && s.chapId === chapId);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-8 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-800">복합 단원 문제지</h2>
            <p className="text-xs text-slate-400 mt-0.5">여러 챕터를 섞어 하나의 문제지를 만듭니다</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-lg font-bold"
          >
            ×
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: chapter picker */}
          <div className="w-1/2 border-r flex flex-col overflow-hidden">
            {/* Grade tabs */}
            <div className="px-4 py-3 border-b flex gap-1 flex-wrap flex-shrink-0">
              {GRADE_DATA.map(g => (
                <button
                  key={g.code}
                  onClick={() => setSelectedGrade(g)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                  style={selectedGrade.code === g.code
                    ? { background: g.color, color: '#fff' }
                    : { background: '#f1f5f9', color: '#64748b' }
                  }
                >
                  {g.label}
                </button>
              ))}
            </div>

            {/* Chapter list */}
            <div className="overflow-y-auto flex-1 p-3">
              <div className="flex flex-col gap-1">
                {selectedGrade.chapters.map(ch => {
                  const selected = isSelected(selectedGrade.code, ch.id);
                  return (
                    <button
                      key={ch.id}
                      onClick={() => addChapter(selectedGrade.code, ch.id, ch.name)}
                      disabled={selected}
                      className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        selected
                          ? 'bg-slate-100 text-slate-400'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-slate-400 text-xs mr-1.5">{ch.id}.</span>
                      {ch.name}
                      {selected && <span className="ml-2 text-xs text-slate-400">추가됨</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: selected chapters */}
          <div className="w-1/2 flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b flex-shrink-0">
              <span className="text-sm font-bold text-slate-600">
                선택한 챕터 ({selections.length}개, {totalCount}문제)
              </span>
            </div>
            <div className="overflow-y-auto flex-1 p-3">
              {selections.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  왼쪽에서 챕터를 선택하세요
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {selections.map((sel, i) => {
                    const g = GRADE_DATA.find(g => g.code === sel.gradeCode);
                    return (
                      <div
                        key={`${sel.gradeCode}-${sel.chapId}`}
                        className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2"
                      >
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white flex-shrink-0"
                          style={{ background: g?.color ?? '#64748b' }}
                        >
                          {sel.gradeCode}
                        </span>
                        <span className="text-sm text-slate-700 flex-1 min-w-0 truncate">
                          {sel.chapName}
                        </span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => updateCount(i, sel.count - 1)}
                            className="w-5 h-5 rounded bg-white border text-xs font-bold text-slate-500"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-xs font-bold tabular-nums">
                            {sel.count}
                          </span>
                          <button
                            onClick={() => updateCount(i, sel.count + 1)}
                            className="w-5 h-5 rounded bg-white border text-xs font-bold text-slate-500"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeSelection(i)}
                          className="w-5 h-5 rounded-full bg-white border text-slate-400 hover:text-red-500 text-xs font-bold flex-shrink-0"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between flex-shrink-0">
          <span className="text-sm text-slate-500">
            {totalCount > 0 ? `총 ${totalCount}문제` : '챕터를 선택하세요'}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border-2 border-slate-200 text-slate-600 font-bold text-sm"
            >
              취소
            </button>
            <button
              onClick={() => onGenerate(selections)}
              disabled={selections.length === 0}
              className="px-4 py-2 rounded-lg text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: color }}
            >
              문제지 생성
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
