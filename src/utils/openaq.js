import axios from 'axios';
import { getAqiFromPM25, getAqiLevel } from './aqi';

const BASE = 'https://api.openaq.org/v3';

function aqiInfoFromPM25(pm25) {
  const aqi = getAqiFromPM25(pm25);
  const level = getAqiLevel(aqi);
  return { aqi, label: level.label, color: level.color };
}

export async function fetchLocations(city, limit = 8) {
  const { data } = await axios.get(`${BASE}/locations`, {
    params: { city, limit, order_by: 'lastUpdated', sort: 'desc' },
  });
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
  const { data } = await axios.get(`${BASE}/locations/${locationId}/latest`);
  const readings = {};
  for (const r of (data.results || [])) {
    readings[r.parameter] = { value: r.value, unit: r.unit, lastUpdated: r.datetime?.utc };
  }
  const pm25 = readings['pm25']?.value;
  return { locationId, readings, ...aqiInfoFromPM25(pm25) };
}

export async function fetchTrends(locationId, parameter = 'pm25', days = 30) {
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - Number(days));
  const { data } = await axios.get(`${BASE}/locations/${locationId}/measurements`, {
    params: { parameter, date_from: dateFrom.toISOString(), limit: 500, order_by: 'datetime', sort: 'asc' },
  });
  return (data.results || []).map(m => ({
    date: m.date?.utc || m.datetime?.utc,
    value: m.value,
    unit: m.unit,
  }));
}

export async function fetchGlobalSnapshot() {
  const { data } = await axios.get(`${BASE}/locations`, {
    params: { limit: 200, order_by: 'lastUpdated', sort: 'desc', has_geo: true },
  });
  return (data.results || [])
    .filter(loc => loc.coordinates?.latitude && loc.coordinates?.longitude)
    .map(loc => {
      const pm25 = loc.parameters?.find(p => p.name === 'pm25')?.lastValue;
      return {
        id: loc.id,
        name: loc.name,
        city: loc.locality || loc.city,
        country: loc.country?.name || loc.country,
        lat: loc.coordinates.latitude,
        lon: loc.coordinates.longitude,
        pm25,
        ...aqiInfoFromPM25(pm25),
      };
    });
}
