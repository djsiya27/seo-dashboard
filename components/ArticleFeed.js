'use client';
import { useState, useEffect } from 'react';
import ArticleCard from './ArticleCard';
import SeoModal from './SeoModal';
import { Loader2 } from 'lucide-react';

const ARTICLES_PER_PAGE = 8;

export default function ArticleFeed({ initialArticles }) {
  const [articles, setArticles] = useState(initialArticles);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [seoData, setSeoData] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [analyzedIds, setAnalyzedIds] = useState(new Set());

  // Derive categories from articles
  const categories = ['All', ...new Set(articles.map(a => a.category).filter(Boolean))].sort((a, b) => {
    if (a === 'All') return -1;
    if (b === 'All') return 1;
    return a.localeCompare(b);
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  async function handleAnalyse(article) {
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    setAnalyzingId(article.id);
    
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article }),
      });
      
      const data = await res.json();
      
      if (data.error) {
        alert(`Analysis error: ${data.error}`);
        return;
      }
      
      setSeoData(data);
      
      // Update local state
      setArticles(prev => prev.map(a => 
        a.link === article.link ? { ...a, aiScore: data.total } : a
      ));

      // Persist to backend
      try {
        await fetch('/api/save-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ link: article.link, aiScore: data.total }),
        });
      } catch (err) {
        console.error('Failed to persist analysis:', err);
      }
      
      setSelectedArticle(article);
      setAnalyzedIds(prev => new Set([...prev, article.id]));
    } catch (err) {
      console.error('Analysis error:', err);
      alert('Failed to analyze article. Please check your internet connection and API key.');
    } finally {
      setIsAnalyzing(false);
      setAnalyzingId(null);
    }
  }

  const filtered = articles.filter(a => {
    const catMatch = activeCategory === 'All' || a.category?.toLowerCase() === activeCategory.toLowerCase();
    const searchMatch = !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase());
    return catMatch && searchMatch;
  });

  const totalPages = Math.ceil(filtered.length / ARTICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const paginatedArticles = filtered.slice(startIndex, startIndex + ARTICLES_PER_PAGE);

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
          {categories.map(cat => (
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
        <>
          <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {paginatedArticles.map((article, idx) => (
              <ArticleCard 
                key={article.id || idx} 
                article={article} 
                onAnalyse={handleAnalyse} 
                isAnalyzing={analyzingId === article.id}
                isLocked={analyzedIds.has(article.id)}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: currentPage === 1 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)', color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', transition: 'all 0.2s', fontSize: '14px', fontWeight: 500 }}
              >
                Previous
              </button>
              
              <div style={{ display: 'flex', gap: '4px' }}>
                {Array.from({ length: Math.min(10, totalPages) }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '1px solid', borderColor: currentPage === i + 1 ? 'rgba(59,130,246,0.5)' : 'transparent', background: currentPage === i + 1 ? 'rgba(59,130,246,0.1)' : 'transparent', color: currentPage === i + 1 ? '#60a5fa' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px', fontWeight: currentPage === i + 1 ? 600 : 400 }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: currentPage === totalPages ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)', color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', transition: 'all 0.2s', fontSize: '14px', fontWeight: 500 }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* SEO Modal */}
      {selectedArticle && seoData && (
        <SeoModal article={selectedArticle} seoData={seoData} onClose={() => { setSelectedArticle(null); setSeoData(null); }} />
      )}
    </div>
  );
}
