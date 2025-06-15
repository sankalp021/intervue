import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Poll, PollResult, UserRole, PollHistory, ChatMessage } from '../types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  userRole: UserRole;
  studentName: string;
  studentId: string;
  currentPoll: Poll | null;
  pollResults: PollResult[];
  studentCount: number;
  pollHistory: PollHistory[];
  hasAnswered: boolean;
  timeRemaining: number;
  chatMessages: ChatMessage[];
  
  // Actions
  setUserRole: (role: UserRole) => void;
  setStudentName: (name: string) => void;
  createPoll: (question: string, options: string[], timeLimit?: number, correctAnswerIndex?: number) => void;
  submitAnswer: (answerIndex: number) => void;
  joinAsTeacher: () => void;
  joinAsStudent: (name: string) => void;
  sendMessage: (message: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [pollResults, setPollResults] = useState<PollResult[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [pollHistory, setPollHistory] = useState<PollHistory[]>([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    // Generate or retrieve student ID from sessionStorage
    let storedStudentId = sessionStorage.getItem('studentId');
    if (!storedStudentId) {
      storedStudentId = 'student_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('studentId', storedStudentId);
    }
    setStudentId(storedStudentId);

    // Retrieve student name from sessionStorage
    const storedStudentName = sessionStorage.getItem('studentName');
    if (storedStudentName) {
      setStudentName(storedStudentName);
    }

    // Initialize socket connection with production-ready URL
    const serverUrl = import.meta.env.VITE_SOCKET_URL || 
      (import.meta.env.PROD ? 'https://your-app-name.onrender.com' : 'http://localhost:3001');
    
    console.log('Connecting to:', serverUrl);
    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'] // Ensure compatibility
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });    newSocket.on('poll-active', (data) => {
      console.log('Received poll-active:', data);
      setCurrentPoll({
        ...data,
        startTime: new Date(data.startTime)
      });
      setHasAnswered(false);
      // Initialize empty results for new poll
      if (data.options) {
        const initialResults = data.options.map((_: any, index: number) => ({
          optionIndex: index,
          count: 0
        }));
        setPollResults(initialResults);
      }
    });

    newSocket.on('poll-ended', (data) => {
      setCurrentPoll(null);
      setPollResults(data.results.map(([optionIndex, count]: [number, number]) => ({
        optionIndex,
        count
      })));
      setHasAnswered(false);
      setTimeRemaining(0);
    });    newSocket.on('poll-results', (results: [number, number][]) => {
      console.log('Received poll-results:', results);
      const formattedResults = results.map(([optionIndex, count]) => ({
        optionIndex,
        count
      }));
      console.log('Formatted poll results:', formattedResults);
      setPollResults(formattedResults);
    });

    newSocket.on('student-count', (count: number) => {
      setStudentCount(count);
    });    newSocket.on('poll-history', (history: PollHistory[]) => {
      setPollHistory(history);
    });

    newSocket.on('new-message', (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Timer for poll countdown
  useEffect(() => {
    if (currentPoll && !hasAnswered) {
      const startTime = new Date(currentPoll.startTime).getTime();
      const endTime = startTime + (currentPoll.timeLimit * 1000);
      
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentPoll, hasAnswered]);

  const joinAsTeacher = () => {
    if (socket) {
      socket.emit('teacher-join');
      setUserRole('teacher');
    }
  };

  const joinAsStudent = (name: string) => {
    if (socket && studentId) {
      socket.emit('student-join', { studentId, name });
      setStudentName(name);
      setUserRole('student');
      sessionStorage.setItem('studentName', name);
    }
  };
  const createPoll = (question: string, options: string[], timeLimit = 60, correctAnswerIndex?: number) => {
    if (socket) {
      socket.emit('create-poll', { question, options, timeLimit, correctAnswerIndex });
    }
  };
  const submitAnswer = (answerIndex: number) => {
    if (socket && studentId && !hasAnswered) {
      socket.emit('submit-answer', { studentId, answerIndex });
      setHasAnswered(true);
    }
  };

  const sendMessage = (message: string) => {
    if (socket && message.trim()) {
      const senderName = userRole === 'teacher' ? 'Teacher' : studentName;
      const senderType = userRole || 'student';
      socket.emit('send-message', { 
        message: message.trim(), 
        senderName, 
        senderType 
      });
    }
  };
  const value: SocketContextType = {
    socket,
    isConnected,
    userRole,
    studentName,
    studentId,
    currentPoll,
    pollResults,
    studentCount,
    pollHistory,
    hasAnswered,
    timeRemaining,
    chatMessages,
    setUserRole,
    setStudentName,
    createPoll,
    submitAnswer,
    joinAsTeacher,
    joinAsStudent,
    sendMessage,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
