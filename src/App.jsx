import React, { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Lesson from './pages/Lesson';
import AdminDashboard from './pages/AdminDashboard';
import { apiFetch } from './lib/api';

export default function App() {
  const [screen, setScreen] = useState(() => {
    if (sessionStorage.getItem('pali_admin_key')) {
      return 'admin';
    }
    if (localStorage.getItem('pali_current_user')) {
      return 'app';
    }
    return 'landing';
  });
  
  // User profile statistics state
  const [userState, setUserState] = useState({
    xp: 0,
    streak: 1,
    hearts: 5,
    gems: 350,
    dailyXP: 0,
    dailyGoal: 50,
    profileName: 'Thiền Sinh'
  });

  const [activeLessonId, setActiveLessonId] = useState(null);
  const [practiceQuestions, setPracticeQuestions] = useState(null);

  // Initialize profile configurations
  useEffect(() => {
    const savedName = localStorage.getItem('pali_profile_name');
    const savedXP = localStorage.getItem('pali_profile_xp');
    const savedStreak = localStorage.getItem('pali_profile_streak');
    
    setUserState(prev => ({
      ...prev,
      profileName: savedName || 'Thiền Sinh',
      xp: savedXP ? parseInt(savedXP) : 0,
      streak: savedStreak ? parseInt(savedStreak) : 1
    }));
  }, []);

  const updateState = (updates) => {
    setUserState(prev => {
      const next = { ...prev, ...updates };
      if (updates.profileName !== undefined) localStorage.setItem('pali_profile_name', next.profileName);
      if (updates.xp !== undefined) localStorage.setItem('pali_profile_xp', next.xp.toString());
      if (updates.streak !== undefined) localStorage.setItem('pali_profile_streak', next.streak.toString());
      
      const currentUser = JSON.parse(localStorage.getItem('pali_current_user') || 'null');
      if (currentUser) {
        const accounts = JSON.parse(localStorage.getItem('pali_accounts') || '[]');
        const idx = accounts.findIndex(a => a.username === currentUser.username);
        if (idx !== -1) {
          if (updates.profileName !== undefined) accounts[idx].profileName = next.profileName;
          if (updates.xp !== undefined) accounts[idx].xp = next.xp;
          if (updates.streak !== undefined) accounts[idx].streak = next.streak;
          localStorage.setItem('pali_accounts', JSON.stringify(accounts));
          
          currentUser.profileName = accounts[idx].profileName;
          currentUser.xp = accounts[idx].xp;
          currentUser.streak = accounts[idx].streak;
          localStorage.setItem('pali_current_user', JSON.stringify(currentUser));
        }
      }
      return next;
    });
  };

  const handleStartLesson = (lessonId) => {
    setActiveLessonId(lessonId);
    setPracticeQuestions(null);
    setScreen('lesson');
  };

  const handleStartPractice = async () => {
    try {
      const response = await apiFetch('/api/questions');
      if (response.ok) {
        const allQuestions = await response.json();
        if (allQuestions.length === 0) {
          alert('Không có câu hỏi nào trong ngân hàng để luyện tập!');
          return;
        }
        
        // Pick 5 random questions
        const shuffled = allQuestions.sort(() => Math.random() - 0.5).slice(0, 5);
        setPracticeQuestions(shuffled);
        setActiveLessonId(null);
        setScreen('lesson');
      } else {
        alert('Lỗi tải câu hỏi từ máy chủ.');
      }
    } catch (err) {
      alert('Không kết nối được tới backend.');
    }
  };

  const handleFinishLesson = async (xpEarned, failed) => {
    setScreen('app');

    if (!failed) {
      const newXP = userState.xp + xpEarned;
      const newDailyXP = userState.dailyXP + xpEarned;
      
      updateState({
        xp: newXP,
        dailyXP: newDailyXP,
        streak: Math.max(1, userState.streak)
      });

      if (activeLessonId) {
        try {
          await apiFetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: 1,
              lessonId: activeLessonId,
              isCompleted: true
            })
          });
        } catch (err) {
          console.error('Failed to save progress:', err);
        }
      }
    }
    
    setActiveLessonId(null);
    setPracticeQuestions(null);
  };

  const handleAuthSuccess = () => {
    const savedName = localStorage.getItem('pali_profile_name');
    const savedXP = localStorage.getItem('pali_profile_xp');
    const savedStreak = localStorage.getItem('pali_profile_streak');
    
    setUserState({
      xp: savedXP ? parseInt(savedXP) : 0,
      streak: savedStreak ? parseInt(savedStreak) : 1,
      hearts: 5,
      gems: 350,
      dailyXP: 0,
      dailyGoal: 50,
      profileName: savedName || 'Thiền Sinh'
    });
    setScreen('app');
  };

  const handleLogout = () => {
    localStorage.removeItem('pali_current_user');
    localStorage.removeItem('pali_profile_name');
    localStorage.removeItem('pali_profile_xp');
    localStorage.removeItem('pali_profile_streak');
    setUserState({
      xp: 0,
      streak: 1,
      hearts: 5,
      gems: 350,
      dailyXP: 0,
      dailyGoal: 50,
      profileName: 'Thiền Sinh'
    });
    setScreen('landing');
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('pali_admin_key');
    setScreen('landing');
  };

  return (
    <div className="min-h-screen bg-white">
      {screen === 'landing' && (
        <Landing 
          onStart={handleAuthSuccess} 
          onHaveAccount={handleAuthSuccess} 
          onStartAdmin={() => setScreen('admin')}
        />
      )}

      {screen === 'app' && (
        <Dashboard
          state={userState}
          updateState={updateState}
          onStartLesson={handleStartLesson}
          onStartPractice={handleStartPractice}
          onLogout={handleLogout}
        />
      )}

      {screen === 'lesson' && (
        <Lesson
          lessonId={activeLessonId}
          practiceQuestions={practiceQuestions}
          onFinishLesson={handleFinishLesson}
          onExit={() => setScreen('app')}
        />
      )}

      {screen === 'admin' && (
        <AdminDashboard
          onExit={handleAdminLogout}
        />
      )}
    </div>
  );
}
