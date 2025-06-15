import React from 'react';
import { useSocket } from '../contexts/SocketContext';

const RoleSelection: React.FC = () => {
  const { joinAsTeacher, setUserRole } = useSocket();

  const handleTeacherSelect = () => {
    joinAsTeacher();
  };

  const handleStudentSelect = () => {
    setUserRole('student');
  };

  return (    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Polling System</h1>
          <p className="text-gray-600">Choose your role to get started</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={handleTeacherSelect}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>I'm a Teacher</span>
          </button>
          
          <button
            onClick={handleStudentSelect}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
            <span>I'm a Student</span>
          </button>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Teachers can create polls and view results</p>
          <p>Students can answer questions and see live results</p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
