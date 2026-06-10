import React, { useState } from 'react';

const PALI_CHARS_LOWER = ['ā', 'ī', 'ū', 'ṃ', 'ṅ', 'ñ', 'ṭ', 'ḍ', 'ṇ', 'ḷ'];
const PALI_CHARS_UPPER = ['Ā', 'Ī', 'Ū', 'Ṃ', 'Ṅ', 'Ñ', 'Ṭ', 'Ḍ', 'Ṇ', 'Ḷ'];

export default function PaliKeyboard({ inputId, onKeyPress }) {
  const [shiftActive, setShiftActive] = useState(false);

  const insertChar = (char) => {
    const input = document.getElementById(inputId);
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;

    const newValue = text.substring(0, start) + char + text.substring(end);
    input.value = newValue;

    // Reset selection/cursor
    const cursorOffset = start + char.length;
    input.selectionStart = input.selectionEnd = cursorOffset;
    input.focus();

    if (onKeyPress) {
      onKeyPress(newValue);
    }
  };

  const chars = shiftActive ? PALI_CHARS_UPPER : PALI_CHARS_LOWER;

  return (
    <div className="bg-[#f7f7f7] border-2 border-[#e5e5e5] rounded-2xl p-4 my-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-bold text-[#888] font-outfit uppercase tracking-wider">
          Ký tự đặc biệt Pali
        </span>
        <button
          type="button"
          onClick={() => setShiftActive(!shiftActive)}
          className={`px-3 py-1 text-xs font-bold rounded-lg border-2 transition-all ${
            shiftActive
              ? 'bg-[#1cb0f6] border-[#1899d6] text-white shadow-[0_2px_0_0_#1899d6]'
              : 'bg-white border-[#e5e5e5] text-[#4b4b4b] hover:bg-gray-100 shadow-[0_2px_0_0_#e5e5e5]'
          }`}
        >
          Shift ⬆️
        </button>
      </div>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
        {chars.map((char) => (
          <button
            key={char}
            type="button"
            onClick={() => insertChar(char)}
            className="pali-key shadow-[0_4px_0_0_#e5e5e5] active:translate-y-[2px] active:shadow-none hover:bg-gray-50 flex items-center justify-center font-outfit font-bold py-2 border rounded-xl text-lg bg-white border-[#e5e5e5]"
          >
            {char}
          </button>
        ))}
      </div>
    </div>
  );
}
