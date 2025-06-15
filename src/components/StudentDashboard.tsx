import React, { useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import Chat from './Chat';

const StudentDashboard: React.FC = () => {
  const {
    studentName,
    currentPoll,
    pollResults,
    hasAnswered,
    timeRemaining,
    submitAnswer,
    setUserRole,
    studentCount
  } = useSocket();

  const [chatOpen, setChatOpen] = useState(false);

  const handleAnswerSubmit = (answerIndex: number) => {
    if (!hasAnswered && timeRemaining > 0) {
      submitAnswer(answerIndex);
    }
  };

  const getTotalResponses = () => {
    return pollResults.reduce((total, result) => total + result.count, 0);
  };  const getPercentage = (count: number) => {
    const total = getTotalResponses();
    return total > 0 ? ((count / total) * 100).toFixed(1) : '0';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {studentName}!</h1>
            <p className="text-gray-600 mt-1">Student Dashboard</p>
          </div>
          <div className="flex items-center space-x-4">            <div className="bg-white px-4 py-2 rounded-lg shadow">
              <span className="text-sm text-gray-600">Students Online: </span>
              <span className="font-semibold text-green-600">{studentCount}</span>
            </div>            <button
              onClick={() => setChatOpen(!chatOpen)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              💬 Chat
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem('studentName');
                setUserRole(null);
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Poll Question */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Current Poll</h2>
            
            {currentPoll ? (
              <div className="space-y-6">
                {/* Question */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-lg font-medium text-blue-900 mb-2">{currentPoll.question}</p>
                  {!hasAnswered && timeRemaining > 0 && (
                    <div className="flex items-center space-x-2 text-blue-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">Time remaining: {formatTime(timeRemaining)}</span>
                    </div>
                  )}
                </div>                {/* Answer Options */}
                {!hasAnswered && timeRemaining > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">Select your answer:</p>
                    {currentPoll.options.map((option: string, index: number) => {
                      const result = pollResults.find(r => r.optionIndex === index);
                      const count = result ? result.count : 0;
                      const percentage = getPercentage(count);
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleAnswerSubmit(index)}
                          className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">{String.fromCharCode(65 + index)}</span>
                              </div>
                              <span className="font-medium text-gray-900">{option}</span>
                            </div>
                            <div className="text-sm text-gray-600 font-medium">
                              {count} ({percentage}%)
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : hasAnswered ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-green-800">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-medium">Answer submitted successfully!</span>
                    </div>
                    <p className="text-green-700 mt-1">Waiting for other students to respond...</p>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-red-800">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">Time's up!</span>
                    </div>
                    <p className="text-red-700 mt-1">You can view the results now.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500 text-lg">Waiting for teacher to start a poll...</p>
                <p className="text-gray-400 text-sm mt-2">You'll see the question here when it's available</p>
              </div>
            )}
          </div>          {/* Results */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">            <h2 className="text-xl font-semibold text-gray-900 mb-6">Live Results</h2>
            
            {/* Show results if answered, time expired, or poll ended but we have results */}
            {((currentPoll && (hasAnswered || timeRemaining === 0)) || pollResults.length > 0) ? (              <div className="space-y-4">
                {pollResults.map((result, index) => {
                  const count = result.count || 0;
                  const percentage = getPercentage(count);
                  const optionText = currentPoll?.options[index] || `Option ${index + 1}`;
                  const isCorrectAnswer = currentPoll?.correctAnswerIndex === index;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            isCorrectAnswer ? 'bg-green-200 text-green-800' : 'bg-gray-200'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="text-sm font-medium text-gray-700">{optionText}</span>
                          {isCorrectAnswer && (
                            <span className="text-green-600 font-medium text-xs">✓ Correct</span>
                          )}
                        </div>
                        <span className="text-sm text-gray-600">{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            isCorrectAnswer ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Total Responses: {getTotalResponses()}
                  </p>
                </div>
              </div>
            ) : currentPoll && !hasAnswered && timeRemaining > 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500">Submit your answer to see results</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-gray-500">No results available yet</p>
              </div>
            )}          </div>
        </div>
      </div>
      
      {/* Chat Component */}
      <Chat isOpen={chatOpen} onToggle={() => setChatOpen(!chatOpen)} />
    </div>
  );
};

export default StudentDashboard;
