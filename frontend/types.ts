import React from "react";

export interface ButtonProps {
  title?: string;
  Logo?: any;
  onPress: () => void;
}

export interface GradientProps {
  children: React.ReactNode;
  style?: any;
  color?: any;
}

interface CardType {
  id: string;
  logoFile: string;
  title: string;
  company: string;
  progress: number;
  rewardsTotal: number;
  total: number;
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
  card: CardType;
}
