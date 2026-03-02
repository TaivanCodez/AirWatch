import axios from 'axios';

// WAQI (World Air Quality Index) — supports CORS, no API key needed for demo
const TOKEN = 'demo';
const BASE = 'https://api.waqi.info';

async function waqi(path, params = {}) {
  const { data } = await axios.get(`${BASE}${path}`, { params: { token: TOKEN, ...params } });
  if (data.status !== 'ok') throw new Error(data.data || 'WAQI error');
  return data.data;
}

export async function fetchGlobalSnapshot() {
  const data = await waqi('/map/bounds/', { latlng: '-90,-180,90,180' });
  return (data || [])
    .filter(s => s.lat && s.lon)
    .map(s => ({
      id: s.uid,
      name: s.station.name,
      city: s.station.name,
      country: '',
      lat: s.lat,
      lon: s.lon,
      aqi: s.aqi === '-' ? null : Number(s.aqi),
      pm25: null,
    }));
}

export async function fetchLocations(city, limit = 8) {
  const data = await waqi('/search/', { keyword: city });
  return (data || []).slice(0, limit).map(s => ({
    id: s.uid,
    name: s.station.name,
    city: s.station.name,
    country: s.station.country || '',
    lat: s.station.geo?.[0],
    lon: s.station.geo?.[1],
    aqi: s.aqi === '-' ? null : Number(s.aqi),
  }));
}

export async function fetchMeasurements(locationId) {
  const data = await waqi(`/feed/@${locationId}/`);
  const iaqi = data.iaqi || {};
  const UNITS = { pm25: 'µg/m³', pm10: 'µg/m³', o3: 'ppb', no2: 'ppb', so2: 'ppb', co: 'ppm' };
  const readings = {};
  for (const [param, unit] of Object.entries(UNITS)) {
    if (iaqi[param] != null) {
      readings[param] = { value: iaqi[param].v, unit, lastUpdated: data.time?.s };
    }
  }
  return { locationId, readings, aqi: typeof data.aqi === 'number' ? data.aqi : null };
}

export async function fetchTrends(locationId, parameter = 'pm25') {
  const data = await waqi(`/feed/@${locationId}/`);
  const forecast = data.forecast?.daily?.[parameter] || [];
  const unit = (parameter === 'pm25' || parameter === 'pm10') ? 'µg/m³' : 'ppb';
  return forecast.map(d => ({ date: d.day + 'T12:00:00Z', value: d.avg, unit }));
}
