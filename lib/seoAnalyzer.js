// ─── SEO Scoring Engine ──────────────────────────────────────────────────────
// Scores articles on 6 dimensions, each returning a sub-score 0-100.
// Final score is a weighted average out of 100.

const POWER_WORDS = [
  'ultimate', 'essential', 'best', 'top', 'how', 'why', 'what', 'guide',
  'tips', 'secrets', 'proven', 'exclusive', 'breaking', 'new', 'free',
  'easy', 'fast', 'powerful', 'important', 'critical', 'revealed', 'shocking',
];

const STOP_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with',
  'by','from','is','are','was','were','be','been','being','have','has',
  'had','do','does','did','will','would','could','should','may','might',
  'shall','can','this','that','these','those','it','its','their','our',
  'your','my','we','you','he','she','they','them','his','her','as','up',
  'out','if','not','so','into','than','then','than','about','after',
  'before','while','during','between','through','over','under',
]);

// ── 1. Title Quality (20pts) ──────────────────────────────────────────────────
function scoreTitleQuality(title) {
  if (!title) return { score: 0, notes: ['No title found'] };
  const notes = [];
  let score = 0;

  const len = title.length;
  if (len >= 50 && len <= 60) { score += 8; notes.push('✓ Title length is optimal (50–60 chars)'); }
  else if (len >= 40 && len < 50) { score += 5; notes.push('⚠ Title slightly short — aim for 50-60 chars'); }
  else if (len > 60 && len <= 70) { score += 5; notes.push('⚠ Title slightly long — aim for 50-60 chars'); }
  else if (len > 70) { score += 2; notes.push('✗ Title too long (>70 chars), may be truncated in SERPs'); }
  else { score += 2; notes.push('✗ Title too short — expand to 50-60 chars'); }

  const lower = title.toLowerCase();
  const foundPowerWords = POWER_WORDS.filter(w => lower.includes(w));
  if (foundPowerWords.length > 0) {
    score += 6;
    notes.push(`✓ Power words detected: ${foundPowerWords.slice(0, 3).join(', ')}`);
  } else {
    notes.push('⚠ No power words — consider adding one for higher CTR');
  }

  if (/\d/.test(title)) { score += 6; notes.push('✓ Contains numbers — boosts click-through rate'); }
  else { notes.push('⚠ No numbers — listicles and stats improve CTR'); }

  return { score: Math.min(score, 20), notes };
}

// ── 2. Meta Description (15pts) ───────────────────────────────────────────────
function scoreMetaDescription(excerpt) {
  if (!excerpt) return { score: 0, notes: ['No description/excerpt found'] };
  const notes = [];
  let score = 0;
  const len = excerpt.length;

  if (len >= 120 && len <= 160) { score += 8; notes.push('✓ Meta description length is optimal (120–160 chars)'); }
  else if (len >= 80 && len < 120) { score += 5; notes.push('⚠ Description a bit short — aim for 120-160 chars'); }
  else if (len > 160 && len <= 200) { score += 4; notes.push('⚠ Description slightly long — may be cut off in SERPs'); }
  else if (len > 200) { score += 2; notes.push('✗ Description too long — trim to 160 chars'); }
  else { score += 2; notes.push('✗ Description very short — expand significantly'); }

  const lower = excerpt.toLowerCase();
  if (/learn|discover|find out|read|explore|see how|click/i.test(lower)) {
    score += 4; notes.push('✓ Contains call-to-action language');
  } else {
    notes.push('⚠ No call-to-action — add "Learn more", "Discover" etc.');
  }

  const hasPunctuation = /[.!?]$/.test(excerpt.trim());
  if (hasPunctuation) { score += 3; notes.push('✓ Description ends with punctuation'); }
  else { notes.push('⚠ Description should end with a full stop'); }

  return { score: Math.min(score, 15), notes };
}

// ── 3. Keyword Density (20pts) ────────────────────────────────────────────────
function scoreKeywordDensity(title, fullText) {
  const words = fullText.toLowerCase().split(/\W+/).filter(w => w.length > 3 && !STOP_WORDS.has(w));
  const titleWords = title.toLowerCase().split(/\W+/).filter(w => w.length > 3 && !STOP_WORDS.has(w));

  const freq = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });

  const total = words.length || 1;
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  const topKeyword = sorted[0];

  const notes = [];
  let score = 0;

  if (!topKeyword) return { score: 0, notes: ['Insufficient text to analyse'], topKeywords: [] };

  const density = ((topKeyword[1] / total) * 100).toFixed(1);
  const dn = parseFloat(density);

  if (dn >= 1 && dn <= 3) { score += 10; notes.push(`✓ Keyword density is optimal: "${topKeyword[0]}" at ${density}%`); }
  else if (dn > 3 && dn <= 5) { score += 6; notes.push(`⚠ Possible keyword stuffing: "${topKeyword[0]}" at ${density}%`); }
  else if (dn < 1) { score += 4; notes.push(`⚠ Low keyword density: "${topKeyword[0]}" at ${density}%`); }
  else { score += 2; notes.push(`✗ Keyword over-stuffed: "${topKeyword[0]}" at ${density}%`); }

  // Check primary keyword in title
  const primaryInTitle = titleWords.some(tw => tw === topKeyword[0] || tw.includes(topKeyword[0]));
  if (primaryInTitle) { score += 10; notes.push('✓ Primary keyword appears in title'); }
  else { notes.push('⚠ Primary keyword not found in title — consider adding it'); }

  const topKeywords = sorted.slice(0, 8).map(([word, count]) => ({
    word,
    count,
    density: ((count / total) * 100).toFixed(1),
    inTitle: titleWords.some(tw => tw.includes(word)),
  }));

  return { score: Math.min(score, 20), notes, topKeywords };
}

// ── 4. Content Length (15pts) ─────────────────────────────────────────────────
function scoreContentLength(wordCount) {
  const notes = [];
  let score = 0;

  if (wordCount >= 1200) { score = 15; notes.push(`✓ Excellent content length: ${wordCount} words`); }
  else if (wordCount >= 600) { score = 11; notes.push(`✓ Good content length: ${wordCount} words (aim for 1200+)`); }
  else if (wordCount >= 300) { score = 7; notes.push(`⚠ Content is thin: ${wordCount} words — Google prefers 600+`); }
  else { score = 3; notes.push(`✗ Very thin content: ${wordCount} words — expand significantly`); }

  return { score, notes };
}

// ── 5. Readability (15pts) ────────────────────────────────────────────────────
function scoreReadability(fullText) {
  const notes = [];
  let score = 0;

  const sentences = fullText.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const totalWords = fullText.split(/\s+/).length;
  const avgSentenceLen = sentences.length > 0 ? totalWords / sentences.length : 999;

  if (avgSentenceLen >= 15 && avgSentenceLen <= 20) { score += 8; notes.push(`✓ Avg sentence length is ideal: ${avgSentenceLen.toFixed(0)} words`); }
  else if (avgSentenceLen >= 10 && avgSentenceLen < 15) { score += 6; notes.push(`⚠ Sentences slightly short: ${avgSentenceLen.toFixed(0)} words avg`); }
  else if (avgSentenceLen > 20 && avgSentenceLen <= 30) { score += 5; notes.push(`⚠ Sentences slightly long: ${avgSentenceLen.toFixed(0)} words — try splitting them`); }
  else if (avgSentenceLen > 30) { score += 2; notes.push(`✗ Sentences too long: ${avgSentenceLen.toFixed(0)} words avg — readers may disengage`); }
  else { score += 4; }

  // Passive voice detection (simplified)
  const passiveMatches = fullText.match(/\b(is|are|was|were|been|being)\s+\w+ed\b/gi) || [];
  const passiveRatio = (passiveMatches.length / (sentences.length || 1));
  if (passiveRatio < 0.1) { score += 7; notes.push('✓ Low passive voice usage — content reads actively'); }
  else if (passiveRatio < 0.2) { score += 4; notes.push('⚠ Some passive voice — consider making sentences more active'); }
  else { score += 1; notes.push('✗ High passive voice — rewrite for more direct, active sentences'); }

  return { score: Math.min(score, 15), notes };
}

// ── 6. Structural SEO (15pts) ─────────────────────────────────────────────────
function scoreStructure(fullText, link) {
  const notes = [];
  let score = 0;

  // Check for headings (h2/h3 markers in raw text)
  const headingMatches = fullText.match(/##\s+\w|<h[2-4]/gi) || [];
  if (headingMatches.length >= 2) { score += 6; notes.push(`✓ Has ${headingMatches.length} sub-headings — good structure`); }
  else if (headingMatches.length === 1) { score += 3; notes.push('⚠ Only one sub-heading found — add more for better scannability'); }
  else { notes.push('✗ No sub-headings detected — add H2/H3s to structure content'); }

  // Check for external links
  const extLinks = (fullText.match(/https?:\/\//gi) || []).length;
  if (extLinks >= 2) { score += 5; notes.push(`✓ ${extLinks} outbound links — good for authority signals`); }
  else if (extLinks === 1) { score += 3; notes.push('⚠ Only 1 outbound link — add 2-3 authoritative sources'); }
  else { notes.push('⚠ No outbound links detected — link to authoritative sources'); }

  // Check URL structure
  if (link && !link.includes('?') && link.split('/').length <= 6) {
    score += 4; notes.push('✓ URL structure is clean and SEO-friendly');
  } else if (link) {
    score += 2; notes.push('⚠ URL could be cleaner (shorter, no query strings)');
  }

  return { score: Math.min(score, 15), notes };
}

// ── Master Analyser ───────────────────────────────────────────────────────────
export function analyzeArticle(article) {
  const title = scoreTitle(article);
  const meta = scoreMetaDescription(article.description);
  const keywords = scoreKeywordDensity(article.title, article.fullText || article.description);
  const length = scoreContentLength(article.wordCount);
  const readability = scoreReadability(article.fullText || article.description);
  const structure = scoreStructure(article.fullText || article.description, article.link);

  const total = title.score + meta.score + keywords.score + length.score + readability.score + structure.score;

  return {
    total,
    dimensions: [
      { name: 'Title Quality', score: title.score, max: 20, notes: title.notes },
      { name: 'Meta Description', score: meta.score, max: 15, notes: meta.notes },
      { name: 'Keyword Density', score: keywords.score, max: 20, notes: keywords.notes },
      { name: 'Content Length', score: length.score, max: 15, notes: length.notes },
      { name: 'Readability', score: readability.score, max: 15, notes: readability.notes },
      { name: 'Page Structure', score: structure.score, max: 15, notes: structure.notes },
    ],
    topKeywords: keywords.topKeywords || [],
  };
}

function scoreTitle(article) {
  return scoreTitleQuality(article.title);
}

// ── Keyword Suggestions ───────────────────────────────────────────────────────
const SA_TRENDING_MODIFIERS = [
  'south africa', 'south african', 'johannesburg', 'cape town', 'durban',
  'pretoria', 'gauteng', 'kwazulu-natal', 'anc', 'da', 'eff', 'saps',
  'ramaphosa', 'mzansi', 'loadshedding', 'eskom', 'rand', 'zar',
];

export function generateKeywordSuggestions(article, topKeywords) {
  const primaryKeywords = topKeywords.slice(0, 3).map(k => k.word);
  const suggestions = [];

  primaryKeywords.forEach(kw => {
    suggestions.push(`${kw} south africa`);
    suggestions.push(`${kw} 2025`);
    suggestions.push(`best ${kw}`);
    suggestions.push(`${kw} news today`);
    suggestions.push(`how to ${kw}`);
    suggestions.push(`${kw} explained`);
    suggestions.push(`${kw} latest updates`);
  });

  // Add SA-specific if not already SA-focused
  const titleLower = article.title.toLowerCase();
  const hasSA = SA_TRENDING_MODIFIERS.some(t => titleLower.includes(t.split(' ')[0]));
  if (!hasSA && primaryKeywords.length > 0) {
    suggestions.unshift(`${primaryKeywords[0]} south africa 2025`);
  }

  // Deduplicate and limit
  return [...new Set(suggestions)].slice(0, 8);
}
