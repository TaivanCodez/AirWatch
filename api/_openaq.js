const BASE = 'https://api.openaq.org/v3';

function headers() {
  return process.env.OPENAQ_API_KEY
    ? { 'X-API-Key': process.env.OPENAQ_API_KEY }
    : {};
}

function aqiFromPM25(pm25) {
  if (pm25 == null) return { aqi: null, label: 'Unknown', color: '#94a3b8' };
  if (pm25 <= 12)    return { aqi: Math.round(pm25 * 4.17),              label: 'Good',            color: '#22c55e' };
  if (pm25 <= 35.4)  return { aqi: Math.round(50  + (pm25 - 12)    * 2.1),  label: 'Moderate',        color: '#eab308' };
  if (pm25 <= 55.4)  return { aqi: Math.round(100 + (pm25 - 35.4)  * 2.5),  label: 'Sensitive Groups', color: '#f97316' };
  if (pm25 <= 150.4) return { aqi: Math.round(150 + (pm25 - 55.4)  * 0.99), label: 'Unhealthy',       color: '#ef4444' };
  if (pm25 <= 250.4) return { aqi: Math.round(200 + (pm25 - 150.4) * 1.0),  label: 'Very Unhealthy',  color: '#a855f7' };
  return               { aqi: Math.round(300 + (pm25 - 250.4) * 0.997),     label: 'Hazardous',       color: '#7f1d1d' };
}

async function openaq(path, params = {}) {
  const url = new URL(`${BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { headers: headers() });
  if (!res.ok) throw new Error(`OpenAQ ${res.status}: ${await res.text()}`);
  return res.json();
}

module.exports = { aqiFromPM25, openaq };
