import { GRADE_DATA } from '../data';

export interface HistoryEntry {
  wid: string;
  gradeCode: string;
  chapIdx: number;
  ts: number;
}

interface Props {
  history: HistoryEntry[];
  onNavigate: (wid: string) => boolean;
}

export default function RecentHistory({ history, onNavigate }: Props) {
  if (history.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {history.map(entry => {
        const grade = GRADE_DATA.find(g => g.code === entry.gradeCode);
        const chapter = grade?.chapters[entry.chapIdx];
        if (!grade || !chapter) return null;
        return (
          <button
            key={entry.wid}
            onClick={() => onNavigate(entry.wid)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all text-left group"
          >
            <span
              className="w-1.5 h-8 rounded-full flex-shrink-0"
              style={{ background: grade.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-500">{grade.fullLabel}</div>
              <div className="text-sm font-semibold text-slate-700 truncate">{chapter.name}</div>
            </div>
            <span className="font-mono text-[10px] text-slate-400 flex-shrink-0 group-hover:text-slate-600 transition-colors">
              {entry.wid}
            </span>
          </button>
        );
      })}
    </div>
  );
}
