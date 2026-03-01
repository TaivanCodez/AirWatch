const { openaq, aqiFromPM25 } = require('../_openaq');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { locationId } = req.query;
  try {
    const data = await openaq(`/locations/${locationId}/latest`);
    const readings = {};
    for (const r of (data.results || [])) {
      readings[r.parameter] = { value: r.value, unit: r.unit, lastUpdated: r.datetime?.utc };
    }
    const pm25 = readings['pm25']?.value;
    res.json({ locationId, readings, ...aqiFromPM25(pm25) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
