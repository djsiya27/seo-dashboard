import Parser from 'rss-parser';

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
    const feed = await parser.parseURL('https://sundayworld.co.za/feed/');
    return feed.items.map((item, index) => {
      const description = cleanText(item['content:encoded'] || item.contentSnippet || item.description || '');
      const excerpt = description.substring(0, 300);

      return {
        id: `article-${index}-${Date.now()}`,
        slug: generateSlug(item.title || `article-${index}`),
        title: item.title || 'Untitled',
        link: item.link || '#',
        description: excerpt,
        fullText: description,
        pubDate: item.pubDate || new Date().toISOString(),
        author: item.creator || item.author || 'Sunday World',
        category: extractCategory(item),
        image: extractImage(item),
        wordCount: description.split(/\s+/).filter(Boolean).length,
      };
    });
  } catch (err) {
    console.error('RSS fetch error:', err);
    return [];
  }
}
