import { GRADE_DATA } from '../data';

const EMOJI: Record<string, string> = {
  E1: '🌱', E2: '📐', E3: '🔢', M1: '📊', M2: '📈', M3: '🔬',
};

interface Props {
  selected: string;
  onSelect: (code: string) => void;
}

export default function GradeSelector({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {GRADE_DATA.map(g => {
        const active = g.code === selected;
        return (
          <button
            key={g.code}
            onClick={() => onSelect(g.code)}
            className={`
              relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 font-sans
              transition-all duration-200 cursor-pointer select-none
              ${active
                ? 'shadow-lg -translate-y-1'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:-translate-y-0.5 hover:shadow-md'
              }
            `}
            style={active ? {
              borderColor: g.color,
              background: `color-mix(in srgb, ${g.color} 8%, white)`,
              boxShadow: `0 8px 24px color-mix(in srgb, ${g.color} 25%, transparent)`,
            } : {}}
          >
            <span className="text-2xl">{EMOJI[g.code]}</span>
            <span
              className="text-sm font-bold"
              style={{ color: active ? g.color : '#374151' }}
            >
              {g.label}
            </span>
            <span className="text-[10px] text-slate-400 text-center leading-tight">
              {g.fullLabel}
            </span>
            {active && (
              <span
                className="absolute top-2 right-2 w-2 h-2 rounded-full"
                style={{ background: g.color }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
