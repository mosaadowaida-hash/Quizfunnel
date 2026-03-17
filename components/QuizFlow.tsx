'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuizStore } from '@/store/quizStore';
import surveyData from '@/data/Survey-Questions.json';
import LeadCapture from './LeadCapture';
import { ArrowRight } from 'lucide-react';
import { event } from '@/components/PixelScripts';

export default function QuizFlow() {
  const { currentQuestionIndex, answers, setAnswer, nextQuestion, prevQuestion, isFinished } = useQuizStore();
  const questions = surveyData.universal_quiz.questions;
  const currentQuestion = questions[currentQuestionIndex];

  const progress = ((currentQuestionIndex) / questions.length) * 100;

  useEffect(() => {
    event('QuizStarted');
  }, []);

  useEffect(() => {
    if (isFinished) {
      event('QuizCompleted', { completion_percentage: 100 });
    }
  }, [isFinished]);

  const handleOptionSelect = (index: number) => {
    setAnswer(currentQuestion.id, index);
    event('QuestionAnswered', { step: currentQuestionIndex + 1, total: questions.length });
    setTimeout(() => {
      nextQuestion();
    }, 400); // slight delay for animation
  };

  if (isFinished) {
    return <LeadCapture />;
  }

  const options = currentQuestion.options_override || surveyData.common_options;

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
              {options.map((option, index) => {
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
