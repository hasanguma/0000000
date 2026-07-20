'use client';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Phone, MessageCircle, Mail, MapPin, Play, X, ChevronUp, Star,
  Instagram, Facebook, Youtube, Send, Music, Sparkles, Award, Users,
  Speaker, Disc3, Heart, GraduationCap, Mic, Lightbulb, Theater, Monitor,
  Menu, ArrowLeft, ZoomIn, Sun, Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useTheme } from '@/components/theme-provider';

const ICONS = { Speaker, Disc3, Heart, GraduationCap, Mic, Lightbulb, Theater, Monitor, Sparkles, Award, Users, Music };

function getYouTubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('/')[0];
    if (u.searchParams.get('v')) return u.searchParams.get('v');
    const m = u.pathname.match(/\/embed\/([^/?]+)/);
    if (m) return m[1];
  } catch (e) {}
  return url;
}

// Smart Chatbot Component
const SmartChatbot = ({ isOpen, onClose, contactPhone, contactWhatsapp }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    eventType: '',
    date: '',
    details: ''
  });
  const [messages, setMessages] = useState([]);
  const [botTyping, setBotTyping] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const eventTypes = ['حنة', 'عرس', 'دي جي', 'عرس مع مطرب', 'صبيب قهرة عربية', 'طبال', 'مقدم', 'حفلات أخرى'];

  const questions = [
    { label: 'ما اسمك أو عنوانك؟', field: 'name', type: 'text' },
    { label: 'نوع الحجز المطلوب؟', field: 'eventType', type: 'select' },
    { label: 'الموعد الذي ترغب بالحجز فيه؟', field: 'date', type: 'date' },
    { label: 'هل لديك أي تفاصيل إضافية أو خواص خاصة؟', field: 'details', type: 'textarea' }
  ];

  const welcomeText = 'أهلاً بك في المستقبل! أنا Reem AI، مساعدك الذكي لحجز حفلتك بأسرع وأفضل طريقة. سأجمع معك بعض التفاصيل الآن.';

  useEffect(() => {
    if (!isOpen) return;
    setStep(0);
    setFormData({ name: '', address: '', eventType: '', date: '', details: '' });
    setSubmitted(false);
    setBotTyping(false);
    setMessages([{ id: 'welcome', role: 'bot', text: welcomeText }]);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (step >= 1 && step <= questions.length) {
      setBotTyping(true);
      const timer = window.setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { id: `question-${step}`, role: 'bot', text: questions[step - 1].label }
        ]);
        setBotTyping(false);
      }, 450);
      return () => window.clearTimeout(timer);
    }
  }, [step, isOpen]);

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { id: `user-${prev.length}-${Date.now()}`, role: 'user', text }]);
  };

  const handleNext = () => {
    if (step === 0) {
      addUserMessage('نعم، لنبدأ');
      setStep(1);
      return;
    }

    const current = questions[step - 1];
    if (!current) return;
    const value = formData[current.field] || 'بدون إجابة';
    addUserMessage(value);
    setStep(step + 1);
  };

  const handleSubmit = () => {
    const details = formData.details.trim() || 'لا توجد تفاصيل إضافية';
    addUserMessage(details);

    const message = `*طلب حجز جديد من موقع الذهبية* 📋\n\n- الاسم/العنوان: ${formData.name || 'غير محدد'}\n- نوع الحفل: ${formData.eventType || 'غير محدد'}\n- الموعد: ${formData.date || 'غير محدد'}\n- التفاصيل: ${details}`;
    const requests = JSON.parse(localStorage.getItem('chatbotRequests') || '[]');
    requests.unshift({ ...formData, timestamp: new Date().toISOString(), message, source: 'Reem AI' });
    localStorage.setItem('chatbotRequests', JSON.stringify(requests));
    localStorage.setItem('chatbotRequestsNewOrder', 'true');
    window.dispatchEvent(new Event('chatbotRequestsUpdated'));
    window.dispatchEvent(new Event('chatbotNewOrder'));
    toast.success('تم حفظ الطلب في لوحة التحكم وسيصلك إشعار جديد');

    const whatsappNum = (contactWhatsapp || '').replace(/[^0-9]/g, '');
    const waLink = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(message)}`;
    window.open(waLink, '_blank');

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      setStep(0);
      setMessages([{ id: 'welcome', role: 'bot', text: welcomeText }]);
      setFormData({ name: '', address: '', eventType: '', date: '', details: '' });
    }, 1800);
  };

  if (!isOpen) return null;

  const currentQuestion = questions[step - 1];
  const canProceed = step === 0 || (currentQuestion && !!formData[currentQuestion.field]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 36, scale: 0.9 }}
            className="chatbot-panel fixed bottom-36 left-6 z-50 w-[clamp(320px,28vw,420px)] max-h-[85vh]"
          >
            <div className="chatbot-header">
              <div>
                <p className="chatbot-title">Reem AI - تحدث معي</p>
                <p className="chatbot-subtitle">مساعد الذكاء الاصطناعي التفاعلي</p>
              </div>
              <button onClick={onClose} aria-label="إغلاق المساعد" className="chatbot-close">
                <X size={18} />
              </button>
            </div>

            <div className="chatbot-messages" role="log" aria-live="polite">
              {Array.isArray(messages) && messages.map((msg, idx) => (
                <motion.div
                  key={msg?.id ?? `chat-msg-${idx}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28 }}
                  className={`chatbot-message ${msg?.role ?? ''}`}
                >
                  <div className="chatbot-bubble">{msg?.text}</div>
                </motion.div>
              ))}
              {botTyping && (
                <div className="chatbot-message bot">
                  <div className="chatbot-bubble chatbot-typing">...</div>
                </div>
              )}
            </div>

            <div className="chatbot-footer">
              {!submitted ? (
                <>
                  {step === 0 && (
                    <button onClick={handleNext} className="chatbot-action-btn">
                      بدء المحادثة الآن
                    </button>
                  )}

                  {step > 0 && step <= questions.length && (
                    <div className="space-y-4 w-full">
                      <div className="chatbot-field">
                        {currentQuestion.type === 'text' && (
                          <Input
                            value={formData[currentQuestion.field]}
                            onChange={(e) => setFormData({ ...formData, [currentQuestion.field]: e.target.value })}
                            placeholder="اكتب الإجابة هنا..."
                            className="text-right"
                          />
                        )}
                        {currentQuestion.type === 'select' && (
                          <select
                            value={formData[currentQuestion.field]}
                            onChange={(e) => setFormData({ ...formData, [currentQuestion.field]: e.target.value })}
                            className="w-full px-3 py-3 rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(15,23,42,0.92)] text-right text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          >
                            <option value="">اختر نوع الحفل...</option>
                            {eventTypes.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        )}
                        {currentQuestion.type === 'date' && (
                          <Input
                            type="date"
                            value={formData[currentQuestion.field]}
                            onChange={(e) => setFormData({ ...formData, [currentQuestion.field]: e.target.value })}
                            className="text-right"
                          />
                        )}
                        {currentQuestion.type === 'textarea' && (
                          <Textarea
                            value={formData[currentQuestion.field]}
                            onChange={(e) => setFormData({ ...formData, [currentQuestion.field]: e.target.value })}
                            placeholder="اكتب التفاصيل هنا..."
                            className="text-right"
                            rows={4}
                          />
                        )}
                      </div>
                      <div className="flex gap-3">
                        {step > 1 && (
                          <button type="button" onClick={() => setStep(step - 1)} className="chatbot-secondary-btn">
                            السابق
                          </button>
                        )}
                        {step < questions.length ? (
                          <button
                            type="button"
                            onClick={handleNext}
                            disabled={!canProceed}
                            className="chatbot-action-btn"
                          >
                            التالي
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!canProceed}
                            className="chatbot-action-btn chatbot-submit-btn"
                          >
                            إرسال الطلب عبر واتس
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="chatbot-success">
                  <Sparkles className="h-6 w-6 text-cyan-300" />
                  <div>
                    <p className="font-bold">تم إرسال الطلب بنجاح!</p>
                    <p className="text-xs text-[rgba(255,255,255,0.68)]">سيظهر الطلب في لوحة التحكم فوراً.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const App = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [videoOpen, setVideoOpen] = useState(null);
  const [galleryFilter, setGalleryFilter] = useState('الكل');
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.1]);

  useEffect(() => {
    fetch('/api/content', { cache: 'no-store' }).then(r => r.json()).then(d => {
      setContent(d);
      setTimeout(() => setLoading(false), 600);
    }).catch(() => setLoading(false));

    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener('scroll', onScroll);

    // Fade-up observer
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => e.isIntersecting && e.target.classList.add('in'));
    }, { threshold: 0.12 });
    setTimeout(() => document.querySelectorAll('.fade-up').forEach(el => io.observe(el)), 800);

    return () => { window.removeEventListener('scroll', onScroll); io.disconnect(); };
  }, []);

  const submitContact = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const data = Object.fromEntries(form);
    try {
      await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      toast.success('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.');
      e.target.reset();
    } catch { toast.error('حدث خطأ، حاول مرة أخرى'); }
  };

  if (loading || !content) {
    return (
      <div className="fixed inset-0 bg-[rgb(var(--page-bg))] flex flex-col items-center justify-center z-50">
        <div className="loader-ring mb-6"></div>
        <h1 className="text-3xl md:text-5xl font-bold gold-text">مؤسسة الذهبية</h1>
      </div>
    );
  }

  const c = content;
  const categories = ['الكل', ...Array.from(new Set((c.gallery || []).map(g => g.category).filter(Boolean)))];
  const filteredGallery = galleryFilter === 'الكل' ? c.gallery : c.gallery.filter(g => g.category === galleryFilter);

  return (
    <div className="relative bg-[rgb(var(--page-bg))] min-h-screen overflow-x-hidden" dir="rtl">
      {c.seo?.googleAnalytics && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${c.seo.googleAnalytics}`}></script>
          <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${c.seo.googleAnalytics}');` }}/>
        </>
      )}

      {/* NAVBAR */}
      <nav className="fixed top-0 inset-x-0 z-40 glass-strong">
        <div className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <a href="#home" className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full gold-gradient-bg flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <Music className="h-5 w-5 text-black" />
            </div>
            <span className="text-xl md:text-2xl font-black gold-text">{c.brand.logoText}</span>
          </a>
          <div className="hidden lg:flex items-center gap-8 text-sm">
            {[['home','الرئيسية'],['about','من نحن'],['services','خدماتنا'],['gallery','المعرض'],['videos','فيديو'],['testimonials','آراء'],['contact','تواصل']].map(([id,label]) => (
              <a key={id} href={`#${id}`} className="text-[rgb(var(--text-heading)/80%)] hover:text-[rgb(var(--gold))] transition-colors font-medium">{label}</a>
            ))}
            <a href="/admin" className="flex items-center gap-1 text-[rgb(var(--gold)/70%)] hover:text-[rgb(var(--gold))] transition-colors font-medium">
              <span className="text-xs">🔒</span>لوحة التحكم
            </a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
              className="theme-toggle h-10 w-10 rounded-full glass hover:bg-[rgb(var(--gold-light)/15%)] text-[rgb(var(--gold))] transition-colors">
              <Sun className="sun-icon h-5 w-5" />
              <Moon className="moon-icon h-5 w-5" />
            </button>
            <a href={`tel:${c.contact.phone}`} className="hidden md:flex">
              <Button className="bg-gradient-to-l from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A] text-white font-bold rounded-full">
                <Phone className="h-4 w-4 ml-2" /> اتصل الآن
              </Button>
            </a>
            <button className="lg:hidden text-[rgb(var(--gold))]" onClick={() => setMenuOpen(true)}><Menu size={26}/></button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'tween'}}
            className="fixed inset-0 z-50 glass-strong lg:hidden flex flex-col p-8">
            <div className="flex items-center justify-between mb-8">
              <button className="text-[rgb(var(--gold))]" onClick={()=>setMenuOpen(false)}><X size={30}/></button>
              <button
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
                className="theme-toggle h-11 w-11 rounded-full glass text-[rgb(var(--gold))]">
                <Sun className="sun-icon h-5 w-5" />
                <Moon className="moon-icon h-5 w-5" />
              </button>
            </div>
            {[['home','الرئيسية'],['about','من نحن'],['services','خدماتنا'],['gallery','المعرض'],['videos','فيديو'],['testimonials','آراء'],['contact','تواصل']].map(([id,label]) => (
              <a key={id} href={`#${id}`} onClick={()=>setMenuOpen(false)} className="text-2xl font-bold text-[rgb(var(--text-strong))] py-4 border-b border-[rgb(var(--gold)/10%)] hover:text-[rgb(var(--gold))]">{label}</a>
            ))}
            <a href="/admin" onClick={()=>setMenuOpen(false)} className="flex items-center gap-2 text-xl font-bold text-[rgb(var(--gold))] py-4 border-b border-[rgb(var(--gold)/10%)] hover:text-[rgb(var(--gold-light))] mt-4">
              🔒 لوحة التحكم
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO */}
      <section id="home" className="relative h-screen w-full overflow-hidden">
        <motion.div style={{ scale: heroScale }} className="absolute inset-0">
          {c.hero.backgroundVideo ? (
            <video src={c.hero.backgroundVideo} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover"/>
          ) : (
            <img src={c.hero.backgroundImage} alt="" className="absolute inset-0 w-full h-full object-cover"/>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-[rgb(var(--page-bg))]"/>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,black_90%)]"/>
        </motion.div>

        <motion.div style={{opacity: heroOpacity}} className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.div initial={{opacity:0, y:30}} animate={{opacity:1, y:0}} transition={{delay:0.3, duration:0.9}}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass mb-8">
            <Sparkles className="h-4 w-4 text-[rgb(var(--gold))]"/>
            <span className="text-[rgb(var(--gold))] text-sm font-medium tracking-wide">تجربة فاخرة لا تُنسى</span>
          </motion.div>

          <motion.h1 initial={{opacity:0, y:50}} animate={{opacity:1, y:0}} transition={{delay:0.5, duration:1}}
            className="gold-text text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-none mb-6">
            {c.hero.title}
          </motion.h1>

          <motion.p initial={{opacity:0, y:30}} animate={{opacity:1, y:0}} transition={{delay:0.8, duration:0.8}}
            className="text-lg md:text-2xl text-[rgb(var(--text-heading)/85%)] max-w-3xl mb-4 font-light leading-relaxed">
            {c.hero.subtitle}
          </motion.p>
          <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1, duration:0.8}}
            className="text-[rgb(var(--gold)/80%)] md:text-lg mb-10">
            {c.hero.description}
          </motion.p>

          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:1.1, duration:0.7}}
            className="flex flex-col sm:flex-row gap-4">
            <a href={c.hero.ctaPrimary.href}>
              <Button size="lg" className="h-14 px-8 text-lg bg-gradient-to-l from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A] text-white font-bold rounded-full hover-gold-glow">
                <Phone className="h-5 w-5 ml-2"/>{c.hero.ctaPrimary.label}
              </Button>
            </a>
            <a href={c.hero.ctaSecondary.href}>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-[rgb(var(--gold)/50%)] bg-white/5 hover:bg-[rgb(var(--gold-light)/10%)] text-[rgb(var(--gold))] hover:text-[rgb(var(--gold-light))] font-bold rounded-full backdrop-blur">
                {c.hero.ctaSecondary.label}<ArrowLeft className="h-5 w-5 mr-2"/>
              </Button>
            </a>
          </motion.div>

          {/* stats */}
          <motion.div initial={{opacity:0, y:30}} animate={{opacity:1, y:0}} transition={{delay:1.4, duration:0.8}}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-16 max-w-4xl w-full">
            {(c.hero.stats||[]).map((s,i)=>(
              <div key={i} className="glass rounded-2xl p-4 md:p-6 text-center">
                <div className="gold-text text-3xl md:text-4xl font-black">{s.value}</div>
                <div className="text-[rgb(var(--text-body2)/70%)] text-xs md:text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div animate={{y:[0,10,0]}} transition={{repeat:Infinity, duration:2}}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-[rgb(var(--gold)/70%)] text-sm flex flex-col items-center">
          <span>مرر للأسفل</span>
          <ChevronUp className="rotate-180 mt-2"/>
        </motion.div>
      </section>

      {/* ABOUT */}
      <section id="about" className="relative py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="fade-up">
              <p className="text-[rgb(var(--gold))] font-semibold tracking-widest mb-3">من نحن</p>
              <h2 className="text-4xl md:text-5xl font-black mb-6"><span className="gold-text">{c.about.title}</span></h2>
              <p className="text-[rgb(var(--text-heading)/80%)] text-lg leading-relaxed mb-8">{c.about.intro}</p>
              <div className="space-y-6">
                <div className="glass rounded-2xl p-6"><h3 className="text-[rgb(var(--gold))] text-lg font-bold mb-2">رؤيتنا</h3><p className="text-[rgb(var(--text-heading)/80%)]">{c.about.vision}</p></div>
                <div className="glass rounded-2xl p-6"><h3 className="text-[rgb(var(--gold))] text-lg font-bold mb-2">رسالتنا</h3><p className="text-[rgb(var(--text-heading)/80%)]">{c.about.mission}</p></div>
              </div>
            </div>
            <div className="fade-up relative">
              <div className="absolute -inset-4 bg-yellow-500/20 blur-3xl rounded-full"/>
              <img src={c.about.image} alt="about" className="relative rounded-3xl w-full h-[500px] object-cover gold-border shadow-2xl shadow-yellow-500/10"/>
            </div>
          </div>

          <div className="mt-24">
            <h3 className="text-3xl md:text-4xl font-black text-center mb-12"><span className="gold-text">لماذا نحن؟</span></h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(c.about.whyUs||[]).map((w,i)=>{
                const Icon = ICONS[w.icon] || Sparkles;
                return (
                  <div key={i} className="fade-up glass rounded-3xl p-8 hover-gold-glow text-center" style={{transitionDelay:`${i*0.08}s`}}>
                    <div className="h-16 w-16 mx-auto rounded-2xl gold-gradient-bg flex items-center justify-center mb-4 shadow-lg shadow-yellow-500/40">
                      <Icon className="h-8 w-8 text-black"/>
                    </div>
                    <h4 className="text-xl font-bold text-[rgb(var(--gold))] mb-2">{w.title}</h4>
                    <p className="text-[rgb(var(--text-body2)/70%)] text-sm leading-relaxed">{w.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="relative py-24 md:py-32 bg-gradient-to-b from-[rgb(var(--page-bg))] via-[rgb(var(--page-bg-alt))] to-[rgb(var(--page-bg))]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16 fade-up">
            <p className="text-[rgb(var(--gold))] font-semibold tracking-widest mb-3">خدماتنا</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4"><span className="gold-text">حلول متكاملة لحفلك</span></h2>
            <p className="text-[rgb(var(--text-body2)/70%)] max-w-2xl mx-auto text-lg">نقدم باقة متكاملة من خدمات الصوت والإضاءة لمناسبة لا تُنسى</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(c.services||[]).map((s,i)=>{
              const Icon = ICONS[s.icon] || Sparkles;
              return (
                <motion.div key={s.id} className="fade-up group relative rounded-3xl overflow-hidden gold-border hover-gold-glow bg-[rgb(var(--card-bg)/80%)]" style={{transitionDelay:`${i*0.05}s`}}>
                  <div className="relative h-64 overflow-hidden">
                    <img src={s.image} alt={s.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--text-strong))] via-[rgb(var(--text-strong)/60%)] to-transparent"/>
                    <div className="absolute top-4 right-4 h-12 w-12 rounded-2xl gold-gradient-bg flex items-center justify-center shadow-lg">
                      <Icon className="h-6 w-6 text-black"/>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-[rgb(var(--gold))] mb-2">{s.title}</h3>
                    <p className="text-[rgb(var(--text-body2)/70%)] leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="relative py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12 fade-up">
            <p className="text-[rgb(var(--gold))] font-semibold tracking-widest mb-3">أعمالنا</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4"><span className="gold-text">معرض الصور</span></h2>
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              {categories.map(cat=>(
                <button key={cat} onClick={()=>setGalleryFilter(cat)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition ${galleryFilter===cat?'gold-gradient-bg text-black':'glass text-[rgb(var(--text-heading)/80%)] hover:text-[rgb(var(--gold))]'}`}>{cat}</button>
              ))}
            </div>
          </div>
          <div className="masonry">
            {filteredGallery.map((g,i)=>(
              <motion.div key={g.id} initial={{opacity:0, scale:0.95}} whileInView={{opacity:1, scale:1}} viewport={{once:true, amount:0.1}} transition={{delay:i*0.03}}
                className="relative rounded-2xl overflow-hidden gold-border group cursor-pointer" onClick={()=>setLightbox(g)}>
                <img src={g.url} alt="" loading="lazy" className="w-full transition-transform duration-500 group-hover:scale-110"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition">
                  <div className="absolute bottom-4 right-4 h-10 w-10 rounded-full gold-gradient-bg flex items-center justify-center"><ZoomIn className="h-5 w-5 text-black"/></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <Dialog open={!!lightbox} onOpenChange={(o)=>!o && setLightbox(null)}>
        <DialogContent className="max-w-6xl bg-black/95 border-[rgb(var(--gold)/30%)] p-0 overflow-hidden">
          {lightbox && <img src={lightbox.url} alt="" className="w-full h-auto max-h-[85vh] object-contain"/>}
        </DialogContent>
      </Dialog>

      {/* VIDEOS */}
      <section id="videos" className="relative py-24 md:py-32 bg-gradient-to-b from-[rgb(var(--page-bg))] via-[rgb(var(--page-bg-alt))] to-[rgb(var(--page-bg))]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-14 fade-up">
            <p className="text-[rgb(var(--gold))] font-semibold tracking-widest mb-3">فيديو</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4"><span className="gold-text">من أحدث حفلاتنا</span></h2>
          </div>
          <div className={`grid gap-6 grid-cols-1 md:grid-cols-2 ${c.youtubeSettings?.columns===4?'lg:grid-cols-4':c.youtubeSettings?.columns===2?'lg:grid-cols-2':c.youtubeSettings?.columns===1?'lg:grid-cols-1':'lg:grid-cols-3'}`}>
            {(c.videos||[]).slice(0, c.youtubeSettings?.maxVideos||12).sort((a,b)=>(b.addedAt||0)-(a.addedAt||0)).map(v=>{
              const isCloudinary = v.source === 'cloudinary';
              const vid = v.videoId || (!isCloudinary ? getYouTubeId(v.url) : null);
              return (
                <div key={v.id} className="fade-up group relative rounded-2xl overflow-hidden gold-border cursor-pointer hover-gold-glow" onClick={()=>setVideoOpen(isCloudinary ? {type:'cloudinary', url:v.url} : {type:'youtube', id:vid})}>
                  {isCloudinary ? (
                    <video src={v.url} className="w-full aspect-video object-cover bg-black" muted playsInline preload="metadata"/>
                  ) : (
                    <img src={`https://i.ytimg.com/vi/${vid}/maxresdefault.jpg`} onError={(e)=>{e.target.src=`https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;}} alt={v.title||''} className="w-full aspect-video object-cover"/>
                  )}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full gold-gradient-bg flex items-center justify-center shadow-2xl shadow-yellow-500/50 group-hover:scale-110 transition">
                      <Play className="h-7 w-7 text-white fill-white mr-1"/>
                    </div>
                  </div>
                  {v.title && <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 to-transparent"><p className="text-white font-medium truncate">{v.title}</p></div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Dialog open={!!videoOpen} onOpenChange={(o)=>!o && setVideoOpen(null)}>
        <DialogContent className="max-w-5xl bg-black border-[rgb(var(--gold)/30%)] p-0 overflow-hidden">
          {videoOpen && (
            videoOpen.type === 'cloudinary' ? (
              <div className="aspect-video"><video src={videoOpen.url} controls autoPlay className="w-full h-full bg-black"/></div>
            ) : (
              <div className="aspect-video"><iframe src={`https://www.youtube.com/embed/${videoOpen.id}?autoplay=1`} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen/></div>
            )
          )}
        </DialogContent>
      </Dialog>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="relative py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-14 fade-up">
            <p className="text-[rgb(var(--gold))] font-semibold tracking-widest mb-3">آراء العملاء</p>
            <h2 className="text-4xl md:text-5xl font-black"><span className="gold-text">يقولون عنا</span></h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(c.testimonials||[]).map((t,i)=>(
              <div key={t.id} className="fade-up glass rounded-3xl p-8 hover-gold-glow" style={{transitionDelay:`${i*0.08}s`}}>
                <div className="flex gap-1 mb-4">{Array.from({length: t.rating||5}).map((_,k)=><Star key={k} className="h-5 w-5 fill-yellow-400 text-[rgb(var(--gold))]"/>)}</div>
                <p className="text-[rgb(var(--text-heading)/85%)] leading-relaxed mb-6 text-lg">“{t.text}”</p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full gold-gradient-bg flex items-center justify-center text-black font-black">{(t.name||'').slice(0,1)}</div>
                  <div><div className="font-bold text-[rgb(var(--gold))]">{t.name}</div><div className="text-sm text-[rgb(var(--text-muted)/60%)]">{t.role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="relative py-24 md:py-32 bg-gradient-to-b from-[rgb(var(--page-bg))] via-[rgb(var(--page-bg-alt))] to-[rgb(var(--page-bg))]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-14 fade-up">
            <p className="text-[rgb(var(--gold))] font-semibold tracking-widest mb-3">تواصل معنا</p>
            <h2 className="text-4xl md:text-5xl font-black"><span className="gold-text">احجز حفلك الآن</span></h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="fade-up glass rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-[rgb(var(--gold))] mb-6">أرسل رسالة</h3>
              <form onSubmit={submitContact} className="space-y-4">
                <Input name="name" required placeholder="الاسم الكامل" className="h-12 bg-[rgb(var(--card-bg)/70%)] border-[rgb(var(--gold)/20%)] focus:border-yellow-500"/>
                <div className="grid grid-cols-2 gap-4">
                  <Input name="phone" required placeholder="رقم الجوال" className="h-12 bg-[rgb(var(--card-bg)/70%)] border-[rgb(var(--gold)/20%)]"/>
                  <Input name="email" type="email" placeholder="الإيميل" className="h-12 bg-[rgb(var(--card-bg)/70%)] border-[rgb(var(--gold)/20%)]"/>
                </div>
                <Input name="eventType" placeholder="نوع الحفل (زفاف، تخرج، مؤتمر...)" className="h-12 bg-[rgb(var(--card-bg)/70%)] border-[rgb(var(--gold)/20%)]"/>
                <Textarea name="message" required rows={5} placeholder="تفاصيل الحدث..." className="bg-[rgb(var(--card-bg)/70%)] border-[rgb(var(--gold)/20%)]"/>
                <Button type="submit" className="w-full h-13 bg-gradient-to-l from-[#16A34A] to-[#22C55E] hover:from-[#15803D] hover:to-[#16A34A] text-white font-bold rounded-full text-lg py-6">إرسال الرسالة</Button>
              </form>
            </div>

            <div className="fade-up space-y-4">
              <a href={`tel:${c.contact.phone}`} className="flex items-center gap-4 glass rounded-2xl p-5 hover-gold-glow">
                <div className="h-12 w-12 rounded-xl gold-gradient-bg flex items-center justify-center"><Phone className="h-6 w-6 text-black"/></div>
                <div><div className="text-[rgb(var(--text-muted)/60%)] text-sm">اتصل بنا</div><div className="text-[rgb(var(--text-strong))] font-bold text-lg" dir="ltr">{c.contact.phone}</div></div>
              </a>
              <a href={`https://wa.me/${(c.contact.whatsapp||'').replace(/[^0-9]/g,'')}`} target="_blank" className="flex items-center gap-4 glass rounded-2xl p-5 hover-gold-glow">
                <div className="h-12 w-12 rounded-xl gold-gradient-bg flex items-center justify-center"><MessageCircle className="h-6 w-6 text-black"/></div>
                <div><div className="text-[rgb(var(--text-muted)/60%)] text-sm">واتساب</div><div className="text-[rgb(var(--text-strong))] font-bold text-lg" dir="ltr">{c.contact.whatsapp}</div></div>
              </a>
              <a href={`mailto:${c.contact.email}`} className="flex items-center gap-4 glass rounded-2xl p-5 hover-gold-glow">
                <div className="h-12 w-12 rounded-xl gold-gradient-bg flex items-center justify-center"><Mail className="h-6 w-6 text-black"/></div>
                <div><div className="text-[rgb(var(--text-muted)/60%)] text-sm">الإيميل</div><div className="text-[rgb(var(--text-strong))] font-bold text-lg" dir="ltr">{c.contact.email}</div></div>
              </a>
              <div className="flex items-center gap-4 glass rounded-2xl p-5">
                <div className="h-12 w-12 rounded-xl gold-gradient-bg flex items-center justify-center"><MapPin className="h-6 w-6 text-black"/></div>
                <div><div className="text-[rgb(var(--text-muted)/60%)] text-sm">الموقع</div><div className="text-[rgb(var(--text-strong))] font-bold">{c.contact.address}</div></div>
              </div>
              {c.contact.mapEmbed && (
                <div className="rounded-2xl overflow-hidden gold-border h-64">
                  <iframe src={c.contact.mapEmbed} className="w-full h-full border-0" loading="lazy" allowFullScreen/>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative pt-16 pb-8 border-t border-[rgb(var(--gold)/10%)]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-full gold-gradient-bg flex items-center justify-center"><Music className="h-5 w-5 text-black"/></div>
                <span className="text-2xl font-black gold-text">{c.brand.logoText}</span>
              </div>
              <p className="text-[rgb(var(--text-muted)/60%)] leading-relaxed">{c.footer.tagline}</p>
            </div>
            <div>
              <h4 className="text-[rgb(var(--gold))] font-bold mb-4">روابط سريعة</h4>
              <div className="space-y-2">
                {[['home','الرئيسية'],['about','من نحن'],['services','خدماتنا'],['gallery','المعرض'],['contact','تواصل']].map(([id,l])=>(
                  <a key={id} href={`#${id}`} className="block text-[rgb(var(--text-body2)/70%)] hover:text-[rgb(var(--gold))]">{l}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[rgb(var(--gold))] font-bold mb-4">تابعنا</h4>
              <div className="flex flex-wrap gap-3">
                {c.social.instagram && <a href={c.social.instagram} target="_blank" className="h-11 w-11 rounded-full glass hover:bg-[rgb(var(--gold-light)/20%)] flex items-center justify-center text-[rgb(var(--gold))]"><Instagram size={18}/></a>}
                {c.social.facebook && <a href={c.social.facebook} target="_blank" className="h-11 w-11 rounded-full glass hover:bg-[rgb(var(--gold-light)/20%)] flex items-center justify-center text-[rgb(var(--gold))]"><Facebook size={18}/></a>}
                {c.social.youtube && <a href={c.social.youtube} target="_blank" className="h-11 w-11 rounded-full glass hover:bg-[rgb(var(--gold-light)/20%)] flex items-center justify-center text-[rgb(var(--gold))]"><Youtube size={18}/></a>}
                {c.social.tiktok && <a href={c.social.tiktok} target="_blank" className="h-11 w-11 rounded-full glass hover:bg-[rgb(var(--gold-light)/20%)] flex items-center justify-center text-[rgb(var(--gold))] font-bold text-xs">TT</a>}
                {c.social.snapchat && <a href={c.social.snapchat} target="_blank" className="h-11 w-11 rounded-full glass hover:bg-[rgb(var(--gold-light)/20%)] flex items-center justify-center text-[rgb(var(--gold))] font-bold text-xs">SC</a>}
                {c.social.telegram && <a href={c.social.telegram} target="_blank" className="h-11 w-11 rounded-full glass hover:bg-[rgb(var(--gold-light)/20%)] flex items-center justify-center text-[rgb(var(--gold))]"><Send size={18}/></a>}
              </div>
            </div>
          </div>
          <div className="border-t border-[rgb(var(--gold)/10%)] pt-6 text-center text-[rgb(var(--text-faint)/50%)] text-sm">{c.footer.text}</div>
        </div>
      </footer>

      {/* Floating buttons */}
      <a href={`https://wa.me/${(c.contact.whatsapp||'').replace(/[^0-9]/g,'')}`} target="_blank"
        className="fixed bottom-6 right-auto left-6 z-30 h-14 w-14 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center shadow-2xl shadow-green-500/40 hover:scale-110 transition">
        <MessageCircle className="h-6 w-6 text-white"/>
      </a>

      {/* AI Assistant Chatbot Button with Golden Label */}
      <button onClick={() => setChatbotOpen(true)}
        className="z-30 ai-assistant-btn group" aria-label="فتح المساعد الذكي">
        <div className="ai-assistant-label">
          <span className="ai-assistant-title">Reem AI</span>
          <span className="ai-assistant-subtitle">تحدث معي ✨</span>
        </div>
        <div className="ai-btn-circle">
          <Sparkles className="h-5 w-5 text-black" />
        </div>
      </button>

      {/* Restored Floating Call Button */}
      <a href={`tel:${c.contact.phone}`}
        className="fixed bottom-24 right-auto left-6 z-30 h-14 w-14 rounded-full gold-gradient-bg flex items-center justify-center shadow-2xl shadow-yellow-500/40 hover:scale-110 transition">
        <Phone className="h-6 w-6 text-black"/>
      </a>

      {/* Smart Chatbot Modal */}
      <SmartChatbot isOpen={chatbotOpen} onClose={() => setChatbotOpen(false)} contactPhone={c.contact.phone} contactWhatsapp={c.contact.whatsapp} />

      <AnimatePresence>
        {showTop && (
          <motion.button initial={{opacity:0, scale:0}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0}}
            onClick={()=>window.scrollTo({top:0, behavior:'smooth'})}
            className="fixed bottom-6 right-6 z-30 h-12 w-12 rounded-full glass-strong border border-[rgb(var(--gold)/40%)] flex items-center justify-center text-[rgb(var(--gold))] hover:bg-[rgb(var(--gold-light)/20%)]">
            <ChevronUp/>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
