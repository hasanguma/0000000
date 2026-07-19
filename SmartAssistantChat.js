'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, CheckCircle2, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const STORAGE_KEYS = {
  requests: 'smart_chat_requests',
  unread: 'smart_chat_unread_count',
  last: 'smart_chat_last_request',
};

const STEP_CONFIG = [
  {
    key: 'name',
    title: 'اسم الزبون أو عنوان الحفل',
    prompt: 'أولاً، ما اسمك أو عنوان الحفل الذي تودّ حجزه؟',
    placeholder: 'مثال: أحمد / جدة - حي الروضة',
  },
  {
    key: 'eventType',
    title: 'نوع الحفل',
    prompt: 'ما نوع الحفل الذي تريده؟',
    placeholder: 'زفاف، حنة، دي جي، عرس مع مطرب، حفلة...',
  },
  {
    key: 'eventDate',
    title: 'الموعد',
    prompt: 'ما الموعد الذي تريده؟',
    placeholder: 'مثال: 20/08/2026 أو نهاية الشهر',
  },
  {
    key: 'details',
    title: 'تفاصيل إضافية',
    prompt: 'هل توجد تفاصيل أو مميزات خاصة تريدها في الحفل؟',
    placeholder: 'مثال: إضاءة فاخرة، DJ، مطرب عربي، ترتيب طاولات...',
  },
];

function getStoredRequests() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.requests);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function formatRequestMessage(data, brandName) {
  return [
    `طلب جديد من مساعد ${brandName} الذكي`,
    '',
    `• الاسم / العنوان: ${data.name || 'غير محدد'}`,
    `• نوع الحفل: ${data.eventType || 'غير محدد'}`,
    `• الموعد: ${data.eventDate || 'غير محدد'}`,
    `• التفاصيل: ${data.details || 'لا توجد تفاصيل إضافية'}`,
  ].join('\n');
}

function buildWhatsAppLink(data, brandName, whatsappNumber) {
  const number = (whatsappNumber || '').replace(/[^0-9]/g, '');
  const base = number ? `https://wa.me/${number}` : 'https://wa.me/';
  const message = formatRequestMessage(data, brandName);
  return `${base}?text=${encodeURIComponent(message)}`;
}

function AICyberCoreIcon() {
  return (
    <svg viewBox="0 0 140 140" className="ai-core-icon" aria-hidden="true">
      <defs>
        <linearGradient id="aiCoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd700" />
          <stop offset="50%" stopColor="#f39c12" />
          <stop offset="100%" stopColor="#c27c0e" />
        </linearGradient>
        <linearGradient id="aiVisorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff7d6" />
          <stop offset="100%" stopColor="#f4c542" />
        </linearGradient>
        <filter id="aiCoreGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle className="ai-core-ring ai-core-ring-outer" cx="70" cy="70" r="50" />
      <circle className="ai-core-ring ai-core-ring-middle" cx="70" cy="70" r="38" />
      <circle className="ai-core-ring ai-core-ring-inner" cx="70" cy="70" r="24" />

      <circle className="ai-core-orbit" cx="70" cy="70" r="58" />
      <circle className="ai-core-orbit ai-core-orbit-alt" cx="70" cy="70" r="44" />

      <rect x="40" y="44" width="60" height="48" rx="10" className="ai-core-face" />
      <rect x="49" y="53" width="42" height="24" rx="7" className="ai-core-visor" />
      <rect x="49" y="86" width="42" height="4" rx="2" className="ai-core-mouth" />
      <circle className="ai-core-eye ai-core-eye-left" cx="58" cy="65" r="3.5" />
      <circle className="ai-core-eye ai-core-eye-right" cx="82" cy="65" r="3.5" />
      <circle className="ai-core-spark ai-core-spark-left" cx="42" cy="58" r="2.5" />
      <circle className="ai-core-spark ai-core-spark-right" cx="98" cy="58" r="2.5" />
      <circle className="ai-core-core" cx="70" cy="70" r="12" filter="url(#aiCoreGlow)" />
    </svg>
  );
}

export default function SmartAssistantChat({ whatsappNumber, brandName = 'المؤسسة' }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [formData, setFormData] = useState({});
  const [completed, setCompleted] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const [pulseActive, setPulseActive] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedCount = Number(window.localStorage.getItem(STORAGE_KEYS.unread) || '0');
    setRequestCount(storedCount);

    const syncCount = () => {
      const count = Number(window.localStorage.getItem(STORAGE_KEYS.unread) || '0');
      setRequestCount(count);
      if (count > 0) {
        setPulseActive(true);
        window.setTimeout(() => setPulseActive(false), 1800);
      }
    };

    window.addEventListener('storage', syncCount);
    window.addEventListener('smart-chat-request-updated', syncCount);
    return () => {
      window.removeEventListener('storage', syncCount);
      window.removeEventListener('smart-chat-request-updated', syncCount);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setPulseActive(false), 2200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    setMessages([
      {
        role: 'bot',
        text: `مرحباً! أنا مساعد ${brandName} الذكي، وسأرافقك خطوة بخطوة لحجز حفلك بكل سهولة واحترافية.`,
      },
      {
        role: 'bot',
        text: STEP_CONFIG[0].prompt,
      },
    ]);
    setCurrentStep(0);
    setInputValue('');
    setFormData({});
    setCompleted(false);
  }, [open, brandName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const currentPrompt = useMemo(() => STEP_CONFIG[currentStep], [currentStep]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const value = inputValue.trim();
    if (!value) return;

    const nextFormData = { ...formData, [STEP_CONFIG[currentStep].key]: value };
    setFormData(nextFormData);
    setMessages((prev) => [...prev, { role: 'user', text: value }]);

    if (currentStep === STEP_CONFIG.length - 1) {
      const finishedData = { ...nextFormData, details: value };
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: `تم جمع المعلومات بنجاح. يمكنك الآن إرسال الطلب مباشرة عبر واتساب أو تعديل أي تفاصيل إذا رغبت.`,
        },
        {
          role: 'bot',
          text: `الملخص:\n• الاسم / العنوان: ${finishedData.name || 'غير محدد'}\n• نوع الحفل: ${finishedData.eventType || 'غير محدد'}\n• الموعد: ${finishedData.eventDate || 'غير محدد'}\n• التفاصيل: ${finishedData.details || 'لا توجد تفاصيل إضافية'}`,
        },
      ]);
      setCompleted(true);
      setInputValue('');
      return;
    }

    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    setInputValue('');
    setMessages((prev) => [...prev, { role: 'bot', text: STEP_CONFIG[nextStep].prompt }]);
  };

  const handleSendToWhatsApp = () => {
    const finalData = { ...formData, details: formData.details || '' };
    const request = {
      id: Date.now(),
      ...finalData,
      createdAt: new Date().toISOString(),
      source: 'ai-chatbot',
    };

    const requests = getStoredRequests();
    const nextRequests = [request, ...requests];

    try {
      window.localStorage.setItem(STORAGE_KEYS.requests, JSON.stringify(nextRequests));
      const unread = Number(window.localStorage.getItem(STORAGE_KEYS.unread) || '0') + 1;
      window.localStorage.setItem(STORAGE_KEYS.unread, String(unread));
      window.localStorage.setItem(STORAGE_KEYS.last, JSON.stringify(request));
      window.dispatchEvent(new Event('smart-chat-request-updated'));
      const link = buildWhatsAppLink(finalData, brandName, whatsappNumber);
      window.open(link, '_blank', 'noopener,noreferrer');
      toast.success('تم إرسال الطلب وحفظه بنجاح في لوحة التحكم');
    } catch {
      toast.error('حدث خطأ أثناء حفظ الطلب، حاول مرة أخرى');
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 left-4 right-4 z-50 mx-auto flex max-w-md flex-col overflow-hidden rounded-[28px] border border-[rgb(var(--gold)/30%)] bg-[rgb(var(--card-bg)/90%)] shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl md:left-auto md:right-6 md:w-[420px]"
          >
            <div className="flex items-center justify-between border-b border-[rgb(var(--gold)/15%)] bg-gradient-to-r from-[rgb(var(--gold)/20%)] to-transparent px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgb(var(--gold))] to-[rgb(var(--gold-light))] text-black shadow-lg shadow-yellow-500/20">
                  <Bot size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-[rgb(var(--gold))]">مساعد ذكي</p>
                  <p className="text-xs text-[rgb(var(--text-muted)/80%)]">متصل الآن ويجمع طلبك خطوة بخطوة</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-2 text-[rgb(var(--gold))] transition hover:bg-[rgb(var(--gold-light)/15%)]" aria-label="إغلاق">
                <X size={18} />
              </button>
            </div>

            <div className="chat-shell max-h-[70vh] overflow-y-auto px-4 py-4">
              {messages.map((message, index) => (
                <motion.div
                  key={`${message.role}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`mb-3 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-3 py-3 text-sm leading-7 shadow-lg ${message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}`}>
                    {message.text.split('\n').map((line, lineIndex) => (
                      <p key={`${message.role}-${lineIndex}`} className="whitespace-pre-wrap">
                        {line}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ))}
              {!completed && (
                <div className="mb-3 flex justify-start">
                  <div className="chat-bubble-bot rounded-2xl px-3 py-3 text-sm">
                    <div className="flex items-center gap-2 text-[rgb(var(--gold))]">
                      <Sparkles size={14} />
                      <span>{currentPrompt?.title}</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSubmit} className="border-t border-[rgb(var(--gold)/15%)] bg-[rgb(var(--card-bg)/95%)] p-3">
              {!completed ? (
                <div className="flex items-end gap-2">
                  <Input
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    placeholder={currentPrompt?.placeholder || 'أخبرنا عن طلبك...'}
                    className="h-11 rounded-2xl border-[rgb(var(--gold)/20%)] bg-[rgb(var(--card-bg)/70%)] text-right"
                  />
                  <Button type="submit" className="h-11 w-11 rounded-2xl bg-gradient-to-l from-[rgb(var(--gold))] to-[rgb(var(--gold-light))] p-0 text-black">
                    <Send size={16} />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button type="button" onClick={handleSendToWhatsApp} className="w-full rounded-2xl bg-gradient-to-l from-[#16A34A] to-[#22C55E] py-3 text-sm font-black text-white">
                    <MessageCircle className="ml-2 h-4 w-4" />
                    إرسال الطلب عبر الواتساب
                  </Button>
                  <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={16} />
                    <span>سيتم حفظ الطلب في لوحة التحكم وإرساله فوراً</span>
                  </div>
                </div>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((prev) => !prev)}
        className={`ai-core-button ${pulseActive ? 'ai-core-button-pulse' : ''}`}
        aria-label="فتح المساعد الذكي"
        whileTap={{ scale: 0.95, rotate: -2 }}
        initial={{ scale: 0.95, opacity: 0.92 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 18 }}
      >
        <div className="ai-core-shell">
          <AICyberCoreIcon />
        </div>
        <span className="ai-core-label">المساعد الذكي</span>
        {requestCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-rose-500 px-2 text-[10px] font-black text-white">
            {requestCount > 9 ? '9+' : requestCount}
          </span>
        )}
      </motion.button>
    </>
  );
}
