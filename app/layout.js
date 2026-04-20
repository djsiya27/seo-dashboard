import './globals.css';

export const metadata = {
  title: 'SEO Dashboard | Sunday World News Analyser',
  description: 'Analyse SEO performance of Sunday World articles, discover trending South African topics, and explore today in history.',
  keywords: 'SEO, South Africa, news, Sunday World, trending topics, keyword analysis',
  openGraph: {
    title: 'SEO Dashboard | Sunday World News Analyser',
    description: 'Real-time SEO analysis for South African news articles',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
