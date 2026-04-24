import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { decodeHtml } from "@/lib/utils";

async function fetchArticleMetadata(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' } });
    const html = await res.text();
    
    // Extract Meta Description
    const metaDescMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) || 
                         html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
    const metaDescription = metaDescMatch ? metaDescMatch[1] : null;

    // Extract H1 (often missing or different from RSS title)
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const h1 = h1Match ? h1Match[1].replace(/<[^>]*>/g, '').trim() : null;

    // Extract H2s for structure analysis
    const h2Matches = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)];
    const h2s = h2Matches.map(m => m[1].replace(/<[^>]*>/g, '').trim()).filter(t => t.length > 0);

    return { metaDescription, h1, h2s, rawHtml: html };
  } catch (err) {
    console.error('Metadata fetch error:', err);
    return { metaDescription: null, h1: null, h2s: [], rawHtml: null };
  }
}

export async function POST(req) {
  try {
    const { article } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not found' }, { status: 500 });
    }

    // Fetch real-world metadata from the live URL
    const liveMetadata = await fetchArticleMetadata(article.link);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `You are a technical SEO Auditor. You provide realistic, strict, and critical SEO evaluations. You never give high scores for average content. Your goal is to provide a 'Google-Realistic' SEO score and a HYPER-SPECIFIC audit.

Act as a STRICT Google Search Quality Rater and Senior SEO Architect. 
Analyze the following article data and provide a detailed SEO audit.

CRITICAL INSTRUCTION: For every note you provide, you must use the "What, Where, How" framework:
- WHAT: The specific technical or editorial error.
- WHERE: The exact location (e.g., "Paragraph 3", "The H1 tag", "The first 50 chars of the meta").
- HOW: The exact fix (e.g., "Split this 120-word paragraph into two", "Change 'is being done' to 'we did'").

Avoid vague language like "improve readability" or "content is long".

ANALYZE THESE LIVE DATA POINTS:
- Article Title: ${decodeHtml(article.title)}
- Live H1: ${decodeHtml(liveMetadata.h1 || 'MISSING (Critical Error)')}
- Meta Description: ${decodeHtml(liveMetadata.metaDescription || 'MISSING (Critical Error)')}
- Subheadings (H2s): ${liveMetadata.h2s.length > 0 ? liveMetadata.h2s.map(h => decodeHtml(h)).join(' | ') : 'NONE (Poor Structure)'}
- Content Content: ${decodeHtml(article.fullText || article.description)}

SCORING RULES (STRICT MODE):
1. Title & CTR (20 pts): Penalize if > 60 chars.
2. Meta Description (15 pts): If "MISSING", score is 0. If generic, max 5 pts.
3. Semantic Keywords (25 pts): Check for keyword stuffing vs natural topical depth.
4. Readability (15 pts): Deduct for "wall of text" or passive voice.
5. Structure & E-E-A-T (25 pts): H2 tags are MANDATORY. Penalize for lack of expert evidence.

SPECIFIC REQUIREMENTS:
- Meta Description Suggestion: Must satisfy Yoast and Google standards (120-155 characters). Must include the primary keyword near the start. Must be actionable and compelling.
- Subheading (H2) Suggestions: If the article has fewer than 2 subheadings, you MUST suggest specific H2 titles and EXACTLY where they should be placed in the body (e.g., "After Paragraph 4", "Before the final section").

OUTPUT FORMAT: Return ONLY a valid JSON object (no markdown blocks, no extra text) matching this schema:
{
  "total": number (0-100),
  "dimensions": [
    { "name": "Title & CTR", "score": number, "max": 20, "notes": ["string"] },
    { "name": "Meta Description", "score": number, "max": 15, "notes": ["string"] },
    { "name": "Semantic Keywords", "score": number, "max": 25, "notes": ["string"] },
    { "name": "Readability", "score": number, "max": 15, "notes": ["string"] },
    { "name": "Structure & E-E-A-T", "score": number, "max": 25, "notes": ["string"] }
  ],
  "topKeywords": [
    { "word": "string", "count": number, "density": "string", "inTitle": boolean }
  ],
  "keywordSuggestions": ["string"],
  "suggestedMeta": "string",
  "suggestedH2s": [
    { "text": "string", "placement": "string" }
  ]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let resultText = response.text();

    // Clean up response if Gemini adds markdown blocks
    resultText = resultText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();

    if (!resultText) {
      throw new Error('No analysis results returned from Gemini');
    }

    const analysis = JSON.parse(resultText);

    // Defensive check: Ensure all required fields exist with fallbacks
    const sanitizedAnalysis = {
      total: typeof analysis.total === 'number' ? analysis.total : 0,
      dimensions: Array.isArray(analysis.dimensions) ? analysis.dimensions : [],
      topKeywords: Array.isArray(analysis.topKeywords) ? analysis.topKeywords : [],
      keywordSuggestions: Array.isArray(analysis.keywordSuggestions) ? analysis.keywordSuggestions : [],
      suggestedMeta: analysis.suggestedMeta || "",
      suggestedH2s: Array.isArray(analysis.suggestedH2s) ? analysis.suggestedH2s : []
    };

    return NextResponse.json(sanitizedAnalysis);
  } catch (err) {
    console.error('Gemini Analysis Error:', err);
    // Return a more descriptive error if possible
    const errorMessage = err instanceof SyntaxError ? 'AI returned invalid JSON' : (err.message || 'Failed to analyze article');
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
