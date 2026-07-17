import { Cairo } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

async function getSeo() {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || '';
    const res = await fetch(`${base}/api/content`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.seo || null;
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
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className={`${cairo.className} bg-black text-white antialiased`}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
