'use client';

import { useState, useEffect } from 'react';
import { Settings, Users, Link as LinkIcon, Copy, Check, X, Loader2, Activity } from 'lucide-react';
import surveyData from '@/data/quizzes/comprehensive.json';
import { supabase } from '@/lib/supabaseClient';

type LinkConfig = {
  [key: string]: string;
};

type Lead = {
  id: string;
  full_name: string;
  quiz_type?: string;
  age?: string;
  gender?: string;
  whatsapp: string;
  top_categories?: string[];
  created_at: string;
  is_message_sent?: boolean;
  recommended_vitamins?: string[];
  chronic_diseases?: string;
  medical_history?: string;
  [key: string]: any;
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
  immunity: 'دعم المناعة',
  skin_hair: 'العناية بالبشرة والشعر',
  'نقص الكالسيوم': 'نقص الكالسيوم',
  'التهاب المفاصل': 'التهاب المفاصل',
  'دعم عضلة القلب': 'دعم عضلة القلب',
  'الدورة الدموية': 'الدورة الدموية'
};

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<'leads' | 'links' | 'tracking'>('leads');
  const [links, setLinks] = useState<LinkConfig>({});
  const [masterBundleLink, setMasterBundleLink] = useState('');
  const [customBundles, setCustomBundles] = useState<LinkConfig>({});
  const [savingLinks, setSavingLinks] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [copied, setCopied] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
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

  const toggleMessageStatus = async (leadId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const { error } = await supabase
        .from('leads')
        .update({ is_message_sent: newStatus })
        .eq('id', leadId);

      if (error) throw error;

      // Update local state
      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, is_message_sent: newStatus } : lead
      ));
    } catch (error) {
      console.error('Error updating message status:', error);
      alert('حدث خطأ أثناء تحديث حالة التواصل');
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
          setCustomBundles(data.product_links.customBundles || {});
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
            vitamins: links,
            customBundles: customBundles
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

  const handleBundleChange = (bundleId: string, url: string) => {
    setCustomBundles({ ...customBundles, [bundleId]: url });
  };

  const getVitaminCategory = (vitaminName: string) => {
    // We can just use the comprehensive mapping as a fallback, or we could load all mappings.
    // For simplicity, we'll just return a generic category if not found in comprehensive.
    for (const [key, vitamins] of Object.entries(surveyData.scoring_rules.recommendation_mapping)) {
      if ((vitamins as string[]).includes(vitaminName)) {
        const cat = key.replace('_high', '');
        return categoryNames[cat] || cat;
      }
    }
    return 'صحتك العامة';
  };

  const QuizTypeContent: Record<string, { warning: string }> = {
    "شامل": { warning: "تجاهل هذه المؤشرات الحيوية قد يؤدي لتفاقم الإرهاق وضعف الأداء العام. جسمك يحتاج لإعادة توازن فوري." },
    "صحة العظام والمفاصل": { warning: "استمرار نقص هذه العناصر قد يُسرع من تآكل الغضاريف ويزيد من تيبس المفاصل، مما يؤثر على حركتك وراحتك اليومية." },
    "صحة القلب والأوعية الدموية": { warning: "مؤشرات الإجهاد التأكسدي وضعف الدورة الدموية تتطلب تدخلاً فورياً لحماية عضلة القلب والشرايين من الإرهاق المستمر." },
    "الصحة النفسية وتقليل التوتر": { warning: "استمرار ارتفاع الكورتيزول وضعف جودة النوم يستنزف طاقتك الذهنية، مما يؤدي إلى ضبابية الدماغ (Brain Fog) وتقلبات مزاجية حادة." },
    "دعم المناعة": { warning: "تجاهل هذه الفجوات يجعل جسمك عرضة للالتهابات المتكررة ويبطئ من سرعة الاستشفاء الطبيعي." },
    "فقدان الوزن والتمثيل الغذائي": { warning: "بطء معدل الحرق ومقاومة الأنسولين يضاعفان من صعوبة نزول الوزن ويستنزفان طاقتك اليومية بعد الوجبات." },
    "مكافحة الشيخوخة (Anti-Aging)": { warning: "تراجع مستويات الطاقة الخلوية (NAD+) يُسرع من ظهور علامات التقدم في العمر البيولوجي وتراجع الحيوية." },
    "مكافحة الشيخوخة": { warning: "تراجع مستويات الطاقة الخلوية (NAD+) يُسرع من ظهور علامات التقدم في العمر البيولوجي وتراجع الحيوية." },
    "العناية بالبشرة": { warning: "نقص ترطيب الخلايا ومضادات الأكسدة يُسرع من فقدان الكولاجين الطبيعي ويُظهر التصبغات والخطوط الدقيقة." },
    "العناية بالشعر": { warning: "استمرار نقص التغذية الموجهة للبصيلات سيؤدي لزيادة دورة تساقط الشعر وضعف كثافته بشكل قد يصعب تداركه لاحقاً." },
    "المكملات الرياضية وبناء العضلات": { warning: "نقص عناصر الاستشفاء يؤدي إلى بطء البناء العضلي، زيادة الإرهاق بعد التمرين (DOMS)، ورفع خطر الإصابة." },
    "صحة الطفل": { warning: "تجاهل هذه الإشارات قد يؤثر على سرعة التطور الذهني، الاستيعاب، والنمو البدني السليم لطفلك في هذه المرحلة الحرجة." }
  };

  const ProductDetails: Record<string, { benefit: string, usage: string }> = {
    "أوميجا-3 (DHA عالي)": { 
      benefit: "يعتبر (Nordic Naturals DHA) من أنقى مصادر الأوميجا 3 لدعم التطور الذهني، ورفع معدلات التركيز والذكاء وتطور العين بشكل ملحوظ.", 
      usage: "تُحدد الجرعة حسب الوزن (مدونة على العبوة)، ويُفضل تناولها مع وجبة." 
    },
    "مالتي فيتامين فائق الجودة": { 
      benefit: "مركب شامل (مثل Kids Smart Brain Booster أو Centrum) يسد الفجوات الغذائية، يدعم النمو البدني، ويعزز الطاقة اليومية والمناعة.", 
      usage: "حبة إلى حبتين يومياً حسب العمر، تمضغ جيداً أو تُبلع مع الماء." 
    },
    "بروبيوتيك متعدد السلالات (50+ مليار)": { 
      benefit: "يعيد بناء بكتيريا الأمعاء النافعة، مما يعالج الانتفاخات، يرفع كفاءة جهاز المناعة بنسبة 70%، ويحسن امتصاص الفيتامينات من الغذاء.", 
      usage: "كبسولة واحدة يومياً على معدة فارغة أو قبل الوجبة بـ 30 دقيقة." 
    },
    "أوميجا-3 (EPA/DHA عالي التركيز)": { 
      benefit: "يحتوي على تركيز فائق من (EPA/DHA) لتقليل الالتهابات الخلوية، دعم صحة القلب الشرايين، وتنشيط الذاكرة.", 
      usage: "كبسولة واحدة يومياً بعد الوجبة الرئيسية." 
    },
    "مغنيسيوم جلايسينات": { 
      benefit: "النسخة الأسرع امتصاصاً (Double Wood)، تهدئ الجهاز العصبي، تحسن جودة النوم العميق، وتدعم استشفاء العضلات دون أي اضطرابات هضمية.", 
      usage: "كبسولتين ليلاً قبل النوم بساعة." 
    },
    "CoQ10": { 
      benefit: "إنزيم (Solgar Coq-10) يعمل كشرارة طاقة للخلايا، يدعم صحة عضلة القلب بقوة ويحارب الشيخوخة والإرهاق الخلوي.", 
      usage: "كبسولة واحدة صباحاً مع وجبة الإفطار." 
    },
    "فيتامين D3 + K2": { 
      benefit: "دمج الـ D3 مع الـ K2 (Deal Supplement) يضمن توجيه الكالسيوم مباشرة للعظام والأسنان بدلاً من تراكمه في الشرايين، مما يدعم العظام والمناعة بفعالية.", 
      usage: "كبسولة واحدة يومياً مع وجبة تحتوي على دهون صحية." 
    },
    "كولاجين مفصل أو جلوكوزامين": { 
      benefit: "يغذي الغضاريف، يزيد من مرونة المفاصل، ويعيد بناء الكولاجين المفقود لدعم صحة البشرة والأربطة.", 
      usage: "الجرعة الموصى بها يومياً مع كوب كبير من الماء." 
    },
    "أوميجا-3": { 
      benefit: "ضروري لدعم صحة الدماغ، تقليل الالتهابات العامة في الجسم، والحفاظ على مرونة الأوعية الدموية.", 
      usage: "كبسولة واحدة يومياً بعد وجبة دسمة." 
    },
    "فيتامينات B المركبة (نشطة)": { 
      benefit: "تُحول الغذاء إلى طاقة فورية (NaturesPlus Hema-Plex)، تدعم صحة الأعصاب، وتمنع الإرهاق المستمر والخمول.", 
      usage: "كبسولة واحدة صباحاً بعد الإفطار." 
    },
    "فيتامينات B المركبة": { 
      benefit: "مركب متكامل يدعم الجهاز العصبي، يقلل من التوتر، ويرفع معدلات الطاقة والتركيز اليومي.", 
      usage: "كبسولة واحدة صباحاً بعد الإفطار." 
    },
    "حديد (إذا كان هناك نقص مؤكد)": { 
      benefit: "حديد مخلب (NOW Iron Complex) لطيف على المعدة ولا يسبب إمساك، لضمان الامتصاص السريع وعلاج فقر الدم وتساقط الشعر الناتج عن نقصه.", 
      usage: "كبسولة واحدة يومياً، ويُفضل بعيداً عن الكالسيوم أو القهوة بساعتين." 
    },
    "جينكو بيلوبا": { 
      benefit: "يعزز (Nature’s Bounty Ginkgo Biloba) تدفق الدم الغني بالأكسجين للدماغ، مما يحسن الذاكرة، التركيز، ويقلل من ضبابية التفكير.", 
      usage: "كبسولة واحدة يومياً مع وجبة." 
    },
    "ل-ثيانين": { 
      benefit: "حمض أميني يعزز موجات الألفا في الدماغ، مما يمنحك هدوءاً وتركيزاً دون التسبب في النعاس، ويقلل من تأثير الكورتيزول.", 
      usage: "كبسولة واحدة عند الحاجة للتركيز أو تخفيف التوتر." 
    },
    "مغنيسيوم ثريونات": { 
      benefit: "شكل المغنيسيوم الوحيد القادر على اختراق حاجز الدماغ لدعم الذاكرة، زيادة التركيز، والحد من التدهور المعرفي.", 
      usage: "تؤخذ الجرعة الموصى بها مقسمة مع الطعام." 
    },
    "فيتامين A و C و E + زنك": { 
      benefit: "مضادات أكسدة قوية مع الزنك (Carlson/Solgar) لتجديد خلايا البشرة، دعم المناعة، وتسريع التئام الأنسجة ومكافحة الحبوب.", 
      usage: "كبسولة واحدة يومياً مع الطعام." 
    },
    "فيتامين D3": { 
      benefit: "أساسي (Nature’s Way D3) لدعم جهاز المناعة، تحسين الحالة المزاجية، ورفع كفاءة الجسم في امتصاص الكالسيوم.", 
      usage: "كبسولة واحدة يومياً مع وجبة تحتوي على دهون." 
    },
    "إنزيمات هاضمة": { 
      benefit: "تساعد في تكسير الطعام المعقد (بروتين، دهون، نشويات)، تمنع الانتفاخ والغازات، وتضمن أقصى استفادة وامتصاص للفيتامينات.", 
      usage: "كبسولة واحدة قبل الوجبات الدسمة مباشرة." 
    },
    "ل-جلوتامين": { 
      benefit: "حمض أميني يسرع من الاستشفاء العضلي بعد التمارين الشاقة، ويدعم صحة بطانة الأمعاء بشكل فعال جداً.", 
      usage: "مكيال (5g) بعد التمرين أو قبل النوم." 
    },
    "كالسيوم مركب": { 
      benefit: "يدعم كثافة العظام والأسنان ويمنع الهشاشة، مصمم بتركيبة متوازنة لسهولة الامتصاص.", 
      usage: "حسب التوجيهات المدونة، ويُفضل تناوله بعيداً عن مكملات الحديد." 
    }
  };

  const getProductDetails = (vit: string) => {
    if (ProductDetails[vit]) return ProductDetails[vit];
    return {
      benefit: "لتعويض النقص المباشر ودعم أهدافك الصحية المحددة في الاستبيان.",
      usage: "حسب التوجيهات المدونة على العبوة."
    };
  };

  const generateWhatsAppReport = (lead: any) => {
    if (!lead) return '';

    const ageStr = lead.age ? lead.age : 'غير محدد';
    const genderStr = lead.gender ? lead.gender : 'غير محدد';
    
    const parts = [];
    if (lead.chronic_diseases && lead.chronic_diseases.trim() !== '' && lead.chronic_diseases.trim() !== 'لا يوجد') {
      parts.push(lead.chronic_diseases);
    }
    if (lead.medical_history && lead.medical_history.trim() !== '' && lead.medical_history.trim() !== 'لا يوجد') {
      parts.push(lead.medical_history);
    }
    
    let medicalHistorySection = '';
    if (parts.length > 0) {
      medicalHistorySection = ` وتاريخك المرضي: ${parts.join('، ')}،`;
    }

    const recommendations = lead.recommended_vitamins || [];
    const topCategoriesList = lead.top_categories?.map((cat: string) => categoryNames[cat] || cat).join('، ') || 'الصحة العامة';

    let bundleLink = masterBundleLink;
    if (lead.quiz_type === 'صحة العظام والمفاصل') {
      bundleLink = customBundles['bones'] || masterBundleLink;
    } else if (lead.quiz_type === 'صحة القلب والأوعية الدموية') {
      bundleLink = customBundles['heart'] || masterBundleLink;
    } else if (lead.quiz_type === 'الصحة النفسية وتقليل التوتر') {
      bundleLink = customBundles['mental'] || masterBundleLink;
    } else if (lead.quiz_type === 'دعم المناعة') {
      bundleLink = customBundles['immunity'] || masterBundleLink;
    } else if (lead.quiz_type === 'فقدان الوزن والتمثيل الغذائي') {
      bundleLink = customBundles['weight'] || masterBundleLink;
    } else if (lead.quiz_type === 'مكافحة الشيخوخة (Anti-Aging)' || lead.quiz_type === 'مكافحة الشيخوخة') {
      bundleLink = customBundles['antiaging'] || masterBundleLink;
    } else if (lead.quiz_type === 'العناية بالبشرة') {
      bundleLink = customBundles['skin'] || masterBundleLink;
    } else if (lead.quiz_type === 'العناية بالشعر') {
      bundleLink = customBundles['hair'] || masterBundleLink;
    } else if (lead.quiz_type === 'المكملات الرياضية وبناء العضلات') {
      bundleLink = customBundles['sports'] || masterBundleLink;
    } else if (lead.quiz_type === 'صحة الطفل') {
      bundleLink = customBundles['child'] || masterBundleLink;
    }

    const quizTypeWarning = QuizTypeContent[lead.quiz_type || 'شامل']?.warning || QuizTypeContent['شامل'].warning;

    let msg = `تقريرك الصحي المفصل من عيادة American Box 🇺🇸\n\n`;
    msg += `أهلاً ${lead.full_name}،\n`;
    msg += `لقد قام خبراؤنا بدراسة ملفك الصحي بعناية (السن: ${ageStr}، الجنس: ${genderStr})، وبناءً على إجاباتك الدقيقة${medicalHistorySection} قمنا بتحليل مؤشراتك الحيوية.\n\n`;

    msg += `⚠️ **التشخيص المبدئي:**\n`;
    msg += `اكتشفنا وجود استنزاف واضح ونقص في دعم المناطق التالية: ${topCategoriesList}.\n`;
    msg += `${quizTypeWarning}\n\n`;

    msg += `💊 **البروتوكول العلاجي المقترح (مدة الكورس: 3 إلى 6 أشهر):**\n`;
    msg += `لقد صممنا لك هذا البروتوكول الأمريكي المخصص لحالتك:\n\n`;

    recommendations.forEach((vit: any) => {
      const url = links[vit] || '#';
      const details = getProductDetails(vit);
      
      msg += `✅ **${vit}**\n`;
      msg += `- **لماذا نرشحه لك؟** ${details.benefit}\n`;
      msg += `- **طريقة الاستخدام:** ${details.usage}\n`;
      msg += `- **رابط المنتج:** ${url}\n\n`;
    });

    msg += `🎁 **الحل الجذري (عرض الباقة المتكاملة):**\n`;
    msg += `للحصول على أسرع نتيجة، يمكنك الحصول على كل ما يحتاجه جسمك في "الباقة المتكاملة" بخصم حصري 20% من هنا:\n`;
    msg += `👉 ${bundleLink || '#'}\n\n`;

    msg += `🔬 **المتابعة والتحاليل:**\n`;
    msg += `لضمان أفضل النتائج، نوصي بإجراء تحاليل دورية (مثل صورة دم كاملة وفيتامين د)، ونتمنى منك التواصل معنا كل 30 يوماً لمتابعة تطور حالتك وتحديث البروتوكول إذا لزم الأمر.\n\n`;

    msg += `مع تمنياتنا لك بدوام الصحة،\n`;
    msg += `فريقك الطبي - American Box`;

    return msg;
  };

  const copyToClipboard = () => {
    const content = generateWhatsAppReport(selectedLead);
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const allVitamins = Object.keys(ProductDetails);

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
                  <th className="p-4 font-bold text-slate-600">نوع الاستبيان</th>
                  <th className="p-4 font-bold text-slate-600">السن/الجنس</th>
                  <th className="p-4 font-bold text-slate-600">رقم الهاتف</th>
                  <th className="p-4 font-bold text-slate-600">أهم الاحتياجات</th>
                  <th className="p-4 font-bold text-slate-600">التاريخ</th>
                  <th className="p-4 font-bold text-slate-600">حالة التواصل</th>
                  <th className="p-4 font-bold text-slate-600">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loadingLeads ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      جاري تحميل البيانات...
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      لا يوجد عملاء محتملين حتى الآن.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-800">{lead.full_name}</td>
                      <td className="p-4 text-slate-600">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-bold">
                          {lead.quiz_type || 'شامل'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">
                        {lead.age ? `${lead.age} سنة` : '-'} / {lead.gender || '-'}
                      </td>
                      <td className="p-4 text-slate-600" dir="ltr">{lead.whatsapp}</td>
                      <td className="p-4 text-slate-600">
                        {lead.top_categories?.map((c: string) => categoryNames[c] || c).join('، ')}
                      </td>
                      <td className="p-4 text-slate-600">{new Date(lead.created_at).toLocaleDateString('ar-EG')}</td>
                      <td className="p-4">
                        {lead.is_message_sent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            🟢 تم الإرسال
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            🟡 بانتظار الإرسال
                          </span>
                        )}
                      </td>
                      <td className="p-4 flex items-center gap-2">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="px-3 py-1.5 bg-accent/10 text-accent-dark font-bold rounded-lg hover:bg-accent/20 transition-colors text-sm whitespace-nowrap"
                        >
                          إنشاء تقرير
                        </button>
                        <button
                          onClick={() => toggleMessageStatus(lead.id, !!lead.is_message_sent)}
                          className={`px-3 py-1.5 font-bold rounded-lg transition-colors text-sm whitespace-nowrap ${
                            lead.is_message_sent 
                              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {lead.is_message_sent ? 'تعليم كـ بانتظار الإرسال' : 'تعليم كـ تم الإرسال'}
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

            <h3 className="text-lg font-tajawal font-bold text-slate-800 mb-4 mt-8">باقات الاستبيانات المخصصة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
              {[
                { id: 'bones', label: 'باندل صحة العظام' },
                { id: 'heart', label: 'باندل صحة القلب' },
                { id: 'mental', label: 'باندل الصحة النفسية' },
                { id: 'immunity', label: 'باندل دعم المناعة' },
                { id: 'weight', label: 'باندل فقدان الوزن' },
                { id: 'antiaging', label: 'باندل مكافحة الشيخوخة' },
                { id: 'skin', label: 'باندل العناية بالبشرة' },
                { id: 'hair', label: 'باندل العناية بالشعر' },
                { id: 'sports', label: 'باندل المكملات الرياضية' },
                { id: 'child', label: 'باندل صحة الطفل' },
              ].map((bundle) => (
                <div key={bundle.id} className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-slate-700">{bundle.label}</label>
                  <input
                    type="url"
                    value={customBundles[bundle.id] || ''}
                    onChange={(e) => handleBundleChange(bundle.id, e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-left text-sm"
                    placeholder="https://..."
                    dir="ltr"
                  />
                </div>
              ))}
            </div>

            <h3 className="text-lg font-tajawal font-bold text-slate-800 mb-4 mt-8">الفيتامينات الفردية</h3>
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
                <h3 className="font-tajawal font-bold text-lg text-slate-800">تقرير واتساب لـ {selectedLead.full_name}</h3>
                <button onClick={() => setSelectedLead(null)} className="p-1 hover:bg-slate-200 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-grow">
                <pre className="whitespace-pre-wrap font-cairo text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm leading-relaxed">
                  {generateWhatsAppReport(selectedLead)}
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
                  className="flex items-center gap-2 px-6 py-2 bg-[#25D366] text-white rounded-lg font-bold hover:bg-[#20bd5a] transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'تم النسخ!' : 'نسخ التقرير'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
