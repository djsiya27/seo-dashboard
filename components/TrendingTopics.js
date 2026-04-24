'use client';
import { useState, useEffect } from 'react';
import { TrendingUp, Flame, RefreshCw } from 'lucide-react';

const CATEGORY_COLORS = {
  Sport: '#10b981', Energy: '#f59e0b', Finance: '#3b82f6',
  Politics: '#8b5cf6', Environment: '#06b6d4', Crime: '#ef4444',
  Tourism: '#ec4899', Trending: '#6366f1', Default: '#94a3b8',
};

function getCatColor(cat) {
  return CATEGORY_COLORS[cat] || CATEGORY_COLORS.Default;
}

function TrendBar({ index, total }) {
  const width = Math.max(20, 100 - (index / total) * 75);
  return (
    <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', marginTop: 4 }}>
      <div style={{
        height: '100%', borderRadius: 2, width: `${width}%`,
        background: `linear-gradient(90deg, #3b82f6, #8b5cf6)`,
        transition: 'width 1s ease',
      }} />
    </div>
  );
}

export default function TrendingTopics() {
  const [trends, setTrends] = useState([]);
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/trends');
      const data = await res.json();
      setTrends(data.trends || []);
      setSource(data.source || '');
      setLastUpdated(new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }));
    } catch {
      setTrends([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="glass-card" style={{ padding: '18px' }}>
      {/* Widget Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #ef4444, #f97316)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Flame size={14} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-space)', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
              Trending Searches
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              {source === 'google' ? '🟢 Google Trends' : '📌 Curated'}
              {lastUpdated && ` · ${lastUpdated}`}
            </div>
          </div>
        </div>
        <button onClick={load} title="Refresh" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6, transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      {/* Trend List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 36, borderRadius: 8 }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {trends.map((trend, i) => (
            <div key={i} style={{
              padding: '8px 10px', borderRadius: 8, cursor: 'default',
              transition: 'background 0.2s',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{
                minWidth: 20, fontSize: 11, fontWeight: 700,
                color: i < 3 ? '#f59e0b' : 'var(--text-muted)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {i < 3 ? ['🥇', '🥈', '🥉'][i] : `${i + 1}`}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {trend.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4,
                    background: `${getCatColor(trend.category)}18`,
                    color: getCatColor(trend.category),
                    border: `1px solid ${getCatColor(trend.category)}30`,
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>{trend.category}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{trend.traffic}</span>
                </div>
                <TrendBar index={i} total={trends.length} />
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
