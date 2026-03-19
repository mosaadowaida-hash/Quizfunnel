'use client';

import { useState, useEffect, useRef } from 'react';
import { Settings, Users, Link as LinkIcon, Copy, Check, X, Loader2, Activity, Download, FileText } from 'lucide-react';
import surveyData from '@/data/quizzes/comprehensive.json';
import { supabase } from '@/lib/supabaseClient';
import * as XLSX from 'xlsx';
import { useReactToPrint } from 'react-to-print';

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
  quiz_answers?: Record<string, string>;
  lab_files?: string[];
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

const quizTypesList = [
  "الكل",
  "صحة العظام والمفاصل",
  "صحة القلب والأوعية الدموية",
  "الصحة النفسية وتقليل التوتر",
  "دعم المناعة",
  "فقدان الوزن والتمثيل الغذائي",
  "مكافحة الشيخوخة",
  "العناية بالبشرة",
  "العناية بالشعر",
  "المكملات الرياضية وبناء العضلات",
  "صحة الطفل",
  "شامل"
];

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<'leads' | 'links' | 'tracking'>('leads');
  const [selectedQuizTypeFilter, setSelectedQuizTypeFilter] = useState<string>('الكل');
  const [links, setLinks] = useState<LinkConfig>({});
  const [masterBundleLink, setMasterBundleLink] = useState('');
  const [customBundles, setCustomBundles] = useState<LinkConfig>({});
  const [savingLinks, setSavingLinks] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadModalTab, setLeadModalTab] = useState<'report' | 'answers' | 'labs'>('report');
  const [copied, setCopied] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);

  // Tracking state
  const [metaPixel, setMetaPixel] = useState('');
  const [tiktokPixel, setTiktokPixel] = useState('');
  const [gaPixel, setGaPixel] = useState('');
  const [savingTracking, setSavingTracking] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

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
      benefit: "دعم التطور المعرفي والذهني، وتحسين مستويات التركيز ووظائف الإبصار بناءً على تركيز الـ DHA المرتفع.", 
      usage: "تحدد الجرعة بناءً على وزن الطفل وفقاً للإرشادات الطبية المرفقة، ويُفضل تناوله مع وجبة تحتوي على دهون صحية." 
    },
    "مالتي فيتامين فائق الجودة": { 
      benefit: "تعويض النقص الغذائي الشامل ودعم الوظائف الحيوية والتمثيل الغذائي.", 
      usage: "قرص واحد يومياً بعد وجبة الإفطار مع كوب ماء كامل." 
    },
    "بروبيوتيك متعدد السلالات (50+ مليار)": { 
      benefit: "إعادة التوازن الميكروبيومي للأمعاء، تحسين كفاءة الامتصاص، ورفع الاستجابة المناعية الطبيعية.", 
      usage: "كبسولة واحدة يومياً على معدة فارغة أو قبل الوجبة الرئيسية بـ 30 دقيقة." 
    },
    "أوميجا-3 (EPA/DHA عالي التركيز)": { 
      benefit: "خفض مؤشرات الالتهاب الخلوي، تحسين مرونة الأوعية الدموية، ودعم صحة القلب والدماغ.", 
      usage: "كبسولة واحدة يومياً بعد الوجبة الرئيسية." 
    },
    "مغنيسيوم جلايسينات": { 
      benefit: "تهدئة الجهاز العصبي المركزي، تحسين جودة النوم العميق، ودعم الاستشفاء العضلي بدون آثار جانبية على الجهاز الهضمي.", 
      usage: "كبسولتين ليلاً قبل النوم بساعة إلى ساعتين." 
    },
    "CoQ10": { 
      benefit: "تحسين إنتاج الطاقة الخلوية (ATP) في الميتوكوندريا، ودعم كفاءة عضلة القلب ومكافحة الإجهاد التأكسدي.", 
      usage: "كبسولة واحدة صباحاً بعد وجبة الإفطار." 
    },
    "فيتامين D3 + K2": { 
      benefit: "توجيه الكالسيوم بكفاءة إلى نسيج العظام ومنع ترسبه في الأوعية الدموية، مما يدعم كثافة العظام والوظائف المناعية.", 
      usage: "كبسولة واحدة يومياً مع وجبة تحتوي على دهون لضمان أقصى امتصاص." 
    },
    "كولاجين مفصل أو جلوكوزامين": { 
      benefit: "توفير الأحماض الأمينية اللازمة لترميم النسيج الغضروفي، وتقليل الاحتكاك وتيبس المفاصل.", 
      usage: "الجرعة المقررة يومياً مع كمية وفيرة من الماء لتعزيز الترطيب الداخلي." 
    },
    "أوميجا-3": { 
      benefit: "تنظيم مستويات الدهون في الدم، تقليل الاستجابة الالتهابية، ودعم الوظائف الإدراكية.", 
      usage: "كبسولة واحدة يومياً بعد وجبة دسمة." 
    },
    "فيتامينات B المركبة (نشطة)": { 
      benefit: "دعم مسارات إنتاج الطاقة، تحسين وظائف الأعصاب المُحيطية، ومكافحة أعراض الإرهاق المزمن.", 
      usage: "كبسولة واحدة صباحاً لتجنب اضطراب النوم." 
    },
    "حديد (إذا كان هناك نقص مؤكد)": { 
      benefit: "علاج فقر الدم الناجم عن نقص الحديد باستخدام صيغة مخلبة تضمن الامتصاص الجيد وتمنع اضطرابات الجهاز الهضمي.", 
      usage: "كبسولة واحدة يومياً، ويُفضل الفصل بينها وبين الكالسيوم أو الكافيين بساعتين على الأقل." 
    },
    "فيتامين A و C و E + زنك": { 
      benefit: "توفير مركب قوي من مضادات الأكسدة لحماية الخلايا، تسريع التئام الأنسجة، ودعم حيوية الجلد والمناعة.", 
      usage: "كبسولة واحدة يومياً مع الطعام." 
    },
    "فيتامين D3": { 
      benefit: "رفع كفاءة الاستجابة المناعية وتنظيم مستويات الكالسيوم والفوسفور في الدم.", 
      usage: "كبسولة واحدة يومياً مع وجبة دهنية." 
    },
    "إنزيمات هاضمة": { 
      benefit: "تخفيف العبء على الجهاز الهضمي عبر تحسين تكسير المغذيات الكبرى (بروتين، دهون، كربوهيدرات) وتقليل أعراض عسر الهضم.", 
      usage: "كبسولة واحدة قبل الوجبات الرئيسية مباشرة." 
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

    const warningText = QuizTypeContent[lead.quiz_type || 'شامل']?.warning || QuizTypeContent['شامل'].warning;

    let report = `تقرير طبي مفصل - American Box\n`;
    report += `اسم المراجع: ${lead.full_name || 'غير محدد'}\n`;
    report += `العمر: ${ageStr} | النوع: ${genderStr}\n\n`;

    // Only add medical history if it exists and is not a common "empty" phrase
    const ignoredPhrases = ["لا", "لا يوجد", "لا شيء", "لاشي", "لايوجد", "الحمد لله", "الحمدلله", "none", "nothing", "no"];
    const hasChronic = lead.chronic_diseases && lead.chronic_diseases.trim() !== "" && !ignoredPhrases.includes(lead.chronic_diseases.trim().toLowerCase());
    const hasHistory = lead.medical_history && lead.medical_history.trim() !== "" && !ignoredPhrases.includes(lead.medical_history.trim().toLowerCase());

    if (hasChronic || hasHistory) {
      report += `التاريخ المرضي:\n`;
      if (hasChronic) report += `- الأمراض المزمنة: ${lead.chronic_diseases}\n`;
      if (hasHistory) report += `- التاريخ الطبي: ${lead.medical_history}\n`;
      report += `\n`;
    }

    report += `--- التقييم المبدئي ---\n`;
    report += `بناءً على التقييم الدقيق للأعراض ومراجعة المؤشرات الحيوية، لوحظ وجود احتياج لدعم: ${topCategoriesList}.\n`;
    report += `${warningText}\n\n`;

    report += `--- البروتوكول المقترح (من 3 إلى 6 أشهر) ---\n`;

    // Loop through recommended vitamins
    recommendations.forEach((vitamin: string, index: number) => {
      let benefit = ProductDetails[vitamin]?.benefit || "تعويض النقص المباشر ودعم الوظائف الحيوية.";
      let usage = ProductDetails[vitamin]?.usage || "حسب التوجيهات المدونة على العبوة.";
      
      // Dynamic Pediatric Override
      if (vitamin === "مالتي فيتامين فائق الجودة" && lead.age && parseInt(lead.age) < 18) {
        benefit = "دعم النمو البدني والتطور الذهني وسد الفجوات الغذائية في مرحلة النمو.";
        usage = "حبة إلى حبتين يومياً حسب إرشادات العبوة، تُعطى تحت إشراف الوالدين.";
      }

      let productLink = links[vitamin] || "#";

      report += `${index + 1}. ${vitamin}\n`;
      report += `- دواعي الاستعمال: ${benefit}\n`;
      report += `- الجرعة الموصى بها: ${usage}\n`;
      report += `- رابط الصرف: ${productLink}\n\n`;
    });

    report += `--- التوصيات الطبية الشاملة ---\n`;
    report += `لضمان تحقيق أقصى استفادة علاجية، يُنصح بالبدء في الباقة المتكاملة المخصصة لحالتكم:\n`;
    report += `رابط الباقة: ${bundleLink}\n\n`;

    report += `المتابعة: يُنصح بإجراء الفحوصات الدورية (مثل صورة دم كاملة ومستويات فيتامين د)، والتواصل معنا بعد 30 يوماً لتقييم الاستجابة وتحديث البروتوكول إذا لزم الأمر.\n\n`;
    report += `مع تمنياتنا بدوام الصحة والعافية،\nالفريق الطبي - American Box`;

    return report;
  };

  const copyToClipboard = () => {
    const content = generateWhatsAppReport(selectedLead);
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const allVitamins = Object.keys(ProductDetails);

  const filteredLeads = selectedQuizTypeFilter === 'الكل' 
    ? leads 
    : leads.filter(lead => (lead.quiz_type || 'شامل') === selectedQuizTypeFilter);

  const exportToExcel = () => {
    const dataToExport = filteredLeads.map(lead => {
      const formattedAnswers = lead.quiz_answers 
        ? Object.entries(lead.quiz_answers).map(([q, a]) => `${q}: ${a}`).join(' | ')
        : '';
        
      return {
        "الاسم": lead.full_name || 'غير محدد',
        "رقم الهاتف": lead.whatsapp,
        "رقم الواتساب": lead.whatsapp,
        "العمر": lead.age || 'غير محدد',
        "النوع": lead.gender || 'غير محدد',
        "نوع الاستبيان": lead.quiz_type || 'شامل',
        "الاحتياجات (التشخيص)": lead.top_categories?.map((c: string) => categoryNames[c] || c).join('، ') || 'الصحة العامة',
        "الأمراض المزمنة": lead.chronic_diseases || 'لا يوجد',
        "التاريخ المرضي": lead.medical_history || 'لا يوجد',
        "حالة الرسالة": lead.is_message_sent ? 'تم الإرسال' : 'بانتظار الإرسال',
        "تاريخ التسجيل": new Date(lead.created_at).toLocaleDateString('ar-EG'),
        "إجابات الاستبيان": formattedAnswers
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    
    const currentDate = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `AmericanBox_Leads_${currentDate}.xlsx`);
  };

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
          <div className="space-y-6">
            {/* Smart Filtering System */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="overflow-x-auto w-full md:w-auto">
                <div className="flex gap-2 min-w-max">
                  {quizTypesList.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedQuizTypeFilter(type)}
                      className={`px-4 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap ${
                        selectedQuizTypeFilter === type
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors whitespace-nowrap shadow-sm"
              >
                <Download className="w-5 h-5" />
                تصدير إلى Excel 📊
              </button>
            </div>

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
                  ) : filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        لا يوجد عملاء محتملين مطابقين للبحث.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
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
                          onClick={() => {
                            setSelectedLead(lead);
                            setLeadModalTab('report');
                          }}
                          className="px-3 py-1.5 bg-accent/10 text-accent-dark font-bold rounded-lg hover:bg-accent/20 transition-colors text-sm whitespace-nowrap"
                        >
                          عرض التفاصيل
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

        {/* Lead Details Modal */}
        {selectedLead && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-tajawal font-bold text-lg text-slate-800">تفاصيل العميل: {selectedLead.full_name}</h3>
                <button onClick={() => setSelectedLead(null)} className="p-1 hover:bg-slate-200 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              
              <div className="flex border-b border-slate-100 bg-white px-4 pt-2 gap-4">
                <button 
                  onClick={() => setLeadModalTab('report')}
                  className={`pb-2 px-2 font-bold text-sm transition-colors border-b-2 ${leadModalTab === 'report' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  تقرير واتساب
                </button>
                <button 
                  onClick={() => setLeadModalTab('answers')}
                  className={`pb-2 px-2 font-bold text-sm transition-colors border-b-2 ${leadModalTab === 'answers' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  إجابات الاستبيان
                </button>
                <button 
                  onClick={() => setLeadModalTab('labs')}
                  className={`pb-2 px-2 font-bold text-sm transition-colors border-b-2 ${leadModalTab === 'labs' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  التحاليل المرفقة
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-grow bg-slate-50/50">
                {leadModalTab === 'report' && (
                  <pre className="whitespace-pre-wrap font-cairo text-slate-700 bg-white p-5 rounded-xl border border-slate-200 text-sm leading-relaxed shadow-sm">
                    {generateWhatsAppReport(selectedLead)}
                  </pre>
                )}
                
                {leadModalTab === 'answers' && (
                  <div className="space-y-4">
                    {selectedLead.quiz_answers && Object.keys(selectedLead.quiz_answers).length > 0 ? (
                      Object.entries(selectedLead.quiz_answers).map(([question, answer], idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <p className="text-sm font-bold text-slate-800 mb-2">{question}</p>
                          <p className="text-sm text-primary bg-primary/5 p-3 rounded-lg border border-primary/10">{answer}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-8 text-slate-500 bg-white rounded-xl border border-slate-200">
                        لا توجد إجابات مسجلة لهذا العميل.
                      </div>
                    )}
                  </div>
                )}

                {leadModalTab === 'labs' && (
                  <div className="space-y-4">
                    {selectedLead.lab_files && selectedLead.lab_files.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedLead.lab_files.map((url, idx) => (
                          <a 
                            key={idx} 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-primary hover:shadow-md transition-all group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                              <LinkIcon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="text-sm font-bold text-slate-800 truncate">مرفق تحليل {idx + 1}</p>
                              <p className="text-xs text-slate-500 truncate" dir="ltr">{url}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-8 text-slate-500 bg-white rounded-xl border border-slate-200">
                        لا يوجد تحاليل مرفقة.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3 flex-wrap">
                <button
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors"
                >
                  إغلاق
                </button>
                <button
                  onClick={() => reactToPrintFn()}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  تحميل التقرير PDF 📄
                </button>
                {leadModalTab === 'report' && (
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-6 py-2 bg-[#25D366] text-white rounded-lg font-bold hover:bg-[#20bd5a] transition-colors shadow-sm"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'تم النسخ!' : 'نسخ التقرير'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Hidden Print Component */}
        <div className="absolute -left-[9999px] top-0">
          <div ref={contentRef} className="p-8 font-cairo bg-white text-black w-[800px]" dir="rtl">
            <div className="border-b-2 border-slate-800 pb-4 mb-6 text-center">
              <h1 className="text-3xl font-tajawal font-bold text-slate-900">American Box 🇺🇸</h1>
              <h2 className="text-xl text-slate-600 mt-2">تقرير التقييم الصحي</h2>
            </div>

            {selectedLead && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-8 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div><span className="font-bold">الاسم:</span> {selectedLead.full_name || 'غير محدد'}</div>
                  <div><span className="font-bold">التاريخ:</span> {new Date(selectedLead.created_at).toLocaleDateString('ar-EG')}</div>
                  <div><span className="font-bold">العمر:</span> {selectedLead.age || 'غير محدد'}</div>
                  <div><span className="font-bold">النوع:</span> {selectedLead.gender || 'غير محدد'}</div>
                  <div><span className="font-bold">رقم الهاتف:</span> <span dir="ltr">{selectedLead.whatsapp}</span></div>
                  <div><span className="font-bold">نوع الاستبيان:</span> {selectedLead.quiz_type || 'شامل'}</div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-bold border-b border-slate-200 pb-2 mb-4">التاريخ المرضي</h3>
                  <div className="space-y-2">
                    <p><span className="font-bold">الأمراض المزمنة:</span> {selectedLead.chronic_diseases || 'لا يوجد'}</p>
                    <p><span className="font-bold">التاريخ الطبي:</span> {selectedLead.medical_history || 'لا يوجد'}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-bold border-b border-slate-200 pb-2 mb-4">إجابات الاستبيان</h3>
                  {selectedLead.quiz_answers && Object.keys(selectedLead.quiz_answers).length > 0 ? (
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-slate-300 p-2 w-1/2">السؤال</th>
                          <th className="border border-slate-300 p-2 w-1/2">الإجابة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(selectedLead.quiz_answers).map(([q, a], idx) => (
                          <tr key={idx}>
                            <td className="border border-slate-300 p-2 text-sm">{q}</td>
                            <td className="border border-slate-300 p-2 text-sm font-bold text-slate-800">{a}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-slate-500">لا توجد إجابات مسجلة.</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold border-b border-slate-200 pb-2 mb-4">التحاليل المرفقة</h3>
                  <p>
                    {selectedLead.lab_files && selectedLead.lab_files.length > 0 
                      ? `تم إرفاق عدد (${selectedLead.lab_files.length}) ملفات تحاليل طبية مع هذا التقييم.`
                      : 'لا يوجد تحاليل مرفقة.'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
