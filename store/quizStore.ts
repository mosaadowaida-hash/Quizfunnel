import { create } from 'zustand';
import surveyData from '@/data/Survey-Questions.json';

export type CategoryScores = {
  heart: number;
  eyes: number;
  memory: number;
  focus: number;
  bones: number;
  energy: number;
  general: number;
  digestive: number;
};

type QuizState = {
  currentQuestionIndex: number;
  answers: Record<number, number>; // questionId -> selectedOptionIndex
  categoryScores: CategoryScores;
  isFinished: boolean;
  topCategories: string[];
  setAnswer: (questionId: number, optionIndex: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  calculateResults: () => void;
  resetQuiz: () => void;
};

const initialScores: CategoryScores = {
  heart: 0,
  eyes: 0,
  memory: 0,
  focus: 0,
  bones: 0,
  energy: 0,
  general: 0,
  digestive: 0,
};

export const useQuizStore = create<QuizState>((set, get) => ({
  currentQuestionIndex: 0,
  answers: {},
  categoryScores: { ...initialScores },
  isFinished: false,
  topCategories: [],

  setAnswer: (questionId, optionIndex) => {
    set((state) => ({
      answers: { ...state.answers, [questionId]: optionIndex },
    }));
  },

  nextQuestion: () => {
    const { currentQuestionIndex, answers } = get();
    const questions = surveyData.universal_quiz.questions;
    
    if (currentQuestionIndex < questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    } else {
      get().calculateResults();
    }
  },

  prevQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  calculateResults: () => {
    const { answers } = get();
    const questions = surveyData.universal_quiz.questions;
    const newScores: CategoryScores = { ...initialScores };

    questions.forEach((q) => {
      const selectedOptionIndex = answers[q.id];
      if (selectedOptionIndex !== undefined) {
        const scores = q.scores_override || surveyData.common_scores;
        const scoreValue = scores[selectedOptionIndex];

        if (q.impact) {
          Object.entries(q.impact).forEach(([category, weight]) => {
            if (category in newScores) {
              newScores[category as keyof CategoryScores] += scoreValue * weight;
            }
          });
        }
      }
    });

    // Sort categories by score descending
    const sortedCategories = Object.entries(newScores)
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .map(([category]) => category);

    const topCategories = sortedCategories.slice(0, 3);

    set({
      categoryScores: newScores,
      topCategories,
      isFinished: true,
    });
  },

  resetQuiz: () => {
    set({
      currentQuestionIndex: 0,
      answers: {},
      categoryScores: { ...initialScores },
      isFinished: false,
      topCategories: [],
    });
  },
}));
