import { fetchArticles } from '@/lib/rss';
import ArticleFeed from '@/components/ArticleFeed';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export const revalidate = 300;

export default async function DashboardPage() {
  const articles = await fetchArticles().catch(() => []);

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <Header articleCount={articles.length} />
      <div style={{ display: 'flex', maxWidth: '1600px', margin: '0 auto', padding: '0 16px', gap: '24px', alignItems: 'flex-start' }}>
        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0, paddingBottom: '48px' }}>
          <ArticleFeed initialArticles={articles} />
        </main>
        {/* Sidebar */}
        <aside className="sidebar" style={{ paddingBottom: '48px', paddingTop: '24px', position: 'sticky', top: '80px', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
          <Sidebar articles={articles} />
        </aside>
      </div>
    </div>
  );
}
