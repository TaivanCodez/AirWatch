import { getAqiLevel, SUSTAINABILITY_TIPS } from '../utils/aqi';

const ICONS = {
  Good:            '🌿',
  Moderate:        '🌤️',
  'Sensitive Groups': '😷',
  Unhealthy:       '⚠️',
  'Very Unhealthy':'🚨',
  Hazardous:       '☠️',
  Unknown:         '🌍',
};

const GLOBAL_ACTIONS = [
  { icon: '🌱', title: 'Plant a tree', desc: 'A single tree absorbs ~22 lbs of CO₂ per year.' },
  { icon: '🚲', title: 'Bike or walk', desc: 'Zero-emission transport improves urban air quality for everyone.' },
  { icon: '♻️', title: 'Reduce, reuse, recycle', desc: 'Manufacturing produces 19% of global air pollution.' },
  { icon: '💡', title: 'Switch to clean energy', desc: 'Solar & wind power produce 95% less CO₂ than coal.' },
  { icon: '🥗', title: 'Eat less red meat', desc: 'Livestock is responsible for 14.5% of global greenhouse gas emissions.' },
  { icon: '🏭', title: 'Advocate for policy', desc: 'Air quality standards save millions of lives — support clean air legislation.' },
];

export default function SustainabilityTips({ aqi }) {
  const level = getAqiLevel(aqi);
  const tips = SUSTAINABILITY_TIPS[level.label] || SUSTAINABILITY_TIPS.Unknown;
  const icon = ICONS[level.label] || '🌍';

  return (
    <div className="space-y-4">
      <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{icon}</span>
          <div>
            <h3 className="text-lg font-bold text-white">Right Now for You</h3>
            <p className="text-xs text-slate-400">
              Based on current{' '}
              <span className="font-semibold" style={{ color: level.color }}>
                {level.label}
              </span>{' '}
              air quality
            </p>
          </div>
        </div>
        <ul className="space-y-3">
          {tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
              <span
                className="mt-1 w-2 h-2 rounded-full shrink-0"
                style={{ background: level.color }}
              />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Always-On Impact Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {GLOBAL_ACTIONS.map((action, i) => (
            <div
              key={i}
              className="flex items-start gap-3 bg-slate-800/60 rounded-xl p-3 border border-slate-700/50"
            >
              <span className="text-2xl shrink-0">{action.icon}</span>
              <div>
                <div className="text-sm font-semibold text-slate-100">{action.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">{action.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
