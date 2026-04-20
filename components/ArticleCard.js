'use client';
import Image from 'next/image';
import { ExternalLink, BarChart2, Clock, User, Tag } from 'lucide-react';
import { analyzeArticle } from '@/lib/seoAnalyzer';
import { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';

function getScoreColor(score) {
  if (score >= 70) return { text: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', label: 'Good' };
  if (score >= 45) return { text: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', label: 'Fair' };
  return { text: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', label: 'Poor' };
}

const CATEGORY_COLORS = {
  news: '#3b82f6', sports: '#10b981', soccer: '#10b981',
  business: '#f59e0b', world: '#8b5cf6', lifestyle: '#ec4899',
  bhekisisa: '#06b6d4', default: '#6366f1',
};

function getCatColor(cat) {
  const key = (cat || '').toLowerCase();
  return CATEGORY_COLORS[key] || CATEGORY_COLORS.default;
}

function ScoreRing({ score }) {
  const { text, bg, border, label } = getScoreColor(score);
  const r = 20, cx = 24, cy = 24;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', minWidth: 56 }}>
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={text} strokeWidth="4"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          transform="rotate(-90 24 24)"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
        <text x="24" y="28" textAnchor="middle" fill={text} fontSize="12" fontWeight="700" fontFamily="var(--font-space)">{score}</text>
      </svg>
      <span style={{ fontSize: 9, fontWeight: 600, color: text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
    </div>
  );
}

export default function ArticleCard({ article, onAnalyse }) {
  const score = useMemo(() => analyzeArticle(article).total, [article]);
  const { text: scoreColor, bg: scoreBg } = getScoreColor(score);
  const catColor = getCatColor(article.category);
  const timeAgo = useMemo(() => {
    try { return formatDistanceToNow(new Date(article.pubDate), { addSuffix: true }); }
    catch { return ''; }
  }, [article.pubDate]);

  return (
    <div className="glass-card fade-in-up" style={{ padding: '20px', display: 'flex', gap: '16px', cursor: 'default' }}>
      {/* Image */}
      {article.image && (
        <div style={{ flexShrink: 0, width: 100, height: 80, borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
          <Image src={article.image} alt={article.title} fill style={{ objectFit: 'cover' }} unoptimized />
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Top row */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
          <span style={{ background: `${catColor}22`, color: catColor, border: `1px solid ${catColor}44`, padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {article.category}
          </span>
          {timeAgo && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: 11, color: 'var(--text-muted)' }}>
              <Clock size={10} /> {timeAgo}
            </span>
          )}
          {article.author && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: 11, color: 'var(--text-muted)' }}>
              <User size={10} /> {article.author}
            </span>
          )}
        </div>

        {/* Title */}
        <h2 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 600, fontFamily: 'var(--font-space)', lineHeight: 1.4, color: 'var(--text-primary)' }}>
          <a href={article.link} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}
            onMouseEnter={e => e.target.style.color = '#60a5fa'}
            onMouseLeave={e => e.target.style.color = 'var(--text-primary)'}>
            {article.title}
          </a>
        </h2>

        {/* Excerpt */}
        <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {article.description}
        </p>

        {/* Bottom row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onAnalyse(article)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
              background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))',
              border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc',
              cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-inter)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59,130,246,0.35), rgba(139,92,246,0.35))'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))'; e.currentTarget.style.transform = 'none'; }}
          >
            <BarChart2 size={13} /> Analyse SEO
          </button>
          <a href={article.link} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            <ExternalLink size={12} /> Read article
          </a>
          <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)' }}>
            {article.wordCount} words
          </span>
        </div>
      </div>

      {/* Score ring */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        <ScoreRing score={score} />
      </div>
    </div>
  );
}
