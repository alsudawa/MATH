import { GRADE_DATA } from '../data';

const EMOJI: Record<string, string> = {
  E1: '🌱', E2: '📐', E3: '🔢', M1: '📊', M2: '📈', M3: '🔬', H1: '🎓',
};

// 각 학년별 그라디언트
const GRADIENTS: Record<string, string> = {
  E1: 'from-orange-400 to-amber-500',
  E2: 'from-sky-400 to-blue-500',
  E3: 'from-violet-400 to-purple-600',
  M1: 'from-blue-500 to-indigo-600',
  M2: 'from-emerald-400 to-teal-600',
  M3: 'from-rose-400 to-red-600',
  H1: 'from-green-700 to-green-900',
};

interface Props {
  selected: string;
  onSelect: (code: string) => void;
}

export default function GradeSelector({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {GRADE_DATA.map(g => {
        const active = g.code === selected;
        const grad = GRADIENTS[g.code] ?? 'from-gray-400 to-gray-600';
        return (
          <button
            key={g.code}
            onClick={() => onSelect(g.code)}
            className={`
              relative flex flex-col items-center justify-center gap-3
              p-5 rounded-2xl border-3 font-sans cursor-pointer select-none
              transition-all duration-200
              ${active
                ? `bg-gradient-to-br ${grad} text-white shadow-xl scale-105 border-transparent`
                : 'bg-white text-slate-700 border-2 border-slate-200 hover:scale-102 hover:shadow-md hover:border-slate-300'
              }
            `}
          >
            {/* 활성 상태 글로우 */}
            {active && (
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${grad} opacity-20 blur-md -z-10 scale-110`}
              />
            )}

            <span className="text-3xl leading-none">{EMOJI[g.code]}</span>

            <div className="text-center">
              <div className={`text-base font-black tracking-tight ${active ? 'text-white' : 'text-slate-800'}`}>
                {g.label}
              </div>
              <div className={`text-[11px] mt-0.5 leading-tight ${active ? 'text-white/80' : 'text-slate-400'}`}>
                {g.fullLabel}
              </div>
            </div>

            {active && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-white rounded-full opacity-90" />
            )}
          </button>
        );
      })}
    </div>
  );
}
