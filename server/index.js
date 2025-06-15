const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Production-ready CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://your-app-name.vercel.app', // Replace with your Vercel URL
        /\.vercel\.app$/ // Allow all Vercel preview deployments
      ]
    : ["http://localhost:5173", "http://localhost:5174"],
  methods: ["GET", "POST"],
  credentials: true
};

const io = socketIo(server, {
  cors: corsOptions
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
let currentPoll = null;
let students = new Map(); // studentId -> { name, socketId, hasAnswered }
let pollResults = new Map(); // optionIndex -> count
let pollHistory = [];

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  // Student joins with name
  socket.on('student-join', (data) => {
    const { studentId, name } = data;
    students.set(studentId, {
      name,
      socketId: socket.id,
      hasAnswered: false
    });
    
    console.log(`Student ${name} joined with ID: ${studentId}`);    // Send current poll if active
    if (currentPoll) {
      socket.emit('poll-active', {
        id: currentPoll.id,
        question: currentPoll.question,
        options: currentPoll.options,
        correctAnswerIndex: currentPoll.correctAnswerIndex,
        timeLimit: currentPoll.timeLimit,
        startTime: currentPoll.startTime
      });
      
      // Send current poll results - make sure we have results initialized
      const currentResults = Array.from(pollResults.entries());
      console.log('Sending poll results to joining student:', currentResults);
      socket.emit('poll-results', currentResults);
    }
    
    // Update student count for everyone
    io.emit('student-count', students.size);
  });
  // Teacher creates a new poll
  socket.on('create-poll', (data) => {
    const { question, options, timeLimit = 60, correctAnswerIndex } = data;
    
    // Reset students' answer status
    students.forEach((student) => {
      student.hasAnswered = false;
    });
      currentPoll = {
      id: Date.now().toString(),
      question,
      options,
      correctAnswerIndex,
      timeLimit,
      startTime: new Date(),
      answers: new Map() // studentId -> answerIndex
    };
    
    // Reset poll results
    pollResults.clear();
    options.forEach((_, index) => {
      pollResults.set(index, 0);
    });
    
    console.log('New poll created:', question);    // Broadcast to all students
    io.emit('poll-active', {
      id: currentPoll.id,
      question,
      options,
      correctAnswerIndex,
      timeLimit,
      startTime: currentPoll.startTime
    });
      // Broadcast initial results (all zeros) to everyone
    const initialResults = Array.from(pollResults.entries());
    console.log('Broadcasting initial poll results:', initialResults);
    io.emit('poll-results', initialResults);// Auto-end poll after time limit
    const pollId = currentPoll.id;
    setTimeout(() => {
      if (currentPoll && currentPoll.id === pollId) {
        endCurrentPoll();
      }
    }, timeLimit * 1000);
  });

  // Student submits answer
  socket.on('submit-answer', (data) => {
    const { studentId, answerIndex } = data;
    
    if (!currentPoll || !students.has(studentId)) {
      return;
    }
    
    const student = students.get(studentId);
    if (student.hasAnswered) {
      return; // Already answered
    }
    
    // Record answer
    currentPoll.answers.set(studentId, answerIndex);
    student.hasAnswered = true;
    
    // Update results
    const currentCount = pollResults.get(answerIndex) || 0;
    pollResults.set(answerIndex, currentCount + 1);
    
    console.log(`Student ${student.name} answered: ${answerIndex}`);
      // Check if all students have answered
    const allAnswered = Array.from(students.values()).every(s => s.hasAnswered);
    
    if (allAnswered) {
      endCurrentPoll();    } else {
      // Broadcast updated results to everyone (teachers and students who have answered)
      const currentResults = Array.from(pollResults.entries());
      console.log('Broadcasting updated poll results:', currentResults);
      io.emit('poll-results', currentResults);
    }
  });
  // Teacher joins teacher room
  socket.on('teacher-join', () => {
    socket.join('teachers');
    console.log('Teacher joined');
      // Send current poll status
    if (currentPoll) {
      socket.emit('poll-active', {
        id: currentPoll.id,
        question: currentPoll.question,
        options: currentPoll.options,
        correctAnswerIndex: currentPoll.correctAnswerIndex,
        timeLimit: currentPoll.timeLimit,
        startTime: currentPoll.startTime      });
      
      // Send current poll results - ensure we always send current state
      const teacherResults = Array.from(pollResults.entries());
      console.log('Sending current results to teacher:', teacherResults);
      socket.emit('poll-results', teacherResults);
    }
    
    // Send current student count and poll history
    socket.emit('student-count', students.size);
    socket.emit('poll-history', pollHistory);
  });
  // Get poll results
  socket.on('get-results', () => {
    if (currentPoll) {
      socket.emit('poll-results', Array.from(pollResults.entries()));
    }
  });

  // Chat functionality
  socket.on('send-message', (data) => {
    const { message, senderName, senderType } = data; // senderType: 'teacher' or 'student'
    
    const chatMessage = {
      id: Date.now().toString(),
      message: message.trim(),
      senderName,
      senderType,
      timestamp: new Date().toISOString()
    };
    
    // Broadcast message to all connected users
    io.emit('new-message', chatMessage);
    console.log(`${senderType} ${senderName}: ${message}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove student if they disconnect
    for (const [studentId, student] of students.entries()) {
      if (student.socketId === socket.id) {
        students.delete(studentId);
        console.log(`Student ${student.name} disconnected`);
        break;
      }
    }
    
    // Update student count
    io.emit('student-count', students.size);
  });
});

function endCurrentPoll() {
  if (!currentPoll) return;
  
  console.log('Ending poll:', currentPoll.question);
    // Save to history
  const completedPoll = {
    id: currentPoll.id,
    question: currentPoll.question,
    options: currentPoll.options,
    correctAnswerIndex: currentPoll.correctAnswerIndex,
    results: Array.from(pollResults.entries()),
    totalResponses: currentPoll.answers.size,
    endTime: new Date()
  };
  
  pollHistory.push(completedPoll);
  
  // Broadcast final results to everyone
  io.emit('poll-ended', {
    question: currentPoll.question,
    options: currentPoll.options,
    results: Array.from(pollResults.entries()),
    totalResponses: currentPoll.answers.size
  });
  
  // Broadcast updated poll history to all teachers
  io.to('teachers').emit('poll-history', pollHistory);
  
  currentPoll = null;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get poll history endpoint
app.get('/api/poll-history', (req, res) => {
  res.json(pollHistory);
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
