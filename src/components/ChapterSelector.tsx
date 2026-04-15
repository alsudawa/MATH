import { Chapter } from '../data';

interface Props {
  chapters: Chapter[];
  selected: number;
  onSelect: (idx: number) => void;
  color: string;
}

export default function ChapterSelector({ chapters, selected, onSelect, color }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {chapters.map((ch, i) => {
        const active = i === selected;
        return (
          <button
            key={ch.id}
            onClick={() => onSelect(i)}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left
              transition-all duration-150 cursor-pointer w-full font-sans
              ${active
                ? 'text-white shadow-md border-transparent'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm text-slate-700'
              }
            `}
            style={active ? { background: color, borderColor: color } : {}}
          >
            {/* 번호 뱃지 */}
            <span
              className={`
                w-8 h-8 rounded-lg flex items-center justify-center
                text-xs font-black flex-shrink-0
                ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}
              `}
            >
              {ch.id}
            </span>

            {/* 챕터명 */}
            <span className={`text-sm font-semibold leading-snug ${active ? 'text-white' : ''}`}>
              {ch.name}
            </span>

            {/* 선택 체크 */}
            {active && (
              <span className="ml-auto text-white/80 text-lg flex-shrink-0">✓</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
