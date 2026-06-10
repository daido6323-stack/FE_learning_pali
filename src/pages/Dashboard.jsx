import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import CourseTab from '../tabs/CourseTab';
import MaterialsTab from '../tabs/MaterialsTab';
import PracticeTab from '../tabs/PracticeTab';
import DictionaryTab from '../tabs/DictionaryTab';
import LeaderboardTab from '../tabs/LeaderboardTab';
import ProfileTab from '../tabs/ProfileTab';
import { Flame, Award } from 'lucide-react';
import { apiFetch } from '../lib/api';

export default function Dashboard({
  state,
  updateState,
  onStartLesson,
  onStartPractice,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState('course');

  // Database States
  const [units, setUnits] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [dictionary, setDictionary] = useState([]);

  // Load database structures
  const loadData = async () => {
    try {
      const resUnits = await apiFetch('/api/units');
      if (resUnits.ok) setUnits(await resUnits.json());

      const resProgress = await apiFetch('/api/progress');
      if (resProgress.ok) setUserProgress(await resProgress.json());

      const resDict = await apiFetch('/api/dictionary');
      if (resDict.ok) setDictionary(await resDict.json());
    } catch (err) {
      console.error('Error fetching data from API:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync data on tab change
  useEffect(() => {
    if (activeTab === 'course') {
      loadData();
    }
  }, [activeTab]);

  const handleSaveProfileName = (newName) => {
    updateState({ profileName: newName });
    alert('Đã cập nhật tên hồ sơ thành công!');
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profileName={state.profileName}
        xp={state.xp}
      />

      {/* Main Content Area */}
      <main className="flex-1 ml-16 md:ml-64 p-4 md:p-8 min-h-screen pb-20">

        {/* Top Header stats */}
        <header className="flex justify-between items-center max-w-4xl mx-auto mb-8 border-b border-[#e5e5e5] pb-4">
          <div>
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tight text-[#4b4b4b]">
              {activeTab === 'course' && 'Lộ trình Học Pali'}
              {activeTab === 'materials' && 'Tài Liệu & Giáo Trình'}
              {activeTab === 'practice' && 'Phòng Luyện Tập'}
              {activeTab === 'dictionary' && 'Từ Điển Tra Cứu'}
              {activeTab === 'leaderboard' && 'Bảng Xếp Hạng'}
              {activeTab === 'profile' && 'Hồ Sơ Của Bạn'}
            </h2>
            <p className="text-[#a3a3a3] text-sm hidden sm:block">
              {activeTab === 'course' && 'Học theo từng bài và tích lũy XP mở khóa chương tiếp theo.'}
              {activeTab === 'materials' && 'Xem và tải về các giáo án, tài liệu PDF giảng dạy tiếng Pali.'}
              {activeTab === 'practice' && 'Luyện phản xạ từ vựng với Flashcards và làm bài kiểm tra nhanh.'}
              {activeTab === 'dictionary' && 'Tra từ vựng Pali-Việt dễ dàng.'}
              {activeTab === 'leaderboard' && 'Đua TOP điểm tích lũy hàng tuần cùng bạn bè.'}
              {activeTab === 'profile' && 'Cập nhật tên tài khoản, xem thống kê của bạn.'}
            </p>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 font-extrabold text-orange">
              <Flame className="w-5 h-5 fill-current" />
              <span>{state.streak}</span>
            </div>
            <div className="flex items-center gap-1.5 font-extrabold text-purple">
              <Award className="w-5 h-5" />
              <span>{state.xp} XP</span>
            </div>
          </div>
        </header>

        {/* Tab display routing */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'course' && (
            <CourseTab
              units={units}
              userProgress={userProgress}
              onStartLesson={onStartLesson}
            />
          )}

          {activeTab === 'materials' && (
            <MaterialsTab />
          )}

          {activeTab === 'practice' && (
            <PracticeTab
              dictionary={dictionary}
              onStartPractice={onStartPractice}
            />
          )}

          {activeTab === 'dictionary' && (
            <DictionaryTab
              dictionary={dictionary}
            />
          )}

          {activeTab === 'leaderboard' && (
            <LeaderboardTab
              profileName={state.profileName}
              xp={state.xp}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              profileName={state.profileName}
              xp={state.xp}
              streak={state.streak}
              completedLessonsCount={userProgress.filter(p => p.isCompleted).length}
              onSaveName={handleSaveProfileName}
              onLogout={onLogout}
            />
          )}
        </div>
      </main>
    </div>
  );
}
