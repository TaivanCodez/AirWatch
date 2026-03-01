import axios from 'axios';

export async function fetchLocations(city, limit = 8) {
  const { data } = await axios.get(`/api/locations?city=${encodeURIComponent(city)}&limit=${limit}`);
  return data;
}

export async function fetchMeasurements(locationId) {
  const { data } = await axios.get(`/api/measurements/${locationId}`);
  return data;
}

export async function fetchTrends(locationId, parameter = 'pm25', days = 30) {
  const { data } = await axios.get(`/api/trends/${locationId}?parameter=${parameter}&days=${days}`);
  return data;
}

export async function fetchGlobalSnapshot() {
  const { data } = await axios.get('/api/global-snapshot');
  return data;
}
