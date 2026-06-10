import React, { useState, useEffect } from 'react';
import { FileText, Download, ExternalLink, RefreshCw } from 'lucide-react';
import { apiFetch } from '../lib/api';

export default function MaterialsTab() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/documents');
      if (response.ok) {
        setDocs(await response.json());
      }
    } catch (err) {
      console.error('Lỗi tải danh sách tài liệu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-4 font-nunito">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black font-outfit text-[#4b4b4b] uppercase tracking-tight">
          Tài Liệu & Giáo Trình Pali
        </h3>
        <button
          onClick={fetchDocs}
          title="Tải lại tài liệu"
          className="p-2 border-2 border-[#e5e5e5] rounded-xl hover:bg-gray-50 active:translate-y-0.5 transition-all text-[#777]"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue border-t-transparent mx-auto mb-2"></div>
          <p className="text-xs font-bold text-[#aaa]">Đang tải danh sách tài liệu...</p>
        </div>
      ) : docs.length === 0 ? (
        <div className="border-2 border-dashed border-[#e5e5e5] rounded-3xl p-12 text-center">
          <span className="text-4xl">📚</span>
          <h4 className="font-extrabold text-sm text-[#777] mt-3">Chưa có tài liệu học tập</h4>
          <p className="text-xs text-[#aaa] mt-1">
            Admin chưa tải lên tài liệu học tập định dạng PDF nào ở trang quản trị.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {docs.map((doc, idx) => (
            <div
              key={idx}
              className="border-2 border-[#e5e5e5] rounded-2xl p-4 flex items-center justify-between bg-white hover:border-[#1cb0f6] transition-all shadow-[0_2px_0_0_rgba(0,0,0,0.02)]"
            >
              <div className="flex items-center gap-3.5 overflow-hidden pr-4">
                <div className="p-3 bg-blue-light text-blue-dark rounded-xl flex-shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-black text-sm text-[#4b4b4b] truncate" title={doc.name}>
                    {doc.name}
                  </h4>
                  <p className="text-[10px] text-[#aaa] font-bold mt-0.5">
                    Đã tải lên: {new Date(doc.uploadedAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-black text-blue-dark bg-blue-light hover:bg-[#cbeeff] border-2 border-transparent rounded-xl transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  XEM
                </a>
                <a
                  href={doc.url}
                  download={doc.name}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-black text-white bg-blue border-blue-dark border-2 shadow-[0_2px_0_0_#1899d6] hover:bg-blue-dark active:translate-y-[2px] active:shadow-none rounded-xl transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  TẢI VỀ
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
