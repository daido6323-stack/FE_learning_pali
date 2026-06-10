import React, { useState, useEffect } from 'react';
import AdminTab from '../tabs/AdminTab';
import {
  Settings,
  Database,
  BookOpen,
  Layers,
  HelpCircle,
  FileText,
  Eye,
  RefreshCw,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { apiFetch } from '../lib/api';

export default function AdminDashboard({ onExit }) {
  const [units, setUnits] = useState([]);
  const [dictionary, setDictionary] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminSubTab, setAdminSubTab] = useState('questions');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load database structures
  const loadData = async () => {
    setLoading(true);
    try {
      const resUnits = await apiFetch('/api/units');
      if (resUnits.ok) setUnits(await resUnits.json());

      const resDict = await apiFetch('/api/dictionary');
      if (resDict.ok) setDictionary(await resDict.json());

      const resQuestions = await apiFetch('/api/questions');
      if (resQuestions.ok) setQuestions(await resQuestions.json());
    } catch (err) {
      console.error('Error fetching data from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const subTabs = [
    { id: 'questions', label: 'Quản lý Câu hỏi', icon: HelpCircle },
    { id: 'dictionary', label: 'Từ điển Pali', icon: BookOpen },
    { id: 'structure', label: 'Chương & Bài học', icon: Layers },
    { id: 'pdf', label: 'Tài liệu PDF', icon: FileText },
    { id: 'preview', label: 'Xem trước Bài tập', icon: Eye },
  ];

  const currentTabLabel = subTabs.find(t => t.id === adminSubTab)?.label;

  return (
    <div className="min-h-screen bg-[#f7f9fa] font-nunito flex">

      {/* ── 1. Left Sidebar ───────────────────────────────────────── */}
      <aside
        className={`relative border-r-2 border-[#e5e5e5] bg-white flex flex-col justify-between sticky top-0 h-screen shrink-0 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-[72px]'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className={`p-5 border-b border-[#e5e5e5] flex items-center gap-3 overflow-hidden ${sidebarOpen ? '' : 'justify-center'}`}>
            <span className="text-3xl shrink-0">🦉</span>
            {sidebarOpen && (
              <div className="min-w-0">
                <h1 className="font-outfit font-black text-xl text-green tracking-tight leading-none truncate">PaliPath</h1>
                <span className="text-[10px] text-purple font-black uppercase tracking-widest block mt-1">HỆ THỐNG QUẢN TRỊ</span>
              </div>
            )}
          </div>

          {/* Nav Items */}
          <nav className={`p-3 space-y-1`}>
            {subTabs.map(tab => {
              const IconComponent = tab.icon;
              const isActive = adminSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setAdminSubTab(tab.id)}
                  title={!sidebarOpen ? tab.label : undefined}
                  className={`flex items-center gap-3 w-full px-3 py-3 rounded-2xl font-black text-sm border-2 transition-all duration-150 ${
                    sidebarOpen ? '' : 'justify-center'
                  } ${
                    isActive
                      ? 'bg-[#e3f2fd] border-[#90caf9] text-blue'
                      : 'border-transparent text-[#777] hover:bg-[#f7f7f7] hover:text-[#4b4b4b]'
                  }`}
                >
                  <IconComponent className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue' : 'text-[#aaa]'}`} />
                  {sidebarOpen && <span className="truncate">{tab.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className={`p-3 border-t border-[#e5e5e5] space-y-2`}>
          <button
            onClick={onExit}
            title={!sidebarOpen ? 'Về trang học viên' : undefined}
            className={`flex items-center gap-2 w-full px-3 py-3 bg-[#ff4b4b] border-2 border-[#ea2b2b] shadow-[0_3px_0_0_#ea2b2b] text-white rounded-2xl text-xs font-black hover:bg-[#ea2b2b] active:translate-y-[2px] active:shadow-none transition-all ${
              sidebarOpen ? 'justify-center' : 'justify-center'
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && 'VỀ TRANG HỌC VIÊN'}
          </button>
        </div>

        {/* Toggle Tab — floating on the right edge */}
        <button
          onClick={() => setSidebarOpen(prev => !prev)}
          title={sidebarOpen ? 'Thu gọn sidebar' : 'Mở rộng sidebar'}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 bg-white border-2 border-[#e5e5e5] rounded-full flex items-center justify-center shadow-md hover:bg-[#f0f0f0] text-[#777] hover:text-[#4b4b4b] transition-all"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </aside>

      {/* ── 2. Main Workspace ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto min-w-0">

        {/* Workspace Top Header */}
        <header className="bg-white border-b border-[#e5e5e5] px-8 py-5 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile hamburger (shown when sidebar is closed on small screens) */}
            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              className="p-2 rounded-xl border-2 border-[#e5e5e5] text-[#777] hover:bg-[#f7f7f7] transition-all lg:hidden"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h2 className="text-xl font-black font-outfit text-[#4b4b4b] truncate">{currentTabLabel}</h2>
              <p className="text-xs text-[#aaa] font-bold mt-0.5 hidden sm:block">
                Cập nhật cấu hình dữ liệu thời gian thực cho hệ thống PaliPath
              </p>
            </div>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-[#e5e5e5] hover:border-[#aaa] rounded-2xl text-xs font-black text-[#777] hover:text-[#4b4b4b] bg-white active:translate-y-0.5 transition-all shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">TẢI LẠI DỮ LIỆU</span>
          </button>
        </header>

        {/* Main Content */}
        <main className="p-6 lg:p-8 flex-1 space-y-6">

          {/* Mini Stats Grid */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Chương Học', value: units.length, bg: 'bg-green-light/40', iconColor: 'text-green-dark', Icon: Layers },
              { label: 'Bài Giảng', value: units.flatMap(u => u.lessons).length, bg: 'bg-blue-light/40', iconColor: 'text-blue-dark', Icon: BookOpen },
              { label: 'Câu Hỏi Thi', value: questions.length, bg: 'bg-purple-light/40', iconColor: 'text-purple-dark', Icon: Database },
              { label: 'Từ Điển Pali', value: dictionary.length, bg: 'bg-yellow-light/40', iconColor: 'text-yellow-dark', Icon: Settings },
            ].map(({ label, value, bg, iconColor, Icon }) => (
              <div key={label} className="bg-white border-2 border-[#e5e5e5] rounded-3xl p-4 flex items-center gap-3 shadow-sm">
                <div className={`p-3 ${bg} rounded-2xl ${iconColor} shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl font-black text-[#4b4b4b]">{value}</div>
                  <div className="text-[10px] text-[#aaa] font-black uppercase tracking-wider truncate">{label}</div>
                </div>
              </div>
            ))}
          </section>

          {/* Subtab Content Card */}
          <section className="bg-white border-2 border-[#e5e5e5] rounded-3xl p-6 shadow-sm min-h-[400px] flex flex-col">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 text-[#aaa] my-auto">
                <RefreshCw className="w-8 h-8 animate-spin mb-4 text-blue" />
                <span className="font-extrabold text-sm uppercase tracking-wider">
                  Đang tải cấu hình hệ thống...
                </span>
              </div>
            ) : (
              <AdminTab
                units={units}
                dictionary={dictionary}
                questions={questions}
                loadData={loadData}
                adminSubTab={adminSubTab}
              />
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
