'use client';
import { useState } from 'react';
import { analyzeArticle, generateKeywordSuggestions } from '@/lib/seoAnalyzer';
import ArticleCard from './ArticleCard';
import SeoModal from './SeoModal';

const CATEGORIES = ['All', 'News', 'Sports', 'Business', 'World', 'Lifestyle'];

export default function ArticleFeed({ initialArticles }) {
  const [articles] = useState(initialArticles);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [seoData, setSeoData] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  function handleAnalyse(article) {
    const analysis = analyzeArticle(article);
    const suggestions = generateKeywordSuggestions(article, analysis.topKeywords);
    setSeoData({ ...analysis, keywordSuggestions: suggestions });
    setSelectedArticle(article);
  }

  const filtered = articles.filter(a => {
    const catMatch = activeCategory === 'All' || a.category?.toLowerCase().includes(activeCategory.toLowerCase());
    const searchMatch = !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase());
    return catMatch && searchMatch;
  });

  return (
    <div style={{ paddingTop: '24px' }}>
      {/* Search + Filter Bar */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '10px 16px 10px 40px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', color: 'var(--text-primary)',
              fontSize: '14px', outline: 'none',
              fontFamily: 'var(--font-inter)',
            }}
          />
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '16px' }}>🔍</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
                cursor: 'pointer', border: '1px solid',
                transition: 'all 0.2s',
                background: activeCategory === cat ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)',
                borderColor: activeCategory === cat ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.08)',
                color: activeCategory === cat ? '#60a5fa' : 'var(--text-secondary)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div style={{ marginBottom: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
        Showing <strong style={{ color: 'var(--text-secondary)' }}>{filtered.length}</strong> articles
        {searchQuery && <span> matching "<em>{searchQuery}</em>"</span>}
      </div>

      {/* Article Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📰</div>
          <p>No articles found</p>
        </div>
      ) : (
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map((article, idx) => (
            <ArticleCard key={article.id || idx} article={article} onAnalyse={handleAnalyse} />
          ))}
        </div>
      )}

      {/* SEO Modal */}
      {selectedArticle && seoData && (
        <SeoModal article={selectedArticle} seoData={seoData} onClose={() => { setSelectedArticle(null); setSeoData(null); }} />
      )}
    </div>
  );
}
