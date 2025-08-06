import React from "react";

export interface ButtonProps {
  title?: string;
  Logo?: any;
  onPress: () => void;
  loading?: boolean;
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
  total: number;
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
}
