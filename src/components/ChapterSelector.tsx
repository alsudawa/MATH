import { Chapter } from '../data';

interface Props {
  chapters: Chapter[];
  selected: number;
  onSelect: (idx: number) => void;
  color: string;
}

export default function ChapterSelector({ chapters, selected, onSelect, color }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
      {chapters.map((ch, i) => {
        const active = i === selected;
        return (
          <button
            key={ch.id}
            onClick={() => onSelect(i)}
            className={`
              flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left
              transition-all duration-150 cursor-pointer w-full
              ${active
                ? 'shadow-md'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
              }
            `}
            style={active ? {
              borderColor: color,
              background: `color-mix(in srgb, ${color} 7%, white)`,
            } : {}}
          >
            <span
              className={`
                min-w-[32px] h-8 rounded-lg flex items-center justify-center
                text-xs font-black flex-shrink-0 transition-colors
              `}
              style={active
                ? { background: color, color: 'white' }
                : { background: '#f1f5f9', color: '#64748b' }
              }
            >
              {ch.id}
            </span>
            <span
              className={`text-sm leading-snug transition-colors ${active ? 'font-bold' : 'font-medium text-slate-600'}`}
              style={active ? { color: '#1e293b' } : {}}
            >
              {ch.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
