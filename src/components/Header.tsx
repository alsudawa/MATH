import { useState } from 'react';

interface Props {
  gradeColor: string;
  onWidNavigate: (wid: string) => boolean;
  onOpenWrongNotes: () => void;
  wrongNotesCount: number;
}

export default function Header({ gradeColor, onWidNavigate, onOpenWrongNotes, wrongNotesCount }: Props) {
  const [wid, setWid] = useState('');
  const [error, setError] = useState(false);

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
          <button
            onClick={onOpenWrongNotes}
            className="bg-white/15 border-2 border-white/30 rounded-lg px-3 py-2 text-sm font-bold text-white hover:bg-white/25 transition-colors relative"
          >
            오답노트
            {wrongNotesCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {wrongNotesCount > 99 ? '99+' : wrongNotesCount}
              </span>
            )}
          </button>
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
        </div>
      </div>
    </header>
  );
}
