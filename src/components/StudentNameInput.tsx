import React, { useState } from 'react';
import { useSocket } from '../contexts/SocketContext';

const StudentNameInput: React.FC = () => {
  const { joinAsStudent, studentName, setUserRole } = useSocket();
  const [name, setName] = useState(studentName);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }
    
    joinAsStudent(name.trim());
  };

  const handleBack = () => {
    setUserRole(null);
  };

  return (    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-md w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, Student!</h1>
          <p className="text-gray-600">Enter your name to join the polling session</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>
          
          <div className="space-y-3">            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Join Polling Session
            </button>
            
            <button
              type="button"
              onClick={handleBack}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Back to Role Selection
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-xs text-gray-500 text-center">
          <p>Your name will be visible to the teacher during the session</p>
        </div>
      </div>
    </div>
  );
};

export default StudentNameInput;
