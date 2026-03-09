'use client';

import { useState, useEffect } from 'react';
import { Settings, Users, Link as LinkIcon, Copy, Check, X, Loader2, Activity } from 'lucide-react';
import surveyData from '@/data/Survey-Questions.json';
import { supabase } from '@/lib/supabaseClient';

type LinkConfig = {
  [key: string]: string;
};

const categoryNames: Record<string, string> = {
  heart: 'صحة القلب',
  eyes: 'صحة العين',
  memory: 'الذاكرة',
  focus: 'التركيز',
  bones: 'صحة العظام',
  energy: 'الطاقة والنشاط',
  general: 'الصحة العامة',
  digestive: 'صحة الجهاز الهضمي',
};

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<'leads' | 'links' | 'tracking'>('leads');
  const [links, setLinks] = useState<LinkConfig>({});
  const [masterBundleLink, setMasterBundleLink] = useState('');
  const [savingLinks, setSavingLinks] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);

  // Tracking state
  const [metaPixel, setMetaPixel] = useState('');
  const [tiktokPixel, setTiktokPixel] = useState('');
  const [gaPixel, setGaPixel] = useState('');
  const [savingTracking, setSavingTracking] = useState(false);

  useEffect(() => {
    const authStatus = sessionStorage.getItem('adminAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLeads();
      fetchTrackingSettings();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const validUsers = [
      { email: 'americanbox149@gmail.com', password: 'Amrcnbxquiz26' },
      { email: 'marketer.a.mosaad@gmail.com', password: 'Generate5598@Go' }
    ];

    const isValid = validUsers.some(
      u => u.email === loginEmail.trim() && u.password === loginPassword
    );

    if (isValid) {
      sessionStorage.setItem('adminAuth', 'true');
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
  };

  const fetchLeads = async () => {
    setLoadingLeads(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoadingLeads(false);
    }
  };

  const fetchTrackingSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error; // ignore not found
      if (data) {
        setMetaPixel(data.meta_pixel || '');
        setTiktokPixel(data.tiktok_pixel || '');
        setGaPixel(data.ga_pixel || '');
        
        if (data.product_links) {
          setLinks(data.product_links.vitamins || {});
          setMasterBundleLink(data.product_links.masterBundle || '');
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const saveTrackingSettings = async () => {
    setSavingTracking(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          id: 1,
          meta_pixel: metaPixel,
          tiktok_pixel: tiktokPixel,
          ga_pixel: gaPixel
        });
        
      if (error) throw error;
      alert('تم حفظ إعدادات التتبع بنجاح');
    } catch (error) {
      console.error('Error saving tracking settings:', error);
      alert('حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setSavingTracking(false);
    }
  };

  const saveLinks = async () => {
    setSavingLinks(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          id: 1,
          product_links: {
            masterBundle: masterBundleLink,
            vitamins: links
          }
        });
        
      if (error) throw error;
      alert('تم حفظ الروابط بنجاح');
    } catch (error) {
      console.error('Error saving links:', error);
      alert('حدث خطأ أثناء حفظ الروابط');
    } finally {
      setSavingLinks(false);
    }
  };

  const handleLinkChange = (vitamin: string, url: string) => {
    setLinks({ ...links, [vitamin]: url });
  };

  const generateEmailContent = (lead: any) => {
    if (!lead) return '';

    const recommendations = lead.recommended_vitamins || [];
    const isPerfectHealth = lead.top_categories?.length === 1 && lead.top_categories[0] === 'general' && recommendations.includes('مالتي فيتامين فائق الجودة');

    let email = `مرحباً ${lead.full_name}،\n\n`;
    
    if (isPerfectHealth) {
      email += `رائع! إجاباتك في التقييم الصحي تدل على نمط حياة صحي جداً. للحفاظ على هذه الحيوية وسد أي فجوات غذائية بسيطة، نوصي بهذه الأساسيات:\n\n`;
    } else {
      email += `بناءً على التقييم الصحي الذي قمت به، وجدنا أن جسمك يحتاج إلى دعم إضافي في المجالات التالية:\n`;
      lead.top_categories?.forEach((cat: string) => {
        email += `- ${categoryNames[cat] || cat}\n`;
      });
      email += `\nلذلك، نوصي بالبروتوكول الأمريكي التالي المصمم خصيصاً لك:\n\n`;
    }

    recommendations.forEach((vit: any) => {
      const url = links[vit] || '#';
      email += `✅ ${vit}\n`;
      email += `رابط المنتج: ${url}\n\n`;
    });

    email += `🎁 عرض خاص لك! احصل على خصم 20% عند شراء الباقة المتكاملة (Master Bundle):\n`;
    email += `${masterBundleLink || '#'}\n\n`;
    email += `مع تمنياتنا بدوام الصحة والعافية،\nفريق American Box`;

    return email;
  };

  const copyToClipboard = () => {
    const content = generateEmailContent(selectedLead);
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const allVitamins = [
    'أوميجا-3 (EPA/DHA عالي التركيز)',
    'مغنيسيوم جلايسينات',
    'CoQ10',
    'فيتامين D3 + K2',
    'كالسيوم مركب',
    'كولاجين مفصل أو جلوكوزامين',
    'بروبيوتيك متعدد السلالات (50+ مليار)',
    'إنزيمات هاضمة',
    'ل-جلوتامين',
    'أوميجا-3 (DHA عالي)',
    'فيتامينات B المركبة (نشطة)',
    'جينكو بيلوبا',
    'ل-ثيانين',
    'مغنيسيوم ثريونات',
    'فيتامينات B المركبة',
    'فيتامين B12 (ميثيل كوبالامين)',
    'حديد (إذا كان هناك نقص مؤكد)',
    'لوتين 10-20 مجم + زياكسانثين',
    'أوميجا-3',
    'فيتامين A و C و E + زنك',
    'مالتي فيتامين فائق الجودة',
    'فيتامين D3'
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-tajawal font-bold text-primary mb-2">American Box</h1>
            <p className="text-slate-500 font-cairo">تسجيل الدخول للوحة التحكم</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5 font-cairo">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-left"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">كلمة المرور</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-left"
                dir="ltr"
              />
            </div>
            {loginError && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
                {loginError}
              </div>
            )}
            <button
              type="submit"
              className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-light transition-colors"
            >
              دخول
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-tajawal font-bold text-primary">لوحة التحكم</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('leads')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors ${
                activeTab === 'leads' ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-5 h-5" />
              العملاء المحتملين
            </button>
            <button
              onClick={() => setActiveTab('links')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors ${
                activeTab === 'links' ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              <LinkIcon className="w-5 h-5" />
              إدارة الروابط
            </button>
            <button
              onClick={() => setActiveTab('tracking')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors ${
                activeTab === 'tracking' ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-5 h-5" />
              التتبع (Pixels)
            </button>
          </div>
        </div>

        {activeTab === 'leads' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-right">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-bold text-slate-600">الاسم</th>
                  <th className="p-4 font-bold text-slate-600">رقم الهاتف</th>
                  <th className="p-4 font-bold text-slate-600">البريد الإلكتروني</th>
                  <th className="p-4 font-bold text-slate-600">أهم الاحتياجات</th>
                  <th className="p-4 font-bold text-slate-600">التاريخ</th>
                  <th className="p-4 font-bold text-slate-600">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loadingLeads ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      جاري تحميل البيانات...
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      لا يوجد عملاء محتملين حتى الآن.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-800">{lead.full_name}</td>
                      <td className="p-4 text-slate-600" dir="ltr">{lead.whatsapp}</td>
                      <td className="p-4 text-slate-600" dir="ltr">{lead.email || '-'}</td>
                      <td className="p-4 text-slate-600">
                        {lead.top_categories?.map((c: string) => categoryNames[c] || c).join('، ')}
                      </td>
                      <td className="p-4 text-slate-600">{new Date(lead.created_at).toLocaleDateString('ar-EG')}</td>
                      <td className="p-4">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="px-3 py-1.5 bg-accent/10 text-accent-dark font-bold rounded-lg hover:bg-accent/20 transition-colors text-sm"
                        >
                          إنشاء رسالة
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'links' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-tajawal font-bold text-slate-800 mb-6">إدارة روابط المنتجات</h2>
            
            <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-2">رابط الباقة المتكاملة (Master Bundle - 20% Off)</label>
              <input
                type="url"
                value={masterBundleLink}
                onChange={(e) => setMasterBundleLink(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-left"
                placeholder="https://..."
                dir="ltr"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {allVitamins.map((vit) => (
                <div key={vit} className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-slate-700">{vit}</label>
                  <input
                    type="url"
                    value={links[vit] || ''}
                    onChange={(e) => handleLinkChange(vit, e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-left text-sm"
                    placeholder="https://..."
                    dir="ltr"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={saveLinks}
              disabled={savingLinks}
              className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-light transition-colors flex items-center gap-2"
            >
              {savingLinks ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              حفظ الروابط
            </button>
          </div>
        )}

        {activeTab === 'tracking' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-tajawal font-bold text-slate-800 mb-6">إعدادات التتبع (Pixels)</h2>
            <p className="text-slate-500 mb-8 text-sm">
              أدخل معرفات التتبع الخاصة بك هنا. سيتم تطبيقها تلقائياً على جميع صفحات التقييم الصحي.
            </p>
            
            <div className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Meta Pixel ID (Facebook)</label>
                <input
                  type="text"
                  value={metaPixel}
                  onChange={(e) => setMetaPixel(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-left"
                  placeholder="e.g. 123456789012345"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">TikTok Pixel ID</label>
                <input
                  type="text"
                  value={tiktokPixel}
                  onChange={(e) => setTiktokPixel(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-left"
                  placeholder="e.g. C1234567890ABCDEF"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Google Analytics ID (اختياري)</label>
                <input
                  type="text"
                  value={gaPixel}
                  onChange={(e) => setGaPixel(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-left"
                  placeholder="e.g. G-ABC123XYZ"
                  dir="ltr"
                />
              </div>

              <button
                onClick={saveTrackingSettings}
                disabled={savingTracking}
                className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-light transition-colors flex items-center gap-2"
              >
                {savingTracking ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                حفظ إعدادات التتبع
              </button>
            </div>
          </div>
        )}

        {/* Email Modal */}
        {selectedLead && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-tajawal font-bold text-lg text-slate-800">رسالة مخصصة لـ {selectedLead.full_name}</h3>
                <button onClick={() => setSelectedLead(null)} className="p-1 hover:bg-slate-200 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-grow">
                <pre className="whitespace-pre-wrap font-cairo text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm leading-relaxed">
                  {generateEmailContent(selectedLead)}
                </pre>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg transition-colors"
                >
                  إغلاق
                </button>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-light transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'تم النسخ!' : 'نسخ الرسالة'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
