import { useEffect, useState } from 'react';
import { fetchMeasurements } from '../utils/openaq';
import { getAqiLevel, PARAMETER_LABELS } from '../utils/aqi';

function AqiGauge({ aqi, color }) {
  const pct = Math.min(100, ((aqi || 0) / 500) * 100);
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r="54" fill="none" stroke="#1e293b" strokeWidth="12" />
        <circle
          cx="70" cy="70" r="54"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-bold" style={{ color }}>{aqi ?? '—'}</div>
        <div className="text-xs text-slate-400">AQI</div>
      </div>
    </div>
  );
}

function ReadingCard({ param, value, unit }) {
  const info = PARAMETER_LABELS[param] || { label: param.toUpperCase(), unit, desc: '' };
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
      <div className="text-xs text-slate-400 mb-1">{info.desc}</div>
      <div className="text-lg font-semibold text-slate-100">{info.label}</div>
      <div className="mt-2 text-2xl font-bold text-emerald-400">
        {value != null ? value.toFixed(1) : '—'}
        <span className="text-sm font-normal text-slate-400 ml-1">{info.unit}</span>
      </div>
    </div>
  );
}

export default function AqiDashboard({ location }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!location?.id) return;
    setLoading(true);
    setData(null);
    fetchMeasurements(location.id)
      .then(data => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [location?.id]);

  if (!location) return null;

  const level = getAqiLevel(data?.aqi);

  return (
    <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-6 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">{location.name}</h2>
        <p className="text-sm text-slate-400">{[location.city, location.country].filter(Boolean).join(', ')}</p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          Loading measurements...
        </div>
      )}

      {data && !loading && (
        <>
          <div className="flex items-center gap-6">
            <AqiGauge aqi={data.aqi} color={level.color} />
            <div>
              <div
                className="inline-block px-3 py-1 rounded-full text-sm font-bold text-white mb-2"
                style={{ background: level.color }}
              >
                {level.label}
              </div>
              <p className="text-sm text-slate-300 max-w-xs">{level.description}</p>
            </div>
          </div>

          {Object.keys(data.readings).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Pollutant Readings</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(data.readings).map(([param, r]) => (
                  <ReadingCard key={param} param={param} value={r.value} unit={r.unit} />
                ))}
              </div>
            </div>
          )}

          {data.readings?.pm25?.lastUpdated && (
            <p className="text-xs text-slate-500">
              Last updated: {new Date(data.readings.pm25.lastUpdated).toLocaleString()}
            </p>
          )}
        </>
      )}
    </div>
  );
}
