const { openaq, aqiFromPM25 } = require('./_openaq');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const data = await openaq('/locations', { limit: 200, order_by: 'lastUpdated', sort: 'desc', has_geo: true });
    const results = (data.results || [])
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
          ...aqiFromPM25(pm25),
        };
      });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
