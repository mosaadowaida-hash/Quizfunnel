import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Footer from '@/components/Footer';

export default function TermsAndConditions() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 w-full">
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary-light font-bold mb-8 transition-colors">
          <ArrowRight className="w-5 h-5" />
          العودة للصفحة الرئيسية
        </Link>
        
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
          <h1 className="text-3xl md:text-4xl font-tajawal font-bold text-slate-900 mb-8">الشروط والأحكام</h1>
          
          <div className="space-y-6 text-slate-600 leading-relaxed">
            <p>
              مرحباً بك في American Box. يرجى قراءة الشروط والأحكام التالية بعناية قبل استخدام موقعنا والتقييم الصحي الخاص بنا.
            </p>
            
            <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">1. قبول الشروط</h2>
            <p>
              باستخدامك لموقعنا والتقييم الصحي، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام الموقع.
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">2. طبيعة الخدمة</h2>
            <p>
              التقييم الصحي المقدم عبر موقعنا هو أداة إرشادية مبنية على دراسات علمية عامة. <strong>هذا التقييم ليس تشخيصاً طبياً ولا يغني عن استشارة الطبيب المختص أو إجراء الفحوصات الطبية اللازمة.</strong>
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">3. التوصيات والمنتجات</h2>
            <p>
              التوصيات المتعلقة بالمكملات الغذائية والفيتامينات هي اقتراحات عامة تهدف لدعم الصحة العامة. يجب عليك دائماً استشارة طبيبك قبل البدء في تناول أي مكمل غذائي، خاصة إذا كنت تعاني من حالات طبية سابقة أو تتناول أدوية أخرى.
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">4. دقة المعلومات</h2>
            <p>
              أنت مسؤول عن تقديم معلومات دقيقة وصحيحة أثناء إكمال التقييم الصحي. دقة التوصيات تعتمد بشكل كبير على صحة المعلومات التي تقدمها.
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">5. حقوق الملكية الفكرية</h2>
            <p>
              جميع المحتويات الموجودة على هذا الموقع، بما في ذلك النصوص والتصميمات والشعارات والأسئلة والتقييمات، هي ملك لـ American Box ومحمية بموجب قوانين حقوق الطبع والنشر.
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">6. إخلاء المسؤولية</h2>
            <p>
              نحن لا نتحمل أي مسؤولية عن أي أضرار مباشرة أو غير مباشرة قد تنشأ عن استخدامك لموقعنا أو اعتمادك على التوصيات المقدمة. استخدامك للخدمة يكون على مسؤوليتك الشخصية.
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">7. التعديلات</h2>
            <p>
              نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. استمرارك في استخدام الموقع بعد إجراء أي تعديلات يعتبر قبولاً منك للشروط المعدلة.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
