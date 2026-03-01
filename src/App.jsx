import { useState } from 'react';
import WorldMap from './components/WorldMap';
import CitySearch from './components/CitySearch';
import AqiDashboard from './components/AqiDashboard';
import TrendsChart from './components/TrendsChart';
import SustainabilityTips from './components/SustainabilityTips';

const TABS = ['Dashboard', 'Trends', 'Sustainability'];

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [activeTab, setActiveTab] = useState('Dashboard');

  function handleSelectLocation(loc) {
    setSelectedLocation(loc);
    setActiveTab('Dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-none">AirWatch</h1>
              <p className="text-xs text-slate-400 leading-none mt-0.5">Global Air Quality</p>
            </div>
          </div>

          <CitySearch onSelectLocation={handleSelectLocation} />

          <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live data · OpenAQ
          </div>
        </div>
      </header>

      {/* Map */}
      <div className="relative" style={{ height: '45vh', minHeight: 300 }}>
        <WorldMap selectedLocation={selectedLocation} onSelectLocation={handleSelectLocation} />
        {!selectedLocation && (
          <div className="absolute inset-0 flex items-end justify-center pb-8 pointer-events-none z-[998]">
            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl px-5 py-3 text-center">
              <p className="text-sm text-slate-300 font-medium">Click any dot or search a city to explore air quality</p>
            </div>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selectedLocation && (
        <div className="flex-1 bg-slate-950">
          <div className="max-w-screen-xl mx-auto px-4 py-6">
            {/* Tab nav */}
            <div className="flex gap-1 mb-6 bg-slate-900 rounded-xl p-1 w-fit border border-slate-800">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {activeTab === 'Dashboard' && (
                <>
                  <div className="lg:col-span-2">
                    <AqiDashboard location={selectedLocation} />
                  </div>
                  <div>
                    <SustainabilityTips aqi={selectedLocation.aqi} />
                  </div>
                </>
              )}

              {activeTab === 'Trends' && (
                <div className="lg:col-span-3">
                  <TrendsChart location={selectedLocation} />
                </div>
              )}

              {activeTab === 'Sustainability' && (
                <div className="lg:col-span-3">
                  <SustainabilityTips aqi={selectedLocation.aqi} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      {!selectedLocation && (
        <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-600">
          Built for CODE @ Babson College · Powered by OpenAQ
        </div>
      )}
    </div>
  );
}
