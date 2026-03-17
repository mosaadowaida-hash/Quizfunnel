'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';
import QuizFlow from '@/components/QuizFlow';
import Footer from '@/components/Footer';
import { event } from '@/components/PixelScripts';

const slugToQuizType: Record<string, string> = {
  "bone-health": "صحة العظام والمفاصل",
  "heart-health": "صحة القلب والأوعية الدموية",
  "mental-health": "الصحة النفسية وتقليل التوتر",
  "immunity": "دعم المناعة",
  "weight-loss": "فقدان الوزن والتمثيل الغذائي",
  "anti-aging": "مكافحة الشيخوخة",
  "skin-care": "العناية بالبشرة",
  "hair-care": "العناية بالشعر",
  "sports-nutrition": "المكملات الرياضية وبناء العضلات",
  "child-health": "صحة الطفل",
  "comprehensive": "شامل"
};

export default function QuizSlugPage() {
  const params = useParams();
  const router = useRouter();
  const { setQuizType, resetQuiz } = useQuizStore();
  const [isReady, setIsReady] = useState(false);
  const eventFired = useRef(false);

  useEffect(() => {
    const slug = params.slug as string;
    const mappedQuizType = slugToQuizType[slug];

    if (mappedQuizType) {
      resetQuiz();
      setQuizType(mappedQuizType);
      if (!eventFired.current) {
        event('StartQuiz', { quiz_type: mappedQuizType });
        eventFired.current = true;
      }
      setIsReady(true);
    } else {
      router.replace('/');
    }
  }, [params.slug, router, setQuizType, resetQuiz]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <main className="flex-grow flex flex-col items-center justify-center relative overflow-hidden">
        <QuizFlow />
      </main>
      <Footer />
    </div>
  );
}
