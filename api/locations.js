import { openaq } from './_openaq.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { city, country, limit = 20 } = req.query;
  try {
    const data = await openaq('/locations', { city, country, limit, order_by: 'lastUpdated', sort: 'desc' });
    const results = (data.results || []).map(loc => ({
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
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
