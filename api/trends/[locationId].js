const { openaq } = require('../_openaq');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { locationId } = req.query;
  const { parameter = 'pm25', days = 30 } = req.query;
  try {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - Number(days));
    const data = await openaq(`/locations/${locationId}/measurements`, {
      parameter,
      date_from: dateFrom.toISOString(),
      limit: 500,
      order_by: 'datetime',
      sort: 'asc',
    });
    const results = (data.results || []).map(m => ({
      date: m.date?.utc || m.datetime?.utc,
      value: m.value,
      unit: m.unit,
    }));
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
