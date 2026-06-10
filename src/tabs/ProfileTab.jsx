import React, { useState } from 'react';

export default function ProfileTab({ 
  profileName, 
  xp, 
  streak, 
  completedLessonsCount, 
  onSaveName,
  onLogout
}) {
  const [profileNameInput, setProfileNameInput] = useState(profileName);

  const handleSave = () => {
    if (!profileNameInput.trim()) return;
    onSaveName(profileNameInput.trim());
  };

  const badges = [
    { icon: '🌱', title: 'Ngày đầu', desc: 'Tham gia học tập', unlocked: true },
    { icon: '🔥', title: 'Siêu phàm', desc: 'Có 7 ngày streak', unlocked: streak >= 7 },
    { icon: '🏆', title: 'Kỷ luật', desc: 'Xong Unit 1', unlocked: completedLessonsCount >= 4 },
    { icon: '⭐', title: 'Cao thủ', desc: 'Đạt trên 100 XP', unlocked: xp >= 100 }
  ];

  return (
    <div className="max-w-3xl mx-auto py-4 font-nunito">
      {/* Profile summary banner */}
      <div className="flex flex-col md:flex-row gap-8 items-center border-b border-[#e5e5e5] pb-8 mb-8">
        <div className="w-24 h-24 rounded-full bg-purple flex items-center justify-center font-black text-white text-4xl shadow-[0_4px_0_0_#aa60eb]">
          {profileName ? profileName[0].toUpperCase() : 'U'}
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4 justify-center md:justify-start">
            <input
              type="text"
              value={profileNameInput}
              onChange={(e) => setProfileNameInput(e.target.value)}
              className="text-2xl font-black font-outfit border-2 border-transparent hover:border-gray-border focus:border-blue px-2 py-1 rounded-xl outline-none"
              placeholder="Nhập tên của bạn..."
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="bg-[#58cc02] border-[#46a302] border-2 shadow-[0_2px_0_0_#46a302] text-white px-4 py-1.5 rounded-xl text-xs font-black hover:bg-green-dark active:translate-y-[2px] transition-all"
              >
                Lưu tên
              </button>
              <button
                onClick={onLogout}
                className="bg-white border-red border-2 shadow-[0_2px_0_0_#ff4b4b] text-red-dark px-4 py-1.5 rounded-xl text-xs font-black hover:bg-[#fdf0f0] active:translate-y-[2px] transition-all"
              >
                Đăng xuất
              </button>
            </div>
          </div>
          <div className="text-sm text-[#888] font-bold mt-2" id="profile-xp-label">
            Tài khoản Học viên. Đã tích lũy {xp} XP.
          </div>
        </div>
      </div>

      {/* Progress stats widget */}
      <h4 className="text-lg font-black font-outfit text-text mb-4">THỐNG KÊ TIẾN ĐỘ</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="border-2 border-[#e5e5e5] rounded-3xl p-4 text-center bg-white shadow-sm">
          <div className="text-3xl">🔥</div>
          <div className="text-2xl font-black mt-2">{streak}</div>
          <div className="text-xs text-[#aaa] font-bold">Ngày Streak</div>
        </div>
        <div className="border-2 border-[#e5e5e5] rounded-3xl p-4 text-center bg-white shadow-sm">
          <div className="text-3xl">🏆</div>
          <div className="text-2xl font-black mt-2">{xp}</div>
          <div className="text-xs text-[#aaa] font-bold">Tổng số XP</div>
        </div>
        <div className="border-2 border-[#e5e5e5] rounded-3xl p-4 text-center bg-white shadow-sm col-span-2 sm:col-span-1">
          <div className="text-3xl">📖</div>
          <div className="text-2xl font-black mt-2">{completedLessonsCount}</div>
          <div className="text-xs text-[#aaa] font-bold">Bài học hoàn tất</div>
        </div>
      </div>

      {/* Achievements grid */}
      <h4 className="text-lg font-black font-outfit text-text mb-4">THÀNH TỰU ĐẠT ĐƯỢC</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map((b, i) => (
          <div
            key={i}
            className={`border-2 border-[#e5e5e5] rounded-3xl p-4 text-center transition-all ${
              b.unlocked ? 'opacity-100 bg-[#fffdf0] border-[#ffe680]' : 'opacity-40 bg-white'
            }`}
          >
            <div className="text-4xl">{b.icon}</div>
            <div className="font-extrabold text-sm mt-2">{b.title}</div>
            <div className="text-xs text-[#aaa] font-bold">{b.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
