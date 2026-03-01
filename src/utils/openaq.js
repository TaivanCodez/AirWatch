import axios from 'axios';
import { getAqiFromPM25 } from './aqi';

const BASE = 'https://api.openaq.org/v3';

// Optional: set VITE_OPENAQ_API_KEY in your .env for higher rate limits
const headers = import.meta.env.VITE_OPENAQ_API_KEY
  ? { 'X-API-Key': import.meta.env.VITE_OPENAQ_API_KEY }
  : {};

async function aq(path, params = {}) {
  const { data } = await axios.get(`${BASE}${path}`, { headers, params });
  return data;
}

export async function fetchLocations(city, limit = 8) {
  const data = await aq('/locations', { city, limit, order_by: 'lastUpdated', sort: 'desc' });
  return (data.results || []).map(loc => ({
    id: loc.id,
    name: loc.name,
    city: loc.locality || loc.city,
    country: loc.country?.name || loc.country,
    countryCode: loc.country?.code,
    lat: loc.coordinates?.latitude,
    lon: loc.coordinates?.longitude,
    lastUpdated: loc.datetimeLast?.utc,
    parameters: loc.parameters?.map(p => p.name) || [],
  }));
}

export async function fetchMeasurements(locationId) {
  const data = await aq(`/locations/${locationId}/latest`);
  const readings = {};
  for (const r of (data.results || [])) {
    readings[r.parameter] = { value: r.value, unit: r.unit, lastUpdated: r.datetime?.utc };
  }
  const pm25 = readings['pm25']?.value ?? null;
  const aqi = getAqiFromPM25(pm25);
  return { locationId, readings, aqi };
}

export async function fetchTrends(locationId, parameter = 'pm25', days = 30) {
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - Number(days));
  const data = await aq(`/locations/${locationId}/measurements`, {
    parameter,
    date_from: dateFrom.toISOString(),
    limit: 500,
    order_by: 'datetime',
    sort: 'asc',
  });
  return (data.results || []).map(m => ({
    date: m.date?.utc || m.datetime?.utc,
    value: m.value,
    unit: m.unit,
  }));
}

export async function fetchGlobalSnapshot() {
  const data = await aq('/locations', {
    limit: 200,
    order_by: 'lastUpdated',
    sort: 'desc',
    has_geo: true,
  });
  return (data.results || [])
    .filter(loc => loc.coordinates?.latitude && loc.coordinates?.longitude)
    .map(loc => {
      const pm25 = loc.parameters?.find(p => p.name === 'pm25')?.lastValue ?? null;
      const aqi = getAqiFromPM25(pm25);
      return {
        id: loc.id,
        name: loc.name,
        city: loc.locality || loc.city,
        country: loc.country?.name || loc.country,
        lat: loc.coordinates.latitude,
        lon: loc.coordinates.longitude,
        pm25,
        aqi,
      };
    });
}
