export const AQI_LEVELS = [
  { max: 50,  label: 'Good',             color: '#22c55e', bg: 'bg-green-500',  description: 'Air quality is satisfactory with little or no risk.' },
  { max: 100, label: 'Moderate',         color: '#eab308', bg: 'bg-yellow-500', description: 'Acceptable air quality. Unusually sensitive people may be affected.' },
  { max: 150, label: 'Sensitive Groups', color: '#f97316', bg: 'bg-orange-500', description: 'Members of sensitive groups may experience health effects.' },
  { max: 200, label: 'Unhealthy',        color: '#ef4444', bg: 'bg-red-500',    description: 'Everyone may begin to experience health effects.' },
  { max: 300, label: 'Very Unhealthy',   color: '#a855f7', bg: 'bg-purple-500', description: 'Health alert: everyone may experience serious health effects.' },
  { max: 500, label: 'Hazardous',        color: '#7f1d1d', bg: 'bg-red-900',    description: 'Health warnings of emergency conditions. Entire population affected.' },
];

export function getAqiLevel(aqi) {
  if (aqi == null) return { label: 'Unknown', color: '#94a3b8', bg: 'bg-slate-400', description: 'No data available.' };
  return AQI_LEVELS.find(l => aqi <= l.max) || AQI_LEVELS[AQI_LEVELS.length - 1];
}

export function getAqiFromPM25(pm25) {
  if (pm25 == null) return null;
  if (pm25 <= 12)    return Math.round(pm25 * 4.17);
  if (pm25 <= 35.4)  return Math.round(50 + (pm25 - 12) * 2.1);
  if (pm25 <= 55.4)  return Math.round(100 + (pm25 - 35.4) * 2.5);
  if (pm25 <= 150.4) return Math.round(150 + (pm25 - 55.4) * 0.99);
  if (pm25 <= 250.4) return Math.round(200 + (pm25 - 150.4) * 1.0);
  return Math.round(300 + (pm25 - 250.4) * 0.997);
}

export const SUSTAINABILITY_TIPS = {
  Good: [
    'Great day to exercise outdoors! Go for a run or bike ride.',
    'Open your windows to let in the fresh air.',
    'Consider walking or cycling instead of driving today.',
  ],
  Moderate: [
    'Unusually sensitive individuals should limit prolonged outdoor exertion.',
    'Keep windows closed if you have allergies.',
    'Great day to plant trees or start a community garden.',
  ],
  'Sensitive Groups': [
    'People with asthma or heart/lung disease should reduce outdoor activity.',
    'Keep windows and doors closed. Use air purifiers indoors.',
    'Advocate for clean energy in your community — your air depends on it.',
  ],
  Unhealthy: [
    'Everyone should reduce outdoor exertion. Wear an N95 mask if going outside.',
    'Use public transit or carpool to reduce vehicle emissions.',
    'Run air purifiers indoors. Avoid burning candles or incense.',
  ],
  'Very Unhealthy': [
    'Avoid all outdoor physical activity. Stay indoors with air purification.',
    'Check on elderly neighbors and those with respiratory conditions.',
    'Reduce energy use at home — power plants are a major pollution source.',
  ],
  Hazardous: [
    'Remain indoors. Seal gaps around doors and windows.',
    'Do not run air conditioners that draw in outdoor air.',
    'This is a climate emergency level event. Share air quality alerts with your community.',
  ],
  Unknown: [
    'Check local air quality before planning outdoor activities.',
    'Support policies that reduce industrial and vehicle emissions.',
    'Plant air-purifying plants indoors (spider plant, peace lily, pothos).',
  ],
};

export const PARAMETER_LABELS = {
  pm25:  { label: 'PM2.5',  unit: 'µg/m³', desc: 'Fine particulate matter' },
  pm10:  { label: 'PM10',   unit: 'µg/m³', desc: 'Coarse particulate matter' },
  o3:    { label: 'Ozone',  unit: 'ppb',   desc: 'Ground-level ozone' },
  no2:   { label: 'NO₂',    unit: 'ppb',   desc: 'Nitrogen dioxide' },
  so2:   { label: 'SO₂',    unit: 'ppb',   desc: 'Sulfur dioxide' },
  co:    { label: 'CO',     unit: 'ppm',   desc: 'Carbon monoxide' },
  bc:    { label: 'Black C',unit: 'µg/m³', desc: 'Black carbon' },
};
