'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Activity, HeartPulse, ArrowLeft, Bone, Heart, Brain, Shield, Scale, Sparkles, Droplets, Scissors, Dumbbell, Baby } from 'lucide-react';
import QuizFlow from '@/components/QuizFlow';
import { event } from '@/components/PixelScripts';
import Footer from '@/components/Footer';
import { useQuizStore } from '@/store/quizStore';

const customQuizzes = [
  { id: 'bones', title: 'صحة العظام والمفاصل', icon: Bone, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'heart', title: 'صحة القلب والأوعية الدموية', icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
  { id: 'mental', title: 'الصحة النفسية وتقليل التوتر', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'immunity', title: 'دعم المناعة', icon: Shield, color: 'text-green-500', bg: 'bg-green-50' },
  { id: 'weight', title: 'فقدان الوزن والتمثيل الغذائي', icon: Scale, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'antiaging', title: 'مكافحة الشيخوخة (Anti-Aging)', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 'skin', title: 'العناية بالبشرة', icon: Droplets, color: 'text-pink-500', bg: 'bg-pink-50' },
  { id: 'hair', title: 'العناية بالشعر', icon: Scissors, color: 'text-rose-500', bg: 'bg-rose-50' },
  { id: 'sports', title: 'المكملات الرياضية وبناء العضلات', icon: Dumbbell, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: 'child', title: 'صحة الطفل', icon: Baby, color: 'text-teal-500', bg: 'bg-teal-50' },
];

export default function Home() {
  const [started, setStarted] = useState(false);
  const { setQuizType } = useQuizStore();

  const handleStart = (type: string = 'شامل') => {
    setQuizType(type);
    event('StartQuiz', { quiz_type: type });
    setStarted(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <main className="flex-grow flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <AnimatePresence mode="wait">
          {!started ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="z-10 w-full max-w-5xl mx-auto px-6 py-12 text-center flex flex-col items-center"
            >
              <div className="mb-8 inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                <span className="text-2xl font-tajawal font-bold text-primary tracking-tight">
                  AMERICAN BOX
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-tajawal font-bold text-slate-900 mb-6 leading-tight">
                اكتشف احتياجات جسمك الحقيقية
                <br />
                <span className="text-primary">بدقة علمية</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                18 سؤالاً فقط تكشف لك أي الفيتامينات يحتاجها جسمك للوصول لأفضل أداء يومي. مبني على أحدث الدراسات الطبية.
              </p>

              <button
                onClick={() => handleStart('شامل')}
                className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-primary text-white rounded-2xl text-xl font-bold overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary/30 w-full max-w-md"
              >
                <span className="relative z-10">الاستبيان الصحي الشامل</span>
                <ArrowLeft className="w-6 h-6 relative z-10 group-hover:-translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary-light to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <div className="mt-16 w-full">
                <h2 className="text-2xl font-tajawal font-bold text-slate-800 mb-8 relative inline-block">
                  أو اختر استبياناً مخصصاً لحالتك:
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-accent rounded-full" />
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {customQuizzes.map((quiz) => {
                    const Icon = quiz.icon;
                    return (
                      <button
                        key={quiz.id}
                        onClick={() => handleStart(quiz.title)}
                        className="flex flex-col items-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group"
                      >
                        <div className={`w-14 h-14 rounded-full ${quiz.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <Icon className={`w-7 h-7 ${quiz.color}`} />
                        </div>
                        <h3 className="font-tajawal font-bold text-slate-700 text-sm leading-tight">
                          {quiz.title}
                        </h3>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
                <div className="flex flex-col items-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm">
                  <ShieldCheck className="w-8 h-8 text-accent mb-3" />
                  <h3 className="font-tajawal font-bold text-slate-800 mb-1">بيانات آمنة</h3>
                  <p className="text-sm text-slate-500">خصوصيتك محمية بالكامل</p>
                </div>
                <div className="flex flex-col items-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm">
                  <Activity className="w-8 h-8 text-accent mb-3" />
                  <h3 className="font-tajawal font-bold text-slate-800 mb-1">دقة علمية</h3>
                  <p className="text-sm text-slate-500">مبني على دراسات موثوقة</p>
                </div>
                <div className="flex flex-col items-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm">
                  <HeartPulse className="w-8 h-8 text-accent mb-3" />
                  <h3 className="font-tajawal font-bold text-slate-800 mb-1">توصيات مخصصة</h3>
                  <p className="text-sm text-slate-500">بروتوكول مصمم خصيصاً لك</p>
                </div>
              </div>

              <p className="mt-16 text-xs text-slate-400 max-w-3xl mx-auto leading-relaxed">
                هذا الاستبيان ليس تشخيصاً طبياً ولا يغني عن فحص الدم أو استشارة الطبيب. التوصيات عامة ومبنية على دراسات علمية كبرى (NIH, Mayo Clinic, AREDS2, COSMOS). استشر طبيبك قبل تناول أي مكمل غذائي.
              </p>
            </motion.div>
          ) : (
            <QuizFlow key="quiz" />
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
