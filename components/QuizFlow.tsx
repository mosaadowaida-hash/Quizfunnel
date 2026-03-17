'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuizStore } from '@/store/quizStore';
import LeadCapture from './LeadCapture';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { event } from '@/components/PixelScripts';

export default function QuizFlow() {
  const { currentQuestionIndex, answers, setAnswer, nextQuestion, prevQuestion, isFinished, age, gender, chronicDiseases, medicalHistory, setMedicalProfile, quizType, quizData, setQuizData } = useQuizStore();

  const [showInitialAssessment, setShowInitialAssessment] = useState(true);
  const [localProfile, setLocalProfile] = useState({
    age: age || '',
    gender: gender || 'ذكر',
    chronicDiseases: chronicDiseases || '',
    medicalHistory: medicalHistory || ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadQuizData = async () => {
      setIsLoading(true);
      try {
        let data;
        switch (quizType) {
          case 'صحة العظام والمفاصل':
            data = (await import('@/data/quizzes/bone-health.json')).default;
            break;
          case 'صحة القلب والأوعية الدموية':
            data = (await import('@/data/quizzes/heart-health.json')).default;
            break;
          case 'الصحة النفسية وتقليل التوتر':
            data = (await import('@/data/quizzes/mental-health.json')).default;
            break;
          case 'دعم المناعة':
            data = (await import('@/data/quizzes/immunity.json')).default;
            break;
          case 'فقدان الوزن والتمثيل الغذائي':
            data = (await import('@/data/quizzes/weight-loss.json')).default;
            break;
          case 'مكافحة الشيخوخة (Anti-Aging)':
            data = (await import('@/data/quizzes/anti-aging.json')).default;
            break;
          case 'العناية بالبشرة':
            data = (await import('@/data/quizzes/skin-care.json')).default;
            break;
          case 'العناية بالشعر':
            data = (await import('@/data/quizzes/hair-care.json')).default;
            break;
          case 'المكملات الرياضية وبناء العضلات':
            data = (await import('@/data/quizzes/sports-nutrition.json')).default;
            break;
          case 'صحة الطفل':
            data = (await import('@/data/quizzes/child-health.json')).default;
            break;
          case 'شامل':
          default:
            data = (await import('@/data/quizzes/comprehensive.json')).default;
            break;
        }
        setQuizData(data);
      } catch (err) {
        console.error("Failed to load quiz data", err);
        // Fallback to comprehensive
        const fallbackData = (await import('@/data/quizzes/comprehensive.json')).default;
        setQuizData(fallbackData);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizData();
  }, [quizType, setQuizData]);

  useEffect(() => {
    if (!showInitialAssessment && currentQuestionIndex === 0) {
      event('QuizStarted');
    }
  }, [showInitialAssessment, currentQuestionIndex]);

  useEffect(() => {
    if (isFinished) {
      event('QuizCompleted', { completion_percentage: 100 });
    }
  }, [isFinished]);

  if (isLoading || !quizData) {
    return (
      <div className="w-full max-w-2xl mx-auto px-6 py-8 flex flex-col min-h-[80vh] items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-600 font-medium">جاري تحميل الاستبيان...</p>
      </div>
    );
  }

  const questions = quizData.universal_quiz.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / questions.length) * 100;

  const handleOptionSelect = (index: number) => {
    setAnswer(currentQuestion.id, index);
    event('QuestionAnswered', { step: currentQuestionIndex + 1, total: questions.length });
    setTimeout(() => {
      nextQuestion();
    }, 400); // slight delay for animation
  };

  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localProfile.age || !localProfile.gender) {
      setError('يرجى إدخال السن والجنس للمتابعة.');
      return;
    }
    setError('');
    setMedicalProfile(localProfile);
    setShowInitialAssessment(false);
  };

  if (isFinished) {
    return <LeadCapture />;
  }

  if (showInitialAssessment) {
    return (
      <div className="w-full max-w-2xl mx-auto px-6 py-8 flex flex-col min-h-[80vh] relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-tajawal font-bold text-slate-800 mb-4">
              التقييم الأولي
            </h2>
            <p className="text-slate-600 leading-relaxed bg-accent/10 p-4 rounded-xl border border-accent/20">
              لضمان دقة التوصيات الطبية، يرجى إدخال بياناتك الصحية الأساسية قبل البدء في الاستبيان.
            </p>
          </div>

          <form onSubmit={handleStartQuiz} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">السن</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="120"
                  value={localProfile.age}
                  onChange={(e) => setLocalProfile({ ...localProfile, age: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-left"
                  placeholder="مثال: 35"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">الجنس</label>
                <select
                  value={localProfile.gender}
                  onChange={(e) => setLocalProfile({ ...localProfile, gender: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                >
                  <option value="ذكر">ذكر</option>
                  <option value="أنثى">أنثى</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">الأمراض المزمنة (إن وجدت)</label>
              <textarea
                value={localProfile.chronicDiseases}
                onChange={(e) => setLocalProfile({ ...localProfile, chronicDiseases: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none h-24"
                placeholder="مثال: ضغط، سكر، لا يوجد..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">التاريخ المرضي والأدوية الحالية</label>
              <textarea
                value={localProfile.medicalHistory}
                onChange={(e) => setLocalProfile({ ...localProfile, medicalHistory: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none h-24"
                placeholder="أي تفاصيل طبية أخرى أو أدوية تتناولها حالياً..."
              />
              <p className="mt-2 text-xs font-medium text-red-500/80 italic">
                *تنويه هام: إذا كنت لا تعاني من أي أمراض مزمنة أو ليس لديك تاريخ مرضي ولا تتناول أدوية، يرجى ترك خانتي الأمراض المزمنة والتاريخ المرضي فارغتين تماماً (لا تكتب &quot;لا يوجد&quot;) لضمان دقة التشخيص.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-light transition-colors flex items-center justify-center gap-2 mt-6"
            >
              ابدأ الاستبيان
              <ArrowLeft className="w-5 h-5" />
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const options = currentQuestion.options_override || quizData.common_options;

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-8 flex flex-col min-h-[80vh] relative z-10">
      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-slate-500">
            سؤال {currentQuestionIndex + 1} من {questions.length}
          </span>
          <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="flex-grow flex flex-col justify-center relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <h2 className="text-2xl md:text-3xl font-tajawal font-bold text-slate-800 mb-8 leading-relaxed">
              {currentQuestion.text}
            </h2>

            <div className="space-y-3">
              {options.map((option: string, index: number) => {
                const isSelected = answers[currentQuestion.id] === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                    className={`w-full text-right p-5 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ${
                      isSelected
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-slate-100 bg-slate-50 hover:border-primary/30 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="text-lg font-medium">{option}</span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected ? 'border-primary' : 'border-slate-300 group-hover:border-primary/50'
                      }`}
                    >
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={prevQuestion}
          disabled={currentQuestionIndex === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors ${
            currentQuestionIndex === 0
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <ArrowRight className="w-5 h-5" />
          السابق
        </button>
      </div>
    </div>
  );
}
