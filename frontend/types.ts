import React from "react";

export const enum QUESTION_TYPES {
  MC = "Multiple Choice",
  TF = "True/False",
  SA = "Short Answer",
  NUM = "Numeric",
}

export interface ButtonProps {
  title?: string;
  Logo?: any;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export interface GradientProps {
  children: React.ReactNode;
  style?: any;
  color?: any;
}

export interface QuizType {
  _id: string;
  quizId: QuizType;
  logoFile: string;
  title: string;
  company: string;
  progress: number;
  rewardsTotal: number;
  questionsTotal: number;
  sections: {
    title: string;
    difficulty: string;
    questions: {}[];
    completedQuestions: number;
    rewards: number;
    total: number;
  }[];
}

export interface QuizModalProps {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  quiz: QuizType;
  currentProgress?: any;
  isUnlocked?: boolean;
}

export type DailyAnswerPayload = {
  index: number; // question index
  type: string; // for backend if needed
  selectedOptionIndex?: number; // for MC/TF
  textAnswer?: string; // for Short Answer
  numericAnswer?: number; // for Numeric
};
