import { create } from 'zustand';

export type CategoryScores = {
  heart: number;
  eyes: number;
  memory: number;
  focus: number;
  bones: number;
  energy: number;
  general: number;
  digestive: number;
  immunity: number;
  skin_hair: number;
  [key: string]: number; // Allow dynamic categories from specific quizzes
};

type QuizState = {
  // Medical Profile
  age: string;
  gender: string;
  chronicDiseases: string;
  medicalHistory: string;
  setMedicalProfile: (profile: { age: string; gender: string; chronicDiseases: string; medicalHistory: string }) => void;

  quizType: string;
  setQuizType: (type: string) => void;

  quizData: any;
  setQuizData: (data: any) => void;

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
  immunity: 0,
  skin_hair: 0,
};

export const useQuizStore = create<QuizState>((set, get) => ({
  age: '',
  gender: 'ذكر',
  chronicDiseases: '',
  medicalHistory: '',
  setMedicalProfile: (profile) => set({ ...profile }),

  quizType: 'شامل',
  setQuizType: (type) => set({ quizType: type }),

  quizData: null,
  setQuizData: (data) => set({ quizData: data }),

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
    const { currentQuestionIndex, quizData } = get();
    if (!quizData) return;
    const questions = quizData.universal_quiz.questions;
    
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
    const { answers, age, gender, chronicDiseases, quizData } = get();
    if (!quizData) return;
    
    const questions = quizData.universal_quiz.questions;
    const newScores: CategoryScores = { ...initialScores };
    const maxScores: CategoryScores = { ...initialScores };

    questions.forEach((q: any) => {
      const selectedOptionIndex = answers[q.id];
      const scores = q.scores_override || quizData.common_scores;
      const maxOptionScore = Math.max(...scores);

      if (q.impact) {
        Object.entries(q.impact).forEach(([category, weight]) => {
          if (!(category in maxScores)) maxScores[category] = 0;
          maxScores[category] += maxOptionScore * (weight as number);
        });
      }

      if (selectedOptionIndex !== undefined) {
        const scoreValue = scores[selectedOptionIndex];

        if (q.impact) {
          Object.entries(q.impact).forEach(([category, weight]) => {
            if (!(category in newScores)) newScores[category] = 0;
            newScores[category] += scoreValue * (weight as number);
          });
        }
      }
    });

    const riskPercentages: Record<string, number> = {};
    Object.keys(newScores).forEach((category) => {
      const max = maxScores[category] || 0;
      const score = newScores[category] || 0;
      let risk = max > 0 ? (score / max) * 100 : 0;

      // Dynamic Medical Scoring Multipliers
      const ageNum = parseInt(age);
      
      // Rule 1: Age >= 40
      if (!isNaN(ageNum) && ageNum >= 40) {
        if (category === 'bones' || category === 'heart' || category === 'نقص الكالسيوم' || category === 'دعم عضلة القلب') {
          risk += 15;
        }
      }

      // Rule 2: Gender === "أنثى"
      if (gender === 'أنثى') {
        if (category === 'bones' || category === 'skin_hair' || category === 'نقص الكالسيوم') {
          risk += 10;
        }
      }

      // Rule 3: Chronic Diseases
      if (chronicDiseases && chronicDiseases.trim() !== '') {
        if (category === 'immunity' || category === 'heart' || category === 'دعم عضلة القلب') {
          risk += 20;
        }
      }

      // Ensure max risk is 100%
      riskPercentages[category] = Math.min(risk, 100);
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
        const key = `${category}_high`;
        const vitamins = quizData.scoring_rules.recommendation_mapping[key] || [];
        vitamins.forEach((vit: string) => {
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
      age: '',
      gender: 'ذكر',
      chronicDiseases: '',
      medicalHistory: '',
      quizType: 'شامل',
      quizData: null,
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
