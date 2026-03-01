import { useState, useEffect } from 'react';
import { fetchTrends } from '../utils/openaq';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, Legend,
} from 'recharts';
import { PARAMETER_LABELS } from '../utils/aqi';

const PARAMETERS = ['pm25', 'pm10', 'o3', 'no2', 'so2'];
const DAY_OPTIONS = [7, 14, 30];

function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 text-sm shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.value?.toFixed(2)} {unit}
        </p>
      ))}
    </div>
  );
}

export default function TrendsChart({ location }) {
  const [parameter, setParameter] = useState('pm25');
  const [days, setDays] = useState(14);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!location?.id) return;
    setLoading(true);
    fetchTrends(location.id, parameter, days)
      .then(res => {
        const formatted = res.map(d => ({
          ...d,
          date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        }));
        setData(formatted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [location?.id, parameter, days]);

  if (!location) return null;

  const paramInfo = PARAMETER_LABELS[parameter] || { label: parameter.toUpperCase(), unit: '' };
  const avg = data.length ? (data.reduce((s, d) => s + (d.value || 0), 0) / data.length).toFixed(1) : null;

  // WHO guideline references
  const WHO_GUIDELINES = { pm25: 15, pm10: 45, o3: 60, no2: 13, so2: 40 };
  const whoLine = WHO_GUIDELINES[parameter];

  return (
    <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-white">Pollution Trends</h3>
          <p className="text-xs text-slate-400">{location.city || location.name} • {days}-day history</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            {PARAMETERS.map(p => (
              <button
                key={p}
                onClick={() => setParameter(p)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  parameter === p
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {PARAMETER_LABELS[p]?.label || p.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            {DAY_OPTIONS.map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  days === d
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {avg != null && (
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-400">
            {days}-day avg: <span className="text-emerald-400 font-semibold">{avg} {paramInfo.unit}</span>
          </span>
          {whoLine && (
            <span className="text-slate-400">
              WHO guideline: <span className="text-amber-400 font-semibold">{whoLine} {paramInfo.unit}</span>
            </span>
          )}
        </div>
      )}

      {loading ? (
        <div className="h-56 flex items-center justify-center text-slate-400 text-sm gap-2">
          <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          Loading trend data...
        </div>
      ) : data.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-slate-500 text-sm">
          No historical data available for {paramInfo.label} at this station.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} unit={` ${paramInfo.unit}`} />
            <Tooltip content={<CustomTooltip unit={paramInfo.unit} />} />
            {whoLine && (
              <ReferenceLine
                y={whoLine}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{ value: 'WHO', fill: '#f59e0b', fontSize: 10, position: 'right' }}
              />
            )}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#10b981' }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
