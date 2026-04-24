import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: false }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: false }],
      ['enclosure', 'enclosure'],
      ['dc:creator', 'creator'],
    ],
  },
  timeout: 10000,
});

const DATA_FILE = path.join(process.cwd(), 'data', 'articles.json');

async function getStoredArticles() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveArticles(articles) {
  try {
    const dir = path.dirname(DATA_FILE);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(articles, null, 2));
  } catch (err) {
    console.error('Error saving articles to disk:', err);
  }
}

function extractImage(item) {
  // Try media:content
  if (item.mediaContent && item.mediaContent.$) {
    return item.mediaContent.$.url || null;
  }
  // Try media:thumbnail
  if (item.mediaThumbnail && item.mediaThumbnail.$) {
    return item.mediaThumbnail.$.url || null;
  }
  // Try enclosure
  if (item.enclosure && item.enclosure.url) {
    return item.enclosure.url;
  }
  // Try to find image in content:encoded or description
  const html = item['content:encoded'] || item.content || item.contentSnippet || '';
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

function extractCategory(item) {
  if (item.categories && item.categories.length > 0) {
    return item.categories[0];
  }
  // Extract from link
  if (item.link) {
    const parts = item.link.split('/').filter(Boolean);
    if (parts.length >= 4) return parts[3];
  }
  return 'News';
}

function cleanText(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80);
}

export async function fetchArticles() {
  try {
    const storedArticles = await getStoredArticles();
    
    // Fetch multiple pages to get "yesterday's" articles
    const urls = [
      'https://sundayworld.co.za/feed/',
      'https://sundayworld.co.za/feed/?paged=2',
      'https://sundayworld.co.za/feed/?paged=3'
    ];
    
    const allFetchedItems = [];
    
    for (const url of urls) {
      try {
        const feed = await parser.parseURL(url);
        allFetchedItems.push(...feed.items);
      } catch (e) {
        console.error(`Error fetching RSS page ${url}:`, e);
      }
    }
    
    const fetchedArticles = allFetchedItems.map((item, index) => {
      const rawContent = item['content:encoded'] || item.contentSnippet || item.description || '';
      const description = cleanText(rawContent);
      const excerpt = description.substring(0, 300);

      return {
        id: `article-${item.guid || item.link || index}`,
        slug: generateSlug(item.title || `article-${index}`),
        title: item.title || 'Untitled',
        link: item.link || '#',
        description: excerpt,
        fullText: description,
        rawHtml: rawContent,
        pubDate: item.pubDate || new Date().toISOString(),
        author: item.creator || item.author || 'Sunday World',
        category: extractCategory(item),
        image: extractImage(item),
        wordCount: description.split(/\s+/).filter(Boolean).length,
      };
    });

    // Merge logic: Update existing articles with new data, keep AI scores
    const articleMap = new Map(storedArticles.map(a => [a.link, a]));
    let hasChanges = false;
    
    fetchedArticles.forEach(a => {
      const existing = articleMap.get(a.link);
      if (existing) {
        // Update with new data but keep the AI score if it exists
        const updated = { ...a, aiScore: existing.aiScore };
        // Check if anything actually changed (like the image)
        if (JSON.stringify(existing) !== JSON.stringify(updated)) {
          articleMap.set(a.link, updated);
          hasChanges = true;
        }
      } else {
        articleMap.set(a.link, a);
        hasChanges = true;
      }
    });

    if (hasChanges || storedArticles.length === 0) {
      const allArticles = Array.from(articleMap.values())
        .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

      await saveArticles(allArticles);
      return allArticles;
    }
    
    return storedArticles;
  } catch (err) {
    console.error('RSS fetch error:', err);
    return await getStoredArticles();
  }
}
