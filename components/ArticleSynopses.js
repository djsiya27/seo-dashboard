'use client';
import Image from 'next/image';
import { FileText, ExternalLink } from 'lucide-react';

function generateSynopsis(description, title) {
  if (!description) return 'No summary available.';
  const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 20);
  if (sentences.length === 0) return description.substring(0, 120) + '...';
  return sentences[0].trim() + '.';
}

export default function ArticleSynopses({ articles }) {
  const items = (articles || []).slice(0, 6);

  return (
    <div className="glass-card" style={{ padding: '18px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FileText size={14} color="white" />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-space)', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
            Article Synopses
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{items.length} latest articles</div>
        </div>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: 13 }}>
          No articles available
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {items.map((article, i) => {
            const synopsis = generateSynopsis(article.description, article.title);
            return (
              <a
                key={i}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div style={{
                  display: 'flex', gap: '10px', padding: '10px 8px',
                  borderRadius: 10, transition: 'background 0.2s', cursor: 'pointer',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  {/* Thumbnail */}
                  <div style={{ flexShrink: 0, width: 52, height: 52, borderRadius: 8, overflow: 'hidden', background: 'rgba(255,255,255,0.06)', position: 'relative' }}>
                    {article.image ? (
                      <Image src={article.image} alt={article.title} fill style={{ objectFit: 'cover' }} unoptimized />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📰</div>
                    )}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 12, fontWeight: 600, color: 'var(--text-primary)',
                      lineHeight: 1.4, marginBottom: 3,
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {article.title}
                    </div>
                    <div style={{
                      fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4,
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {synopsis}
                    </div>
                  </div>

                  <ExternalLink size={11} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
