import { useState } from 'react';

export interface RecentEntry {
  wid: string;
  n: number;
  gradeLabel: string;
  chapterName: string;
  ts: number;
}

const STORAGE_KEY = 'math-recent-sheets';
const MAX_ENTRIES = 8;

export function loadRecent(): RecentEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function saveRecent(entry: RecentEntry): void {
  const list = loadRecent().filter(e => e.wid !== entry.wid);
  list.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_ENTRIES)));
}

interface Props {
  onNavigate: (wid: string) => void;
  refreshKey: number;
}

function fmtTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return '방금';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

export default function RecentSheets({ onNavigate, refreshKey }: Props) {
  const [open, setOpen] = useState(false);
  const entries = loadRecent();

  if (entries.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors w-fit"
        key={refreshKey}
      >
        <span className="text-base">{open ? '▾' : '▸'}</span>
        최근 문제지 ({entries.length})
      </button>

      {open && (
        <div className="flex flex-col gap-1.5">
          {entries.map(e => (
            <button
              key={e.wid}
              onClick={() => onNavigate(e.wid)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all text-left w-full group"
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-700 truncate">{e.gradeLabel} · {e.chapterName}</div>
                <div className="font-mono text-[11px] text-slate-400 mt-0.5">{e.wid}</div>
              </div>
              <div className="text-[11px] text-slate-400 flex-shrink-0">{fmtTime(e.ts)}</div>
              <span className="text-slate-300 group-hover:text-slate-500 text-xs transition-colors flex-shrink-0">→</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
