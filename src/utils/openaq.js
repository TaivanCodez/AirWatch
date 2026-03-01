import axios from 'axios';
import { getAqiFromPM25 } from './aqi';

const BASE = 'https://api.openaq.org/v2';

async function aq(path, params = {}) {
  const { data } = await axios.get(`${BASE}${path}`, { params });
  return data;
}

export async function fetchLocations(city, limit = 8) {
  const data = await aq('/locations', {
    city,
    limit,
    order_by: 'lastUpdated',
    sort: 'desc',
    has_geo: true,
  });
  return (data.results || []).map(loc => ({
    id: loc.id,
    name: loc.name,
    city: loc.city,
    country: loc.country,
    lat: loc.coordinates?.latitude,
    lon: loc.coordinates?.longitude,
    lastUpdated: loc.lastUpdated,
    parameters: loc.parameters?.map(p => p.parameter) || [],
  }));
}

export async function fetchMeasurements(locationId) {
  const data = await aq(`/latest/${locationId}`);
  const readings = {};
  for (const m of (data.results?.[0]?.measurements || [])) {
    readings[m.parameter] = { value: m.value, unit: m.unit, lastUpdated: m.lastUpdated };
  }
  const pm25 = readings['pm25']?.value ?? null;
  return { locationId, readings, aqi: getAqiFromPM25(pm25) };
}

export async function fetchTrends(locationId, parameter = 'pm25', days = 30) {
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - Number(days));
  const data = await aq('/measurements', {
    location_id: locationId,
    parameter,
    date_from: dateFrom.toISOString(),
    limit: 500,
    order_by: 'datetime',
    sort: 'asc',
  });
  return (data.results || []).map(m => ({
    date: m.date?.utc,
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
      const pm25 = loc.parameters?.find(p => p.parameter === 'pm25')?.lastValue ?? null;
      return {
        id: loc.id,
        name: loc.name,
        city: loc.city,
        country: loc.country,
        lat: loc.coordinates.latitude,
        lon: loc.coordinates.longitude,
        pm25,
        aqi: getAqiFromPM25(pm25),
      };
    });
}
