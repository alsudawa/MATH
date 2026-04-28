import { useState, useMemo } from 'react';
import { GRADE_DATA } from '../data';
import { WrongEntry, getWrongEntries, removeWrongEntry, clearWrongEntries } from '../wrongNotes';
import { renderDisplay } from '../utils';

interface Props {
  gradeColor: string;
  onClose: () => void;
}

export default function WrongNotes({ gradeColor, onClose }: Props) {
  const [entries, setEntries] = useState<WrongEntry[]>(() => getWrongEntries());
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const grades = useMemo(() => {
    const set = new Set(entries.map(e => e.gradeCode));
    return GRADE_DATA.filter(g => set.has(g.code));
  }, [entries]);

  const filtered = useMemo(() => {
    if (filterGrade === 'all') return entries;
    return entries.filter(e => e.gradeCode === filterGrade);
  }, [entries, filterGrade]);

  const grouped = useMemo(() => {
    const map = new Map<string, WrongEntry[]>();
    for (const e of filtered) {
      const key = `${e.gradeCode}-${e.chapId}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return [...map.entries()];
  }, [filtered]);

  const handleRemove = (id: string) => {
    removeWrongEntry(id);
    setEntries(getWrongEntries());
  };

  const handleClear = () => {
    clearWrongEntries();
    setEntries([]);
    setShowConfirmClear(false);
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-8 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black text-slate-800">오답노트</h2>
            <span className="text-sm text-slate-400">{entries.length}개</span>
          </div>
          <div className="flex items-center gap-2">
            {entries.length > 0 && (
              <>
                {showConfirmClear ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-red-500">전부 삭제?</span>
                    <button
                      onClick={handleClear}
                      className="px-2 py-1 text-xs font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                    >
                      확인
                    </button>
                    <button
                      onClick={() => setShowConfirmClear(false)}
                      className="px-2 py-1 text-xs font-bold text-slate-500 bg-slate-50 rounded-lg"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowConfirmClear(true)}
                    className="px-3 py-1.5 text-xs font-bold text-red-500 border border-red-200 rounded-lg hover:bg-red-50"
                  >
                    전체 삭제
                  </button>
                )}
              </>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-lg font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Filter */}
        {grades.length > 1 && (
          <div className="px-6 py-3 border-b flex gap-2 flex-wrap flex-shrink-0">
            <button
              onClick={() => setFilterGrade('all')}
              className="px-3 py-1 rounded-lg text-xs font-bold transition-all"
              style={filterGrade === 'all'
                ? { background: gradeColor, color: '#fff' }
                : { background: '#f1f5f9', color: '#64748b' }
              }
            >
              전체
            </button>
            {grades.map(g => (
              <button
                key={g.code}
                onClick={() => setFilterGrade(g.code)}
                className="px-3 py-1 rounded-lg text-xs font-bold transition-all"
                style={filterGrade === g.code
                  ? { background: g.color, color: '#fff' }
                  : { background: '#f1f5f9', color: '#64748b' }
                }
              >
                {g.label}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4">
          {entries.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-4xl mb-3">📝</p>
              <p className="font-bold">아직 오답이 없어요</p>
              <p className="text-sm mt-1">풀기 모드에서 틀린 문제가 여기에 저장됩니다</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {grouped.map(([key, items]) => {
                const grade = GRADE_DATA.find(g => g.code === items[0].gradeCode);
                const color = grade?.color ?? '#64748b';
                return (
                  <div key={key} className="rounded-xl border border-slate-100 overflow-hidden">
                    <div
                      className="px-4 py-2 text-sm font-bold text-white"
                      style={{ background: color }}
                    >
                      {items[0].chapterName}
                    </div>
                    <div className="divide-y divide-slate-50">
                      {items.map(entry => (
                        <div key={entry.id} className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50 group">
                          <div className="flex-1 min-w-0">
                            <div
                              className="text-sm leading-relaxed"
                              dangerouslySetInnerHTML={{
                                __html: renderDisplay(entry.display, false),
                              }}
                            />
                            <div className="flex items-center gap-3 mt-1.5 text-xs">
                              <span className="text-red-500">
                                내 답: <span className="font-bold">{entry.userAnswer || '(미입력)'}</span>
                              </span>
                              <span style={{ color }}>
                                정답: <span className="font-bold" dangerouslySetInnerHTML={{ __html: entry.correctAnswer }} />
                              </span>
                              <span className="text-slate-300">{formatDate(entry.timestamp)}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemove(entry.id)}
                            className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 hover:bg-red-100 flex items-center justify-center text-slate-400 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-all"
                            title="삭제"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
