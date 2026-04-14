interface Props {
  sheetCount: number;
  onChangeCount: (n: number) => void;
  onGenerate: () => void;
  color: string;
}

export default function GenerateControls({ sheetCount, onChangeCount, onGenerate, color }: Props) {
  const adjust = (delta: number) => onChangeCount(Math.max(1, Math.min(20, sheetCount + delta)));

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {/* 장 수 조절 */}
      <div className="flex items-center gap-2 bg-white border-2 border-slate-200 rounded-xl px-3 py-2 shadow-sm">
        <button
          onClick={() => adjust(-1)}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600 transition-colors text-lg"
        >
          −
        </button>
        <input
          type="number"
          min={1}
          max={20}
          value={sheetCount}
          onChange={e => onChangeCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
          className="w-12 text-center text-lg font-bold text-slate-800 bg-transparent focus:outline-none"
        />
        <button
          onClick={() => adjust(1)}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600 transition-colors text-lg"
        >
          +
        </button>
        <span className="text-sm text-slate-400 ml-1">장</span>
      </div>

      {/* 생성 버튼 */}
      <button
        onClick={onGenerate}
        className="group flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-white font-bold text-base
          transition-all duration-200 hover:-translate-y-1 hover:shadow-xl active:translate-y-0"
        style={{
          background: color,
          boxShadow: `0 4px 16px color-mix(in srgb, ${color} 35%, transparent)`,
        }}
      >
        <span>문제 생성하기</span>
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </button>

      {/* 인쇄 버튼 */}
      <button
        onClick={() => window.print()}
        className="flex items-center gap-2 px-5 py-3.5 rounded-xl border-2 border-slate-200 bg-white
          text-slate-600 font-bold text-base hover:border-slate-300 hover:shadow-md transition-all"
      >
        <span>🖨️</span>
        <span>인쇄</span>
      </button>
    </div>
  );
}
