export interface Poll {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex?: number; // Optional: index of the correct answer
  timeLimit: number;
  startTime: Date;
}

export interface PollResult {
  optionIndex: number;
  count: number;
}

export interface Student {
  id: string;
  name: string;
  hasAnswered: boolean;
}

export interface PollHistory {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex?: number;
  results: [number, number][];
  totalResponses: number;
  endTime: Date;
}

export interface ChatMessage {
  id: string;
  message: string;
  senderName: string;
  senderType: 'teacher' | 'student';
  timestamp: string;
}

export type UserRole = 'teacher' | 'student' | null;
