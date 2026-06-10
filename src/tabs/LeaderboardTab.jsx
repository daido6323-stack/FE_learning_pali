import React from 'react';
import { Trophy } from 'lucide-react';

export default function LeaderboardTab({ profileName, xp }) {
  const leaderboardData = [
    { name: 'Minh Tuệ', xp: 1240, color: 'bg-purple', isMe: false },
    { name: profileName, xp: xp, color: 'bg-blue', isMe: true },
    { name: 'Phước An', xp: 890, color: 'bg-orange', isMe: false },
    { name: 'Diệu Tâm', xp: 720, color: 'bg-red', isMe: false },
    { name: 'Từ Quang', xp: 480, color: 'bg-green', isMe: false }
  ];

  return (
    <div className="max-w-lg mx-auto py-4 font-nunito">
      <div className="bg-[#1cb0f6] text-white p-6 rounded-3xl text-center mb-8 shadow-[0_4px_0_0_#1899d6] border-2 border-[#1899d6]">
        <Trophy className="w-12 h-12 mx-auto mb-2 text-white" />
        <h3 className="text-xl font-black font-outfit uppercase tracking-tight">Bảng Xếp Hạng Tuần</h3>
        <p className="text-xs opacity-90 mt-1">Đua top cùng những thiền sinh khác trên con đường học pháp Pali.</p>
      </div>

      <div className="border-2 border-[#e5e5e5] rounded-3xl p-2 divide-y divide-[#e5e5e5] bg-white shadow-sm">
        {leaderboardData
          .sort((a, b) => b.xp - a.xp)
          .map((item, idx) => (
            <div key={idx} className={`flex items-center gap-4 p-4 ${item.isMe ? 'bg-[#f0fff8] rounded-2xl' : ''}`}>
              <div className="font-black font-outfit text-lg w-6 text-center text-[#aaa]">
                {idx === 0 && '🥇'}
                {idx === 1 && '🥈'}
                {idx === 2 && '🥉'}
                {idx > 2 && `${idx + 1}`}
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-lg ${item.color}`}>
                {item.name ? item.name[0].toUpperCase() : 'U'}
              </div>
              <div className="flex-1 font-bold text-sm text-[#4b4b4b] truncate">
                {item.name} {item.isMe && <span className="text-xs text-green font-black ml-1">(bạn)</span>}
              </div>
              <div className="font-extrabold text-[#777] text-sm">{item.xp} XP</div>
            </div>
          ))}
      </div>
    </div>
  );
}
