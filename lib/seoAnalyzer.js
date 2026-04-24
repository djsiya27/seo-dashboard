// ─── Modern SEO Scoring Engine (2026 Standard) ──────────────────────────────
// Scores articles on 5 dimensions, each returning a sub-score.
// Final score is a sum out of 100.

const POWER_WORDS = ['ultimate', 'guide', 'proven', 'essential', 'how to', 'best', 'top', 'secrets', 'exclusive', 'breaking', 'new', 'free', 'easy', 'fast', 'powerful', 'important', 'critical', 'revealed', 'shocking'];

const STOP_WORDS = new Set([
  'a','an','the','and','or','but','is','are','was','were','be','been','being',
  'have','has','had','do','does','did','will','would','could','should','may',
  'might','shall','can','this','that','these','those','it','its','their','our',
  'your','my','we','you','he','she','they','them','his','her','as','up',
  'out','if','not','so','into','than','then','about','after',
  'before','while','during','between','through','over','under',
  'on','at','to','for','of','with','by','from','in'
]);

// ── 1. Title Quality & CTR (20pts) ─────────────────────────────────────────
function scoreTitleQuality(title) {
  if (!title) return { score: 0, notes: ['No title found'] };
  const notes = [];
  let score = 0;

  // 2026 Mobile-first truncation is usually around 580px (~55 chars)
  const len = title.length;
  if (len >= 45 && len <= 55) { score += 10; notes.push('✓ Title length is perfect for Mobile & Desktop'); }
  else if (len > 55 && len <= 65) { score += 7; notes.push('⚠ Title might truncate on some mobile devices'); }
  else { score += 3; notes.push('✗ Title length is sub-optimal; aim for 45-55 chars'); }

  const lowerTitle = title.toLowerCase();
  if (POWER_WORDS.some(w => lowerTitle.includes(w))) {
    score += 5; notes.push('✓ High-CTR power word detected');
  } else {
    notes.push('⚠ No power words — consider adding one for higher CTR');
  }
  
  if (/\d/.test(title)) { 
    score += 5; notes.push('✓ Numerical data in title (Listicles/Years) boosts CTR'); 
  } else {
    notes.push('⚠ No numbers — listicles and stats improve CTR');
  }

  return { score: Math.min(score, 20), notes };
}

// ── 2. Meta Description (15pts) ───────
function scoreMetaDescription(excerpt) {
  if (!excerpt || excerpt.length < 50) return { score: 0, notes: ['✗ Meta description is missing or dangerously thin'] };
  const notes = [];
  let score = 0;
  const len = excerpt.length;

  if (len >= 120 && len <= 160) { score += 10; notes.push('✓ Meta description length is optimal'); }
  else if (len >= 80 && len < 120) { score += 5; notes.push('⚠ Description a bit short'); }
  else { score += 2; notes.push('✗ Description length is sub-optimal'); }

  const lower = excerpt.toLowerCase();
  if (/learn|discover|find out|read|explore|see how|click/i.test(lower)) {
    score += 5; notes.push('✓ Contains call-to-action language');
  }

  return { score: Math.min(score, 15), notes };
}

// ── 3. Semantic Keyword Analysis (25pts) ─────────────────────────────────────
function scoreKeywords(title, fullText) {
  const content = fullText.toLowerCase();
  const words = content.split(/\W+/).filter(w => w.length > 3 && !STOP_WORDS.has(w));
  
  const freq = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  
  const topKeyword = sorted[0];
  const notes = [];
  let score = 0;

  if (!topKeyword) return { score: 0, notes: ['Insufficient text to analyse'], topKeywords: [] };

  const kw = topKeyword[0];

  // Check Placement (Google weights the top of the page heavier)
  if (title.toLowerCase().includes(kw)) { 
    score += 10; notes.push(`✓ Primary keyword "${kw}" in Title`); 
  } else {
    notes.push(`⚠ Primary keyword "${kw}" missing from title`);
  }
  
  const firstParagraph = content.substring(0, 500);
  if (firstParagraph.includes(kw)) {
    score += 10; notes.push('✓ Keyword appears in the "Hook" (first 500 chars)');
  } else {
    notes.push('⚠ Keyword missing from intro; helps Google establish intent early');
  }

  // Sentiment/Entity Check: Avoid stuffing (>4% is usually bad)
  const density = (topKeyword[1] / (words.length || 1)) * 100;

  if (density >= 0.5 && density <= 2.5) {
    score += 5; notes.push(`✓ Natural keyword flow (${density.toFixed(1)}%)`);
  } else if (density > 2.5) {
    notes.push(`✗ Possible keyword stuffing detected (${density.toFixed(1)}%); reduce repetition`);
  } else {
    score += 3; notes.push(`⚠ Low keyword density (${density.toFixed(1)}%)`);
  }

  const topKeywords = sorted.slice(0, 8).map(([word, count]) => ({
    word,
    count,
    density: ((count / (words.length || 1)) * 100).toFixed(1),
    inTitle: title.toLowerCase().includes(word),
  }));

  return { score: Math.max(0, Math.min(score, 25)), notes, topKeywords };
}

// ── 4. Readability (15pts) (Kept original to maintain 100 points) ────────────
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

// ── 5. Structure & E-E-A-T (25pts) ───────────────────────────────────────────
function scoreStructure(rawHtml, wordCount) {
  const notes = [];
  let score = 0;

  const contentToSearch = rawHtml || '';

  // Headings & Scannability
  const h2s = (contentToSearch.match(/<h2/gi) || []).length;
  
  if (h2s >= 3) { 
    score += 10; notes.push(`✓ Excellent use of ${h2s} subheadings`); 
  } else if (h2s >= 1) {
    score += 4; notes.push('⚠ Limited subheading structure detected');
  } else { 
    notes.push('✗ CRITICAL: Missing H2 structure; heavily penalized by Google'); 
  }

  // Expertise Signals (E-E-A-T)
  if (/\b(research|study|according to|source|expert|data|evidence)\b/i.test(contentToSearch)) {
    score += 10; notes.push('✓ E-E-A-T expertise signals detected');
  } else {
    notes.push('⚠ No clear evidence or expert citations found');
  }

  // Depth vs Intent
  if (wordCount >= 800) { 
    score += 5; notes.push(`✓ Comprehensive depth (${wordCount} words)`); 
  } else if (wordCount >= 400) {
    score += 3; notes.push(`⚠ Moderate depth (${wordCount} words) — consider expanding`);
  } else {
    notes.push(`✗ Content is thin (${wordCount} words)`);
  }

  return { score: Math.min(score, 25), notes };
}

// ── Master Analyser ───────────────────────────────────────────────────────────
export function analyzeArticle(article) {
  const title = scoreTitleQuality(article.title);
  const meta = scoreMetaDescription(article.description);
  const keywords = scoreKeywords(article.title, article.fullText || article.description);
  const readability = scoreReadability(article.fullText || article.description);
  const wordCount = article.wordCount || (article.fullText ? article.fullText.split(/\s+/).length : 0);
  const structure = scoreStructure(article.rawHtml, wordCount);

  const total = title.score + meta.score + keywords.score + readability.score + structure.score;

  return {
    total,
    dimensions: [
      { name: 'Title & CTR', score: title.score, max: 20, notes: title.notes },
      { name: 'Meta Description', score: meta.score, max: 15, notes: meta.notes },
      { name: 'Semantic Keywords', score: keywords.score, max: 25, notes: keywords.notes },
      { name: 'Readability', score: readability.score, max: 15, notes: readability.notes },
      { name: 'Structure & E-E-A-T', score: structure.score, max: 25, notes: structure.notes },
    ],
    topKeywords: keywords.topKeywords || [],
  };
}

// ── Keyword Suggestions ───────────────────────────────────────────────────────
const SA_TRENDING_MODIFIERS = [
  'south africa', 'south african', 'johannesburg', 'cape town', 'durban',
  'pretoria', 'gauteng', 'kwazulu-natal', 'anc', 'da', 'eff', 'saps',
  'ramaphosa', 'mzansi', 'loadshedding', 'eskom', 'rand', 'zar',
];

export function generateKeywordSuggestions(article, topKeywords) {
  if (!topKeywords || topKeywords.length === 0) return [];
  const primaryKeywords = topKeywords.slice(0, 3).map(k => k.word);
  const suggestions = [];

  primaryKeywords.forEach(kw => {
    suggestions.push(`${kw} south africa`);
    suggestions.push(`${kw} 2026`);
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
    suggestions.unshift(`${primaryKeywords[0]} south africa 2026`);
  }

  // Deduplicate and limit
  return [...new Set(suggestions)].slice(0, 8);
}
