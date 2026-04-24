export function decodeHtml(html) {
  if (!html) return '';
  const entities = {
    '&#8217;': "'",
    '&#8216;': "'",
    '&#8220;': '"',
    '&#8221;': '"',
    '&#8211;': '-',
    '&#8212;': '—',
    '&amp;': '&',
    '&quot;': '"',
    '&apos;': "'",
    '&lt;': '<',
    '&gt;': '>',
    '&#039;': "'",
    '&#8230;': '...'
  };
  return html.replace(/&#?[a-z0-9]+;/gi, (match) => entities[match] || match);
}
