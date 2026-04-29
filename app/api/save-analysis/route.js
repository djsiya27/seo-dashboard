import { NextResponse } from 'next/server';
import { getStoredArticles, saveArticles } from '@/lib/rss';

export async function POST(req) {
  try {
    const { link, aiScore } = await req.json();

    if (!link || aiScore === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const articles = await getStoredArticles();

    const updatedArticles = articles.map(article => {
      if (article.link === link) {
        return { ...article, aiScore };
      }
      return article;
    });

    await saveArticles(updatedArticles);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error saving analysis result:', err);
    return NextResponse.json({ error: 'Failed to save analysis result' }, { status: 500 });
  }
}
