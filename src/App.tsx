import React from 'react';
import { SocketProvider, useSocket } from './contexts/SocketContext';
import RoleSelection from './components/RoleSelection';
import StudentNameInput from './components/StudentNameInput';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';

const AppContent: React.FC = () => {
  const { userRole, studentName, isConnected } = useSocket();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to server...</p>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return <RoleSelection />;
  }

  if (userRole === 'student' && !studentName) {
    return <StudentNameInput />;
  }

  if (userRole === 'teacher') {
    return <TeacherDashboard />;
  }

  if (userRole === 'student') {
    return <StudentDashboard />;
  }

  return <RoleSelection />;
};

function App() {
  return (
    <SocketProvider>
      <AppContent />
    </SocketProvider>
  );
}

export default App;
