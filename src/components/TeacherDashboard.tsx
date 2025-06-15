import React, { useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import Chat from './Chat';

const TeacherDashboard: React.FC = () => {  const { 
    currentPoll, 
    pollResults, 
    studentCount, 
    pollHistory,
    createPoll,
    setUserRole 
  } = useSocket();
  
  const [showCreatePoll, setShowCreatePoll] = useState(false);  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [timeLimit, setTimeLimit] = useState(60);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | undefined>(undefined);
  const [showHistory, setShowHistory] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validOptions = options.filter(opt => opt.trim() !== '');
    
    if (!question.trim()) {
      alert('Please enter a question');
      return;
    }
    
    if (validOptions.length < 2) {
      alert('Please provide at least 2 options');
      return;
    }
      createPoll(question.trim(), validOptions, timeLimit, correctAnswerIndex);
    setShowCreatePoll(false);
    setQuestion('');
    setOptions(['', '']);
    setTimeLimit(60);
    setCorrectAnswerIndex(undefined);
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  const getTotalResponses = () => {
    return pollResults.reduce((total, result) => total + result.count, 0);
  };

  const getPercentage = (count: number) => {
    const total = getTotalResponses();
    return total > 0 ? ((count / total) * 100).toFixed(1) : '0';
  };  console.log('TeacherDashboard - pollResults:', pollResults);

  const canCreateNewPoll = !currentPoll || (currentPoll && getTotalResponses() === studentCount && studentCount > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage polls and view live results</p>
          </div>
          <div className="flex items-center space-x-4">            <div className="bg-white px-4 py-2 rounded-lg shadow">
              <span className="text-sm text-gray-600">Students Online: </span>
              <span className="font-semibold text-blue-600">{studentCount}</span>
            </div>            <button
              onClick={() => setChatOpen(!chatOpen)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              💬 Chat
            </button>
            <button
              onClick={() => setUserRole(null)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Poll Creation/Management */}          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Poll Management</h2>
                <div className="space-x-2">                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                  >
                    {showHistory ? 'Hide' : 'Show'} History
                  </button>
                  {canCreateNewPoll && (
                    <button
                      onClick={() => setShowCreatePoll(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      Create New Poll
                    </button>
                  )}
                </div>
              </div>

              {!canCreateNewPoll && currentPoll && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-yellow-800">
                    Wait for all students to answer or for the time to expire before creating a new poll.
                  </p>
                </div>
              )}

              {/* Current Poll */}
              {currentPoll && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Active Poll</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="font-medium text-blue-900 mb-2">{currentPoll.question}</p>
                    <div className="text-sm text-blue-700">
                      <p>Time Limit: {currentPoll.timeLimit} seconds</p>
                      <p>Started: {new Date(currentPoll.startTime).toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>
              )}              {/* Poll History */}
              {showHistory && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Poll History</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {pollHistory.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No polls created yet</p>
                    ) : (
                      pollHistory.map((poll) => (
                        <div key={poll.id} className="bg-gray-50 rounded-lg p-4">
                          <p className="font-medium text-gray-900 mb-2">{poll.question}</p>
                          <div className="text-sm text-gray-600 mb-3">
                            <p>Total Responses: {poll.totalResponses}</p>
                            <p>Ended: {new Date(poll.endTime).toLocaleString()}</p>
                          </div>
                            {/* Show poll results */}
                          <div className="space-y-2">
                            {poll.results.map(([optionIndex, count]) => {
                              const percentage = poll.totalResponses > 0 ? ((count / poll.totalResponses) * 100).toFixed(1) : '0';
                              const optionText = poll.options[optionIndex] || `Option ${optionIndex + 1}`;
                              const isCorrectAnswer = poll.correctAnswerIndex === optionIndex;
                              
                              return (
                                <div key={optionIndex} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center space-x-2">
                                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-medium ${
                                      isCorrectAnswer ? 'bg-green-200 text-green-800' : 'bg-gray-300'
                                    }`}>
                                      {String.fromCharCode(65 + optionIndex)}
                                    </span>
                                    <span className="text-gray-700">{optionText}</span>
                                    {isCorrectAnswer && (
                                      <span className="text-green-600 font-medium">✓ Correct</span>
                                    )}
                                  </div>
                                  <span className="text-gray-600">{count} ({percentage}%)</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Live Results */}          <div>            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Live Results</h2>
              
              {/* Show results if we have poll data */}
              {pollResults.length > 0 ? (                <div className="space-y-4">
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
                            className={`h-3 rounded-full transition-all duration-300 ${
                              isCorrectAnswer ? 'bg-green-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Total Responses: {getTotalResponses()} / {studentCount}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-gray-500">No active poll or results yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Poll Modal */}
      {showCreatePoll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-90vh overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Create New Poll</h3>
                <button
                  onClick={() => setShowCreatePoll(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreatePoll} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question
                  </label>                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter your poll question..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Limit (seconds)
                  </label>                  <input
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(parseInt(e.target.value) || 60)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min={10}
                    max={300}
                  />
                </div>                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options
                  </label>
                  <div className="space-y-3">
                    {options.map((option, index) => (
                      <div key={index} className="flex space-x-2 items-center">
                        {/* Radio button for correct answer */}
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={correctAnswerIndex === index}
                          onChange={() => setCorrectAnswerIndex(index)}
                          className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300"
                          title="Mark as correct answer"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Option ${index + 1}`}
                          required
                        />
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500">
                    💡 Click the radio button next to the correct answer (optional)
                  </div>
                  
                  {options.length < 6 && (
                    <button
                      type="button"
                      onClick={addOption}
                      className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + Add Option
                    </button>
                  )}
                </div><div className="flex space-x-3">
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                    Create Poll
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreatePoll(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>          </div>
        </div>
      )}
      
      {/* Chat Component */}
      <Chat isOpen={chatOpen} onToggle={() => setChatOpen(!chatOpen)} />
    </div>
  );
};

export default TeacherDashboard;
