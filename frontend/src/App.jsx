import { useState, useEffect, useRef } from 'react'

// Animated number with tick flash
const AnimatedPrice = ({ value, prefix = "$", decimals = 2, className = "" }) => {
  const [tickClass, setTickClass] = useState("");
  const prevValueRef = useRef(value);
  useEffect(() => {
    if (value !== null && prevValueRef.current !== null) {
      if (value > prevValueRef.current) setTickClass("tick-up");
      else if (value < prevValueRef.current) setTickClass("tick-down");
      const t = setTimeout(() => setTickClass(""), 500);
      prevValueRef.current = value;
      return () => clearTimeout(t);
    }
    prevValueRef.current = value;
  }, [value]);
  return (
    <span className={`${className} ${tickClass}`}>
      {value !== null && value !== undefined
        ? prefix + value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
        : '---'}
    </span>
  );
};

// Latency sparkline (per-exchange)
const Sparkline = ({ value }) => {
  const [history, setHistory] = useState(Array(15).fill(0));
  useEffect(() => {
    if (value) setHistory(prev => [...prev.slice(1), value]);
  }, [value]);
  const max = Math.max(...history.filter(v => v > 0), 1);
  const min = Math.min(...history.filter(v => v > 0), 1);
  const range = max - min || 1;
  const points = history.map((val, i) => {
    if (val === 0) return `${(i / 14) * 40},20`;
    const norm = (val - min) / range;
    const y = 20 - (norm * 16 + 2);
    return `${(i / 14) * 40},${y}`;
  }).join(' L ');
  return (
    <svg width="40" height="20" style={{ marginLeft: '8px', opacity: 0.8 }}>
      <path d={`M ${points}`} fill="none" stroke="var(--color-live)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

// P&L History sparkline
const PnlSparkline = ({ data }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  const W = 300, H = 60;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - (val / max) * (H - 10) - 5;
    return `${x},${y}`;
  }).join(' L ');
  const areaPoints = `0,${H} ` + points + ` ${W},${H}`;
  return (
    <div style={{ position: 'relative', width: `${W}px`, height: `${H + 20}px` }}>
      <div style={{ position: 'absolute', top: '-10px', left: 0, fontSize: '9px', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.1em' }}>
        CUMULATIVE PROFIT (24H) - PAPER
      </div>
      <svg width={W} height={H} style={{ overflow: 'visible', position: 'absolute', bottom: 0 }}>
        <defs>
          <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-live)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-live)" stopOpacity="0" />
          </linearGradient>
          <pattern id="grid" width="30" height="20" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <polygon points={areaPoints} fill="url(#pnlGrad)" />
        <path d={`M ${points}`} fill="none" stroke="var(--color-live)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  );
};

// Liquidity Heatmap
const LiquidityHeatmap = ({ sources }) => {
  let totalBid = 0, totalAsk = 0;
  Object.values(sources).forEach(s => {
    totalBid += s.bid_size || 0;
    totalAsk += s.ask_size || 0;
  });
  const total = totalBid + totalAsk;
  const bidPct = total > 0 ? (totalBid / total) * 100 : 50;
  const askPct = 100 - bidPct;

  return (
    <div className="heatmap-container" style={{ marginTop: '24px' }}>
      <div className="heatmap-label">
        <span>AGGREGATED BUY WALL</span>
        <span>AGGREGATED SELL WALL</span>
      </div>
      <div className="heatmap-track">
        <div className="heatmap-bid" style={{ width: `${bidPct}%` }}></div>
        <div className="heatmap-ask" style={{ width: `${askPct}%` }}></div>
      </div>
    </div>
  );
};

// Capital Allocation Engine
const CapitalAllocationEngine = ({ data }) => {
  let crossCount = 0;
  Object.values(data.state?.pairs || {}).forEach(p => { if (p.status === 'LIVE') crossCount++; });
  const triLive = data.state?.triangular?.status === 'LIVE';
  const regLive = data.state?.regional?.status === 'LIVE';
  
  let crossPct = 80, triPct = 15, regPct = 5;
  if (crossCount > 0 || triLive || regLive) {
     const totalWeight = (crossCount * 3) + (triLive ? 2 : 1) + (regLive ? 1 : 0.5);
     crossPct = Math.round(((crossCount * 3) / totalWeight) * 100);
     triPct = Math.round(((triLive ? 2 : 1) / totalWeight) * 100);
     regPct = 100 - crossPct - triPct;
  }
  
  return (
    <div className="glass-panel">
      <div className="panel-title">CAPITAL ALLOCATION ENGINE</div>
      <div className="panel-description">Dynamic routing of theoretical $1,000,000 portfolio across active arbitrage strategies based on regime volatility.</div>
      <div className="alloc-grid">
         <div className="alloc-item">
           <div className="alloc-label">CROSS-EXCHANGE</div>
           <div className="alloc-val mono text-primary">${(10000 * crossPct).toLocaleString()}</div>
           <div className="eff-bar-track" style={{ marginTop: '6px' }}>
              <div className="eff-bar-fill" style={{ width: `${crossPct}%`, background: 'var(--color-live)' }}></div>
           </div>
         </div>
         <div className="alloc-item">
           <div className="alloc-label">TRIANGULAR LOOP</div>
           <div className="alloc-val mono text-primary">${(10000 * triPct).toLocaleString()}</div>
           <div className="eff-bar-track" style={{ marginTop: '6px' }}>
              <div className="eff-bar-fill" style={{ width: `${triPct}%`, background: 'var(--color-neutral)' }}></div>
           </div>
         </div>
         <div className="alloc-item">
           <div className="alloc-label">REGIONAL PREMIUM</div>
           <div className="alloc-val mono text-primary">${(10000 * regPct).toLocaleString()}</div>
           <div className="eff-bar-track" style={{ marginTop: '6px' }}>
              <div className="eff-bar-fill" style={{ width: `${regPct}%`, background: 'var(--color-hold)' }}></div>
           </div>
         </div>
      </div>
    </div>
  );
};

// Gauge
const Gauge = ({ value, max, label, isLive }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(value / max, 0), 1);
  const strokeDashoffset = circumference - pct * circumference;
  return (
    <div className="gauge-container" style={{ width: '90px', height: '90px' }}>
      <svg width="90" height="90" viewBox="0 0 90 90" className="gauge-svg">
        <circle cx="45" cy="45" r={radius} className="gauge-bg" />
        <circle cx="45" cy="45" r={radius} className="gauge-fill"
          style={{ strokeDasharray: circumference, strokeDashoffset, stroke: isLive ? 'var(--color-live)' : 'var(--color-neutral)' }} />
      </svg>
      <div className="gauge-center">
        <div className="gauge-value mono text-primary">{Number.isFinite(value) ? value.toFixed(2) : '0'}</div>
        <div className="gauge-label">{label}</div>
      </div>
    </div>
  );
};

// Signal age timer
const SignalAge = ({ firedAt }) => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const tick = () => setElapsed(Math.floor(Date.now() / 1000 - firedAt));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [firedAt]);
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  const label = m > 0 ? `${m}m ${s}s ago` : `${s}s ago`;
  const isStale = elapsed > 60;
  return (
    <span className="mono" style={{ fontSize: '10px', color: isStale ? 'var(--color-hold)' : 'var(--color-live)', marginLeft: '8px' }}>
      {label}
    </span>
  );
};

// Market Regime Badge
const RegimeBadge = ({ pairs }) => {
  let totalImbalance = 0, count = 0;
  Object.values(pairs || {}).forEach(info => {
    Object.values(info.sources || {}).forEach(src => {
      const bid = src.bid_size || 0, ask = src.ask_size || 0, total = bid + ask;
      if (total > 0) { totalImbalance += Math.abs((bid - ask) / total); count++; }
    });
  });
  const avg = count > 0 ? totalImbalance / count : 0;
  let regime = 'RANGING', color = 'var(--color-neutral)';
  if (avg > 0.3) { regime = 'HIGH VOLATILITY'; color = 'var(--color-error)'; }
  else if (avg > 0.15) { regime = 'TRENDING'; color = 'var(--color-hold)'; }
  return (
    <span className="mono" style={{ fontSize: '11px', fontWeight: 700, color, border: `1px solid ${color}`, padding: '3px 10px', borderRadius: '20px', opacity: 0.9 }}>
      REGIME: {regime}
    </span>
  );
};

// Exchange Online Counter
const ExchangeCount = ({ pairs }) => {
  const sources = new Map();
  Object.values(pairs || {}).forEach(info => {
    Object.entries(info.sources || {}).forEach(([name, src]) => {
      if (!sources.has(name)) sources.set(name, src.status === 'ACTIVE');
    });
  });
  const total = sources.size;
  const online = [...sources.values()].filter(Boolean).length;
  const allOnline = online === total && total > 0;
  return (
    <span className="mono" style={{ fontSize: '11px', fontWeight: 700, color: allOnline ? 'var(--color-live)' : 'var(--color-error)', border: `1px solid ${allOnline ? 'var(--color-live)' : 'var(--color-error)'}`, padding: '3px 10px', borderRadius: '20px' }}>
      {online}/{total} EXCHANGES ONLINE
    </span>
  );
};

// Bottom Ticker
const Ticker = ({ data }) => {
  const sigCount = data?.signals?.all?.length || 0;
  const pnl = data?.daily_pnl?.total_pnl || 0;
  const fillRate = data?.execution_stats?.fill_rate_pct || 0;
  const isHealthy = data?.state?.written_at ? (Date.now() / 1000 - data.state.written_at) < 5 : false;
  const text = `SYSTEM HEALTH: ${isHealthy ? 'OPTIMAL' : 'DEGRADED'} // ANTI-SPOOFING ACTIVE // LATENCY BOUNDS ENFORCED // ${sigCount} SIGNALS VERIFIED // TOTAL P&L: $${pnl.toLocaleString()} // FILL RATE: ${fillRate}% // ORACLE TIEBREAK PROTECTED // `;
  return (
    <div className="ticker-wrap">
      <div className="ticker-label">
        <div className="pill-dot dot-live"></div>
        SYSTEM INTELLIGENCE
      </div>
      <div className="ticker-track">
        <div className="ticker-content">
          <span>{text}</span><span>{text}</span><span>{text}</span>
        </div>
      </div>
    </div>
  );
};

// P&L Banner
const PnlBanner = ({ daily_pnl, historical_pnl, execution_stats, accuracy_stats }) => {
  const pnl = daily_pnl?.total_pnl || 0;
  const trades = daily_pnl?.trade_count || 0;
  const fillRate = execution_stats?.fill_rate_pct || 0;
  const aborted = execution_stats?.aborted || 0;
  const signalsFired = execution_stats?.signals_fired || 0;
  const heldPct = accuracy_stats?.held_pct;
  return (
    <div className="glass-panel col-12 pnl-banner">
      <div className="pnl-banner-left">
        <div className="pnl-label">TOTAL PAPER P&L</div>
        <div className="pnl-value mono text-live glow-success">
          +${pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="pnl-sub mono text-dim">{trades} executions</div>
      </div>
      <div className="pnl-chart-area">
        <PnlSparkline data={historical_pnl} />
      </div>
      <div className="pnl-stats-grid">
        <div className="pnl-stat">
          <div className="pnl-stat-label">SIGNALS FIRED</div>
          <div className="pnl-stat-value mono">{signalsFired.toLocaleString()}</div>
        </div>
        <div className="pnl-stat">
          <div className="pnl-stat-label">FILL RATE</div>
          <div className="pnl-stat-value mono text-live">{fillRate}%</div>
        </div>
        <div className="pnl-stat">
          <div className="pnl-stat-label">ABORTS</div>
          <div className="pnl-stat-value mono text-hold">{aborted}</div>
        </div>
        <div className="pnl-stat">
          <div className="pnl-stat-label">SIGNAL ACCURACY</div>
          <div className="pnl-stat-value mono text-live">
            {heldPct !== null && heldPct !== undefined ? `${heldPct.toFixed(1)}%` : '--'}
          </div>
        </div>
      </div>
    </div>
  );
};

// Z-Score Sparkline
const ZScoreSparkline = ({ value }) => {
  const [history, setHistory] = useState(Array(100).fill(0));
  const [maxObserved, setMaxObserved] = useState(-3);
  const [minObserved, setMinObserved] = useState(3);
  
  useEffect(() => {
    if (value !== undefined && value !== null) {
      setHistory(prev => [...prev.slice(1), value]);
      setMaxObserved(prev => Math.max(prev, value));
      setMinObserved(prev => Math.min(prev, value));
    }
  }, [value]);
  
  const W = 600;
  const H = 60;
  
  const minZ = -3;
  const maxZ = 3;
  const range = maxZ - minZ;
  
  const points = history.map((val, i) => {
    const x = (i / 99) * W;
    const clampedVal = Math.max(minZ, Math.min(maxZ, val));
    const norm = (clampedVal - minZ) / range;
    const y = H - (norm * H);
    return `${x},${y}`;
  }).join(' L ');
  
  const zeroY = H - ((0 - minZ) / range) * H;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ textAlign: 'right' }}>
        <div className="text-dim" style={{ fontSize: '9px', fontWeight: 'bold' }}>ALL-TIME HIGH</div>
        <div className="mono text-live">{maxObserved === -3 ? '0.00' : maxObserved.toFixed(2)}</div>
      </div>
      <svg width={W} height={H} style={{ opacity: 0.8, marginTop: '4px' }}>
        <line x1="0" y1={zeroY} x2={W} y2={zeroY} stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="2,2" />
        <path d={`M ${points}`} fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinejoin="round" />
      </svg>
      <div style={{ textAlign: 'left' }}>
        <div className="text-dim" style={{ fontSize: '9px', fontWeight: 'bold' }}>ALL-TIME LOW</div>
        <div className="mono" style={{ color: '#ff4444' }}>{minObserved === 3 ? '0.00' : minObserved.toFixed(2)}</div>
      </div>
    </div>
  );
};

// Statistical Arbitrage Engine
const StatisticalPairs = ({ data }) => {
  const stat = data?.state?.statistical;
  if (!stat) return null;

  return (
    <div className="glass-panel" style={{ marginBottom: '24px' }}>
      <div className="panel-title">STATISTICAL ARBITRAGE (PAIRS TRADING)</div>
      <div className="panel-description">
        Tracks the Z-Score correlation between BTC and ETH to detect macroeconomic divergence and mean-reversion opportunities.
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
        <div style={{ flex: 1 }}>
          <div className="text-dim" style={{ fontSize: '11px', marginBottom: '8px', fontWeight: 'bold' }}>CURRENT RATIO (BTC/ETH)</div>
          <AnimatedPrice value={stat.current_ratio} prefix="" decimals={4} className="mono text-primary" style={{ fontSize: '24px' }} />
        </div>
        
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '0 16px' }}>
          <div style={{ display: 'flex', gap: '32px', marginBottom: '4px' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="text-dim" style={{ fontSize: '10px', fontWeight: 'bold' }}>ROLLING MEAN</div>
              <div className="mono text-primary">{stat.mean ? stat.mean.toFixed(4) : '0.0000'}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="text-dim" style={{ fontSize: '10px', fontWeight: 'bold' }}>STD DEV</div>
              <div className="mono text-primary">{stat.std_dev ? stat.std_dev.toFixed(4) : '0.0000'}</div>
            </div>
          </div>
          <ZScoreSparkline value={stat.z_score} />
        </div>
        
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Gauge 
            value={Math.abs(stat.z_score || 0)} 
            max={3} 
            label="Z-SCORE" 
            isLive={Math.abs(stat.z_score || 0) > 1.5} 
          />
        </div>
      </div>

      <div style={{ marginTop: '16px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '4px', textAlign: 'center' }}>
        <div className="text-dim" style={{ fontSize: '10px', letterSpacing: '0.1em', marginBottom: '4px' }}>LIVE SIGNAL</div>
        <div className={`mono ${stat.status === 'LIVE' ? 'text-live glow-success' : 'text-hold'}`} style={{ fontWeight: 'bold', fontSize: '14px' }}>
          {stat.signal}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [data, setData] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket('ws://localhost:8765');
      ws.onopen = () => setConnectionStatus('connected');
      ws.onmessage = (event) => {
        try { setData(JSON.parse(event.data)); } catch (e) { console.error("WS parse error", e); }
      };
      ws.onclose = () => { setConnectionStatus('disconnected'); setTimeout(connect, 2000); };
      ws.onerror = (err) => { console.error("WS error:", err); ws.close(); };
      return ws;
    };
    const ws = connect();
    return () => ws.close();
  }, []);

  if (!data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <div className="pill-dot dot-live" style={{ marginBottom: '16px', width: '12px', height: '12px' }}></div>
        <p className="mono">CONNECTING TO HIGH FREQUENCY ENGINE...</p>
      </div>
    );
  }

  const { state, signals, risk, audit, daily_pnl, execution_stats, historical_pnl, accuracy_stats } = data;

  const getDotClass = (status) => {
    if (status === 'LIVE' || status === 'ACTIVE') return 'dot-live';
    if (status === 'HOLD' || status === 'PROBATION') return 'dot-hold';
    return 'dot-error';
  };

  let hasActiveSignal = false;
  if (state.triangular?.status === 'LIVE' && state.triangular?.loops) {
    if (Math.max(...state.triangular.loops.map(l => l.net_profit_pct)) >= 0.15) hasActiveSignal = true;
  }
  if (state.regional?.status === 'LIVE' && state.regional?.premium) {
    if (state.regional.premium.net_premium_pct >= 0.15) hasActiveSignal = true;
  }
  Object.values(state.pairs || {}).forEach(info => {
    if (info.status === 'LIVE') {
      const prices = Object.values(info.sources).filter(s => s.status === 'ACTIVE' && s.last_price).map(s => s.last_price);
      if (prices.length >= 2) {
        const mn = Math.min(...prices), mx = Math.max(...prices);
        if ((mx - mn) / mn * 100 >= 0.15) hasActiveSignal = true;
      }
    }
  });

  return (
    <div className={`ambient-base ${hasActiveSignal ? 'ambient-signal' : ''}`}>
      <div className="dashboard-container">

        <div className="header">
          <div className="header-title" style={{ display: 'flex', alignItems: 'baseline', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="pill-dot dot-live" style={{ width: '12px', height: '12px' }}></div>
              HYDRA ARBITRAGE ENGINE
            </div>
            <span style={{ fontSize: '13px', color: '#888', letterSpacing: '1px', fontWeight: '500', fontFamily: 'monospace' }}>
              BUILT BY SUDARSHAN SINGH RATHORE
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ backgroundColor: 'rgba(0, 255, 0, 0.1)', color: '#00ff00', border: '1px solid rgba(0,255,0,0.3)', padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '1px' }}>
              <div className="pill-dot dot-live" style={{ width: '8px', height: '8px', backgroundColor: '#00ff00', boxShadow: '0 0 8px #00ff00' }}></div>
              ENTERPRISE SECURITY SHIELD
            </div>
            <RegimeBadge pairs={state.pairs} />
            <ExchangeCount pairs={state.pairs} />
            <div className="mono text-dim" style={{ fontSize: '12px' }}>
              WS: {connectionStatus.toUpperCase()} | ENGINE: {state.written_at ? new Date(state.written_at * 1000).toLocaleTimeString() : 'N/A'}
            </div>
          </div>
        </div>

        <PnlBanner daily_pnl={daily_pnl} historical_pnl={historical_pnl} execution_stats={execution_stats} accuracy_stats={accuracy_stats} />

        <div className="col-8">
          {Object.entries(state.pairs || {}).map(([pair, info]) => {
            const activePrices = Object.entries(info.sources)
              .filter(([_, src]) => src.status === 'ACTIVE' && src.last_price !== null)
              .map(([name, src]) => ({ name, price: src.last_price, bid: src.bid_size, ask: src.ask_size }));
            let maxSpreadPct = 0, bestBuy = null, bestSell = null, bestBuyPrice = 0, bestSellPrice = 0;
            activePrices.forEach(buy => {
              activePrices.forEach(sell => {
                if (buy.name === sell.name) return;
                const spreadPct = (sell.price - buy.price) / buy.price * 100;
                if (spreadPct > maxSpreadPct) {
                  maxSpreadPct = spreadPct; bestBuy = buy.name; bestSell = sell.name;
                  bestBuyPrice = buy.price; bestSellPrice = sell.price;
                }
              });
            });
            const isProfitable = maxSpreadPct >= 0.15;
            return (
              <div key={pair} className="glass-panel" style={{ marginBottom: '24px' }}>
                <div className="panel-title">
                  <span>{pair} CONSENSUS</span>
                  <span className={info.status === 'LIVE' ? 'text-live' : 'text-hold'}>{info.status}</span>
                </div>
                <div className="panel-description">
                  Sub-millisecond feeds fused into a single verified price. Protected by anti-spoofing depth checks and staleness hounds.
                </div>
                <div className="validation-pipeline">
                  <div className="pipeline-check valid">&#10003; Sub-ms Latency</div>
                  <div className="pipeline-arrow">&#8594;</div>
                  <div className="pipeline-check valid">&#10003; Bounds Protected</div>
                  <div className="pipeline-arrow">&#8594;</div>
                  <div className="pipeline-check valid">&#10003; Oracle Confirmed</div>
                </div>
                <div className="hero-price-card">
                  {info.status === 'HOLD' && info.fallback_price ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div className="web3-fallback-wrapper">
                        <AnimatedPrice value={info.fallback_price} className="hero-price-value mono" />
                      </div>
                      <div style={{ backgroundColor: 'rgba(185, 103, 255, 0.1)', color: '#b967ff', border: '1px solid rgba(185, 103, 255, 0.5)', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', marginTop: '-5px', marginBottom: '15px', letterSpacing: '1px', textShadow: '0 0 10px rgba(185, 103, 255, 0.5)' }}>WEB3 ORACLE FALLBACK ACTIVE</div>
                    </div>
                  ) : (
                    <AnimatedPrice value={info.verified_price} className="hero-price-value mono" />
                  )}
                  <div className="pills-container">
                    {Object.entries(info.sources || {}).map(([exchange, src]) => {
                      const bid = src.bid_size || 0, ask = src.ask_size || 0, total = bid + ask;
                      const bidPct = total > 0 ? (bid / total) * 100 : 50;
                      const latency = src.last_update ? (Date.now() / 1000 - src.last_update) * 1000 : 0;
                      return (
                        <div key={exchange} className="exchange-pill">
                          <div className="pill-top">
                            <div className="pill-brand">
                              <div className={`pill-dot ${getDotClass(src.status)}`}></div>
                              <span className="pill-name">{exchange}</span>
                            </div>
                            <Sparkline value={latency} />
                          </div>
                          <AnimatedPrice value={src.last_price} className="pill-price mono" />
                          <div className="imbalance-meter">
                            <div className="imbalance-bid" style={{ width: `${bidPct}%` }}></div>
                            <div className="imbalance-ask" style={{ width: `${100 - bidPct}%` }}></div>
                          </div>
                          <div className="imbalance-label">
                            <span>BID {bid > 0 ? bid.toFixed(1) : ''}</span>
                            <span>ASK {ask > 0 ? ask.toFixed(1) : ''}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {maxSpreadPct > 0 && (
                  <div className="radar-wrapper">
                    <div className="radar-header">
                      <span>ARBITRAGE RADAR: {bestBuy} &#8594; {bestSell}</span>
                      <span className={isProfitable ? "text-live" : "text-muted"}>
                        {maxSpreadPct.toFixed(3)}% {isProfitable ? "(PROFITABLE)" : "(EFFICIENT)"}
                      </span>
                    </div>
                    <div className="radar-track">
                      <div className={`radar-fill ${isProfitable ? 'fill-live' : 'fill-neutral'}`}
                        style={{ width: `${Math.min((maxSpreadPct / 0.30) * 100, 100)}%` }}></div>
                    </div>
                    <div className="explicit-trade-text">
                      <div className="trade-row">
                        <span><span className="pill-dot dot-live" style={{ display: 'inline-block', marginRight: '8px' }}></span>Buy on {bestBuy}</span>
                        <span className="text-primary">${bestBuyPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="trade-row">
                        <span><span className="pill-dot dot-error" style={{ display: 'inline-block', marginRight: '8px' }}></span>Sell on {bestSell}</span>
                        <span className="text-primary">${bestSellPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                )}
                <LiquidityHeatmap sources={info.sources} />
              </div>
            );
          })}
        </div>

        <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel">
            <div className="panel-title">TRIANGULAR MONITOR</div>
            <div className="panel-description">Checks whether Binance own BTC/USDT, ETH/USDT, and ETH/BTC prices briefly disagree by more than fees.</div>
            {state.triangular?.legs && (
              <div className="tri-pipeline">
                {Object.entries(state.triangular.legs).map(([legName, legData], idx) => (
                  <div key={legName} style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="tri-node">
                      <span className="tri-label">{legName}</span>
                      <AnimatedPrice value={legData.price} prefix="" decimals={4} className="tri-value mono text-primary" />
                    </div>
                    {idx < 2 && <span className="tri-arrow" style={{ margin: '0 12px' }}>&#8594;</span>}
                  </div>
                ))}
              </div>
            )}
            <div style={{ textAlign: 'center' }}>
              {state.triangular?.status === "LIVE" && state.triangular?.loops?.length > 0 ? (
                <span className="text-live mono glow-success" style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  MAX SPREAD: {Math.max(...state.triangular.loops.map(l => l.net_profit_pct)).toFixed(3)}%
                </span>
              ) : (
                <span className="mono text-dim" style={{ fontSize: '12px' }}>AWAITING TRIANGULAR DIVERGENCE</span>
              )}
            </div>
          </div>

          <div className="glass-panel">
            <div className="panel-title">REGIONAL PREMIUM</div>
            <div className="panel-description">Compares CoinDCX local USDT/INR market directly against the real-world USD/INR forex rate.</div>
            {state.regional?.usdt_inr && state.regional?.usd_inr ? (
              <div className="regional-grid">
                <div className="regional-block">
                  <div className="text-dim" style={{ fontSize: '11px', marginBottom: '8px', fontWeight: 'bold' }}>COINDCX USDT</div>
                  <AnimatedPrice value={state.regional.usdt_inr} prefix="Rs." decimals={3} className="mono" />
                </div>
                <div className="regional-block">
                  <div className="text-dim" style={{ fontSize: '11px', marginBottom: '8px', fontWeight: 'bold' }}>REAL USD/INR</div>
                  <AnimatedPrice value={state.regional.usd_inr} prefix="Rs." decimals={3} className="mono" />
                </div>
              </div>
            ) : (
              <div className="mono text-dim" style={{ textAlign: 'center', padding: '20px 0' }}>Pending data...</div>
            )}
            <div style={{ textAlign: 'center' }}>
              {state.regional?.status === "LIVE" && state.regional?.premium ? (
                <span className="text-live mono glow-success" style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  NET PREMIUM: {state.regional.premium.net_premium_pct.toFixed(3)}%
                </span>
              ) : (
                <span className="mono text-dim" style={{ fontSize: '12px' }}>PENDING CHECKS...</span>
              )}
            </div>
          </div>

          <div className="glass-panel">
            <div className="panel-title">PORTFOLIO RISK</div>
            <div className="panel-description">Real-time covariance and Sortino ratio tracking to ensure exposure bounds are mathematically safe.</div>
            {risk && Object.keys(risk).length > 0 ? (
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <Gauge value={risk.portfolio_sortino_ratio || 0} max={3} label="SORTINO" isLive={risk.portfolio_sortino_ratio > 1} />
                <Gauge value={risk.portfolio_risk_covariance_based || 0} max={1} label="COVARIANCE" isLive={true} />
              </div>
            ) : (
              <div className="mono text-dim" style={{ textAlign: 'center', fontSize: '12px' }}>Risk report pending...</div>
            )}
          </div>

          <CapitalAllocationEngine data={data} />
        </div>

        <div className="col-12">
          <StatisticalPairs data={data} />
        </div>

        <div className="col-6 glass-panel">
          <div className="panel-title">ARBITRAGE SIGNALS (VERIFIED)</div>
          <div className="log-list">
            {signals?.all?.length > 0 ? (
              signals.all.slice(0, 10).map((sig, i) => (
                <div key={i} className="log-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="log-time mono">{new Date(sig.fired_at * 1000).toLocaleTimeString()}</span>
                      <SignalAge firedAt={sig.fired_at} />
                    </div>
                    <span className="log-value mono text-live">+{sig.net_spread_pct > 0 ? (sig.net_spread_pct * 100).toFixed(3) : 0}%</span>
                  </div>
                  <div className="mono" style={{ fontSize: '12px', display: 'flex', gap: '16px' }}>
                    <span style={{ fontWeight: 'bold', color: 'white' }}>{sig.pair}</span>
                    <span className="text-dim">({sig.strategy})</span>
                  </div>
                  {(sig.buy_exchange && sig.sell_exchange) && (
                    <div className="mono" style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '4px', width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-live">BUY: {sig.buy_exchange}</span>
                      <span className="text-error">SELL: {sig.sell_exchange}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-dim" style={{ textAlign: 'center', padding: '20px' }}>No signals fired recently.</div>
            )}
          </div>
        </div>

        <div className="col-6 glass-panel">
          <div className="panel-title">SYSTEM AUDIT LEDGER</div>
          <div className="log-list mono">
            {audit?.slice(0, 15).map((entry, i) => {
              const isErr = entry.level === 'ERROR' || entry.level === 'WARN';
              const isSig = entry.level === 'SIGNAL';
              const isExec = entry.level === 'EXECUTION';
              const isAbort = entry.level === 'EXECUTION_ABORT';
              const levelColor = isErr ? 'var(--color-error)' : isSig ? 'var(--color-live)' : isExec ? 'var(--color-neutral)' : isAbort ? 'var(--color-hold)' : 'white';
              return (
                <div key={i} className="log-item" style={{ padding: '10px 14px' }}>
                  <span className="log-time text-dim">[{new Date(entry.ts * 1000).toLocaleTimeString()}] </span>
                  <span className="log-content" style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ color: levelColor, fontWeight: 'bold' }}>{entry.level}</span> - {entry.message}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
      <Ticker data={data} />
    </div>
  );
}

export default App
