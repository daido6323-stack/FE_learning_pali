import React from 'react';
import { BookOpen, FileText, RefreshCw, Search, Trophy, User } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, profileName, xp }) {
  const navItems = [
    { id: 'course', label: 'HỌC', icon: BookOpen },
    { id: 'materials', label: 'TÀI LIỆU', icon: FileText },
    { id: 'practice', label: 'LUYỆN TẬP', icon: RefreshCw },
    { id: 'dictionary', label: 'TỪ ĐIỂN', icon: Search },
    { id: 'leaderboard', label: 'BẢNG XẾP HẠNG', icon: Trophy },
    { id: 'profile', label: 'HỒ SƠ', icon: User }
  ];

  return (
    <aside className="w-16 md:w-64 border-r border-[#e5e5e5] px-2 md:px-4 py-6 flex flex-col justify-between fixed h-screen bg-white z-10 font-nunito">
      <div>
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center md:justify-start">
          <span className="text-3xl">🦉</span>
          <h1 className="hidden md:block font-outfit font-black text-2xl text-green tracking-tight">PaliPath</h1>
        </div>

        {/* Navigation links */}
        <nav className="flex flex-col gap-2">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-4 px-3 py-3 rounded-2xl font-bold transition-all border-2 text-sm justify-center md:justify-start ${activeTab === item.id
                    ? 'bg-[#ddf4ff] border-[#1899d6] text-[#1899d6]'
                    : 'bg-transparent border-transparent text-[#777] hover:bg-[#f7f7f7]'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden md:block">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile brief */}
      <div className="hidden md:flex items-center gap-3 border-t border-[#e5e5e5] pt-4">
        <div className="w-10 h-10 rounded-full bg-purple flex items-center justify-center font-black text-white text-lg shadow-[0_2px_0_0_#aa60eb]">
          {profileName ? profileName[0].toUpperCase() : 'U'}
        </div>
        <div className="overflow-hidden">
          <div className="font-black text-sm text-[#4b4b4b] truncate max-w-[140px]">{profileName}</div>
          <div className="text-xs text-[#a3a3a3] font-bold">{xp} XP tích lũy</div>
        </div>
      </div>
    </aside>
  );
}
