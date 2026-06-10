import React, { useState } from 'react';

// ── Fixed Admin Credentials ──────────────────────────────────────────────────
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

export default function Landing({ onStart, onHaveAccount, onStartAdmin }) {
  const [authMode, setAuthMode] = useState(null); // null | 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [profileName, setProfileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setProfileName('');
    setErrorMsg('');
    setAuthMode(null);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    // Check admin credentials first
    if (
      username.trim().toLowerCase() === ADMIN_USERNAME &&
      password === ADMIN_PASSWORD
    ) {
      resetForm();
      onStartAdmin();
      return;
    }

    // Regular user login
    const accounts = JSON.parse(localStorage.getItem('pali_accounts') || '[]');
    const user = accounts.find(
      a => a.username === username.trim().toLowerCase() && a.password === password
    );

    if (user) {
      localStorage.setItem('pali_current_user', JSON.stringify(user));
      localStorage.setItem('pali_profile_name', user.profileName);
      localStorage.setItem('pali_profile_xp', user.xp.toString());
      localStorage.setItem('pali_profile_streak', user.streak.toString());
      onHaveAccount();
    } else {
      setErrorMsg('Tên đăng nhập hoặc mật khẩu không đúng!');
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!profileName.trim() || !username.trim() || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ các trường thông tin!');
      return;
    }
    const accounts = JSON.parse(localStorage.getItem('pali_accounts') || '[]');
    const normalizedUsername = username.trim().toLowerCase();

    if (accounts.some(a => a.username === normalizedUsername)) {
      setErrorMsg('Tên đăng nhập đã tồn tại trên hệ thống!');
      return;
    }

    const newUser = {
      username: normalizedUsername,
      password,
      profileName: profileName.trim(),
      xp: 0,
      streak: 1
    };

    accounts.push(newUser);
    localStorage.setItem('pali_accounts', JSON.stringify(accounts));
    localStorage.setItem('pali_current_user', JSON.stringify(newUser));
    localStorage.setItem('pali_profile_name', newUser.profileName);
    localStorage.setItem('pali_profile_xp', '0');
    localStorage.setItem('pali_profile_streak', '1');
    onStart();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#fafafa] relative select-none">

      {/* Main Landing Panel */}
      <div className="max-w-2xl w-full flex flex-col md:flex-row items-center gap-12 text-center md:text-left z-0">

        {/* Owl Hero */}
        <div className="w-56 h-56 md:w-80 md:h-80 bg-green-light border-4 border-green rounded-[50px] flex items-center justify-center text-8xl md:text-9xl shadow-md relative transform hover:rotate-3 transition-transform cursor-pointer">
          🦉
          <div className="absolute -bottom-4 bg-white border-2 border-green text-green-dark px-4 py-1 rounded-full font-black text-xs font-outfit uppercase shadow-[0_2.5px_0_0_#46a302]">
            SĀDHU!
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-black font-outfit text-green tracking-tight mb-4 leading-none">
            PaliPath
          </h1>
          <p className="text-[#4b4b4b] font-bold text-lg md:text-xl leading-relaxed mb-8">
            Cách học tiếng Pali và Giáo pháp Phật giáo miễn phí, vui nhộn và hiệu quả nhất!
          </p>

          <div className="space-y-3">
            <button
              onClick={() => { setErrorMsg(''); setAuthMode('register'); }}
              className="w-full md:w-64 bg-[#58cc02] border-[#46a302] border-2 shadow-[0_4px_0_0_#46a302] text-white py-3.5 px-6 rounded-2xl font-black tracking-wide text-sm active:translate-y-1 hover:bg-green-dark active:shadow-none transition-all btn-3d"
            >
              BẮT ĐẦU HỌC NGAY
            </button>
            <button
              onClick={() => { setErrorMsg(''); setAuthMode('login'); }}
              className="w-full md:w-64 bg-white border-[#e5e5e5] border-2 shadow-[0_4px_0_0_#e5e5e5] text-blue py-3.5 px-6 rounded-2xl font-black text-sm active:translate-y-1 hover:bg-gray-50 active:shadow-none transition-all btn-3d"
            >
              TÔI ĐÃ CÓ TÀI KHOẢN
            </button>
          </div>
        </div>
      </div>

      {/* Login / Register Modal */}
      {authMode !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border-2 border-[#e5e5e5] shadow-[0_8px_0_0_#e5e5e5] w-full max-w-md rounded-3xl p-6 md:p-8 relative">

            {/* Close */}
            <button
              onClick={resetForm}
              className="absolute top-4 right-4 text-[#aaa] font-extrabold hover:text-[#4b4b4b] text-xl"
            >
              ✕
            </button>

            <h3 className="text-2xl font-black font-outfit text-[#4b4b4b] mb-2 text-center">
              {authMode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Tạo Hồ Sơ Học Tập'}
            </h3>
            <p className="text-xs text-[#888] font-bold text-center mb-6">
              {authMode === 'login'
                ? 'Nhập tài khoản để tiếp tục lưu tiến độ tu học.'
                : 'Lưu lại hành trình học tiếng Pali miễn phí hàng ngày.'}
            </p>

            {errorMsg && (
              <div className="bg-red-light/50 border border-red text-red-dark font-extrabold text-xs p-3 rounded-xl mb-4 text-center">
                ⚠️ {errorMsg}
              </div>
            )}

            <form
              onSubmit={authMode === 'login' ? handleLoginSubmit : handleRegisterSubmit}
              className="space-y-4"
            >
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-black text-[#aaa] uppercase tracking-wider mb-1">Họ tên của bạn</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    placeholder="Ví dụ: Diệu Tâm"
                    className="w-full border-2 border-[#e5e5e5] rounded-xl p-3 text-sm font-bold focus:border-blue outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-[#aaa] uppercase tracking-wider mb-1">Tên đăng nhập</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập..."
                  className="w-full border-2 border-[#e5e5e5] rounded-xl p-3 text-sm font-bold focus:border-blue outline-none"
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#aaa] uppercase tracking-wider mb-1">Mật khẩu</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full border-2 border-[#e5e5e5] rounded-xl p-3 text-sm font-bold focus:border-blue outline-none"
                  autoComplete="current-password"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#1cb0f6] border-[#1899d6] border-2 shadow-[0_4px_0_0_#1899d6] text-white py-3 rounded-2xl font-black text-sm active:translate-y-1 hover:bg-blue-dark active:shadow-none transition-all btn-3d"
                >
                  {authMode === 'login' ? 'ĐĂNG NHẬP' : 'TẠO TÀI KHOẢN'}
                </button>
              </div>
            </form>

            {/* Switch between login ↔ register */}
            <div className="mt-6 text-center border-t border-[#e5e5e5] pt-4">
              <button
                onClick={() => {
                  setErrorMsg('');
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                }}
                className="text-xs font-black text-blue hover:underline uppercase tracking-wider"
              >
                {authMode === 'login' ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
