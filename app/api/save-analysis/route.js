import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'articles.json');

export async function POST(req) {
  try {
    const { link, aiScore } = await req.json();

    if (!link || aiScore === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const data = await fs.readFile(DATA_FILE, 'utf8');
    const articles = JSON.parse(data);

    const updatedArticles = articles.map(article => {
      if (article.link === link) {
        return { ...article, aiScore };
      }
      return article;
    });

    await fs.writeFile(DATA_FILE, JSON.stringify(updatedArticles, null, 2));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error saving analysis result:', err);
    return NextResponse.json({ error: 'Failed to save analysis result' }, { status: 500 });
  }
}
