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
  riskPercentages: Record<string, number>;
  deficientCategories: string[];
  recommendedVitamins: string[];
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
  riskPercentages: {},
  deficientCategories: [],
  recommendedVitamins: [],
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
    const maxScores: CategoryScores = { ...initialScores };

    questions.forEach((q) => {
      const selectedOptionIndex = answers[q.id];
      const scores = q.scores_override || surveyData.common_scores;
      const maxOptionScore = Math.max(...scores);

      if (q.impact) {
        Object.entries(q.impact).forEach(([category, weight]) => {
          if (category in maxScores) {
            maxScores[category as keyof CategoryScores] += maxOptionScore * weight;
          }
        });
      }

      if (selectedOptionIndex !== undefined) {
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

    const riskPercentages: Record<string, number> = {};
    Object.keys(newScores).forEach((category) => {
      const max = maxScores[category as keyof CategoryScores];
      const score = newScores[category as keyof CategoryScores];
      riskPercentages[category] = max > 0 ? (score / max) * 100 : 0;
    });

    const deficientCategories = Object.entries(riskPercentages)
      .filter(([, risk]) => risk > 35)
      .sort(([, riskA], [, riskB]) => riskB - riskA)
      .map(([category]) => category);

    let finalRecommendedVitamins: string[] = [];

    if (deficientCategories.length === 0) {
      // Perfect health edge case
      finalRecommendedVitamins = ["مالتي فيتامين فائق الجودة", "أوميجا-3"];
    } else {
      const recommendedVitaminsSet = new Set<string>();
      const recommendedVitaminsList: string[] = [];

      deficientCategories.forEach((category) => {
        const key = `${category}_high` as keyof typeof surveyData.scoring_rules.recommendation_mapping;
        const vitamins = surveyData.scoring_rules.recommendation_mapping[key] || [];
        vitamins.forEach((vit) => {
          if (!recommendedVitaminsSet.has(vit)) {
            recommendedVitaminsSet.add(vit);
            recommendedVitaminsList.push(vit);
          }
        });
      });

      finalRecommendedVitamins = recommendedVitaminsList.slice(0, 4);
    }

    // Sort categories by score descending (legacy for topCategories)
    const sortedCategories = Object.entries(newScores)
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .map(([category]) => category);

    const topCategories = sortedCategories.slice(0, 3);

    set({
      categoryScores: newScores,
      riskPercentages,
      deficientCategories,
      recommendedVitamins: finalRecommendedVitamins,
      topCategories,
      isFinished: true,
    });
  },

  resetQuiz: () => {
    set({
      currentQuestionIndex: 0,
      answers: {},
      categoryScores: { ...initialScores },
      riskPercentages: {},
      deficientCategories: [],
      recommendedVitamins: [],
      isFinished: false,
      topCategories: [],
    });
  },
}));
