import { Cairo } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';

// Runs before paint so the page renders in the correct theme immediately,
// with no flash of light mode before the dark class is applied.
const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

async function getSeo() {
  try {
    if (!process.env.MONGO_URL) return null;
    const { getDb } = await import('@/lib/mongodb');
    const db = await getDb();
    const doc = await db.collection('content').findOne({ _id: 'site' });
    return doc?.seo || null;
  } catch (e) {
    return null;
  }
}

export async function generateMetadata() {
  const seo = await getSeo();
  return {
    title: seo?.title || 'مؤسسة الذهبية - أفضل معدات الصوت والدي جي',
    description: seo?.description || 'أفضل معدات الصوت والدي جي الاحترافية لحفل زفافك. نوصل إحساس الموسيقى إلى كل ركن في القاعة.',
    keywords: seo?.keywords || 'مؤسسة الذهبية, دي جي, صوت, حفلات زفاف, إضاءة, معدات صوتية',
    openGraph: {
      title: seo?.ogTitle || seo?.title || 'مؤسسة الذهبية',
      description: seo?.ogDescription || seo?.description || 'أفضل معدات الصوت والدي جي',
      images: seo?.ogImage ? [seo.ogImage] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo?.title || 'مؤسسة الذهبية',
      description: seo?.description || '',
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${cairo.className} antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
