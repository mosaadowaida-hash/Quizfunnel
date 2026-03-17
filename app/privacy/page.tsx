import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Footer from '@/components/Footer';

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 w-full">
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary-light font-bold mb-8 transition-colors">
          <ArrowRight className="w-5 h-5" />
          العودة للصفحة الرئيسية
        </Link>
        
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
          <h1 className="text-3xl md:text-4xl font-tajawal font-bold text-slate-900 mb-8">سياسة الخصوصية</h1>
          
          <div className="space-y-6 text-slate-600 leading-relaxed">
            <p>
              نحن في American Box نولي أهمية قصوى لخصوصية زوارنا وعملائنا. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك الشخصية عند استخدامك لموقعنا والتقييم الصحي الخاص بنا.
            </p>
            
            <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">1. المعلومات التي نجمعها</h2>
            <p>
              قد نقوم بجمع المعلومات التالية عند استخدامك للتقييم الصحي:
            </p>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>الاسم الكامل</li>
              <li>رقم الهاتف (الواتساب)</li>
              <li>البريد الإلكتروني (اختياري)</li>
              <li>إجاباتك على أسئلة التقييم الصحي</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">2. كيف نستخدم معلوماتك</h2>
            <p>
              نستخدم المعلومات التي نجمعها للأغراض التالية:
            </p>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>تحليل إجاباتك لتقديم توصيات صحية مخصصة.</li>
              <li>التواصل معك عبر الواتساب لإرسال التقرير الطبي والبروتوكول المقترح.</li>
              <li>تحسين جودة خدماتنا وتجربة المستخدم.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">3. حماية البيانات</h2>
            <p>
              نحن نتخذ إجراءات أمنية مناسبة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التعديل أو الإفصاح أو الإتلاف. بياناتك الصحية تُعامل بسرية تامة.
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">4. مشاركة المعلومات</h2>
            <p>
              نحن لا نقوم ببيع أو تأجير معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك فقط مع مزودي الخدمات الموثوقين الذين يساعدوننا في تشغيل موقعنا وتقديم خدماتنا، بشرط أن يوافقوا على الحفاظ على سرية هذه المعلومات.
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">5. التغييرات في سياسة الخصوصية</h2>
            <p>
              نحتفظ بالحق في تحديث سياسة الخصوصية هذه في أي وقت. سنقوم بنشر أي تغييرات على هذه الصفحة، ونشجعك على مراجعتها بشكل دوري.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
