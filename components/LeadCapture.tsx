'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuizStore } from '@/store/quizStore';
import { event } from '@/components/PixelScripts';
import { CheckCircle2, Loader2 } from 'lucide-react';

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
  skin_hair: 'العناية بالبشرة والشعر'
};

export default function LeadCapture() {
  const { topCategories, categoryScores, deficientCategories, recommendedVitamins, age, gender, chronicDiseases, medicalHistory, quizType, exactAnswers, labFiles } = useQuizStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const isPerfectHealth = deficientCategories.length === 0;
  const topCategoryName = isPerfectHealth 
    ? 'الصحة العامة' 
    : (categoryNames[deficientCategories[0]] || categoryNames[topCategories[0]] || 'الصحة العامة');

  useEffect(() => {
    event('ViewContent', { content_name: 'Lead Capture Screen' });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age,
          gender,
          chronicDiseases,
          medicalHistory,
          quizType,
          topCategories: isPerfectHealth ? ['general'] : deficientCategories,
          categoryScores,
          recommendedVitamins,
          quiz_answers: exactAnswers,
          lab_files: labFiles,
        }),
      });

      if (res.ok) {
        event('Purchase', { currency: 'EGP', value: 100 });
        event('CompletePayment', { currency: 'EGP', value: 100 });
        setSubmitted(true);
      } else {
        const data = await res.json();
        const errorMsg = data.error || 'حدث خطأ أثناء إرسال البيانات. يرجى المحاولة مرة أخرى.';
        setError(errorMsg);
        alert(`Error: ${errorMsg}`);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'حدث خطأ في الاتصال. يرجى التحقق من اتصالك بالإنترنت.';
      setError(errorMsg);
      alert(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    const whatsappText = encodeURIComponent(`أهلاً American Box، لقد قمت بإكمال الاستبيان الصحي الشامل للتو باسم ${formData.name}، وأريد استلام تقريري الطبي المفصل ومعرفة البروتوكول المناسب لحالتي.`);
    const whatsappUrl = `https://wa.me/201040000728?text=${whatsappText}`;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-auto p-8 bg-white rounded-3xl shadow-xl text-center border border-slate-100 z-10"
      >
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-3xl font-tajawal font-bold text-slate-800 mb-4">تم حفظ بياناتك بنجاح!</h2>
        <p className="text-slate-600 mb-8 leading-relaxed">
          للحصول على تقريرك الطبي الشامل ومعرفة البروتوكول الأمريكي المخصص لك، يرجى التواصل معنا عبر الواتساب الآن.
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-4 bg-[#25D366] text-white rounded-xl font-bold text-lg hover:bg-[#20bd5a] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/30"
        >
          احصل على تقريرك الطبي المجاني عبر واتساب الآن
        </a>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto p-8 bg-white rounded-3xl shadow-xl border border-slate-100 z-10 overflow-hidden"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-tajawal font-bold text-slate-800 mb-4">
          تم تحليل إجاباتك!
        </h2>
        {isPerfectHealth ? (
          <p className="text-slate-600 leading-relaxed bg-green-50 p-4 rounded-xl border border-green-200">
            رائع! إجاباتك تدل على نمط حياة صحي جداً. للحفاظ على هذه الحيوية وسد أي فجوات غذائية بسيطة، نوصي بهذه الأساسيات:
          </p>
        ) : (
          <p className="text-slate-600 leading-relaxed bg-accent/10 p-4 rounded-xl border border-accent/20">
            اكتشفنا احتياجات أساسية لجسمك لتحسين <strong className="text-primary">{topCategoryName}</strong>. لاستكمال تقريرك الطبي بدقة، يرجى إدخال البيانات التالية.
          </p>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.form
          key="step2"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">الاسم بالكامل</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="أدخل اسمك"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">رقم الواتساب</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-left"
              placeholder="01xxxxxxxxx"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني (اختياري)</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-left"
              placeholder="example@email.com"
              dir="ltr"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-light transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                'احصل على تقريرك الآن'
              )}
            </button>
          </div>
        </motion.form>
      </AnimatePresence>
    </motion.div>
  );
}
