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

// weeklyEvent

export type WeeklyEventNodeStatus = "locked" | "unlocked" | "completed";

export type WeeklyEventNodeType =
  | "mini_quiz"
  | "time_challenge"
  | "true_false_sprint"
  | "survival"
  | "mixed_gauntlet"
  | "emoji_puzzle"
  | "quote_guess"
  | "vote";

export interface WeeklyEventNodeSummary {
  index: number;
  type: WeeklyEventNodeType;
  title: string;
  description: string;
  iconKey: string;
  status: WeeklyEventNodeStatus;
  completionReward?: {
    trophies: number;
    gems: number;
  };
  config?: any; // Simplified for display purposes
  questionsCorrect?: number;
  trophiesCollected?: number;
}

export interface WeeklyEventInfo {
  id: string;
  weekKey: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  theme?: {
    name?: string;
    primaryColor?: string;
    bannerImageUrl?: string;
  };
}

export interface WeeklyEventProgress {
  currentNodeIndex: number;
  fullCompletionRewardClaimed: boolean;
}

export interface WeeklyEventResponse {
  event: WeeklyEventInfo;
  progress: WeeklyEventProgress;
  nodes: WeeklyEventNodeSummary[];
}
