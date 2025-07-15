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
  svg: React.ReactNode;
  title: string;
  company: string;
  progress: number;
  rewards: number;
  total: number;
  levels: {
    name: string;
    questions: number;
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
