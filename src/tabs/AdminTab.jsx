import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit, FileText, RefreshCw, X
} from 'lucide-react';
import PaliKeyboard from '../components/PaliKeyboard';
import { apiFetch } from '../lib/api';

export default function AdminTab({ units, dictionary, questions, loadData, adminSubTab }) {
  const [adminActiveInputId, setAdminActiveInputId] = useState(null);

  useEffect(() => {
    setAdminActiveInputId(null);
  }, [adminSubTab]);

  // ----- QUESTIONS CRUD STATE -----
  const [qId, setQId] = useState('');
  const [qLessonId, setQLessonId] = useState('');
  const [qType, setQType] = useState('vocab');
  const [qContent, setQContent] = useState('');
  const [qPaliText, setQPaliText] = useState('');
  const [qCorrect, setQCorrect] = useState('');
  const [qDistractors, setQDistractors] = useState('');
  const [qExplanation, setQExplanation] = useState('');

  // Default lesson ID mapping helper
  useEffect(() => {
    if (units.length > 0 && !qLessonId) {
      const firstAvailableLessonId = units.flatMap(u => u.lessons)[0]?.id;
      if (firstAvailableLessonId) {
        setQLessonId(firstAvailableLessonId.toString());
      }
    }
  }, [units, qLessonId]);

  // Helper to resolve Lesson Title
  const getLessonTitle = (lessonId) => {
    for (const unit of units) {
      const lesson = unit.lessons.find(l => l.id === parseInt(lessonId));
      if (lesson) {
        return `${unit.title.split(':')[0]} > ${lesson.title}`;
      }
    }
    return `Bài học ID: ${lessonId}`;
  };

  // ----- DICTIONARY CRUD STATE -----
  const [dId, setDId] = useState('');
  const [dWordPali, setDWordPali] = useState('');
  const [dMeaningVn, setDMeaningVn] = useState('');
  const [dWordType, setDWordType] = useState('Danh từ');
  const [dExample, setDExample] = useState('');

  // ----- STRUCTURE CRUD STATE -----
  const [editingUnitId, setEditingUnitId] = useState(null);
  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [newUnitDesc, setNewUnitDesc] = useState('');
  const [newUnitOrder, setNewUnitOrder] = useState('');

  const [editingLessonId, setEditingLessonId] = useState(null);
  const [newLessonUnitId, setNewLessonUnitId] = useState('');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonOrder, setNewLessonOrder] = useState('');

  // --- Structure panel selection state ---
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [lessonQuestionsModal, setLessonQuestionsModal] = useState(null); // { lesson, questions[] }

  useEffect(() => {
    if (units.length > 0 && !newLessonUnitId) {
      setNewLessonUnitId(units[0].id.toString());
    }
    // Auto-select first unit when units load
    if (units.length > 0 && !selectedUnitId) {
      setSelectedUnitId(units[0].id);
    }
  }, [units, newLessonUnitId, selectedUnitId]);

  // ----- PDF UPLOADS STATE -----
  const [pdfUploadFile, setPdfUploadFile] = useState(null);
  const [uploadedDocs, setUploadedDocs] = useState([]);

  const fetchDocs = async () => {
    try {
      const response = await apiFetch('/api/documents');
      if (response.ok) {
        setUploadedDocs(await response.json());
      }
    } catch (err) {
      console.error('Lỗi tải danh sách tài liệu:', err);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleDeleteDoc = async (url) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;
    try {
      const response = await apiFetch('/api/documents', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      if (response.ok) {
        const res = await response.json();
        setUploadedDocs(res.documents);
        alert('Đã xóa tài liệu thành công!');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  // ----- QUESTION PREVIEWER STATE -----
  const [previewQId, setPreviewQId] = useState('');
  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [previewAnswered, setPreviewAnswered] = useState(false);
  const [previewSelectedAnswer, setPreviewSelectedAnswer] = useState(null);
  const [previewTypeInput, setPreviewTypeInput] = useState('');
  const [previewSelectedWords, setPreviewSelectedWords] = useState([]);
  const [previewPoolWords, setPreviewPoolWords] = useState([]);
  const [previewFeedback, setPreviewFeedback] = useState(null);

  useEffect(() => {
    if (questions.length > 0 && !previewQId) {
      setPreviewQId(questions[0].id.toString());
    }
  }, [questions, previewQId]);

  useEffect(() => {
    if (previewQId) {
      const q = questions.find(item => item.id === parseInt(previewQId));
      if (q) {
        setPreviewQuestion(q);
        resetPreviewInteractiveState(q);
      }
    }
  }, [previewQId, questions]);

  const resetPreviewInteractiveState = (q) => {
    setPreviewAnswered(false);
    setPreviewSelectedAnswer(null);
    setPreviewTypeInput('');
    setPreviewFeedback(null);
    
    if (q && q.type === 'sentence_build') {
      const corrects = Array.isArray(q.correctAnswers) ? q.correctAnswers : JSON.parse(q.correctAnswers || '[]');
      const dists = Array.isArray(q.distractors) ? q.distractors : JSON.parse(q.distractors || '[]');
      const combined = [...corrects, ...dists];
      
      setPreviewPoolWords(
        combined.sort(() => Math.random() - 0.5).map((w, i) => ({ id: i, word: w, used: false }))
      );
      setPreviewSelectedWords([]);
    }
  };

  // ----- SUBMIT API CALLS -----

  // Units CRUD operations
  const handleSaveUnit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = editingUnitId ? `/api/units/${editingUnitId}` : '/api/units';
      const method = editingUnitId ? 'PUT' : 'POST';
      const response = await apiFetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newUnitTitle,
          description: newUnitDesc,
          orderIndex: parseInt(newUnitOrder) || 1
        })
      });
      if (response.ok) {
        alert(editingUnitId ? 'Cập nhật chương thành công!' : 'Tạo chương mới thành công!');
        resetUnitForm();
        loadData();
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const editUnit = (u) => {
    setEditingUnitId(u.id);
    setNewUnitTitle(u.title);
    setNewUnitDesc(u.description || '');
    setNewUnitOrder(u.orderIndex.toString());
  };

  const resetUnitForm = () => {
    setEditingUnitId(null);
    setNewUnitTitle('');
    setNewUnitDesc('');
    setNewUnitOrder('');
  };

  const handleDeleteUnit = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa chương này? Toàn bộ bài học và câu hỏi thuộc chương này sẽ bị xóa.')) return;
    try {
      const response = await apiFetch(`/api/units/${id}`, { method: 'DELETE' });
      if (response.ok) {
        loadData();
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  // Lessons CRUD operations
  const handleSaveLesson = async (e) => {
    e.preventDefault();
    try {
      const endpoint = editingLessonId ? `/api/lessons/${editingLessonId}` : '/api/lessons';
      const method = editingLessonId ? 'PUT' : 'POST';
      const response = await apiFetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitId: parseInt(newLessonUnitId),
          title: newLessonTitle,
          orderIndex: parseInt(newLessonOrder) || 1
        })
      });
      if (response.ok) {
        alert(editingLessonId ? 'Cập nhật bài học thành công!' : 'Tạo bài học mới thành công!');
        resetLessonForm();
        loadData();
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const editLesson = (l) => {
    setEditingLessonId(l.id);
    setNewLessonUnitId(l.unitId.toString());
    setNewLessonTitle(l.title);
    setNewLessonOrder(l.orderIndex.toString());
  };

  const resetLessonForm = () => {
    setEditingLessonId(null);
    setNewLessonTitle('');
    setNewLessonOrder('');
  };

  const handleDeleteLesson = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài học này? Toàn bộ câu hỏi tương ứng sẽ bị xóa.')) return;
    try {
      const response = await apiFetch(`/api/lessons/${id}`, { method: 'DELETE' });
      if (response.ok) {
        loadData();
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  // Dictionary CRUD operations
  const handleSaveDictWord = async (e) => {
    e.preventDefault();
    if (!dWordPali.trim() || !dMeaningVn.trim()) {
      alert('Hãy nhập đầy đủ từ Pali và nghĩa Việt!');
      return;
    }
    const payload = {
      wordPali: dWordPali.trim(),
      meaningVn: dMeaningVn.trim(),
      wordType: dWordType,
      example: dExample.trim()
    };

    try {
      const endpoint = dId ? `/api/dictionary/${dId}` : '/api/dictionary';
      const method = dId ? 'PUT' : 'POST';
      const response = await apiFetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        alert(dId ? 'Cập nhật từ vựng thành công!' : 'Thêm từ vựng thành công!');
        resetDictForm();
        loadData();
      } else {
        const err = await response.json();
        alert('Lỗi lưu: ' + (err.error || 'Trùng lặp từ vựng'));
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const editDictWord = (w) => {
    setDId(w.id);
    setDWordPali(w.wordPali);
    setDMeaningVn(w.meaningVn);
    setDWordType(w.wordType || 'Danh từ');
    setDExample(w.example || '');
  };

  const deleteDictWord = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa từ vựng này?')) return;
    try {
      const response = await apiFetch(`/api/dictionary/${id}`, { method: 'DELETE' });
      if (response.ok) {
        loadData();
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const resetDictForm = () => {
    setDId('');
    setDWordPali('');
    setDMeaningVn('');
    setDWordType('Danh từ');
    setDExample('');
    setAdminActiveInputId(null);
  };

  // Questions CRUD operations
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!qLessonId) {
      alert('Vui lòng chọn bài học!');
      return;
    }
    if (!qContent.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi!');
      return;
    }
    const correctAnswers = qCorrect.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const distractors = qType !== 'manual_input' ? qDistractors.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];

    if (correctAnswers.length === 0) {
      alert('Vui lòng nhập ít nhất một đáp án đúng!');
      return;
    }

    const payload = {
      lessonId: parseInt(qLessonId),
      type: qType,
      content: qContent.trim(),
      imageUrl: qPaliText.trim() || null,
      correctAnswers,
      distractors,
      explanation: qExplanation.trim()
    };

    try {
      const endpoint = qId ? `/api/questions/${qId}` : '/api/questions';
      const method = qId ? 'PUT' : 'POST';
      const response = await apiFetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        alert(qId ? 'Cập nhật câu hỏi thành công!' : 'Thêm câu hỏi mới thành công!');
        resetQuestionForm();
        loadData();
      } else {
        const err = await response.json();
        alert('Lỗi lưu câu hỏi: ' + err.error);
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const editQuestion = (q) => {
    setQId(q.id);
    setQLessonId(q.lessonId.toString());
    setQType(q.type);
    setQContent(q.content);
    setQPaliText(q.imageUrl || '');
    
    const corrects = Array.isArray(q.correctAnswers) ? q.correctAnswers : JSON.parse(q.correctAnswers || '[]');
    const dists = Array.isArray(q.distractors) ? q.distractors : JSON.parse(q.distractors || '[]');
    
    setQCorrect(corrects.join(', '));
    setQDistractors(dists.join(', '));
    setQExplanation(q.explanation || '');
  };

  const deleteQuestion = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;
    try {
      const response = await apiFetch(`/api/questions/${id}`, { method: 'DELETE' });
      if (response.ok) {
        loadData();
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const resetQuestionForm = () => {
    setQId('');
    setQContent('');
    setQPaliText('');
    setQCorrect('');
    setQDistractors('');
    setQExplanation('');
    setAdminActiveInputId(null);
  };

  // PDF uploads operations
  const handlePdfUpload = async (e) => {
    e.preventDefault();
    if (!pdfUploadFile) {
      alert('Hãy chọn file tài liệu!');
      return;
    }
    const formData = new FormData();
    formData.append('file', pdfUploadFile);

    try {
      const response = await apiFetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        const res = await response.json();
        alert('Tải lên thành công tài liệu!');
        setUploadedDocs(res.documents);
        setPdfUploadFile(null);
        e.target.reset();
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  // Previewer functions
  const selectPrevAnswer = (opt) => {
    if (previewAnswered) return;
    setPreviewSelectedAnswer(opt);
  };

  const addWordToPrevSlots = (card) => {
    if (previewAnswered || card.used) return;
    setPreviewPoolWords(previewPoolWords.map(w => w.id === card.id ? { ...w, used: true } : w));
    setPreviewSelectedWords([...previewSelectedWords, card]);
  };

  const removeWordFromPrevSlots = (index) => {
    if (previewAnswered) return;
    const card = previewSelectedWords[index];
    setPreviewPoolWords(previewPoolWords.map(w => w.id === card.id ? { ...w, used: false } : w));
    const newSelected = [...previewSelectedWords];
    newSelected.splice(index, 1);
    setPreviewSelectedWords(newSelected);
  };

  const checkPreviewAnswer = () => {
    if (previewAnswered || !previewQuestion) return;
    setPreviewAnswered(true);

    const q = previewQuestion;
    const corrects = Array.isArray(q.correctAnswers) ? q.correctAnswers : JSON.parse(q.correctAnswers || '[]');

    if (q.type === 'vocab') {
      const correctVal = corrects[0];
      const correct = previewSelectedAnswer === correctVal;
      setPreviewFeedback({
        correct,
        message: correct 
          ? 'Chính xác! Gợi ý: ' + (q.explanation || '')
          : `Chưa đúng! Đáp án đúng: "${correctVal}". \nGiải thích: ${q.explanation || ''}`
      });
    } else if (q.type === 'sentence_build') {
      const correct = 
        previewSelectedWords.length === corrects.length &&
        previewSelectedWords.every((w, idx) => w.word === corrects[idx]);
      setPreviewFeedback({
        correct,
        message: correct
          ? 'Chính xác! Ghép câu đúng.'
          : `Chưa đúng! Đáp án đúng mẫu: "${corrects.join(' ')}". \nGiải thích: ${q.explanation || ''}`
      });
    } else if (q.type === 'manual_input') {
      const normalize = (str) => 
        str.trim()
           .toLowerCase()
           .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '')
           .replace(/\s+/g, ' ');
      const cleanInput = normalize(previewTypeInput);
      const cleanCorrects = corrects.map(c => normalize(c));
      const correct = cleanCorrects.includes(cleanInput);
      setPreviewFeedback({
        correct,
        message: correct
          ? 'Chính xác! Câu dịch được chấp nhận.'
          : `Chưa chính xác! Đáp án đúng mẫu: "${corrects[0]}". \nGiải thích: ${q.explanation || ''}`
      });
    }
  };

  return (
    <div className="w-full py-2 font-nunito">

      {/* SUBTAB 1: QUESTIONS CRUD */}
      {adminSubTab === 'questions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Question fields */}
          <div className="lg:col-span-1 border-2 border-[#e5e5e5] rounded-3xl p-5 bg-white shadow-sm font-nunito">
            <h4 className="text-lg font-black font-outfit mb-4 text-[#4b4b4b]" id="question-form-title">
              {qId ? `Sửa câu hỏi ID: ${qId}` : 'Thêm câu hỏi mới'}
            </h4>
            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-[#aaa] mb-1">Loại bài tập</label>
                <select
                  value={qType}
                  onChange={(e) => {
                    setQType(e.target.value);
                    if (e.target.value === 'manual_input') setQDistractors('');
                  }}
                  className="w-full border-2 border-gray-border rounded-xl px-3 py-2 outline-none"
                >
                  <option value="vocab">Dạng 1: Trắc nghiệm (Vocabulary)</option>
                  <option value="sentence_build">Dạng 2: Sắp xếp câu (Sentence Builder)</option>
                  <option value="manual_input">Dạng 3: Nhập liệu tự do (Manual Input)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#aaa] mb-1">Bài học (Lesson)</label>
                <select
                  value={qLessonId}
                  onChange={(e) => setQLessonId(e.target.value)}
                  className="w-full border-2 border-gray-border rounded-xl px-3 py-2 outline-none"
                >
                  {units.map(u => (
                    <optgroup key={u.id} label={u.title}>
                      {u.lessons.map(l => (
                        <option key={l.id} value={l.id}>{l.title}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#aaa] mb-1">Nội dung câu hỏi (Câu dịch gốc)</label>
                <input
                  type="text"
                  value={qContent}
                  onChange={(e) => setQContent(e.target.value)}
                  onFocus={() => setAdminActiveInputId('qContent')}
                  id="qContent"
                  className="w-full border-2 border-gray-border rounded-xl px-3 py-2 outline-none focus:border-blue font-nunito"
                  placeholder="Ví dụ: Dịch câu: 'Đức Phật ngự trong tu viện'?"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#aaa] mb-1">Đồ họa / Phụ chú Pali (Không bắt buộc)</label>
                <input
                  type="text"
                  value={qPaliText}
                  onChange={(e) => setQPaliText(e.target.value)}
                  onFocus={() => setAdminActiveInputId('qPaliText')}
                  id="qPaliText"
                  className="w-full border-2 border-gray-border rounded-xl px-3 py-2 outline-none focus:border-blue font-nunito"
                  placeholder="Ví dụ: Buddho vihāre viharati"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#aaa] mb-1" id="label-correct-answers">
                  {qType === 'vocab' && 'Đáp án đúng (Chỉ 1 từ)'}
                  {qType === 'sentence_build' && 'Thứ tự từ đúng (Cách nhau bằng dấu phẩy)'}
                  {qType === 'manual_input' && 'Các đáp án đúng chấp nhận (Cách nhau bằng dấu phẩy)'}
                </label>
                <input
                  type="text"
                  value={qCorrect}
                  onChange={(e) => setQCorrect(e.target.value)}
                  onFocus={() => setAdminActiveInputId('qCorrect')}
                  id="qCorrect"
                  className="w-full border-2 border-gray-border rounded-xl px-3 py-2 outline-none focus:border-blue font-nunito"
                  placeholder={
                    qType === 'sentence_build'
                      ? 'Buddho,viharati'
                      : qType === 'manual_input'
                      ? 'buddho vihare viharati'
                      : 'Đức Phật'
                  }
                  required
                />
              </div>

              {qType !== 'manual_input' && (
                <div id="field-distractors">
                  <label className="block text-xs font-black uppercase text-[#aaa] mb-1">
                    {qType === 'vocab' ? 'Các đáp án sai (Cách nhau bằng dấu phẩy)' : 'Thẻ từ gây nhiễu thêm (Cách nhau bằng dấu phẩy)'}
                  </label>
                  <input
                    type="text"
                    value={qDistractors}
                    onChange={(e) => setQDistractors(e.target.value)}
                    onFocus={() => setAdminActiveInputId('qDistractors')}
                    id="qDistractors"
                    className="w-full border-2 border-gray-border rounded-xl px-3 py-2 outline-none focus:border-blue font-nunito"
                    placeholder="Ví dụ: Dhamma,Saṅgha,Nibbāna"
                    required={qType === 'vocab'}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-black uppercase text-[#aaa] mb-1">Lời giải thích giải nghĩa</label>
                <textarea
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  onFocus={() => setAdminActiveInputId('qExplanation')}
                  id="qExplanation"
                  rows={2}
                  className="w-full border-2 border-gray-border rounded-xl px-3 py-2 outline-none focus:border-blue font-nunito"
                  placeholder="Buddho nghĩa là người Tự Giác ngộ..."
                />
              </div>

              {adminActiveInputId && (
                <div id="admin-pali-keyboard-container">
                  <PaliKeyboard 
                    inputId={adminActiveInputId} 
                    onKeyPress={(val) => {
                      if (adminActiveInputId === 'qContent') setQContent(val);
                      else if (adminActiveInputId === 'qPaliText') setQPaliText(val);
                      else if (adminActiveInputId === 'qCorrect') setQCorrect(val);
                      else if (adminActiveInputId === 'qDistractors') setQDistractors(val);
                      else if (adminActiveInputId === 'qExplanation') setQExplanation(val);
                    }} 
                  />
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  id="btn-question-submit"
                  className="flex-1 bg-blue border-blue-dark border-2 shadow-[0_2px_0_0_#1899d6] text-white py-2 px-4 rounded-xl font-bold hover:bg-[#1899d6] transition-all"
                >
                  Lưu câu hỏi
                </button>
                <button
                  type="button"
                  onClick={resetQuestionForm}
                  className="bg-white border-2 border-[#e5e5e5] text-text py-2 px-4 rounded-xl font-bold shadow-[0_2px_0_0_#e5e5e5]"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>

          {/* Table display */}
          <div className="lg:col-span-2 overflow-x-auto border-2 border-[#e5e5e5] rounded-3xl p-5 bg-white shadow-sm font-nunito">
            <h4 className="text-lg font-black font-outfit mb-4 text-[#4b4b4b]">Ngân hàng câu hỏi hiện tại</h4>
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e5e5e5] text-[#888] font-bold text-xs uppercase">
                  <th className="py-3 px-2">Dạng</th>
                  <th className="py-3 px-2">Bài học (Lesson)</th>
                  <th className="py-3 px-2">Nội dung</th>
                  <th className="py-3 px-2">Đáp án đúng</th>
                  <th className="py-3 px-2 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {questions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-[#999]">Chưa có câu hỏi nào...</td>
                  </tr>
                ) : (
                  questions.map(q => (
                    <tr key={q.id} className="border-b border-[#f0f0f0] hover:bg-[#fcfcfc]">
                      <td className="py-3 px-2 font-bold text-xs">
                        {q.type === 'vocab' && 'Trắc nghiệm'}
                        {q.type === 'sentence_build' && 'Sắp xếp thẻ'}
                        {q.type === 'manual_input' && 'Nhập tay'}
                      </td>
                      <td className="py-3 px-2 text-xs font-bold text-[#666]">
                        {getLessonTitle(q.lessonId)}
                      </td>
                      <td className="py-3 px-2 truncate max-w-[120px]">{q.content}</td>
                      <td className="py-3 px-2 text-xs font-mono text-blue-dark">
                        {Array.isArray(q.correctAnswers) ? q.correctAnswers.join(', ') : JSON.parse(q.correctAnswers || '[]').join(', ')}
                      </td>
                      <td className="py-3 px-2 text-center space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => editQuestion(q)}
                          className="p-1.5 border border-[#e5e5e5] rounded-md hover:bg-gray-100"
                        >
                          <Edit className="w-4 h-4 text-blue" />
                        </button>
                        <button
                          onClick={() => deleteQuestion(q.id)}
                          className="p-1.5 border border-[#e5e5e5] rounded-md hover:bg-red-light"
                        >
                          <Trash2 className="w-4 h-4 text-red" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: DICTIONARY CRUD */}
      {adminSubTab === 'dictionary' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-nunito">
          {/* Dictionary Inputs */}
          <div className="lg:col-span-1 border-2 border-[#e5e5e5] rounded-3xl p-5 bg-white shadow-sm">
            <h4 className="text-lg font-black font-outfit mb-4 text-[#4b4b4b]" id="dict-form-title">
              {dId ? `Sửa từ vựng ID: ${dId}` : 'Thêm từ vựng mới'}
            </h4>
            <form onSubmit={handleSaveDictWord} className="space-y-4" id="dict-form">
              <div>
                <label className="block text-xs font-black uppercase text-[#aaa] mb-1">Từ Pali gốc</label>
                <input
                  type="text"
                  value={dWordPali}
                  onChange={(e) => setDWordPali(e.target.value)}
                  onFocus={() => setAdminActiveInputId('dWordPali')}
                  id="dWordPali"
                  className="w-full border-2 border-gray-border rounded-xl px-3 py-2 outline-none focus:border-blue font-nunito"
                  placeholder="Buddha"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#aaa] mb-1">Loại từ</label>
                <select
                  value={dWordType}
                  onChange={(e) => setDWordType(e.target.value)}
                  className="w-full border-2 border-gray-border rounded-xl px-3 py-2 outline-none"
                  id="d-type"
                >
                  <option value="Danh từ">Danh từ</option>
                  <option value="Động từ">Động từ</option>
                  <option value="Tính từ">Tính từ</option>
                  <option value="Phó từ">Phó từ</option>
                  <option value="Giới từ">Giới từ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#aaa] mb-1">Ý nghĩa tiếng Việt</label>
                <input
                  type="text"
                  value={dMeaningVn}
                  onChange={(e) => setDMeaningVn(e.target.value)}
                  onFocus={() => setAdminActiveInputId('dMeaningVn')}
                  id="dMeaningVn"
                  className="w-full border-2 border-gray-border rounded-xl px-3 py-2 outline-none focus:border-blue font-nunito"
                  placeholder="Đức Phật"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#aaa] mb-1">Ví dụ đặt câu / Ngữ cảnh</label>
                <textarea
                  value={dExample}
                  onChange={(e) => setDExample(e.target.value)}
                  onFocus={() => setAdminActiveInputId('dExample')}
                  id="dExample"
                  rows={3}
                  className="w-full border-2 border-gray-border rounded-xl px-3 py-2 outline-none focus:border-blue font-nunito"
                  placeholder="Ví dụ: Buddho loke uppajjati..."
                />
              </div>

              {adminActiveInputId && (
                <div id="admin-dict-keyboard-container">
                  <PaliKeyboard 
                    inputId={adminActiveInputId} 
                    onKeyPress={(val) => {
                      if (adminActiveInputId === 'dWordPali') setDWordPali(val);
                      else if (adminActiveInputId === 'dMeaningVn') setDMeaningVn(val);
                      else if (adminActiveInputId === 'dExample') setDExample(val);
                    }} 
                  />
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  id="btn-dict-submit"
                  className="flex-1 bg-blue border-blue-dark border-2 shadow-[0_2px_0_0_#1899d6] text-white py-2 px-4 rounded-xl font-bold hover:bg-[#1899d6] transition-all"
                >
                  Lưu từ vựng
                </button>
                <button
                  type="button"
                  onClick={resetDictForm}
                  className="bg-white border-2 border-[#e5e5e5] text-text py-2 px-4 rounded-xl font-bold shadow-[0_2px_0_0_#e5e5e5]"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>

          {/* Dictionary table list */}
          <div className="lg:col-span-2 overflow-x-auto border-2 border-[#e5e5e5] rounded-3xl p-5 bg-white shadow-sm font-nunito">
            <h4 className="text-lg font-black font-outfit mb-4 text-[#4b4b4b]">Danh sách từ vựng hiện tại</h4>
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e5e5e5] text-[#888] font-bold text-xs uppercase">
                  <th className="py-3 px-2">Từ Pali</th>
                  <th className="py-3 px-2">Loại từ</th>
                  <th className="py-3 px-2">Nghĩa Việt</th>
                  <th className="py-3 px-2">Ví dụ</th>
                  <th className="py-3 px-2 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {dictionary.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-[#999]">Chưa có từ vựng nào...</td>
                  </tr>
                ) : (
                  dictionary.map(word => (
                    <tr key={word.id} className="border-b border-[#f0f0f0] hover:bg-[#fcfcfc]">
                      <td className="py-3 px-2 font-bold text-blue">{word.wordPali}</td>
                      <td className="py-3 px-2"><span className="text-xs px-2.5 py-0.5 border rounded-full bg-gray-100">{word.wordType}</span></td>
                      <td className="py-3 px-2 font-bold text-[#444]">{word.meaningVn}</td>
                      <td className="py-3 px-2 text-xs italic text-[#aaa] truncate max-w-[120px]">{word.example}</td>
                      <td className="py-3 px-2 text-center space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => editDictWord(word)}
                          className="p-1 border border-[#e5e5e5] rounded-md hover:bg-gray-100"
                        >
                          <Edit className="w-4 h-4 text-blue" />
                        </button>
                        <button
                          onClick={() => deleteDictWord(word.id)}
                          className="p-1 border border-[#e5e5e5] rounded-md hover:bg-red-light"
                        >
                          <Trash2 className="w-4 h-4 text-red" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: STRUCTURE (UNITS & LESSONS) */}
      {adminSubTab === 'structure' && (
        <div className="font-nunito space-y-6">

          {/* ── Question Modal ───────────────────────────────────── */}
          {lessonQuestionsModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setLessonQuestionsModal(null)}>
              <div className="bg-white rounded-3xl border-2 border-[#e5e5e5] shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-[#e5e5e5]">
                  <div>
                    <h4 className="font-black text-lg font-outfit text-[#4b4b4b]">{lessonQuestionsModal.lesson.title}</h4>
                    <p className="text-xs text-[#aaa] font-bold">{lessonQuestionsModal.questions.length} câu hỏi</p>
                  </div>
                  <button onClick={() => setLessonQuestionsModal(null)} className="text-[#aaa] hover:text-[#4b4b4b] font-black text-xl w-8 h-8 flex items-center justify-center">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="overflow-y-auto p-5 space-y-3">
                  {lessonQuestionsModal.questions.length === 0 ? (
                    <div className="text-center py-12 text-[#aaa] font-bold text-sm">
                      Bài học này chưa có câu hỏi nào.
                    </div>
                  ) : (
                    lessonQuestionsModal.questions.map((q, idx) => (
                      <div key={q.id} className="bg-[#f7f9fa] border border-[#e5e5e5] rounded-2xl p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-xs font-black text-white bg-blue rounded-full w-6 h-6 flex items-center justify-center shrink-0">{idx + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                q.type === 'vocab' ? 'bg-green-light text-green-dark' :
                                q.type === 'sentence_builder' ? 'bg-purple-light text-purple-dark' :
                                q.type === 'fill_blank' ? 'bg-yellow-light text-yellow-dark' :
                                'bg-blue-light text-blue-dark'
                              }`}>{q.type}</span>
                            </div>
                            <div className="font-bold text-sm text-[#4b4b4b]">{q.content || q.paliText}</div>
                            <div className="text-xs text-green-dark font-black mt-1">✓ {q.correctAnswer}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── 3-Column Panel: Forms | Unit List | Lesson List ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Col 1: Create/Edit Forms */}
            <div className="space-y-6">
              {/* Unit form */}
              <div className="border-2 border-[#e5e5e5] rounded-3xl p-5 bg-white shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base font-black font-outfit text-[#4b4b4b]">
                    {editingUnitId ? `Sửa Chương #${editingUnitId}` : '＋ Thêm Chương'}
                  </h4>
                  {editingUnitId && (
                    <button onClick={resetUnitForm} className="text-xs flex items-center gap-0.5 text-red hover:underline">
                      <X className="w-3.5 h-3.5" /> Hủy
                    </button>
                  )}
                </div>
                <form onSubmit={handleSaveUnit} className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black uppercase text-[#aaa] mb-1">Tên chương</label>
                      <input type="text" value={newUnitTitle} onChange={e => setNewUnitTitle(e.target.value)} className="w-full border-2 border-gray-border rounded-xl px-3 py-1.5 text-sm outline-none" placeholder="Chương 2: Danh từ" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-[#aaa] mb-1">Thứ tự</label>
                      <input type="number" value={newUnitOrder} onChange={e => setNewUnitOrder(e.target.value)} className="w-full border-2 border-gray-border rounded-xl px-3 py-1.5 text-sm outline-none" placeholder="2" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-[#aaa] mb-1">Mô tả</label>
                    <input type="text" value={newUnitDesc} onChange={e => setNewUnitDesc(e.target.value)} className="w-full border-2 border-gray-border rounded-xl px-3 py-1.5 text-sm outline-none" placeholder="Mô tả chương học..." />
                  </div>
                  <button type="submit" className="bg-blue border-blue-dark border-2 shadow-[0_2px_0_0_#1899d6] text-white px-4 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 active:translate-y-[2px] transition-all">
                    <Plus className="w-3.5 h-3.5" /> {editingUnitId ? 'Lưu Chương' : 'Tạo Chương'}
                  </button>
                </form>
              </div>

              {/* Lesson form */}
              <div className="border-2 border-[#e5e5e5] rounded-3xl p-5 bg-white shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base font-black font-outfit text-[#4b4b4b]">
                    {editingLessonId ? `Sửa Bài #${editingLessonId}` : '＋ Thêm Bài học'}
                  </h4>
                  {editingLessonId && (
                    <button onClick={resetLessonForm} className="text-xs flex items-center gap-0.5 text-red hover:underline">
                      <X className="w-3.5 h-3.5" /> Hủy
                    </button>
                  )}
                </div>
                <form onSubmit={handleSaveLesson} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-[#aaa] mb-1">Thuộc chương</label>
                    <select value={newLessonUnitId} onChange={e => setNewLessonUnitId(e.target.value)} className="w-full border-2 border-gray-border rounded-xl px-3 py-1.5 text-sm outline-none">
                      {units.map(u => <option key={u.id} value={u.id}>{u.title}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black uppercase text-[#aaa] mb-1">Tên bài học</label>
                      <input type="text" value={newLessonTitle} onChange={e => setNewLessonTitle(e.target.value)} className="w-full border-2 border-gray-border rounded-xl px-3 py-1.5 text-sm outline-none" placeholder="Bài 2: Thực hành" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-[#aaa] mb-1">Thứ tự</label>
                      <input type="number" value={newLessonOrder} onChange={e => setNewLessonOrder(e.target.value)} className="w-full border-2 border-gray-border rounded-xl px-3 py-1.5 text-sm outline-none" placeholder="1" required />
                    </div>
                  </div>
                  <button type="submit" className="bg-blue border-blue-dark border-2 shadow-[0_2px_0_0_#1899d6] text-white px-4 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 active:translate-y-[2px] transition-all">
                    <Plus className="w-3.5 h-3.5" /> {editingLessonId ? 'Lưu Bài học' : 'Tạo Bài học'}
                  </button>
                </form>
              </div>
            </div>

            {/* Col 2: Unit List (clickable) */}
            <div className="border-2 border-[#e5e5e5] rounded-3xl p-5 bg-white shadow-sm flex flex-col">
              <h5 className="font-black text-sm font-outfit text-[#4b4b4b] mb-3">📚 Danh sách Chương</h5>
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px]">
                {units.length === 0 && <p className="text-xs text-[#aaa] font-bold text-center py-8">Chưa có chương nào.</p>}
                {units.map(u => (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUnitId(u.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedUnitId === u.id
                        ? 'border-blue bg-[#e3f2fd]'
                        : 'border-[#e5e5e5] hover:border-[#aaa] bg-[#fafafa]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className={`font-black text-sm truncate ${selectedUnitId === u.id ? 'text-blue' : 'text-[#4b4b4b]'}`}>{u.title}</div>
                      <div className="text-xs text-[#aaa] font-bold">{u.lessons.length} bài • Thứ tự {u.orderIndex}</div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={e => { e.stopPropagation(); editUnit(u); }} className="p-1.5 border border-[#e5e5e5] rounded-xl hover:bg-gray-100 bg-white" title="Sửa">
                        <Edit className="w-3.5 h-3.5 text-blue" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); handleDeleteUnit(u.id); }} className="p-1.5 border border-[#e5e5e5] rounded-xl hover:bg-red-light bg-white" title="Xóa">
                        <Trash2 className="w-3.5 h-3.5 text-red" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Col 3: Lesson List (filtered by selected unit, click → question modal) */}
            <div className="border-2 border-[#e5e5e5] rounded-3xl p-5 bg-white shadow-sm flex flex-col">
              <h5 className="font-black text-sm font-outfit text-[#4b4b4b] mb-1">📖 Bài học trong chương</h5>
              <p className="text-[10px] text-[#aaa] font-bold mb-3">
                {selectedUnitId
                  ? `Đang xem: ${units.find(u => u.id === selectedUnitId)?.title}`
                  : 'Chọn một chương bên trái'}
              </p>
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px]">
                {(() => {
                  const selectedUnit = units.find(u => u.id === selectedUnitId);
                  const lessons = selectedUnit?.lessons || [];
                  if (!selectedUnit) return <p className="text-xs text-[#aaa] font-bold text-center py-8">← Chọn chương để xem bài học</p>;
                  if (lessons.length === 0) return <p className="text-xs text-[#aaa] font-bold text-center py-8">Chương này chưa có bài học.</p>;
                  return lessons.map(lesson => {
                    const lessonQuestions = questions.filter(q => q.lessonId === lesson.id);
                    return (
                      <div
                        key={lesson.id}
                        onClick={() => setLessonQuestionsModal({ lesson, questions: lessonQuestions })}
                        className="flex items-center justify-between p-3 rounded-2xl border-2 border-[#e5e5e5] hover:border-blue hover:bg-[#e3f2fd] bg-[#fafafa] cursor-pointer transition-all group"
                      >
                        <div className="min-w-0">
                          <div className="font-black text-sm text-[#4b4b4b] group-hover:text-blue truncate">{lesson.title}</div>
                          <div className="text-xs text-[#aaa] font-bold">
                            {lessonQuestions.length} câu hỏi • Thứ tự {lesson.orderIndex}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] font-black text-blue bg-blue-light/50 px-2 py-0.5 rounded-full">
                            Xem câu hỏi →
                          </span>
                          <button onClick={e => { e.stopPropagation(); editLesson(lesson); }} className="p-1.5 border border-[#e5e5e5] rounded-xl hover:bg-gray-100 bg-white" title="Sửa">
                            <Edit className="w-3.5 h-3.5 text-blue" />
                          </button>
                          <button onClick={e => { e.stopPropagation(); handleDeleteLesson(lesson.id); }} className="p-1.5 border border-[#e5e5e5] rounded-xl hover:bg-red-light bg-white" title="Xóa">
                            <Trash2 className="w-3.5 h-3.5 text-red" />
                          </button>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUBTAB 4: PDF UPLOAD */}
      {adminSubTab === 'pdf' && (
        <div className="max-w-2xl mx-auto border-2 border-[#e5e5e5] rounded-3xl p-6 bg-white shadow-sm font-nunito">
          <h4 className="text-lg font-black font-outfit mb-2 text-[#4b4b4b]">Tài liệu học tập</h4>
          <p className="text-xs text-[#aaa] mb-6">Tải lên các tài liệu hướng dẫn học tiếng Pali ở định dạng PDF để lưu trữ nội bộ.</p>
          
          <form onSubmit={handlePdfUpload} className="flex flex-col gap-4 border-b border-[#e5e5e5] pb-6 mb-6">
            <div>
              <label className="block text-xs font-black uppercase text-[#aaa] mb-2">Chọn file tài liệu (PDF hoặc Ảnh)</label>
              <input
                type="file"
                onChange={(e) => setPdfUploadFile(e.target.files[0])}
                className="w-full text-sm border-2 border-[#e5e5e5] rounded-2xl p-4 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-blue-light file:text-blue-dark file:cursor-pointer"
                accept=".pdf,image/*"
                required
              />
            </div>
            <button
              type="submit"
              className="w-fit bg-blue border-blue-dark border-2 shadow-[0_2px_0_0_#1899d6] text-white px-6 py-2.5 rounded-2xl font-black text-sm active:translate-y-[2px] transition-all"
            >
              TẢI TÀI LIỆU LÊN
            </button>
          </form>

          <h5 className="font-extrabold text-xs text-[#aaa] uppercase mb-3">Tài liệu lưu hành</h5>
          <div className="space-y-3">
            {uploadedDocs.map((doc, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-blue-light/30 border-2 border-blue-light rounded-2xl hover:border-blue transition-all"
              >
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:text-blue-dark transition-all overflow-hidden pr-4"
                >
                  <FileText className="w-5 h-5 text-blue-dark flex-shrink-0" />
                  <span className="font-extrabold text-sm text-[#4b4b4b] truncate">
                    {doc.name}
                  </span>
                </a>
                <button
                  onClick={() => handleDeleteDoc(doc.url)}
                  className="text-xs font-black text-red-dark hover:underline flex-shrink-0"
                  title="Xóa tài liệu"
                >
                  XÓA
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 5: PREVIEWER */}
      {adminSubTab === 'preview' && (
        <div className="max-w-xl mx-auto font-nunito">
          <div className="border-2 border-[#e5e5e5] rounded-3xl p-5 bg-white shadow-sm mb-6 font-nunito">
            <label className="block text-xs font-black uppercase text-[#aaa] mb-2">Chọn câu hỏi để xem trước (Preview)</label>
            <select
              value={previewQId}
              onChange={(e) => setPreviewQId(e.target.value)}
              className="w-full border-2 border-gray-border rounded-2xl px-4 py-3 outline-none font-nunito"
              id="preview-q-select"
            >
              {questions.length === 0 ? (
                <option value="">(Không có câu hỏi nào trong ngân hàng)</option>
              ) : (
                questions.map(q => {
                  let typeLabel = q.type === 'vocab' ? 'Trắc nghiệm' : (q.type === 'sentence_build' ? 'Sắp xếp thẻ' : 'Nhập tay');
                  return (
                    <option key={q.id} value={q.id}>
                      [{typeLabel}] - {q.content.substring(0, 45)}...
                    </option>
                  );
                })
              )}
            </select>
          </div>

          {/* Simulator Box */}
          <div className="border-4 border-dashed border-[#ddf4ff] rounded-3xl p-6 bg-white relative font-nunito">
            <span className="absolute -top-3.5 left-6 bg-blue-light border-2 border-blue text-blue-dark font-black text-[10px] tracking-wider uppercase px-3.5 py-0.5 rounded-full">
              Giao diện Học viên giả lập
            </span>

            {previewQuestion ? (
              <div className="pt-4" id="preview-area">
                <div className="text-sm font-black text-blue-dark uppercase tracking-widest mb-1">
                  {previewQuestion.type === 'vocab' && 'Chọn từ đúng'}
                  {previewQuestion.type === 'sentence_build' && 'Sắp xếp câu'}
                  {previewQuestion.type === 'manual_input' && 'Nhập câu trả lời'}
                </div>
                <h3 className="text-xl font-black text-[#4b4b4b] mb-4">{previewQuestion.content}</h3>
                {previewQuestion.imageUrl && (
                  <div className="text-2xl text-[#777] bg-[#f9f9f9] border rounded-2xl p-4 w-fit mb-4 mx-auto select-none">
                    {previewQuestion.imageUrl}
                  </div>
                )}

                {/* Vocab Option List */}
                {previewQuestion.type === 'vocab' && (
                  <div className="grid grid-cols-1 gap-2.5 my-6">
                    {(() => {
                      const corrects = Array.isArray(previewQuestion.correctAnswers) ? previewQuestion.correctAnswers : JSON.parse(previewQuestion.correctAnswers || '[]');
                      const dists = Array.isArray(previewQuestion.distractors) ? previewQuestion.distractors : JSON.parse(previewQuestion.distractors || '[]');
                      const options = [...corrects, ...dists].sort((a,b) => a.localeCompare(b));

                      return options.map((opt, oIdx) => {
                        const isSelected = previewSelectedAnswer === opt;
                        const isCorrectAnswer = opt === corrects[0];
                        
                        let btnClass = 'border-gray-border bg-white text-[#4b4b4b] hover:bg-gray-50';
                        if (isSelected) {
                          btnClass = 'border-blue bg-blue-light text-blue-dark';
                        }
                        if (previewAnswered) {
                          if (isCorrectAnswer) btnClass = 'border-green bg-green-light text-green-dark';
                          else if (isSelected) btnClass = 'border-red bg-[#fce4ec] text-red-dark';
                        }

                        return (
                          <button
                            key={oIdx}
                            onClick={() => selectPrevAnswer(opt)}
                            disabled={previewAnswered}
                            className={`w-full text-left font-bold font-nunito border-2 rounded-2xl py-3 px-4 transition-all text-sm ${btnClass}`}
                          >
                            {opt}
                          </button>
                        );
                      });
                    })()}
                  </div>
                )}

                {/* Sentence Builder Option List */}
                {previewQuestion.type === 'sentence_build' && (
                  <div className="my-6">
                    <div className="border-b-2 border-gray-border min-h-[50px] pb-2 mb-4 flex flex-wrap gap-2 items-center">
                      {previewSelectedWords.length === 0 ? (
                        <span className="text-[#bbb] text-xs font-bold mx-auto italic">Nhấp các từ bên dưới...</span>
                      ) : (
                        previewSelectedWords.map((card, idx) => (
                          <button
                            key={idx}
                            onClick={() => removeWordFromPrevSlots(idx)}
                            disabled={previewAnswered}
                            className={`word-block-card text-xs ${
                              previewAnswered 
                                ? (previewFeedback?.correct ? 'border-green bg-green-light text-green-dark' : 'border-red bg-[#fce4ec] text-red-dark')
                                : 'border-gray-border text-text'
                            }`}
                          >
                            {card.word}
                          </button>
                        ))
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {previewPoolWords.map((card) => (
                        <button
                          key={card.id}
                          onClick={() => addWordToPrevSlots(card)}
                          disabled={previewAnswered || card.used}
                          className={`word-block-card text-xs ${card.used ? 'placed' : 'border-gray-border text-text'}`}
                        >
                          {card.word}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Manual Input Option */}
                {previewQuestion.type === 'manual_input' && (
                  <div className="my-6 font-nunito">
                    <input
                      type="text"
                      value={previewTypeInput}
                      onChange={(e) => setPreviewTypeInput(e.target.value)}
                      disabled={previewAnswered}
                      className={`w-full border-2 rounded-2xl px-4 py-3 outline-none focus:border-blue transition-all font-nunito ${
                        previewAnswered 
                          ? (previewFeedback?.correct ? 'border-green bg-green-light' : 'border-red bg-[#fce4ec]') 
                          : 'border-gray-border'
                      }`}
                      placeholder="Nhập câu dịch tiếng Pali..."
                      id="prev-type-inp"
                    />
                    {!previewAnswered && (
                      <PaliKeyboard 
                        inputId="prev-type-inp" 
                        onKeyPress={(val) => setPreviewTypeInput(val)} 
                      />
                    )}
                  </div>
                )}

                {/* Checker control buttons */}
                <div className="flex gap-4 items-center">
                  <button
                    onClick={checkPreviewAnswer}
                    disabled={
                      previewAnswered ||
                      (previewQuestion.type === 'vocab' && !previewSelectedAnswer) ||
                      (previewQuestion.type === 'sentence_build' && previewSelectedWords.length === 0) ||
                      (previewQuestion.type === 'manual_input' && !previewTypeInput.trim())
                    }
                    className="flex-1 bg-green border-green-dark border-2 shadow-[0_4px_0_0_#46a302] text-white py-3 px-6 rounded-2xl font-black hover:bg-[#46a302] disabled:opacity-50 disabled:pointer-events-none transition-all btn-3d"
                  >
                    KIỂM TRA
                  </button>
                  {previewAnswered && (
                    <button
                      onClick={() => resetPreviewInteractiveState(previewQuestion)}
                      className="bg-white border-2 border-[#e5e5e5] text-text p-3 rounded-2xl shadow-[0_4px_0_0_#e5e5e5] active:translate-y-1 hover:bg-gray-50 active:shadow-none"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {previewFeedback && (
                  <div 
                    className={`mt-6 p-4 rounded-2xl border-2 flex gap-3 items-start ${
                      previewFeedback.correct 
                        ? 'bg-green-light border-green text-green-dark' 
                        : 'bg-[#fce4ec] border-red text-red-dark'
                    }`}
                    id="preview-feedback"
                  >
                    <span className="text-2xl">{previewFeedback.correct ? '🎉' : '💔'}</span>
                    <div>
                      <div className="font-black text-sm">{previewFeedback.correct ? 'Chính xác!' : 'Chưa đúng rồi!'}</div>
                      <div className="text-xs whitespace-pre-wrap mt-0.5">{previewFeedback.message}</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-[#aaa] py-12">Không tìm thấy thông tin câu hỏi để xem trước.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
