import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { fetchGlobalSnapshot } from '../utils/openaq';
import { getAqiLevel } from '../utils/aqi';

function FlyToLocation({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lon], 10, { duration: 1.5 });
  }, [target, map]);
  return null;
}

export default function WorldMap({ selectedLocation, onSelectLocation }) {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGlobalSnapshot()
      .then(data => setStations(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-700">
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-slate-900/80">
          <div className="flex items-center gap-3 text-slate-300">
            <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            Loading global air quality data...
          </div>
        </div>
      )}

      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        minZoom={2}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        {selectedLocation?.lat && <FlyToLocation target={selectedLocation} />}

        {stations.map(station => {
          const level = getAqiLevel(station.aqi);
          return (
            <CircleMarker
              key={station.id}
              center={[station.lat, station.lon]}
              radius={station.aqi ? Math.max(5, Math.min(14, station.aqi / 15)) : 5}
              pathOptions={{
                fillColor: level.color,
                fillOpacity: 0.85,
                color: '#fff',
                weight: 0.5,
              }}
              eventHandlers={{
                click: () => onSelectLocation(station),
              }}
              className="aqi-popup"
            >
              <Popup className="aqi-popup">
                <div className="p-1 min-w-[160px]">
                  <div className="font-semibold text-sm">{station.name}</div>
                  <div className="text-xs text-slate-400 mb-2">{station.city}, {station.country}</div>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
                      style={{ background: level.color }}
                    >
                      {level.label}
                    </span>
                    {station.aqi != null && (
                      <span className="text-lg font-bold">AQI {station.aqi}</span>
                    )}
                  </div>
                  {station.pm25 != null && (
                    <div className="text-xs text-slate-400 mt-1">PM2.5: {station.pm25.toFixed(1)} µg/m³</div>
                  )}
                  <button
                    onClick={() => onSelectLocation(station)}
                    className="mt-2 w-full text-xs bg-emerald-600 hover:bg-emerald-500 text-white py-1 rounded-md transition-colors"
                  >
                    View Details →
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      <div className="absolute bottom-3 left-3 z-[999] bg-slate-900/90 border border-slate-700 rounded-lg p-2.5 text-xs space-y-1.5">
        <div className="font-semibold text-slate-300 mb-1">AQI Scale</div>
        {[
          { label: 'Good', color: '#22c55e' },
          { label: 'Moderate', color: '#eab308' },
          { label: 'Sensitive', color: '#f97316' },
          { label: 'Unhealthy', color: '#ef4444' },
          { label: 'Very Unhealthy', color: '#a855f7' },
          { label: 'Hazardous', color: '#7f1d1d' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: l.color }} />
            <span className="text-slate-300">{l.label}</span>
          </div>
        ))}
      </div>

      <div className="absolute top-3 right-3 z-[999] bg-slate-900/80 rounded-lg px-3 py-1.5 text-xs text-slate-400">
        {stations.length} stations live
      </div>
    </div>
  );
}
