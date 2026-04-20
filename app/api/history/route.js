import { NextResponse } from 'next/server';

export const revalidate = 86400; // 24h

const SA_HISTORY_DATA = {
  '04-18': [
    {
      slug: 'first-democratic-election-sa-1994',
      year: 1994,
      title: 'South Africa Holds First Democratic Election',
      excerpt: 'Millions of South Africans voted for the first time in the country\'s first fully democratic election, electing Nelson Mandela as president.',
      fullText: 'On April 27, 1994 South Africa held its first fully democratic election, a watershed moment that ended decades of apartheid. Millions of Black South Africans voted for the first time in their lives. The African National Congress, led by Nelson Mandela, won an overwhelming majority. This election marked the transition from apartheid to democracy and is celebrated as Freedom Day. Long queues stretched for miles outside polling stations as citizens exercised their right to vote for the very first time.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Nelson_Mandela-2008_%28edit%29.jpg/440px-Nelson_Mandela-2008_%28edit%29.jpg',
      tags: ['Democracy', 'Nelson Mandela', 'ANC', 'Freedom Day'],
    },
    {
      slug: 'sharpeville-massacre-anniversary',
      year: 1960,
      title: 'Sharpeville Massacre Shocks the World',
      excerpt: 'South African police opened fire on peaceful protesters in Sharpeville, killing 69 people and wounding 180, sparking global outrage against apartheid.',
      fullText: 'On March 21, 1960, South African police opened fire on a crowd of approximately 7,000 Black South Africans who had gathered outside the Sharpeville police station to protest the pass laws. The police fired 705 rounds into the crowd, killing 69 people and wounding at least 180, many of whom were shot in the back as they fled. The Sharpeville Massacre, as it became known, shocked the world and is now commemorated as Human Rights Day in South Africa. The incident led to international condemnation and marked a turning point in the struggle against apartheid.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Sharpeville_massacre.jpg/440px-Sharpeville_massacre.jpg',
      tags: ['Apartheid', 'Human Rights', 'Sharpeville', 'History'],
    },
  ],
};

function getTodayKey() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${m}-${day}`;
}

async function fetchWikipediaHistory() {
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
    const saTerms = ['south africa', 'africa', 'mandela', 'apartheid', 'zulu', 'xhosa', 'cape town', 'johannesburg', 'pretoria', 'soweto', 'african', 'boer', 'natal'];
    const saEvents = events.filter(e => {
      const text = (e.text || '').toLowerCase();
      return saTerms.some(t => text.includes(t));
    });
    const source = saEvents.length >= 2 ? saEvents : events.slice(0, 5);
    return source.slice(0, 4).map((e, i) => {
      const page = e.pages && e.pages[0];
      const thumb = page && page.thumbnail;
      // Build a safe slug: prefer page.key, else derive from text, else use index
      const rawSlug = (page && page.key)
        || (e.text ? e.text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').substring(0, 60) : null)
        || `history-event-${i}-${e.year || 'unknown'}`;
      const slug = rawSlug.replace(/^-+|-+$/g, '') || `event-${i}`;
      return {
        slug,
        year: e.year,
        title: e.text ? e.text.substring(0, 80) : 'Historical Event',
        excerpt: e.text ? e.text.substring(0, 160) + '...' : '',
        fullText: e.text || '',
        image: thumb ? thumb.source : null,
        wikiUrl: page ? `https://en.wikipedia.org/wiki/${page.key}` : null,
        tags: ['History', 'Africa'],
      };
    });
  } catch { return null; }
}

export async function GET() {
  const key = getTodayKey();
  const live = await fetchWikipediaHistory();
  const events = live || SA_HISTORY_DATA[key] || SA_HISTORY_DATA['04-18'];
  return NextResponse.json({ events, date: key, fetchedAt: new Date().toISOString() });
}
