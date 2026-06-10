import React, { useState } from 'react';

export default function PracticeTab({ dictionary, onStartPractice }) {
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [fcIdx, setFcIdx] = useState(0);
  const [fcFlipped, setFcFlipped] = useState(false);

  const startFlashcards = () => {
    if (dictionary.length === 0) {
      alert('Từ điển trống! Hãy nhập từ vựng tại trang Admin.');
      return;
    }
    setFcIdx(0);
    setFcFlipped(false);
    setShowFlashcards(true);
  };

  const handleNextCard = (e) => {
    e.stopPropagation();
    setFcFlipped(false);
    setFcIdx((prev) => (prev + 1) % dictionary.length);
  };

  const handlePrevCard = (e) => {
    e.stopPropagation();
    setFcFlipped(false);
    setFcIdx((prev) => (prev - 1 + dictionary.length) % dictionary.length);
  };

  return (
    <div className="max-w-3xl mx-auto py-4 font-nunito">
      {!showFlashcards ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mode 1: Quick Quiz */}
          <div className="border-2 border-[#e5e5e5] rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-blue transition-all bg-white">
            <div>
              <div className="text-4xl mb-4">⚡</div>
              <h4 className="text-xl font-black font-outfit text-[#4b4b4b]">Luyện thi nhanh (Random Quiz)</h4>
              <p className="text-sm text-[#777] mt-2">
                Hệ thống sẽ bốc ngẫu nhiên 5 câu hỏi từ Ngân hàng để bạn luyện tập ôn lại kiến thức. Giúp duy trì streak của bạn!
              </p>
            </div>
            <button
              onClick={onStartPractice}
              className="w-full bg-[#1cb0f6] border-[#1899d6] border-2 shadow-[0_4px_0_0_#1899d6] text-white py-3 px-6 rounded-2xl font-black mt-6 hover:bg-[#1899d6] transition-all btn-3d"
            >
              BẮT ĐẦU LUYỆN TẬP
            </button>
          </div>

          {/* Mode 2: Flashcards */}
          <div className="border-2 border-[#e5e5e5] rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-purple transition-all bg-white">
            <div>
              <div className="text-4xl mb-4">🎴</div>
              <h4 className="text-xl font-black font-outfit text-[#4b4b4b]">Flashcards Học Từ Vựng</h4>
              <p className="text-sm text-[#777] mt-2">
                Học từ mới qua thẻ lật 3D tương tác. Giúp nhớ sâu từ vựng Pali, loại từ cùng ví dụ minh họa sinh động.
              </p>
            </div>
            <button
              onClick={startFlashcards}
              className="w-full bg-[#ce82ff] border-[#aa60eb] border-2 shadow-[0_4px_0_0_#aa60eb] text-white py-3 px-6 rounded-2xl font-black mt-6 hover:bg-[#aa60eb] transition-all btn-3d"
            >
              MỞ FLASHCARDS
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setShowFlashcards(false)}
              className="text-sm font-black text-blue hover:underline"
            >
              ← Trở lại Luyện tập
            </button>
            <span className="text-sm font-bold text-[#888]">
              {fcIdx + 1} / {dictionary.length}
            </span>
          </div>

          {/* 3D scene */}
          <div
            className="flashcard-scene h-72 cursor-pointer w-full"
            onClick={() => setFcFlipped(!fcFlipped)}
          >
            <div className={`flashcard-wrapper ${fcFlipped ? 'flipped' : ''}`}>
              {/* Front */}
              <div className="flashcard-front bg-white flex flex-col items-center justify-center p-6 text-center select-none border-2 border-[#e5e5e5] shadow-sm">
                <div className="text-sm bg-blue-light border-2 border-blue-dark text-blue-dark rounded-full px-4 py-1 text-xs font-black mb-4 uppercase tracking-widest">
                  {dictionary[fcIdx]?.wordType || 'Từ Pali'}
                </div>
                <div className="text-4xl font-black font-outfit text-blue">
                  {dictionary[fcIdx]?.wordPali}
                </div>
                <div className="text-xs text-[#aaa] font-bold mt-8">Click để xem nghĩa Việt ➔</div>
              </div>

              {/* Back */}
              <div className="flashcard-back bg-blue-light border-2 border-blue-dark text-blue-dark flex flex-col items-center justify-center p-6 text-center select-none shadow-sm">
                <div className="text-xl font-bold uppercase tracking-wider text-[#a0ccee]">Nghĩa là</div>
                <div className="text-2xl font-black font-outfit my-2 text-blue-dark">
                  {dictionary[fcIdx]?.meaningVn}
                </div>
                <div className="text-xs italic text-[#777] max-w-xs mt-4">
                  {dictionary[fcIdx]?.example ? `Ví dụ: ${dictionary[fcIdx].example}` : 'Chưa cấu hình ví dụ.'}
                </div>
                <div className="text-xs text-[#5aaae6] font-bold mt-8">Click để lật lại ➔</div>
              </div>
            </div>
          </div>

          {/* Nav arrows */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={handlePrevCard}
              className="flex-1 bg-white border-2 border-[#e5e5e5] text-text py-3 rounded-2xl font-black shadow-[0_4px_0_0_#e5e5e5] active:translate-y-1 active:shadow-none hover:bg-gray-50 transition-all"
            >
              TRƯỚC
            </button>
            <button
              onClick={handleNextCard}
              className="flex-1 bg-white border-2 border-[#e5e5e5] text-text py-3 rounded-2xl font-black shadow-[0_4px_0_0_#e5e5e5] active:translate-y-1 active:shadow-none hover:bg-gray-50 transition-all"
            >
              TIẾP THEO
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
