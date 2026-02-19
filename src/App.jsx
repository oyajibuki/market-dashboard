import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Cloud, Sun, CloudRain, Wind, RefreshCw, Globe, Activity, MapPin, CloudLightning, CloudSnow, CloudFog, ExternalLink, Users } from 'lucide-react';

export default function App() {
  const [cryptoData, setCryptoData] = useState([]);
  const [exchangeRates, setExchangeRates] = useState(null);
  const [weatherData, setWeatherData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [visitorCount, setVisitorCount] = useState(null);

  const ui = {
    nikkei: "日経平均",
    topix: "TOPIX",
    shanghai: "上海総合",
    acwi: "全世界株(2559)",
    tokyo: "東京",
    asagiri: "朝霧",
    live: "LIVE",
    updated: "更新: ",
    visitors: "訪問者数: "
  };

  // 1. GAS Counter Integration
  const updateCounter = async () => {
    try {
      const gasUrl = "https://script.google.com/macros/s/AKfycbznxYkj5ixnK_pHkGR8LUYhEYdvSYpaiF3x4LaZy964wlu068oak1X1uuIiyqCEtGWF/exec?page=Dashboard";
      const response = await fetch(gasUrl);
      if (response.ok) {
        const data = await response.json();
        setVisitorCount(data.count || data.visitorCount || data);
      }
    } catch (e) {
      console.error("Counter fetch failed", e);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. 株価指数 (日経平均 57,143円ベース)
      const indices = [
        { id: 'n225', name: ui.nikkei, symbol: 'NI225', base: 57143, url: 'https://www.google.com/finance/quote/NI225:INDEXNIKKEI' },
        { id: 'topix', name: ui.topix, symbol: 'TOPIX', base: 3850, url: 'https://www.google.com/finance/quote/TOPIX:INDEXTvSE' },
        { id: 'spx', name: 'S&P 500', symbol: '.INX', base: 5800, url: 'https://www.google.com/finance/quote/.INX:INDEXSP' },
        { id: 'nas', name: 'NASDAQ', symbol: '.IXIC', base: 18500, url: 'https://www.google.com/finance/quote/.IXIC:INDEXNASDAQ' },
        { id: 'ftse', name: 'FTSE 100', symbol: 'UKX', base: 8400, url: 'https://www.google.com/finance/quote/UKX:INDEXFTSE' },
        { id: 'sen', name: 'SENSEX', symbol: 'SENSEX', base: 75000, url: 'https://www.google.com/finance/quote/SENSEX:INDEXBOM' },
        { id: 'sh', name: ui.shanghai, symbol: '000001', base: 3100, url: 'https://www.google.com/finance/quote/000001:SHA' },
        { id: 'all', name: ui.acwi, symbol: '2559:TYO', base: 25500, url: 'https://www.google.com/finance/quote/2559:TYO' }
      ];
      setStockData(indices.map(idx => {
        const randVar = (Math.random() - 0.5) * (idx.base * 0.002);
        return {
          ...idx,
          price: idx.base + randVar,
          change: (randVar / idx.base) * 100 + (Math.random() > 0.5 ? 0.5 : -0.2)
        };
      }));

      // 2. 仮想通貨
      const crypRes = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=4&page=1').catch(() => null);
      if (crypRes?.ok) {
        setCryptoData(await crypRes.json());
      }

      // 3. 為替
      const exRes = await fetch('https://open.er-api.com/v6/latest/USD').catch(() => null);
      if (exRes?.ok) setExchangeRates(await exRes.json());

      // 4. 天気
      const locations = [
        { name: ui.tokyo, lat: 35.6895, lon: 139.6917, url: 'https://open-meteo.com/en/forecast?latitude=35.6895&longitude=139.6917' },
        { name: ui.asagiri, lat: 35.4211, lon: 138.5911, url: 'https://open-meteo.com/en/forecast?latitude=35.4211&longitude=138.5911' }
      ];
      
      const wResults = await Promise.all(locations.map(async loc => {
        const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,weather_code&timezone=Asia/Tokyo`).catch(() => null);
        if (r?.ok) {
          const data = await r.json();
          return {
            temp: data.current.temperature_2m,
            code: data.current.weather_code,
            locationName: loc.name,
            infoUrl: loc.url
          };
        }
        return null;
      }));
      setWeatherData(wResults.filter(Boolean));

    } catch (e) {
      console.error(e);
      setError("Data fetch error");
    }
    setLastUpdate(new Date());
    setLoading(false);
  };

  useEffect(() => { 
    fetchAllData(); 
    updateCounter();
    const inv = setInterval(fetchAllData, 60000); 
    return () => clearInterval(inv); 
  }, []);

  const getWeatherIcon = (code) => {
    if (code <= 1) return <Sun className="text-orange-400" size={32} />;
    if (code <= 3) return <Cloud className="text-gray-400" size={32} />;
    if (code <= 48) return <CloudFog className="text-slate-400" size={32} />;
    if (code <= 67) return <CloudRain className="text-blue-400" size={32} />;
    if (code <= 99) return <CloudLightning className="text-yellow-400" size={32} />;
    return <Cloud size={32} />;
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 text-slate-200 font-mono">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap');
        .font-orbitron { font-family: 'Orbitron', sans-serif; }
        .glass { background: rgba(30, 41, 59, 0.5); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.05); }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center relative">
          <div className="md:absolute top-0 right-0 glass px-4 py-2 rounded-full border border-cyan-500/30 flex items-center justify-center gap-2 mb-4 md:mb-0">
            <Users size={14} className="text-cyan-400" />
            <span className="text-[10px] text-cyan-400 font-orbitron">
              {ui.visitors}{visitorCount !== null ? visitorCount.toLocaleString() : '---'}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 font-orbitron mb-4 tracking-tighter">GLOBAL MARKET</h1>
          <div className="flex justify-center items-center gap-4 text-[10px] text-cyan-400/50">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> {ui.live}</span>
            <span>{ui.updated}{lastUpdate.toLocaleTimeString()}</span>
            <button onClick={fetchAllData} className="hover:text-white transition-colors"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /></button>
          </div>
        </header>

        <div className="mb-12">
          <h2 className="text-indigo-400 font-orbitron mb-6 flex items-center gap-2 tracking-widest text-sm uppercase">
            <Globe size={18} /> 主要株価指数
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stockData.map(s => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="glass p-5 rounded-xl border-l-2 border-l-indigo-500 hover:scale-105 transition-transform block group">
                <div className="flex justify-between items-start mb-1">
                  <div className="text-[9px] text-slate-500">{s.symbol}</div>
                  <ExternalLink size={10} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="font-bold text-white mb-2">{s.name}</div>
                <div className="text-2xl font-orbitron">
                  {/* 小数点を切り捨てて整数で表示 */}
                  {Math.floor(s.price).toLocaleString()}
                </div>
                <div className={`text-xs font-bold ${s.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {s.change >= 0 ? '▲' : '▼'}{Math.abs(s.change).toFixed(2)}%
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h2 className="text-orange-400 font-orbitron text-sm flex items-center gap-2 uppercase tracking-widest"><Cloud size={18} /> 天気予報</h2>
            {weatherData.map((w, i) => (
              <a key={i} href={w.infoUrl} target="_blank" rel="noopener noreferrer" className="glass p-6 rounded-2xl flex justify-between items-center hover:bg-slate-800/50 transition-colors block group">
                <div>
                  <div className="text-[10px] text-slate-500 mb-1 flex items-center gap-1"><MapPin size={10} /> {w.locationName}</div>
                  <div className="text-4xl font-bold font-orbitron">{Math.round(w.temp)}{'\u00b0'}C</div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  {getWeatherIcon(w.code)}
                  <ExternalLink size={10} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            ))}
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-cyan-400 font-orbitron text-sm flex items-center gap-2 mb-4 uppercase tracking-widest"><Activity size={18} /> 仮想通貨資産</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {cryptoData.map(c => (
                <a key={c.id} href={`https://www.coingecko.com/en/coins/${c.id}`} target="_blank" rel="noopener noreferrer" className="glass p-4 rounded-xl block hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    {c.image && <img src={c.image} className="w-5 h-5 rounded-full" alt="" />}
                    <span className="text-[10px] font-bold">{c.symbol?.toUpperCase()}</span>
                  </div>
                  <div className="text-lg font-orbitron">${c.current_price?.toLocaleString()}</div>
                  <div className={`text-[10px] ${c.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {c.price_change_percentage_24h >= 0 ? '▲' : '▼'}{Math.abs(c.price_change_percentage_24h).toFixed(2)}%
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {exchangeRates && (
          <div className="mt-12 glass p-8 rounded-2xl border-t-2 border-t-emerald-500/30">
            <h2 className="text-emerald-400 font-orbitron text-sm mb-6 flex items-center gap-2 uppercase tracking-widest"><DollarSign size={18} /> 為替レート (円貨ベース)</h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-8 text-center">
              {['USD', 'EUR', 'GBP', 'AUD', 'CNY', 'PHP'].map(cur => (
                <a 
                  key={cur} 
                  href={`https://www.google.com/finance/quote/${cur}-JPY`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group"
                >
                  <div className="text-[10px] text-slate-500 mb-1 group-hover:text-emerald-400 transition-colors font-bold">{cur}/JPY</div>
                  <div className="text-xl font-orbitron font-bold text-white group-hover:scale-110 transition-transform inline-block">
                    {(exchangeRates.rates['JPY'] / exchangeRates.rates[cur])?.toFixed(2)}
                  </div>
                  <div className="text-[8px] text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity mt-1">チャート</div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
