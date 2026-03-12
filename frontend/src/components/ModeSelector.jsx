const MODES = [
  { id: 'gentle',    label: 'Gentle',    desc: 'Friendly teasing',   emoji: '😊' },
  { id: 'savage',    label: 'Savage',    desc: 'Zero mercy',         emoji: '🔥' },
  { id: 'twitter',   label: 'Twitter',   desc: 'One-liner only',     emoji: '🐦' },
  { id: 'hollywood', label: 'Hollywood', desc: 'Industry insider',   emoji: '🎬' },
];

export default function ModeSelector({ selected, onSelect }) {
  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-widest text-white mb-3">Roast mode</p>
      <div className="space-y-1.5">
        {MODES.map(mode => (
          <button
            key={mode.id}
            type="button"
            onClick={() => onSelect(mode.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150 border
              ${selected === mode.id
                ? 'bg-heat/15 border-heat text-white shadow-heat-glow/30'
                : 'bg-surface/30 border-white/5 text-white hover:border-white/15'
              }`}
          >
            <span className="text-2xl">{mode.emoji}</span>
            <div className="flex-1 min-w-0">
              <span className="text-base font-bold block text-white">{mode.label}</span>
              <span className="text-sm text-white block mt-0.5">{mode.desc}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
