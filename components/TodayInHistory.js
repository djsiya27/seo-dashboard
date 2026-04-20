'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock4, ChevronRight } from 'lucide-react';

function encodeSlug(slug) {
  return encodeURIComponent(slug);
}

export default function TodayInHistory() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/history');
        const data = await res.json();
        setEvents(data.events || []);
        setDate(data.date || '');
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const today = new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long' });

  return (
    <div className="glass-card" style={{ padding: '18px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Clock4 size={14} color="white" />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-space)', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
            Today in History
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Africa & South Africa · {today}</div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 10 }}>
              <div className="skeleton" style={{ width: 56, height: 56, borderRadius: 8, flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="skeleton" style={{ height: 12, width: '80%' }} />
                <div className="skeleton" style={{ height: 10, width: '60%' }} />
                <div className="skeleton" style={{ height: 10, width: '90%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: 13 }}>
          No historical events found for today
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {events.map((event, i) => (
            <Link
              key={i}
              href={`/history/${encodeSlug(event.slug)}`}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div style={{
                display: 'flex', gap: '10px', padding: '10px 8px',
                borderRadius: 10, transition: 'background 0.2s', cursor: 'pointer',
                position: 'relative',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(139,92,246,0.08)';
                  e.currentTarget.querySelector('.hist-arrow').style.opacity = '1';
                  e.currentTarget.querySelector('.hist-arrow').style.transform = 'translateX(3px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.querySelector('.hist-arrow').style.opacity = '0';
                  e.currentTarget.querySelector('.hist-arrow').style.transform = 'translateX(0)';
                }}>
                {/* Image */}
                <div style={{ flexShrink: 0, width: 56, height: 56, borderRadius: 8, overflow: 'hidden', background: 'rgba(139,92,246,0.15)', position: 'relative', border: '1px solid rgba(139,92,246,0.2)' }}>
                  {event.image ? (
                    <Image src={event.image} alt={event.title} fill style={{ objectFit: 'cover' }} unoptimized />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🏛️</div>
                  )}
                  {/* Year badge */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'rgba(0,0,0,0.75)', textAlign: 'center',
                    fontSize: 9, fontWeight: 700, color: '#c4b5fd', padding: '1px 0',
                  }}>
                    {event.year}
                  </div>
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 3,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {event.title}
                  </div>
                  <div style={{
                    fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.45,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {event.excerpt}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 10, color: '#a78bfa', fontWeight: 600 }}>Read full story →</div>
                </div>

                <ChevronRight size={12} className="hist-arrow" color="#8b5cf6" style={{ flexShrink: 0, alignSelf: 'center', opacity: 0, transition: 'all 0.2s' }} />
              </div>

              {i < events.length - 1 && <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '0 8px' }} />}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
