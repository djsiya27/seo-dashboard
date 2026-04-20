import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, ExternalLink, BookOpen } from 'lucide-react';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return {
    title: `${decodeURIComponent(slug).replace(/-/g, ' ')} | Today in History`,
    description: 'Historical event from South African and African history',
  };
}

async function getEvent(slug) {
  try {
    const d = new Date();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'SEODashboard/1.0 (educational)' },
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error('wiki fail');
    const data = await res.json();
    const events = data.events || [];
    const decodedSlug = decodeURIComponent(slug);

    function makeTextSlug(text) {
      return (text || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').substring(0, 60).replace(/^-+|-+$/g, '');
    }

    let found = events.find(e => {
      const page = e.pages && e.pages[0];
      return page && page.key === decodedSlug;
    });
    if (!found) found = events.find(e => makeTextSlug(e.text) === decodedSlug);
    if (!found) {
      found = events.find(e => {
        const ts = makeTextSlug(e.text);
        return ts.startsWith(decodedSlug.substring(0, 20)) || decodedSlug.startsWith(ts.substring(0, 20));
      });
    }
    if (!found) return null;

    const page = found.pages && found.pages[0];
    const thumb = page && page.thumbnail;
    return {
      slug: decodedSlug,
      year: found.year,
      title: found.text || 'Historical Event',
      fullText: found.text || '',
      excerpt: found.text ? found.text.substring(0, 200) + '...' : '',
      image: thumb ? thumb.source : null,
      wikiUrl: page ? `https://en.wikipedia.org/wiki/${page.key}` : null,
      tags: ['History', 'Africa'],
      pages: found.pages || [],
    };
  } catch { return null; }
}

const FALLBACK_EVENTS = {
  'first-democratic-election-sa-1994': {
    slug: 'first-democratic-election-sa-1994',
    year: 1994,
    title: 'South Africa Holds First Democratic Election',
    fullText: `On April 27, 1994, South Africa held its first fully democratic election, a watershed moment that ended decades of apartheid rule. Millions of Black South Africans voted for the first time in their lives. The African National Congress (ANC), led by Nelson Mandela, won an overwhelming majority of the vote.

This election marked the transition from apartheid to democracy and is celebrated annually as Freedom Day, a public holiday. Long queues stretched for miles outside polling stations as citizens exercised their right to vote for the very first time. International observers declared the election free and fair.

Nelson Mandela was inaugurated as the first democratically elected President of South Africa on May 10, 1994. His inauguration was attended by dignitaries from around the world, including US Vice President Al Gore and First Lady Hillary Clinton.

The election was a culmination of decades of struggle by the anti-apartheid movement, international pressure, and the negotiations that began after the unbanning of the ANC in 1990 and the release of Nelson Mandela after 27 years in prison.`,
    excerpt: 'Millions of South Africans voted for the first time, electing Nelson Mandela as president.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Nelson_Mandela-2008_%28edit%29.jpg/440px-Nelson_Mandela-2008_%28edit%29.jpg',
    wikiUrl: 'https://en.wikipedia.org/wiki/1994_South_African_general_election',
    tags: ['Democracy', 'Nelson Mandela', 'ANC', 'Freedom Day'],
    pages: [],
  },
};

export default async function HistoryEventPage({ params }) {
  const { slug } = await params;
  let event = await getEvent(slug);

  if (!event) {
    event = FALLBACK_EVENTS[decodeURIComponent(slug)] || {
      slug: decodeURIComponent(slug),
      year: 'Unknown',
      title: decodeURIComponent(slug).replace(/-/g, ' '),
      fullText: 'Full details for this historical event are not available. Please check Wikipedia for more information.',
      excerpt: 'Historical event details unavailable.',
      image: null,
      wikiUrl: `https://en.wikipedia.org/wiki/${slug}`,
      tags: ['History'],
      pages: [],
    };
  }

  const todayLabel = new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long' });

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <style>{`
        .hist-back-link { display:flex;align-items:center;gap:8px;text-decoration:none;color:var(--text-secondary);font-size:14px;transition:color 0.2s; }
        .hist-back-link:hover { color:var(--text-primary); }
        .wiki-link { display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:var(--text-secondary);transition:all 0.2s; }
        .wiki-link:hover { background:rgba(255,255,255,0.12);color:var(--text-primary); }
        .related-link { display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);text-decoration:none;transition:all 0.2s; }
        .related-link:hover { background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.12); }
      `}</style>

      {/* Top Nav */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(7,13,26,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 24px',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" className="hist-back-link">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
            <BookOpen size={13} />
            Today in History
          </div>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Year badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 100, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', marginBottom: 20 }}>
          <Calendar size={13} color="#a78bfa" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#a78bfa', fontVariantNumeric: 'tabular-nums' }}>
            {event.year} &middot; {todayLabel}
          </span>
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 700, lineHeight: 1.3, marginBottom: 20, color: 'var(--text-primary)' }}>
          {event.title}
        </h1>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
            {event.tags.map((tag, i) => (
              <span key={i} style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Featured Image */}
        {event.image && (
          <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 32, position: 'relative', height: 320, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Image src={event.image} alt={event.title} fill style={{ objectFit: 'cover' }} unoptimized />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(7,13,26,0.6) 0%, transparent 60%)' }} />
            <div style={{ position: 'absolute', bottom: 16, left: 16 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>📷 Image via Wikimedia Commons</span>
            </div>
          </div>
        )}

        {/* Article body */}
        <div className="glass-card" style={{ padding: '28px 32px', marginBottom: 24 }}>
          <div style={{ fontSize: 15, lineHeight: 1.85, color: 'var(--text-secondary)' }}>
            {event.fullText.split('\n\n').map((para, i) => (
              para.trim() ? <p key={i} style={{ marginBottom: 18, marginTop: 0 }}>{para.trim()}</p> : null
            ))}
          </div>
        </div>

        {/* Related Wikipedia pages */}
        {event.pages && event.pages.length > 0 && (
          <div className="glass-card" style={{ padding: '20px 24px', marginBottom: 24 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14, marginTop: 0 }}>
              Related Articles
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {event.pages.slice(0, 4).map((page, i) => (
                <a key={i} href={`https://en.wikipedia.org/wiki/${page.key}`} target="_blank" rel="noopener noreferrer" className="related-link">
                  {page.thumbnail && (
                    <div style={{ width: 36, height: 36, borderRadius: 6, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                      <Image src={page.thumbnail.source} alt={page.title} fill style={{ objectFit: 'cover' }} unoptimized />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{page.title}</div>
                    {page.description && <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{page.description}</div>}
                  </div>
                  <ExternalLink size={12} color="var(--text-muted)" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Wikipedia source link */}
        {event.wikiUrl && (
          <div style={{ textAlign: 'center' }}>
            <a href={event.wikiUrl} target="_blank" rel="noopener noreferrer" className="wiki-link">
              <ExternalLink size={14} />
              Read more on Wikipedia
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
