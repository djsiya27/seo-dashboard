import TrendingTopics from './TrendingTopics';
import ArticleSynopses from './ArticleSynopses';
import TodayInHistory from './TodayInHistory';

export default function Sidebar({ articles }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <TrendingTopics />
      <ArticleSynopses articles={articles} />
      <TodayInHistory />
    </div>
  );
}
