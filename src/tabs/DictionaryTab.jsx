import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function DictionaryTab({ dictionary }) {
  const [dictSearch, setDictSearch] = useState('');
  const [dictTypeFilter, setDictTypeFilter] = useState('all');

  const filteredDict = dictionary.filter(item => {
    const matchesSearch = 
      item.wordPali.toLowerCase().includes(dictSearch.toLowerCase()) ||
      item.meaningVn.toLowerCase().includes(dictSearch.toLowerCase());
    const matchesType = dictTypeFilter === 'all' || item.wordType === dictTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-4xl mx-auto py-4 font-nunito">
      {/* Search and category pills */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Nhập từ Pali hoặc nghĩa Tiếng Việt để tìm..."
            value={dictSearch}
            onChange={(e) => setDictSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-[#e5e5e5] rounded-2xl focus:outline-none focus:border-blue transition-all"
            id="dict-search-input"
          />
          <Search className="w-5 h-5 absolute left-3 top-3.5 text-[#aaa]" />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1" id="dict-type-filters">
          {['all', 'Danh từ', 'Động từ', 'Tính từ', 'Phó từ', 'Giới từ'].map(type => (
            <button
              key={type}
              onClick={() => setDictTypeFilter(type)}
              className={`px-4 py-2 rounded-2xl text-sm font-bold border-2 transition-all whitespace-nowrap ${
                dictTypeFilter === type
                  ? 'bg-blue border-blue-dark text-white'
                  : 'bg-white border-[#e5e5e5] text-[#777] hover:bg-gray-50'
              }`}
            >
              {type === 'all' ? 'Tất cả' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Words grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="dict-list-container">
        {filteredDict.length === 0 ? (
          <div className="col-span-2 text-center text-[#999] py-12">Không tìm thấy từ vựng nào...</div>
        ) : (
          filteredDict.map(word => (
            <div key={word.id} className="border-2 border-[#e5e5e5] rounded-3xl p-5 hover:border-blue transition-all relative overflow-hidden bg-white shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h5 className="text-xl font-black font-outfit text-blue">{word.wordPali}</h5>
                <span className="bg-[#f0f0f0] text-[#777] text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-[#ddd]">
                  {word.wordType || 'Không rõ'}
                </span>
              </div>
              <p className="text-[#4b4b4b] font-bold text-sm">{word.meaningVn}</p>
              {word.example && (
                <p className="text-xs text-[#aaa] italic mt-3 border-t border-[#f0f0f0] pt-2">
                  Ví dụ: {word.example}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
