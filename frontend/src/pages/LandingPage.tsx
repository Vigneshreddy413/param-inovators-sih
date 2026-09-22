import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import * as d3 from 'd3-geo';
import * as topojson from 'topojson-client';
import worldData from 'world-atlas/countries-110m.json';
import { getStatistics, getGeoJSON, getRiskEvents } from '../api/client';
import type { Statistics, GeoJSONFeature, ThermalEvent } from '../types';
import '../landing.css';

// -------------------------------------------------------------
// Procedural Sparkline Generation
// -------------------------------------------------------------
function generateProceduralSparkline(points: number, seed: number) {
  const data = [];
  let current = 20 + (seed % 10);
  for (let i = 0; i < points; i++) {
    data.push(current);
    current += (Math.random() - 0.4) * 15;
    if (current < 5) current = 5;
    if (current > 50) current = 50;
  }
  return data;
}

const Sparkline = ({ data, color }: { data: number[], color: string }) => {
  const max = Math.max(...data, 1);
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${data.length * 4} 30`} preserveAspectRatio="none">
      <path
        d={`M0,30 ${data.map((d, i) => `L${i * 4},${30 - (d / max) * 25}`).join(' ')}`}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const BarSparkline = ({ data }: { data: number[] }) => {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '24px' }}>
      {data.map((d, i) => (
        <div
          key={i}
          style={{
            width: '4px',
            height: `${(d / max) * 100}%`,
            background: i === data.length - 1 ? 'var(--lp-accent)' : 'rgba(212,66,30,0.2)',
            borderRadius: '1px'
          }}
        />
      ))}
    </div>
  );
};

// -------------------------------------------------------------
// Earth Canvas Component
// -------------------------------------------------------------
interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number; }

const EarthCanvas: React.FC<{ events: GeoJSONFeature[] }> = ({ events }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // Orthographic projection centered on India
    const projection = d3.geoOrthographic()
      .scale(width * 0.38)
      .translate([width / 2, height / 2])
      .clipAngle(90)
      .precision(0.5);
      
    let rotation = [78, -22, 0]; // Center lon, lat

    const path = d3.geoPath().projection(projection).context(ctx);
    const graticule = d3.geoGraticule10();
    
    // @ts-ignore
    const countries = topojson.feature(worldData, worldData.objects.countries);
    // @ts-ignore
    const india = countries.features.find((f: any) => f.id === '356' || f.properties?.name === 'India');

    let animationFrameId: number;
    let time = 0;
    const particles: Particle[] = [];

    const render = () => {
      time += 0.02;
      rotation[0] += 0.05; // very slow spin
      projection.rotate([rotation[0], rotation[1], rotation[2]]);
      
      ctx.clearRect(0, 0, width, height);

      // 1. Atmosphere rim
      ctx.beginPath();
      path({ type: 'Sphere' });
      ctx.fillStyle = 'rgba(255,255,255,0.01)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(200,200,200,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 2. Base sphere
      ctx.beginPath();
      path({ type: 'Sphere' });
      const grad = ctx.createRadialGradient(width/2 - 60, height/2 - 60, 20, width/2, height/2, width*0.4);
      grad.addColorStop(0, '#2a2a2a');
      grad.addColorStop(0.7, '#181818');
      grad.addColorStop(1, '#0a0a0a');
      ctx.fillStyle = grad;
      ctx.fill();
      
      // 3. Graticule
      ctx.beginPath();
      path(graticule);
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // 4. Countries
      ctx.beginPath();
      path(countries as any);
      ctx.fillStyle = '#1e1e1e';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // 5. India Highlight
      if (india) {
        ctx.beginPath();
        path(india as any);
        ctx.fillStyle = '#262626';
        ctx.fill();
        ctx.strokeStyle = 'rgba(212,66,30,0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 6. Thermal Events
      events.forEach(feature => {
        const coords = feature.geometry.coordinates as [number, number];
        const projected = projection(coords);
        if (projected) {
          const [x, y] = projected;
          const isAnomaly = feature.properties.is_anomalous;
          
          ctx.beginPath();
          ctx.arc(x, y, isAnomaly ? 2.5 : 1.5, 0, Math.PI * 2);
          
          if (isAnomaly) {
            const pulse = (Math.sin(time * 2 + coords[0]) + 1) / 2;
            ctx.fillStyle = `rgba(212,66,30,${0.6 + pulse * 0.4})`;
            ctx.shadowColor = 'rgba(212,66,30,0.8)';
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0;
          } else {
            ctx.fillStyle = 'rgba(212,66,30,0.6)';
            ctx.fill();
          }

          // Randomly spawn particles from thermal events
          if (Math.random() < 0.005) {
            particles.push({
              x, y,
              vx: (Math.random() - 0.5) * 0.5,
              vy: -Math.random() * 1,
              life: 0,
              maxLife: 100 + Math.random() * 50,
              color: 'rgba(212,66,30,',
              size: Math.random() * 1.5
            });
          }
        }
      });

      // 7. Orbital / Satellite Particles
      if (Math.random() < 0.05 && particles.length < 40) {
        // Spawn from orbital path (top right)
        particles.push({
          x: width * 0.8,
          y: height * 0.2,
          vx: -Math.random() * 1 - 0.5,
          vy: Math.random() * 1 + 0.5,
          life: 0,
          maxLife: 150 + Math.random() * 100,
          color: 'rgba(180,180,180,',
          size: Math.random() * 1
        });
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        const opacity = Math.sin((p.life / p.maxLife) * Math.PI);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${opacity})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [events]);

  return <canvas ref={canvasRef} width={800} height={800} className="lp-earth-canvas" />;
};

// -------------------------------------------------------------
// Main Landing Page
// -------------------------------------------------------------
const LandingPage: React.FC = () => {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [geoEvents, setGeoEvents] = useState<GeoJSONFeature[]>([]);
  const [topEvent, setTopEvent] = useState<ThermalEvent | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, geoData, riskData] = await Promise.all([
          getStatistics(),
          getGeoJSON(),
          getRiskEvents(1)
        ]);
        setStats(statsData);
        setGeoEvents(geoData.features || []);
        if (riskData.length > 0) {
          setTopEvent(riskData[0]);
        }
      } catch (err) {
        console.error("Error fetching landing data", err);
      }
    };
    fetchData();
  }, []);

  // Generate some aesthetic procedural sparkline data based on metrics
  const activeSparkline = useMemo(() => generateProceduralSparkline(20, 1), []);
  const anomalySparkline = useMemo(() => generateProceduralSparkline(20, 2), []);
  const prioritySparkline = useMemo(() => generateProceduralSparkline(20, 3), []);
  const indSparkline = useMemo(() => generateProceduralSparkline(20, 4), []);
  const cardBarSparkline = useMemo(() => generateProceduralSparkline(12, 5).map(v => v/2), []);

  return (
    <div className="landing-page">
      {/* Background Grid */}
      <div className="lp-grid-bg" />
      <div className="lp-grid-arc lp-grid-arc-1" />
      <div className="lp-grid-arc lp-grid-arc-2" />
      
      {/* Crosshairs */}
      <div className="lp-crosshair" style={{ top: '15%', left: '10%' }} />
      <div className="lp-crosshair" style={{ bottom: '25%', right: '5%' }} />
      <div style={{ position: 'absolute', top: '14%', left: '10%', paddingLeft: '12px', fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--lp-text-dim)'}}>
        26.8467° N<br/>80.9462° E
      </div>

      {/* Navigation */}
      <nav className="lp-navbar">
        <div className="lp-logo">
          <div className="lp-logo-mark">TS</div>
          Thermosentry
        </div>
        
        <ul className="lp-nav-links">
          <li><a href="#" className="active">Home <span style={{color:'var(--lp-accent)'}}>●</span></a></li>
          <li><a href="#">Mission</a></li>
          <li><a href="#">Technology</a></li>
          <li><a href="#">Intelligence</a></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><a href="#">Team</a></li>
        </ul>

        <div className="lp-nav-right">
          <div className="lp-live-badge">
            <div className="lp-live-dot" /> LIVE<br/><span style={{fontSize:'8px', color: '#ccc'}}>Satellite Feed</span>
          </div>
          <Link to="/dashboard" className="lp-nav-cta">Dashboard →</Link>
          <div style={{ cursor: 'pointer', opacity: 0.5 }}>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </div>
        </div>
      </nav>

      {/* 01 HERO */}
      <section className="lp-hero">
        <div className="lp-hero-text">
          <div className="lp-hero-eyebrow">SATELLITE THERMAL INTELLIGENCE</div>
          <h1 className="lp-hero-headline">
            SEE BEYOND<br/>
            <span className="highlight">THE HOTSPOT</span>
          </h1>
          <p className="lp-hero-body">
            THERMOSENTRY transforms raw satellite thermal observations into explainable, prioritized intelligence — helping analysts detect, understand, and act on potential industrial fires and persistent thermal sources.
          </p>
          
          <div className="lp-hero-ctas">
            <Link to="/dashboard" className="lp-btn-primary">Explore the Mission →</Link>
            <button className="lp-btn-secondary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M10 8l6 4-6 4V8z"/></svg>
              Watch Demo
            </button>
          </div>
        </div>

        <div className="lp-earth-scene">
          
          {/* Orbital System */}
          <div className="lp-orbital-system">
             <div className="lp-orbit-ring lp-orbit-ring-1" />
             <div className="lp-orbit-ring lp-orbit-ring-2" />
             <div className="lp-orbit-ring lp-orbit-ring-3" />
             
             {/* Primary Satellite Orbit Line */}
             <div className="lp-primary-orbit">
                <div className="lp-orbit-active-arc" />
             </div>

             {/* Satellite Element */}
             <div className="lp-satellite-wrapper">
               <div className="lp-satellite">
                 <div className="lp-sat-panel lp-sat-panel-l" />
                 <div className="lp-sat-body">
                    <div className="lp-sat-lens" />
                 </div>
                 <div className="lp-sat-panel lp-sat-panel-r" />
                 <div className="lp-sat-antenna" />
               </div>
             </div>
          </div>

          <div className="lp-globe-container">
            {/* Canvas */}
            <EarthCanvas events={geoEvents} />
            
            {/* Callouts (Positioned closer to Earth on right) */}
            <div className="lp-callouts-container">
              <div className="lp-callout lp-callout-1">
                <div className="lp-callout-line" />
                <div className="lp-callout-num">01</div>
                <div>
                  <h4>THERMAL OBSERVATION</h4>
                  <p>Real-time satellite coordinates.</p>
                </div>
              </div>
              
              <div className="lp-callout lp-callout-2">
                <div className="lp-callout-line" />
                <div className="lp-callout-num">02</div>
                <div>
                  <h4>TEMPORAL INTELLIGENCE</h4>
                  <p>Persistence and change tracking.</p>
                </div>
              </div>

              <div className="lp-callout lp-callout-3">
                <div className="lp-callout-line" />
                <div className="lp-callout-num">03</div>
                <div>
                  <h4>RISK PRIORITIZATION</h4>
                  <p>AI-driven analyst escalation.</p>
                </div>
              </div>
            </div>

            {/* Floating Data Card (Left of Earth) */}
            <div className="lp-data-card">
              <div className="lp-data-card-header">
                <div className="lp-data-card-square" />
                <div className="lp-data-card-title">{topEvent?.event_id || 'TH-000724'}</div>
                <div style={{marginLeft: 'auto', fontSize:'14px', color:'var(--lp-text-dim)'}}>→</div>
              </div>
              <div className="lp-data-row">
                <span className="lp-data-label">FRP (MW)</span>
                <span className="lp-data-val">{topEvent?.frp?.toFixed(1) || '86.7'}</span>
              </div>
              <div className="lp-data-row">
                <span className="lp-data-label">Risk Score</span>
                <span className="lp-data-val">
                  {topEvent?.risk?.risk_score?.toFixed(1) || '82.4'}
                  <span className="lp-data-badge">HIGH</span>
                </span>
              </div>
              <div className="lp-data-row">
                <span className="lp-data-label">Industrial Dist.</span>
                <span className="lp-data-val">{topEvent?.context?.distance_to_industry_km?.toFixed(1) || '0.6'} km</span>
              </div>
              <div className="lp-data-row">
                <span className="lp-data-label">Satellite</span>
                <span className="lp-data-val">{topEvent?.satellite || 'VIIRS (N20)'}</span>
              </div>
              <div className="lp-data-row">
                <span className="lp-data-label">Reliability</span>
                <span className="lp-data-val">{Math.round(topEvent?.evidence?.observation_reliability || 87)}%</span>
              </div>
              
              <div className="lp-data-sparklines">
                 <div style={{width: '60px'}}><Sparkline data={activeSparkline.slice(0, 10)} color="var(--lp-accent)" /></div>
                 <BarSparkline data={cardBarSparkline} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metric Strip */}
      <div className="lp-metric-strip">
        <div className="lp-metric-item">
          <div className="lp-metric-val">{stats?.total_active_events || 0}</div>
          <div className="lp-metric-label">Active Events</div>
          <div style={{height:'30px'}}><Sparkline data={activeSparkline} color="var(--lp-accent)" /></div>
        </div>
        <div className="lp-metric-item">
          <div className="lp-metric-val">{stats?.anomalous_events || 0}</div>
          <div className="lp-metric-label">Anomalous</div>
          <div style={{height:'30px'}}><Sparkline data={anomalySparkline} color="var(--lp-accent)" /></div>
        </div>
        <div className="lp-metric-item">
          <div className="lp-metric-val">{stats?.high_priority_events || 0}</div>
          <div className="lp-metric-label">High Priority</div>
          <div style={{height:'30px'}}><Sparkline data={prioritySparkline} color="var(--lp-accent)" /></div>
        </div>
        <div className="lp-metric-item">
          <div className="lp-metric-val">{stats?.industrial_context_events || 0}</div>
          <div className="lp-metric-label">Industrial Context</div>
          <div style={{height:'30px'}}><Sparkline data={indSparkline} color="var(--lp-accent)" /></div>
        </div>
        <div className="lp-metric-map">
          <div className="lp-metric-map-thumb" />
          <div className="lp-metric-map-text">Live Thermal<br/>Activity Map</div>
          <Link to="/dashboard" className="lp-metric-map-btn">→</Link>
        </div>
      </div>
      
      <div style={{ position: 'absolute', bottom: '40px', right: '48px', fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--lp-text-dim)', textAlign:'right', lineHeight: '1.5'}}>
        REAL DATA.<br/>REAL IMPACT.<br/><br/>
        <span style={{color:'var(--lp-text-secondary)'}}>POWERED BY<br/>
        <span style={{color:'var(--lp-accent)'}}>■</span> PARAM INNOVATORS<br/>
        SIH 2026</span>
      </div>
      <div style={{ position: 'absolute', bottom: '40px', left: '48px', fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--lp-text-dim)', letterSpacing:'1px', textTransform:'uppercase'}}>
        A SAFER TOMORROW<br/>THROUGH EARTH INTELLIGENCE
      </div>

      {/* 02 THE CHALLENGE */}
      <section className="lp-section" style={{ padding: '80px 48px' }}>
        <h3 className="lp-section-title" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--lp-accent)', letterSpacing: '2px', marginBottom: '16px' }}>THE CHALLENGE</h3>
        <h2 className="lp-section-headline" style={{ fontFamily: 'var(--font-sans)', fontSize: '48px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '24px' }}>A SMALL HOTSPOT<br/>CAN BE A BIG RISK</h2>
        <div className="lp-section-body" style={{ color: 'var(--lp-text-secondary)', maxWidth: '400px', lineHeight: '1.6' }}>
          <p>VAST DATA.<br/>LACK OF CONTEXT.<br/>NEED FOR TIMELY ACTION.</p>
        </div>
      </section>
    </div>
  );
};
export default LandingPage;
