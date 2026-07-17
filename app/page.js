'use client';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Phone, MessageCircle, Mail, MapPin, Play, X, ChevronUp, Star,
  Instagram, Facebook, Youtube, Send, Music, Sparkles, Award, Users,
  Speaker, Disc3, Heart, GraduationCap, Mic, Lightbulb, Theater, Monitor,
  Menu, ArrowLeft, ZoomIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';

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

const App = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [videoOpen, setVideoOpen] = useState(null);
  const [galleryFilter, setGalleryFilter] = useState('الكل');
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.1]);

  useEffect(() => {
    fetch('/api/content').then(r => r.json()).then(d => {
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
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
        <div className="loader-ring mb-6"></div>
        <h1 className="text-3xl md:text-5xl font-bold gold-text">مؤسسة الذهبية</h1>
      </div>
    );
  }

  const c = content;
  const categories = ['الكل', ...Array.from(new Set((c.gallery || []).map(g => g.category).filter(Boolean)))];
  const filteredGallery = galleryFilter === 'الكل' ? c.gallery : c.gallery.filter(g => g.category === galleryFilter);

  return (
    <div className="relative bg-black min-h-screen overflow-x-hidden" dir="rtl">
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
              <a key={id} href={`#${id}`} className="text-white/80 hover:text-yellow-400 transition-colors font-medium">{label}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <a href={`tel:${c.contact.phone}`} className="hidden md:flex">
              <Button className="bg-gradient-to-l from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold rounded-full">
                <Phone className="h-4 w-4 ml-2" /> اتصل الآن
              </Button>
            </a>
            <button className="lg:hidden text-yellow-400" onClick={() => setMenuOpen(true)}><Menu size={26}/></button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'tween'}}
            className="fixed inset-0 z-50 glass-strong lg:hidden flex flex-col p-8">
            <button className="self-start text-yellow-400 mb-8" onClick={()=>setMenuOpen(false)}><X size={30}/></button>
            {[['home','الرئيسية'],['about','من نحن'],['services','خدماتنا'],['gallery','المعرض'],['videos','فيديو'],['testimonials','آراء'],['contact','تواصل']].map(([id,label]) => (
              <a key={id} href={`#${id}`} onClick={()=>setMenuOpen(false)} className="text-2xl font-bold text-white py-4 border-b border-yellow-500/10 hover:text-yellow-400">{label}</a>
            ))}
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black"/>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,black_90%)]"/>
        </motion.div>

        <motion.div style={{opacity: heroOpacity}} className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.div initial={{opacity:0, y:30}} animate={{opacity:1, y:0}} transition={{delay:0.3, duration:0.9}}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass mb-8">
            <Sparkles className="h-4 w-4 text-yellow-400"/>
            <span className="text-yellow-400 text-sm font-medium tracking-wide">تجربة فاخرة لا تُنسى</span>
          </motion.div>

          <motion.h1 initial={{opacity:0, y:50}} animate={{opacity:1, y:0}} transition={{delay:0.5, duration:1}}
            className="gold-text text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-none mb-6">
            {c.hero.title}
          </motion.h1>

          <motion.p initial={{opacity:0, y:30}} animate={{opacity:1, y:0}} transition={{delay:0.8, duration:0.8}}
            className="text-lg md:text-2xl text-white/85 max-w-3xl mb-4 font-light leading-relaxed">
            {c.hero.subtitle}
          </motion.p>
          <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1, duration:0.8}}
            className="text-yellow-400/80 md:text-lg mb-10">
            {c.hero.description}
          </motion.p>

          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:1.1, duration:0.7}}
            className="flex flex-col sm:flex-row gap-4">
            <a href={c.hero.ctaPrimary.href}>
              <Button size="lg" className="h-14 px-8 text-lg bg-gradient-to-l from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold rounded-full hover-gold-glow">
                <Phone className="h-5 w-5 ml-2"/>{c.hero.ctaPrimary.label}
              </Button>
            </a>
            <a href={c.hero.ctaSecondary.href}>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-yellow-500/50 bg-white/5 hover:bg-yellow-500/10 text-yellow-400 hover:text-yellow-300 font-bold rounded-full backdrop-blur">
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
                <div className="text-white/70 text-xs md:text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div animate={{y:[0,10,0]}} transition={{repeat:Infinity, duration:2}}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-yellow-400/70 text-sm flex flex-col items-center">
          <span>مرر للأسفل</span>
          <ChevronUp className="rotate-180 mt-2"/>
        </motion.div>
      </section>

      {/* ABOUT */}
      <section id="about" className="relative py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="fade-up">
              <p className="text-yellow-400 font-semibold tracking-widest mb-3">من نحن</p>
              <h2 className="text-4xl md:text-5xl font-black mb-6"><span className="gold-text">{c.about.title}</span></h2>
              <p className="text-white/80 text-lg leading-relaxed mb-8">{c.about.intro}</p>
              <div className="space-y-6">
                <div className="glass rounded-2xl p-6"><h3 className="text-yellow-400 text-lg font-bold mb-2">رؤيتنا</h3><p className="text-white/80">{c.about.vision}</p></div>
                <div className="glass rounded-2xl p-6"><h3 className="text-yellow-400 text-lg font-bold mb-2">رسالتنا</h3><p className="text-white/80">{c.about.mission}</p></div>
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
                    <h4 className="text-xl font-bold text-yellow-400 mb-2">{w.title}</h4>
                    <p className="text-white/70 text-sm leading-relaxed">{w.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="relative py-24 md:py-32 bg-gradient-to-b from-black via-zinc-950 to-black">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16 fade-up">
            <p className="text-yellow-400 font-semibold tracking-widest mb-3">خدماتنا</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4"><span className="gold-text">حلول متكاملة لحفلك</span></h2>
            <p className="text-white/70 max-w-2xl mx-auto text-lg">نقدم باقة متكاملة من خدمات الصوت والإضاءة لمناسبة لا تُنسى</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(c.services||[]).map((s,i)=>{
              const Icon = ICONS[s.icon] || Sparkles;
              return (
                <motion.div key={s.id} className="fade-up group relative rounded-3xl overflow-hidden gold-border hover-gold-glow bg-zinc-950" style={{transitionDelay:`${i*0.05}s`}}>
                  <div className="relative h-64 overflow-hidden">
                    <img src={s.image} alt={s.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"/>
                    <div className="absolute top-4 right-4 h-12 w-12 rounded-2xl gold-gradient-bg flex items-center justify-center shadow-lg">
                      <Icon className="h-6 w-6 text-black"/>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-yellow-400 mb-2">{s.title}</h3>
                    <p className="text-white/70 leading-relaxed">{s.desc}</p>
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
            <p className="text-yellow-400 font-semibold tracking-widest mb-3">أعمالنا</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4"><span className="gold-text">معرض الصور</span></h2>
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              {categories.map(cat=>(
                <button key={cat} onClick={()=>setGalleryFilter(cat)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition ${galleryFilter===cat?'gold-gradient-bg text-black':'glass text-white/80 hover:text-yellow-400'}`}>{cat}</button>
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
        <DialogContent className="max-w-6xl bg-black/95 border-yellow-500/30 p-0 overflow-hidden">
          {lightbox && <img src={lightbox.url} alt="" className="w-full h-auto max-h-[85vh] object-contain"/>}
        </DialogContent>
      </Dialog>

      {/* VIDEOS */}
      <section id="videos" className="relative py-24 md:py-32 bg-gradient-to-b from-black via-zinc-950 to-black">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-14 fade-up">
            <p className="text-yellow-400 font-semibold tracking-widest mb-3">فيديو</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4"><span className="gold-text">من أحدث حفلاتنا</span></h2>
          </div>
          <div className={`grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-${c.youtubeSettings?.columns||3}`}>
            {(c.videos||[]).slice(0, c.youtubeSettings?.maxVideos||12).sort((a,b)=>(b.addedAt||0)-(a.addedAt||0)).map(v=>{
              const vid = v.videoId || getYouTubeId(v.url);
              return (
                <div key={v.id} className="fade-up group relative rounded-2xl overflow-hidden gold-border cursor-pointer hover-gold-glow" onClick={()=>setVideoOpen(vid)}>
                  <img src={`https://i.ytimg.com/vi/${vid}/maxresdefault.jpg`} onError={(e)=>{e.target.src=`https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;}} alt={v.title||''} className="w-full aspect-video object-cover"/>
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full gold-gradient-bg flex items-center justify-center shadow-2xl shadow-yellow-500/50 group-hover:scale-110 transition">
                      <Play className="h-7 w-7 text-black fill-black mr-1"/>
                    </div>
                  </div>
                  {v.title && <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black to-transparent"><p className="text-white font-medium truncate">{v.title}</p></div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Dialog open={!!videoOpen} onOpenChange={(o)=>!o && setVideoOpen(null)}>
        <DialogContent className="max-w-5xl bg-black border-yellow-500/30 p-0 overflow-hidden">
          {videoOpen && <div className="aspect-video"><iframe src={`https://www.youtube.com/embed/${videoOpen}?autoplay=1`} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen/></div>}
        </DialogContent>
      </Dialog>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="relative py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-14 fade-up">
            <p className="text-yellow-400 font-semibold tracking-widest mb-3">آراء العملاء</p>
            <h2 className="text-4xl md:text-5xl font-black"><span className="gold-text">يقولون عنا</span></h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(c.testimonials||[]).map((t,i)=>(
              <div key={t.id} className="fade-up glass rounded-3xl p-8 hover-gold-glow" style={{transitionDelay:`${i*0.08}s`}}>
                <div className="flex gap-1 mb-4">{Array.from({length: t.rating||5}).map((_,k)=><Star key={k} className="h-5 w-5 fill-yellow-400 text-yellow-400"/>)}</div>
                <p className="text-white/85 leading-relaxed mb-6 text-lg">“{t.text}”</p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full gold-gradient-bg flex items-center justify-center text-black font-black">{(t.name||'').slice(0,1)}</div>
                  <div><div className="font-bold text-yellow-400">{t.name}</div><div className="text-sm text-white/60">{t.role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="relative py-24 md:py-32 bg-gradient-to-b from-black via-zinc-950 to-black">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-14 fade-up">
            <p className="text-yellow-400 font-semibold tracking-widest mb-3">تواصل معنا</p>
            <h2 className="text-4xl md:text-5xl font-black"><span className="gold-text">احجز حفلك الآن</span></h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="fade-up glass rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-yellow-400 mb-6">أرسل رسالة</h3>
              <form onSubmit={submitContact} className="space-y-4">
                <Input name="name" required placeholder="الاسم الكامل" className="h-12 bg-black/40 border-yellow-500/20 focus:border-yellow-500"/>
                <div className="grid grid-cols-2 gap-4">
                  <Input name="phone" required placeholder="رقم الجوال" className="h-12 bg-black/40 border-yellow-500/20"/>
                  <Input name="email" type="email" placeholder="الإيميل" className="h-12 bg-black/40 border-yellow-500/20"/>
                </div>
                <Input name="eventType" placeholder="نوع الحفل (زفاف، تخرج، مؤتمر...)" className="h-12 bg-black/40 border-yellow-500/20"/>
                <Textarea name="message" required rows={5} placeholder="تفاصيل الحدث..." className="bg-black/40 border-yellow-500/20"/>
                <Button type="submit" className="w-full h-13 bg-gradient-to-l from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold rounded-full text-lg py-6">إرسال الرسالة</Button>
              </form>
            </div>

            <div className="fade-up space-y-4">
              <a href={`tel:${c.contact.phone}`} className="flex items-center gap-4 glass rounded-2xl p-5 hover-gold-glow">
                <div className="h-12 w-12 rounded-xl gold-gradient-bg flex items-center justify-center"><Phone className="h-6 w-6 text-black"/></div>
                <div><div className="text-white/60 text-sm">اتصل بنا</div><div className="text-white font-bold text-lg" dir="ltr">{c.contact.phone}</div></div>
              </a>
              <a href={`https://wa.me/${(c.contact.whatsapp||'').replace(/[^0-9]/g,'')}`} target="_blank" className="flex items-center gap-4 glass rounded-2xl p-5 hover-gold-glow">
                <div className="h-12 w-12 rounded-xl gold-gradient-bg flex items-center justify-center"><MessageCircle className="h-6 w-6 text-black"/></div>
                <div><div className="text-white/60 text-sm">واتساب</div><div className="text-white font-bold text-lg" dir="ltr">{c.contact.whatsapp}</div></div>
              </a>
              <a href={`mailto:${c.contact.email}`} className="flex items-center gap-4 glass rounded-2xl p-5 hover-gold-glow">
                <div className="h-12 w-12 rounded-xl gold-gradient-bg flex items-center justify-center"><Mail className="h-6 w-6 text-black"/></div>
                <div><div className="text-white/60 text-sm">الإيميل</div><div className="text-white font-bold text-lg" dir="ltr">{c.contact.email}</div></div>
              </a>
              <div className="flex items-center gap-4 glass rounded-2xl p-5">
                <div className="h-12 w-12 rounded-xl gold-gradient-bg flex items-center justify-center"><MapPin className="h-6 w-6 text-black"/></div>
                <div><div className="text-white/60 text-sm">الموقع</div><div className="text-white font-bold">{c.contact.address}</div></div>
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
      <footer className="relative pt-16 pb-8 border-t border-yellow-500/10">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-full gold-gradient-bg flex items-center justify-center"><Music className="h-5 w-5 text-black"/></div>
                <span className="text-2xl font-black gold-text">{c.brand.logoText}</span>
              </div>
              <p className="text-white/60 leading-relaxed">{c.footer.tagline}</p>
            </div>
            <div>
              <h4 className="text-yellow-400 font-bold mb-4">روابط سريعة</h4>
              <div className="space-y-2">
                {[['home','الرئيسية'],['about','من نحن'],['services','خدماتنا'],['gallery','المعرض'],['contact','تواصل']].map(([id,l])=>(
                  <a key={id} href={`#${id}`} className="block text-white/70 hover:text-yellow-400">{l}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-yellow-400 font-bold mb-4">تابعنا</h4>
              <div className="flex flex-wrap gap-3">
                {c.social.instagram && <a href={c.social.instagram} target="_blank" className="h-11 w-11 rounded-full glass hover:bg-yellow-500/20 flex items-center justify-center text-yellow-400"><Instagram size={18}/></a>}
                {c.social.facebook && <a href={c.social.facebook} target="_blank" className="h-11 w-11 rounded-full glass hover:bg-yellow-500/20 flex items-center justify-center text-yellow-400"><Facebook size={18}/></a>}
                {c.social.youtube && <a href={c.social.youtube} target="_blank" className="h-11 w-11 rounded-full glass hover:bg-yellow-500/20 flex items-center justify-center text-yellow-400"><Youtube size={18}/></a>}
                {c.social.tiktok && <a href={c.social.tiktok} target="_blank" className="h-11 w-11 rounded-full glass hover:bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold text-xs">TT</a>}
                {c.social.snapchat && <a href={c.social.snapchat} target="_blank" className="h-11 w-11 rounded-full glass hover:bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold text-xs">SC</a>}
                {c.social.telegram && <a href={c.social.telegram} target="_blank" className="h-11 w-11 rounded-full glass hover:bg-yellow-500/20 flex items-center justify-center text-yellow-400"><Send size={18}/></a>}
              </div>
            </div>
          </div>
          <div className="border-t border-yellow-500/10 pt-6 text-center text-white/50 text-sm">{c.footer.text}</div>
        </div>
      </footer>

      {/* Floating buttons */}
      <a href={`https://wa.me/${(c.contact.whatsapp||'').replace(/[^0-9]/g,'')}`} target="_blank"
        className="fixed bottom-6 left-6 z-30 h-14 w-14 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center shadow-2xl shadow-green-500/40 hover:scale-110 transition">
        <MessageCircle className="h-6 w-6 text-white"/>
      </a>
      <a href={`tel:${c.contact.phone}`}
        className="fixed bottom-24 left-6 z-30 h-14 w-14 rounded-full gold-gradient-bg flex items-center justify-center shadow-2xl shadow-yellow-500/40 hover:scale-110 transition">
        <Phone className="h-6 w-6 text-black"/>
      </a>
      <AnimatePresence>
        {showTop && (
          <motion.button initial={{opacity:0, scale:0}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0}}
            onClick={()=>window.scrollTo({top:0, behavior:'smooth'})}
            className="fixed bottom-6 right-6 z-30 h-12 w-12 rounded-full glass-strong border border-yellow-500/40 flex items-center justify-center text-yellow-400 hover:bg-yellow-500/20">
            <ChevronUp/>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
