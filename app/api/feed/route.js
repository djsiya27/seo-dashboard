import { NextResponse } from 'next/server';
import { fetchArticles } from '@/lib/rss';

export const revalidate = 300; // 5 min cache

export async function GET() {
  try {
    const articles = await fetchArticles();
    return NextResponse.json({ articles, count: articles.length, fetchedAt: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ error: err.message, articles: [] }, { status: 500 });
  }
}
