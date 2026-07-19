import Link from 'next/link';
import { Home, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[rgb(var(--page-bg))] text-[rgb(var(--text-strong))] flex items-center justify-center px-4" dir="rtl">
      <div className="w-full max-w-lg rounded-[32px] border border-[rgb(var(--gold)/20%)] bg-[rgb(var(--card-bg)/80%)] p-8 text-center shadow-2xl shadow-yellow-500/10 backdrop-blur-xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl gold-gradient-bg text-black">
          <Sparkles className="h-8 w-8" />
        </div>
        <h1 className="mb-3 text-3xl font-black gold-text">الصفحة غير موجودة</h1>
        <p className="mb-8 text-[rgb(var(--text-body2)/75%)] leading-8">
          عذراً، الصفحة التي تبحث عنها غير متوفرة الآن. يمكنك العودة إلى الصفحة الرئيسية أو التواصل معنا مباشرة.
        </p>
        <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-l from-[#16A34A] to-[#22C55E] px-6 py-3 font-bold text-white">
          <Home className="h-4 w-4" />
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
