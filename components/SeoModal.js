'use client';
import { X, BarChart2, Search, TrendingUp, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';

function getScoreGrade(score) {
  if (score >= 80) return { grade: 'A', color: '#10b981', label: 'Excellent' };
  if (score >= 65) return { grade: 'B', color: '#34d399', label: 'Good' };
  if (score >= 50) return { grade: 'C', color: '#f59e0b', label: 'Fair' };
  if (score >= 35) return { grade: 'D', color: '#f97316', label: 'Poor' };
  return { grade: 'F', color: '#ef4444', label: 'Critical' };
}

function DimensionBar({ dim }) {
  const pct = Math.round((dim.score / dim.max) * 100);
  const color = pct >= 70 ? '#10b981' : pct >= 45 ? '#f59e0b' : '#ef4444';
  const fillClass = pct >= 70 ? 'progress-fill-high' : pct >= 45 ? 'progress-fill-medium' : 'progress-fill-low';
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{dim.name}</span>
        <span style={{ fontSize: '13px', fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{dim.score}/{dim.max}</span>
      </div>
      <div className="progress-bar">
        <div className={`progress-fill ${fillClass}`} style={{ width: `${pct}%` }} />
      </div>
      <div style={{ marginTop: '6px' }}>
        {dim.notes.map((note, i) => (
          <p key={i} style={{ margin: '2px 0', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{note}</p>
        ))}
      </div>
    </div>
  );
}

export default function SeoModal({ article, seoData, onClose }) {
  const { grade, color, label } = getScoreGrade(seoData.total);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleKey); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-panel">
        {/* Header */}
        <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <BarChart2 size={16} color="#3b82f6" />
              <span style={{ fontSize: '12px', color: '#60a5fa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>SEO Analysis</span>
            </div>
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 600, fontFamily: 'var(--font-space)', color: 'var(--text-primary)', lineHeight: 1.4 }}>
              {article.title}
            </h2>
          </div>
          {/* Score badge */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              border: `3px solid ${color}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: `${color}15`,
              boxShadow: `0 0 20px ${color}30`,
            }}>
              <span style={{ fontSize: '22px', fontWeight: 800, color, fontFamily: 'var(--font-space)', lineHeight: 1 }}>{seoData.total}</span>
              <span style={{ fontSize: '10px', color, fontWeight: 600 }}>/100</span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{grade} — {label}</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', borderRadius: '6px', transition: 'all 0.2s', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px 24px', maxHeight: 'calc(90vh - 140px)', overflowY: 'auto' }}>
          {/* Score Dimensions */}
          <h3 style={{ margin: '0 0 16px', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Score Breakdown
          </h3>
          {seoData.dimensions.map((dim, i) => <DimensionBar key={i} dim={dim} />)}

          <div className="divider" style={{ margin: '20px 0' }} />

          {/* Top Keywords */}
          {seoData.topKeywords && seoData.topKeywords.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Search size={13} /> Detected Keywords
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {seoData.topKeywords.map((kw, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '5px 10px', borderRadius: '8px', fontSize: '12px',
                    background: kw.inTitle ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${kw.inTitle ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    color: kw.inTitle ? '#34d399' : 'var(--text-secondary)',
                  }}>
                    <span style={{ fontWeight: 600 }}>{kw.word}</span>
                    <span style={{ opacity: 0.6, fontSize: '11px' }}>{kw.density}%</span>
                    {kw.inTitle && <span title="In title" style={{ fontSize: '10px' }}>✓</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keyword Suggestions */}
          {seoData.keywordSuggestions && seoData.keywordSuggestions.length > 0 && (
            <div>
              <h3 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={13} /> Suggested Keywords to Rank Higher
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {seoData.keywordSuggestions.map((kw, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#60a5fa', minWidth: '18px' }}>#{i + 1}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-primary)', flex: 1 }}>{kw}</span>
                    <ChevronRight size={14} color="var(--text-muted)" />
                  </div>
                ))}
              </div>
              <p style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                💡 Try incorporating these keywords naturally into your title, subheadings, and first paragraph to improve search visibility.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
