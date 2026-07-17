'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Lock, Save, Plus, Trash2, RefreshCw, LogOut, Youtube, Image as ImageIcon, ExternalLink, Home, Info, Wrench, Grid3x3, Video, Star, Phone, Share2, Search, ChevronsUp } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const Admin = () => {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [content, setContent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [ytUrl, setYtUrl] = useState('');
  const [ytLoading, setYtLoading] = useState(false);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
    if (t) setToken(t);
  }, []);

  useEffect(() => {
    if (token) loadContent();
  }, [token]);

  const loadContent = async () => {
    const r = await fetch('/api/content');
    const d = await r.json();
    setContent(d);
  };

  const login = async (e) => {
    e.preventDefault();
    const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    const d = await r.json();
    if (r.ok && d.token) {
      localStorage.setItem('admin_token', d.token);
      setToken(d.token);
      toast.success('مرحباً بك في لوحة التحكم');
    } else {
      toast.error(d.error || 'خطأ في تسجيل الدخول');
    }
  };

  const logout = () => { localStorage.removeItem('admin_token'); setToken(''); setContent(null); };

  const save = async () => {
    setSaving(true);
    try {
      const body = { ...content }; delete body._id;
      const r = await fetch('/api/content', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      if (r.status === 401) { logout(); return; }
      if (!r.ok) throw new Error('save failed');
      toast.success('تم الحفظ بنجاح ✔');
    } catch (e) { toast.error('فشل الحفظ'); }
    setSaving(false);
  };

  const update = (path, value) => {
    setContent(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = copy;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  const resolveYouTube = async () => {
    if (!ytUrl) return;
    setYtLoading(true);
    try {
      const r = await fetch('/api/youtube/resolve', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ url: ytUrl }) });
      const items = await r.json();
      if (Array.isArray(items) && items.length) {
        const existing = new Set((content.videos || []).map(v => v.videoId));
        const fresh = items.filter(v => !existing.has(v.videoId)).map(v => ({ ...v, addedAt: v.addedAt || Date.now() }));
        setContent(prev => ({ ...prev, videos: [...fresh, ...(prev.videos || [])] }));
        toast.success(`تمت إضافة ${fresh.length} فيديو`);
        setYtUrl('');
      } else {
        toast.error('لم يتم العثور على فيديوهات');
      }
    } catch (e) { toast.error('فشل جلب الفيديوهات'); }
    setYtLoading(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4" dir="rtl">
        <form onSubmit={login} className="w-full max-w-md glass-strong rounded-3xl p-8 gold-border">
          <div className="text-center mb-8">
            <div className="h-16 w-16 mx-auto rounded-2xl gold-gradient-bg flex items-center justify-center mb-4"><Lock className="h-8 w-8 text-black"/></div>
            <h1 className="text-3xl font-black gold-text mb-2">لوحة التحكم</h1>
            <p className="text-white/60 text-sm">مؤسسة الذهبية</p>
          </div>
          <Label className="text-yellow-400">كلمة المرور</Label>
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-2 h-12 bg-black/40 border-yellow-500/30" placeholder="أدخل كلمة المرور"/>
          <Button type="submit" className="w-full mt-6 h-12 bg-gradient-to-l from-yellow-500 to-yellow-600 text-black font-bold rounded-full">دخول</Button>
          <p className="text-center text-white/40 text-xs mt-6">الكلمة الافتراضية: admin2025</p>
        </form>
      </div>
    );
  }

  if (!content) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="loader-ring"/></div>;

  return (
    <div className="min-h-screen bg-black text-white pb-24" dir="rtl">
      {/* Top bar */}
      <div className="sticky top-0 z-40 glass-strong border-b border-yellow-500/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-black gold-text">لوحة التحكم - مؤسسة الذهبية</h1>
          <div className="flex gap-2">
            <a href="/" target="_blank"><Button variant="outline" className="border-yellow-500/40 text-yellow-400"><ExternalLink className="h-4 w-4 ml-2"/>الموقع</Button></a>
            <Button onClick={save} disabled={saving} className="bg-gradient-to-l from-yellow-500 to-yellow-600 text-black font-bold">
              {saving ? <RefreshCw className="h-4 w-4 ml-2 animate-spin"/> : <Save className="h-4 w-4 ml-2"/>}حفظ
            </Button>
            <Button onClick={logout} variant="ghost" className="text-white/60"><LogOut className="h-4 w-4"/></Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="hero" className="w-full">
          <TabsList className="w-full flex flex-wrap gap-2 bg-transparent h-auto justify-start">
            {[['hero','الرئيسية',Home],['about','من نحن',Info],['services','الخدمات',Wrench],['gallery','المعرض',Grid3x3],['videos','الفيديو',Video],['testimonials','الآراء',Star],['contact','التواصل',Phone],['social','السوشيال',Share2],['seo','SEO',Search],['footer','الفوتر',ChevronsUp]].map(([v,l,I])=>(
              <TabsTrigger key={v} value={v} className="data-[state=active]:gold-gradient-bg data-[state=active]:text-black glass gold-border rounded-full px-4 py-2">
                <I className="h-4 w-4 ml-2"/>{l}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* HERO */}
          <TabsContent value="hero" className="mt-8">
            <Card className="glass rounded-3xl p-6 space-y-4 border-yellow-500/20">
              <Section title="القسم الرئيسي (Hero)">
                <Field label="اسم العلامة (لوجو)"><Input value={content.brand?.logoText||''} onChange={e=>update('brand.logoText', e.target.value)}/></Field>
                <Field label="عنوان الهيرو"><Input value={content.hero.title} onChange={e=>update('hero.title', e.target.value)}/></Field>
                <Field label="الشعار"><Textarea value={content.hero.subtitle} onChange={e=>update('hero.subtitle', e.target.value)}/></Field>
                <Field label="وصف صغير"><Input value={content.hero.description} onChange={e=>update('hero.description', e.target.value)}/></Field>
                <Field label="رابط صورة الخلفية"><Input value={content.hero.backgroundImage} onChange={e=>update('hero.backgroundImage', e.target.value)}/></Field>
                <Field label="رابط فيديو الخلفية (اختياري - إذا مُعبأ سيحل محل الصورة)"><Input value={content.hero.backgroundVideo||''} onChange={e=>update('hero.backgroundVideo', e.target.value)}/></Field>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-yellow-400 font-bold mb-2">زر رئيسي</h4>
                    <Input className="mb-2" placeholder="النص" value={content.hero.ctaPrimary?.label||''} onChange={e=>update('hero.ctaPrimary.label', e.target.value)}/>
                    <Input placeholder="الرابط" value={content.hero.ctaPrimary?.href||''} onChange={e=>update('hero.ctaPrimary.href', e.target.value)}/>
                  </div>
                  <div>
                    <h4 className="text-yellow-400 font-bold mb-2">زر ثانوي</h4>
                    <Input className="mb-2" placeholder="النص" value={content.hero.ctaSecondary?.label||''} onChange={e=>update('hero.ctaSecondary.label', e.target.value)}/>
                    <Input placeholder="الرابط" value={content.hero.ctaSecondary?.href||''} onChange={e=>update('hero.ctaSecondary.href', e.target.value)}/>
                  </div>
                </div>
              </Section>

              <Section title="الإحصائيات">
                <ArrayEditor items={content.hero.stats||[]} onChange={v=>update('hero.stats', v)}
                  fields={[{k:'value',l:'القيمة'},{k:'label',l:'التسمية'}]}
                  newItem={()=>({value:'0',label:'جديد'})}/>
              </Section>
            </Card>
          </TabsContent>

          {/* ABOUT */}
          <TabsContent value="about" className="mt-8">
            <Card className="glass rounded-3xl p-6 space-y-4 border-yellow-500/20">
              <Field label="العنوان"><Input value={content.about.title} onChange={e=>update('about.title', e.target.value)}/></Field>
              <Field label="نبذة"><Textarea rows={4} value={content.about.intro} onChange={e=>update('about.intro', e.target.value)}/></Field>
              <Field label="الرؤية"><Textarea value={content.about.vision} onChange={e=>update('about.vision', e.target.value)}/></Field>
              <Field label="الرسالة"><Textarea value={content.about.mission} onChange={e=>update('about.mission', e.target.value)}/></Field>
              <Field label="رابط صورة قسم من نحن"><Input value={content.about.image} onChange={e=>update('about.image', e.target.value)}/></Field>
              <Section title="لماذا نحن (4 عناصر)">
                <ArrayEditor items={content.about.whyUs||[]} onChange={v=>update('about.whyUs', v)}
                  fields={[{k:'icon',l:'أيقونة (Award/Speaker/Users/Sparkles)'},{k:'title',l:'العنوان'},{k:'desc',l:'الوصف'}]}
                  newItem={()=>({icon:'Sparkles',title:'',desc:''})}/>
              </Section>
            </Card>
          </TabsContent>

          {/* SERVICES */}
          <TabsContent value="services" className="mt-8">
            <Card className="glass rounded-3xl p-6 border-yellow-500/20">
              <ArrayEditor items={content.services||[]} onChange={v=>update('services', v)}
                fields={[{k:'title',l:'اسم الخدمة'},{k:'desc',l:'الوصف',type:'textarea'},{k:'image',l:'رابط الصورة'},{k:'icon',l:'أيقونة (Speaker/Disc3/Heart/GraduationCap/Mic/Lightbulb/Theater/Monitor/Sparkles)'}]}
                newItem={()=>({id:uuidv4(),title:'خدمة جديدة',desc:'',image:'',icon:'Sparkles',gallery:[]})}/>
            </Card>
          </TabsContent>

          {/* GALLERY */}
          <TabsContent value="gallery" className="mt-8">
            <Card className="glass rounded-3xl p-6 border-yellow-500/20">
              <div className="mb-4 flex gap-2">
                <Button onClick={()=>{ const url = prompt('رابط الصورة:'); const category = prompt('التصنيف:', 'زفاف'); if(url) update('gallery', [{id:uuidv4(), url, category:category||''}, ...(content.gallery||[])]); }} className="bg-yellow-500 text-black"><Plus className="h-4 w-4 ml-1"/>إضافة صورة</Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(content.gallery||[]).map((g,i)=>(
                  <div key={g.id} className="relative rounded-xl overflow-hidden gold-border group">
                    <img src={g.url} alt="" className="w-full h-40 object-cover"/>
                    <Input className="absolute bottom-0 inset-x-0 bg-black/80 border-0 text-xs text-yellow-300" value={g.category||''} onChange={e=>{ const arr=[...content.gallery]; arr[i]={...g,category:e.target.value}; update('gallery',arr); }}/>
                    <button onClick={()=>update('gallery', content.gallery.filter((_,j)=>j!==i))} className="absolute top-2 right-2 h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* VIDEOS */}
          <TabsContent value="videos" className="mt-8">
            <Card className="glass rounded-3xl p-6 border-yellow-500/20 space-y-6">
              <div className="glass rounded-2xl p-5">
                <h3 className="text-yellow-400 font-bold mb-3 flex items-center"><Youtube className="ml-2 h-5 w-5"/>إضافة من يوتيوب</h3>
                <p className="text-white/60 text-sm mb-3">الصق رابط قناة YouTube، أو رابط قائمة تشغيل، أو رابط فيديو مفرد. سيتم جلب الفيديوهات تلقائياً.</p>
                <div className="flex gap-2">
                  <Input value={ytUrl} onChange={e=>setYtUrl(e.target.value)} placeholder="https://www.youtube.com/@channel أو https://www.youtube.com/playlist?list=... أو https://youtu.be/xxxx"/>
                  <Button onClick={resolveYouTube} disabled={ytLoading} className="bg-yellow-500 text-black">{ytLoading?<RefreshCw className="h-4 w-4 animate-spin"/>:'جلب'}</Button>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <Field label="عدد الفيديوهات المعروضة"><Input type="number" value={content.youtubeSettings?.maxVideos||12} onChange={e=>update('youtubeSettings.maxVideos', Number(e.target.value))}/></Field>
                <Field label="عدد الأعمدة (1-4)"><Input type="number" min={1} max={4} value={content.youtubeSettings?.columns||3} onChange={e=>update('youtubeSettings.columns', Number(e.target.value))}/></Field>
                <Field label="تفعيل المزامنة التلقائية"><Switch checked={!!content.youtubeSettings?.autoSync} onCheckedChange={v=>update('youtubeSettings.autoSync', v)}/></Field>
              </div>

              <div>
                <h3 className="text-yellow-400 font-bold mb-3">الفيديوهات ({(content.videos||[]).length})</h3>
                <div className="space-y-2">
                  {(content.videos||[]).map((v,i)=>(
                    <div key={v.id} className="flex items-center gap-3 glass rounded-xl p-3">
                      <img src={`https://i.ytimg.com/vi/${v.videoId||''}/hqdefault.jpg`} className="h-16 w-28 object-cover rounded"/>
                      <div className="flex-1 min-w-0">
                        <Input value={v.title||''} onChange={e=>{ const arr=[...content.videos]; arr[i]={...v,title:e.target.value}; update('videos',arr); }} placeholder="عنوان"/>
                        <p className="text-white/50 text-xs mt-1 truncate">{v.url}</p>
                      </div>
                      <button onClick={()=>update('videos', content.videos.filter((_,j)=>j!==i))} className="h-9 w-9 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center"><Trash2 size={14}/></button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* TESTIMONIALS */}
          <TabsContent value="testimonials" className="mt-8">
            <Card className="glass rounded-3xl p-6 border-yellow-500/20">
              <ArrayEditor items={content.testimonials||[]} onChange={v=>update('testimonials', v)}
                fields={[{k:'name',l:'الاسم'},{k:'role',l:'الصفة'},{k:'text',l:'الرأي',type:'textarea'},{k:'rating',l:'التقييم (1-5)'}]}
                newItem={()=>({id:uuidv4(),name:'',role:'',text:'',rating:5})}/>
            </Card>
          </TabsContent>

          {/* CONTACT */}
          <TabsContent value="contact" className="mt-8">
            <Card className="glass rounded-3xl p-6 space-y-4 border-yellow-500/20">
              <Field label="رقم الهاتف"><Input value={content.contact.phone} onChange={e=>update('contact.phone', e.target.value)}/></Field>
              <Field label="رقم الواتساب"><Input value={content.contact.whatsapp} onChange={e=>update('contact.whatsapp', e.target.value)}/></Field>
              <Field label="البريد الإلكتروني"><Input value={content.contact.email} onChange={e=>update('contact.email', e.target.value)}/></Field>
              <Field label="العنوان"><Input value={content.contact.address} onChange={e=>update('contact.address', e.target.value)}/></Field>
              <Field label="رابط Google Maps embed (src)"><Textarea rows={2} value={content.contact.mapEmbed||''} onChange={e=>update('contact.mapEmbed', e.target.value)}/></Field>
            </Card>
          </TabsContent>

          {/* SOCIAL */}
          <TabsContent value="social" className="mt-8">
            <Card className="glass rounded-3xl p-6 space-y-3 border-yellow-500/20">
              {['instagram','facebook','tiktok','snapchat','youtube','telegram','twitter','linkedin'].map(k=>(
                <Field key={k} label={k.charAt(0).toUpperCase()+k.slice(1)}><Input value={content.social[k]||''} onChange={e=>update(`social.${k}`, e.target.value)} placeholder={`رابط ${k}`}/></Field>
              ))}
            </Card>
          </TabsContent>

          {/* SEO */}
          <TabsContent value="seo" className="mt-8">
            <Card className="glass rounded-3xl p-6 space-y-4 border-yellow-500/20">
              <Field label="عنوان الصفحة (Title)"><Input value={content.seo?.title||''} onChange={e=>update('seo.title', e.target.value)}/></Field>
              <Field label="الوصف (Description)"><Textarea value={content.seo?.description||''} onChange={e=>update('seo.description', e.target.value)}/></Field>
              <Field label="الكلمات المفتاحية (فاصلة بينها)"><Input value={content.seo?.keywords||''} onChange={e=>update('seo.keywords', e.target.value)}/></Field>
              <Field label="OG Title"><Input value={content.seo?.ogTitle||''} onChange={e=>update('seo.ogTitle', e.target.value)}/></Field>
              <Field label="OG Description"><Textarea value={content.seo?.ogDescription||''} onChange={e=>update('seo.ogDescription', e.target.value)}/></Field>
              <Field label="OG Image URL"><Input value={content.seo?.ogImage||''} onChange={e=>update('seo.ogImage', e.target.value)}/></Field>
              <Field label="Google Analytics ID (G-XXXX)"><Input value={content.seo?.googleAnalytics||''} onChange={e=>update('seo.googleAnalytics', e.target.value)}/></Field>
            </Card>
          </TabsContent>

          {/* FOOTER */}
          <TabsContent value="footer" className="mt-8">
            <Card className="glass rounded-3xl p-6 space-y-4 border-yellow-500/20">
              <Field label="نص الفوتر"><Input value={content.footer?.text||''} onChange={e=>update('footer.text', e.target.value)}/></Field>
              <Field label="شعار الفوتر"><Input value={content.footer?.tagline||''} onChange={e=>update('footer.tagline', e.target.value)}/></Field>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="fixed bottom-6 inset-x-0 z-30 flex justify-center pointer-events-none">
        <Button onClick={save} disabled={saving} className="pointer-events-auto h-14 px-8 bg-gradient-to-l from-yellow-500 to-yellow-600 text-black font-bold rounded-full shadow-2xl shadow-yellow-500/40 text-lg">
          {saving ? <RefreshCw className="h-5 w-5 ml-2 animate-spin"/> : <Save className="h-5 w-5 ml-2"/>}حفظ جميع التغييرات
        </Button>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="border-t border-yellow-500/10 pt-4 first:border-0 first:pt-0">
    <h3 className="text-yellow-400 font-bold text-lg mb-4">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <Label className="text-white/80 text-sm mb-1.5 block">{label}</Label>
    {children}
  </div>
);

const ArrayEditor = ({ items, onChange, fields, newItem }) => (
  <div className="space-y-4">
    {items.map((it, idx) => (
      <div key={idx} className="glass rounded-2xl p-4 relative">
        <button onClick={()=>onChange(items.filter((_,j)=>j!==idx))} className="absolute top-3 left-3 h-8 w-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center"><Trash2 size={14}/></button>
        <div className="grid md:grid-cols-2 gap-3 pl-10">
          {fields.map(f=>(
            <div key={f.k} className={f.type==='textarea' ? 'md:col-span-2' : ''}>
              <Label className="text-white/70 text-xs mb-1 block">{f.l}</Label>
              {f.type==='textarea' ? (
                <Textarea value={it[f.k]||''} onChange={e=>{ const arr=[...items]; arr[idx]={...it,[f.k]:e.target.value}; onChange(arr); }}/>
              ) : (
                <Input value={it[f.k]||''} onChange={e=>{ const arr=[...items]; arr[idx]={...it,[f.k]:e.target.value}; onChange(arr); }}/>
              )}
            </div>
          ))}
        </div>
      </div>
    ))}
    <Button onClick={()=>onChange([...(items||[]), newItem()])} variant="outline" className="border-yellow-500/40 text-yellow-400"><Plus className="h-4 w-4 ml-1"/>إضافة</Button>
  </div>
);

export default Admin;
