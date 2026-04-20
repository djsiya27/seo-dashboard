'use client';
import { BarChart2, RefreshCw, Newspaper } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header({ articleCount }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }));
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, []);

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'rgba(7,13,26,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      padding: '0 16px',
    }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(59,130,246,0.4)',
          }}>
            <BarChart2 size={18} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-space)', fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }} className="gradient-text">
              SEO Dashboard
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: -2 }}>Sunday World Analyser</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 13, color: 'var(--text-secondary)' }}>
            <Newspaper size={14} />
            <span><strong style={{ color: 'var(--text-primary)' }}>{articleCount}</strong> articles</span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px', fontSize: 13, color: 'var(--text-secondary)',
            padding: '4px 10px', borderRadius: 8,
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Live Feed
          </div>
          {time && (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
              🇿🇦 {time}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </header>
  );
}
