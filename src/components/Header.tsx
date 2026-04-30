import { useEffect, useRef, useState } from 'react';
import { Bookmark } from '../hooks/useBookmarks';

interface Props {
  gradeColor: string;
  onWidNavigate: (wid: string) => boolean;
  bookmarks: Bookmark[];
  onRemoveBookmark: (wid: string) => void;
}

export default function Header({ gradeColor, onWidNavigate, bookmarks, onRemoveBookmark }: Props) {
  const [wid, setWid] = useState('');
  const [error, setError] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showBookmarks) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowBookmarks(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showBookmarks]);

  const handleGo = () => {
    const ok = onWidNavigate(wid.trim().toUpperCase());
    setError(!ok);
  };

  return (
    <header
      className="text-white shadow-lg transition-colors duration-300"
      style={{ background: gradeColor }}
    >
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-3xl">✏️</span>
          <div>
            <h1 className="text-xl font-black tracking-tight">수학 문제 생성기</h1>
            <p className="text-xs opacity-75 mt-0.5">학년과 챕터를 선택하고 문제를 만들어 보세요</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* WID 이동 */}
          <input
            className="bg-white/15 border-2 border-white/30 rounded-lg px-3 py-2 text-sm font-mono tracking-widest uppercase placeholder-white/50 text-white w-40 focus:outline-none focus:border-white/80 transition-colors"
            placeholder="E2-03-X7K2M"
            maxLength={11}
            value={wid}
            onChange={e => { setWid(e.target.value); setError(false); }}
            onKeyDown={e => e.key === 'Enter' && handleGo()}
          />
          <button
            onClick={handleGo}
            className="bg-white font-bold text-sm px-4 py-2 rounded-lg transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ color: gradeColor }}
          >
            이동
          </button>
          {error && (
            <span className="text-xs bg-black/20 px-3 py-1.5 rounded-full text-yellow-200">
              올바른 번호가 아니에요
            </span>
          )}

          {/* 즐겨찾기 드롭다운 */}
          {bookmarks.length > 0 && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowBookmarks(v => !v)}
                className="flex items-center gap-1.5 bg-white/15 border-2 border-white/30 hover:border-white/60 rounded-lg px-3 py-2 text-sm font-bold transition-all"
              >
                <span>★</span>
                <span>{bookmarks.length}</span>
              </button>

              {showBookmarks && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 w-64 max-h-80 overflow-y-auto">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-wider px-2 pb-2">
                    즐겨찾기
                  </div>
                  {bookmarks.map(bm => (
                    <div
                      key={bm.wid}
                      className="flex items-center gap-2 rounded-xl hover:bg-slate-50 group"
                    >
                      <button
                        className="flex-1 text-left px-3 py-2.5"
                        onClick={() => {
                          onWidNavigate(bm.wid);
                          setShowBookmarks(false);
                        }}
                      >
                        <div className="font-mono font-bold text-sm text-slate-800">{bm.wid}</div>
                        <div className="text-xs text-slate-400 mt-0.5 truncate">{bm.label}</div>
                      </button>
                      <button
                        onClick={() => onRemoveBookmark(bm.wid)}
                        className="pr-3 text-slate-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-lg leading-none"
                        title="삭제"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
