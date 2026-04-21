import { NextResponse } from 'next/server';

export const revalidate = 1800;

const SA_FALLBACK_TRENDS = [
  { title: 'Mamelodi Sundowns CAF Final', traffic: '500K+', category: 'Sport' },
  { title: 'Load Shedding Schedule 2025', traffic: '450K+', category: 'Energy' },
  { title: 'South Africa Budget 2025', traffic: '380K+', category: 'Finance' },
  { title: 'ANC Policy Conference', traffic: '320K+', category: 'Politics' },
  { title: 'Eskom Stage 4', traffic: '290K+', category: 'Energy' },
  { title: 'FIFA World Cup 2026 SA', traffic: '270K+', category: 'Sport' },
  { title: 'Cape Town Water Crisis', traffic: '240K+', category: 'Environment' },
  { title: 'Rand Dollar Exchange Rate', traffic: '220K+', category: 'Finance' },
  { title: 'Gauteng Crime Statistics', traffic: '200K+', category: 'Crime' },
  { title: 'Orlando Pirates Log Leaders', traffic: '190K+', category: 'Sport' },
  { title: 'South Africa Tourism Growth', traffic: '170K+', category: 'Tourism' },
  { title: 'Cyril Ramaphosa Speech', traffic: '160K+', category: 'Politics' },
];

async function tryGoogleTrends() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch('https://trends.google.com/trending/rss?geo=ZA', {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/rss+xml' },
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error('blocked');
    const xml = await res.text();
    const items = [];
    const titleRe = /<item>[\s\S]*?<title>([^<]+)<\/title>/g;
    const trafficRe = /<ht:approx_traffic>([^<]+)<\/ht:approx_traffic>/g;
    let tm; let i = 0;
    while ((tm = titleRe.exec(xml)) && i < 12) {
      const tr = trafficRe.exec(xml);
      // clean up any potential CDATA just in case it ever returns
      const cleanTitle = tm[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim();
      items.push({ title: cleanTitle, traffic: tr ? tr[1] : 'Trending', category: 'Trending' });
      i++;
    }
    return items.length > 0 ? items : null;
  } catch { return null; }
}

export async function GET() {
  const live = await tryGoogleTrends();
  const trends = live || SA_FALLBACK_TRENDS;
  return NextResponse.json({ trends, source: live ? 'google' : 'curated', fetchedAt: new Date().toISOString() });
}
