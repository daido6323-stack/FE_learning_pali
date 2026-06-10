import React, { useState, useEffect } from 'react';
import PaliKeyboard from '../components/PaliKeyboard';
import { apiFetch } from '../lib/api';

export default function Lesson({ 
  lessonId, 
  practiceQuestions, // Optional, for quick practice mode
  onFinishLesson, 
  onExit 
}) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Lesson state variables
  const [idx, setIdx] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [correctCount, setCorrectCount] = useState(0);
  
  const [selectedAnswer, setSelectedAnswer] = useState(null); // MC
  const [selectedWords, setSelectedWords] = useState([]); // Sentence build
  const [poolWords, setPoolWords] = useState([]); // Sentence build
  const [typeInput, setTypeInput] = useState(''); // Manual Input
  
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [failed, setFailed] = useState(false);

  // Load questions for lesson or quick practice
  useEffect(() => {
    const fetchQuestions = async () => {
      if (practiceQuestions) {
        setQuestions(practiceQuestions);
        initializeQuestionState(practiceQuestions[0]);
        setLoading(false);
        return;
      }
      
      try {
        const response = await apiFetch(`/api/lessons/${lessonId}/questions`);
        if (response.ok) {
          const data = await response.json();
          setQuestions(data);
          if (data.length > 0) {
            initializeQuestionState(data[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching questions:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [lessonId, practiceQuestions]);

  const initializeQuestionState = (q) => {
    setSelectedAnswer(null);
    setSelectedWords([]);
    setTypeInput('');
    setAnswered(false);
    
    if (!q) return;

    // Database returns Json fields for correctAnswers and distractors
    const corrects = Array.isArray(q.correctAnswers) ? q.correctAnswers : JSON.parse(q.correctAnswers || '[]');
    
    if (q.type === 'sentence_build') {
      const dists = Array.isArray(q.distractors) ? q.distractors : JSON.parse(q.distractors || '[]');
      const combined = [...corrects, ...dists];
      
      // Shuffle words
      setPoolWords(
        combined
          .sort(() => Math.random() - 0.5)
          .map((w, index) => ({ id: index, word: w, used: false }))
      );
    }
  };

  const currentQ = questions[idx];

  // ----- INPUT INTERACTIVES -----
  const selectAnswer = (opt) => {
    if (answered) return;
    setSelectedAnswer(opt);
  };

  const addWordToSlots = (card) => {
    if (answered || card.used) return;
    setPoolWords(poolWords.map(w => w.id === card.id ? { ...w, used: true } : w));
    setSelectedWords([...selectedWords, card]);
  };

  const removeWordFromSlots = (index) => {
    if (answered) return;
    const card = selectedWords[index];
    setPoolWords(poolWords.map(w => w.id === card.id ? { ...w, used: false } : w));
    const newSelected = [...selectedWords];
    newSelected.splice(index, 1);
    setSelectedWords(newSelected);
  };

  // ----- VALIDATE ANSWERS -----
  const checkAnswer = () => {
    if (answered || !currentQ) return;
    
    const corrects = Array.isArray(currentQ.correctAnswers) ? currentQ.correctAnswers : JSON.parse(currentQ.correctAnswers || '[]');
    let correct = false;

    if (currentQ.type === 'vocab') {
      correct = selectedAnswer === corrects[0];
    } else if (currentQ.type === 'sentence_build') {
      correct = 
        selectedWords.length === corrects.length &&
        selectedWords.every((w, index) => w.word === corrects[index]);
    } else if (currentQ.type === 'manual_input') {
      const normalize = (str) => 
        str.trim()
           .toLowerCase()
           .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '')
           .replace(/\s+/g, ' ');
      const cleanInput = normalize(typeInput);
      const cleanCorrects = corrects.map(c => normalize(c));
      correct = cleanCorrects.includes(cleanInput);
    }

    setIsCorrect(correct);
    setAnswered(true);

    if (correct) {
      setCorrectCount(prev => prev + 1);
    } else {
      setHearts(prev => {
        const nextHearts = Math.max(0, prev - 1);
        if (nextHearts <= 0) {
          // Trigger failure immediately after user reads feedback
          setFailed(true);
        }
        return nextHearts;
      });
    }
  };

  const handleContinue = () => {
    if (hearts <= 0) {
      setShowEndScreen(true);
      return;
    }

    if (idx + 1 >= questions.length) {
      setShowEndScreen(true);
    } else {
      const nextIdx = idx + 1;
      setIdx(nextIdx);
      initializeQuestionState(questions[nextIdx]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue border-t-transparent mx-auto mb-4"></div>
          <p className="font-extrabold text-blue-dark">Đang tải câu hỏi...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
        <div>
          <div className="text-5xl mb-4">😿</div>
          <h3 className="text-xl font-black text-text">Bài học trống</h3>
          <p className="text-sm text-[#888] mt-2 mb-6">Xin lỗi, bài học này chưa được cấu hình câu hỏi nào trong ngân hàng.</p>
          <button
            onClick={onExit}
            className="bg-[#1cb0f6] border-[#1899d6] border-2 shadow-[0_4px_0_0_#1899d6] text-white py-3 px-8 rounded-2xl font-black active:translate-y-1 active:shadow-none"
          >
            QUAY LẠI LỘ TRÌNH
          </button>
        </div>
      </div>
    );
  }

  // ----- RESULT SCREEN VIEWS -----
  if (showEndScreen) {
    const accuracy = Math.round((correctCount / questions.length) * 100);
    const xpEarned = failed ? 0 : correctCount * 10 + (correctCount === questions.length ? 20 : 0);

    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="text-8xl mb-6">{failed ? '😢' : '🦉🎉'}</div>
          
          <h2 className="text-3xl font-black font-outfit text-text mb-2">
            {failed ? 'Thất bại rồi!' : 'Bài học hoàn thành!'}
          </h2>
          <p className="text-[#888] font-bold text-sm mb-8">
            {failed 
              ? 'Bạn đã hết sạch tim mất rồi. Hãy luyện tập lại nhé!' 
              : 'Tuyệt vời! Bạn đã hoàn thành xuất sắc các thử thách.'}
          </p>

          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="border-2 border-[#e5e5e5] rounded-3xl p-4">
              <span className="text-2xl">🏆</span>
              <div className="text-xl font-black mt-2">+{xpEarned}</div>
              <div className="text-[10px] text-[#aaa] font-bold uppercase tracking-wider">Kinh nghiệm</div>
            </div>
            <div className="border-2 border-[#e5e5e5] rounded-3xl p-4">
              <span className="text-2xl">🎯</span>
              <div className="text-xl font-black mt-2">{accuracy}%</div>
              <div className="text-[10px] text-[#aaa] font-bold uppercase tracking-wider">Chính xác</div>
            </div>
            <div className="border-2 border-[#e5e5e5] rounded-3xl p-4">
              <span className="text-2xl">❤️</span>
              <div className="text-xl font-black mt-2">{hearts}</div>
              <div className="text-[10px] text-[#aaa] font-bold uppercase tracking-wider">Trái tim</div>
            </div>
          </div>

          <button
            onClick={() => onFinishLesson(xpEarned, failed)}
            className={`w-full py-4 rounded-2xl font-black transition-all btn-3d border-2 text-white ${
              failed 
                ? 'bg-red border-red-dark shadow-[0_4px_0_0_#ea2b2b]' 
                : 'bg-green border-green-dark shadow-[0_4px_0_0_#46a302]'
            }`}
          >
            {failed ? 'QUAY LẠI' : 'TIẾP TỤC'}
          </button>
        </div>
      </div>
    );
  }

  // Shuffled MC options helper
  const corrects = Array.isArray(currentQ.correctAnswers) ? currentQ.correctAnswers : JSON.parse(currentQ.correctAnswers || '[]');
  const correctVal = corrects[0];

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between select-none">
      
      {/* 1. TOP NAVBAR STATS */}
      <header className="max-w-4xl mx-auto w-full px-4 pt-8 flex items-center justify-between gap-6">
        <button
          onClick={onExit}
          className="text-[#aaa] font-black text-2xl hover:text-text"
          title="Thoát bài học"
        >
          ✕
        </button>
        
        {/* Progress bar */}
        <div className="flex-1 h-4 bg-[#e5e5e5] rounded-full overflow-hidden">
          <div 
            className="h-full bg-green transition-all duration-300 rounded-full" 
            style={{ width: `${(idx / questions.length) * 100}%` }}
          ></div>
        </div>

        {/* Hearts list display */}
        <div className="flex items-center gap-1.5 text-red text-xl font-extrabold">
          <span>❤️</span>
          <span>{hearts}</span>
        </div>
      </header>

      {/* 2. QUIZ BODY AREA */}
      <main className="max-w-xl mx-auto w-full px-4 flex-1 flex flex-col justify-center py-12">
        <div className="text-sm font-black text-blue-dark uppercase tracking-widest mb-1.5">
          {currentQ.type === 'vocab' && 'Chọn từ đúng'}
          {currentQ.type === 'sentence_build' && 'Sắp xếp câu'}
          {currentQ.type === 'manual_input' && 'Nhập câu dịch Pali'}
        </div>
        <h3 className="text-2xl font-black text-text mb-6">{currentQ.content}</h3>

        {currentQ.imageUrl && (
          <div className="text-3xl text-text bg-gray-50 border-2 border-[#e5e5e5] rounded-3xl p-6 w-fit mb-6 mx-auto">
            {currentQ.imageUrl}
          </div>
        )}

        {/* Exercises render switch */}

        {/* Case 1: Vocabulary multiple choice */}
        {currentQ.type === 'vocab' && (
          <div className="grid grid-cols-1 gap-3">
            {(() => {
              const dists = Array.isArray(currentQ.distractors) ? currentQ.distractors : JSON.parse(currentQ.distractors || '[]');
              const opts = [correctVal, ...dists].sort((a,b) => a.localeCompare(b));
              
              return opts.map((opt, oIdx) => {
                const isSelected = selectedAnswer === opt;
                let btnClass = 'border-[#e5e5e5] hover:bg-gray-50';
                
                if (isSelected) {
                  btnClass = 'border-blue bg-blue-light text-blue-dark';
                }
                
                if (answered) {
                  if (opt === correctVal) {
                    btnClass = 'border-green bg-green-light text-green-dark';
                  } else if (isSelected) {
                    btnClass = 'border-red bg-[#fce4ec] text-red-dark';
                  } else {
                    btnClass = 'border-[#e5e5e5] opacity-50';
                  }
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => selectAnswer(opt)}
                    disabled={answered}
                    className={`w-full text-left border-2 rounded-2xl p-4 font-bold text-sm sm:text-base transition-all select-none shadow-[0_2px_0_0_rgba(0,0,0,0.02)] ${btnClass}`}
                  >
                    {opt}
                  </button>
                );
              });
            })()}
          </div>
        )}

        {/* Case 2: Sentence Builder cards builder */}
        {currentQ.type === 'sentence_build' && (
          <div className="space-y-6">
            {/* Selected cards slots container */}
            <div className="border-b-2 border-[#e5e5e5] min-h-[60px] pb-3 flex flex-wrap gap-2 items-center">
              {selectedWords.length === 0 ? (
                <span className="text-[#ccc] font-bold text-sm mx-auto select-none italic">
                  Nhấp vào các thẻ để ghép câu...
                </span>
              ) : (
                selectedWords.map((card, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => removeWordFromSlots(sIdx)}
                    disabled={answered}
                    className={`word-block-card text-sm ${
                      answered 
                        ? (isCorrect ? 'border-green bg-green-light text-green-dark shadow-none' : 'border-red bg-[#fce4ec] text-red-dark shadow-none')
                        : 'shadow-[0_2px_0_0_#e5e5e5]'
                    }`}
                  >
                    {card.word}
                  </button>
                ))
              )}
            </div>

            {/* Scrambled pool */}
            <div className="flex flex-wrap gap-2.5 justify-center">
              {poolWords.map((card) => (
                <button
                  key={card.id}
                  onClick={() => addWordToSlots(card)}
                  disabled={answered || card.used}
                  className={`word-block-card text-sm shadow-[0_4px_0_0_#e5e5e5] ${
                    card.used ? 'placed shadow-none' : 'hover:bg-gray-50'
                  }`}
                >
                  {card.word}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Case 3: Manual input field */}
        {currentQ.type === 'manual_input' && (
          <div>
            <textarea
              value={typeInput}
              onChange={(e) => setTypeInput(e.target.value)}
              disabled={answered}
              rows={3}
              className={`w-full border-2 rounded-2xl p-4 font-bold text-base outline-none focus:border-blue transition-all ${
                answered 
                  ? (isCorrect ? 'border-green bg-green-light' : 'border-red bg-[#fce4ec]') 
                  : 'border-[#e5e5e5]'
              }`}
              placeholder="Nhập câu dịch Pali..."
              id="type-inp"
            />
            
            {!answered && (
              <PaliKeyboard 
                inputId="type-inp" 
                onKeyPress={(val) => setTypeInput(val)} 
              />
            )}
          </div>
        )}
      </main>

      {/* 3. FOOTER CONTROLLER / ACTION SLIDER FEEDBACK BAR */}
      <footer className={`border-t border-[#e5e5e5] py-6 px-4 md:px-8 transition-all ${
        answered 
          ? (isCorrect ? 'bg-green-light/80 border-green' : 'bg-[#fdf0f0]/90 border-red') 
          : 'bg-white'
      }`}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Response Text block */}
          {answered ? (
            <div className="flex items-start gap-3 flex-1 select-none">
              <span className="text-3xl">{isCorrect ? '🎉' : '💔'}</span>
              <div>
                <h4 className={`text-base font-black ${isCorrect ? 'text-green-dark' : 'text-red-dark'}`}>
                  {isCorrect ? 'Chính xác! Cố lên.' : 'Chưa chính xác.'}
                </h4>
                <p className="text-xs text-[#555] font-extrabold mt-1">
                  {!isCorrect && `Đáp án đúng mẫu: "${correctVal}". `}
                  {currentQ.explanation}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 hidden sm:block text-xs font-bold text-[#aaa] uppercase tracking-wider">
              Chọn hoặc gõ đáp án của bạn
            </div>
          )}

          {/* Action trigger button */}
          <button
            onClick={answered ? handleContinue : checkAnswer}
            disabled={
              (!answered && currentQ.type === 'vocab' && !selectedAnswer) ||
              (!answered && currentQ.type === 'sentence_build' && selectedWords.length === 0) ||
              (!answered && currentQ.type === 'manual_input' && !typeInput.trim())
            }
            className={`w-full sm:w-auto px-10 py-3.5 rounded-2xl font-black transition-all btn-3d border-2 text-white ${
              answered 
                ? (isCorrect 
                    ? 'bg-green border-green-dark shadow-[0_4px_0_0_#46a302] hover:bg-green-dark' 
                    : 'bg-red border-red-dark shadow-[0_4px_0_0_#ea2b2b] hover:bg-[#ea2b2b]') 
                : 'bg-green border-green-dark shadow-[0_4px_0_0_#46a302] disabled:opacity-50 disabled:pointer-events-none'
            }`}
          >
            {answered ? 'TIẾP TỤC' : 'KIỂM TRA'}
          </button>
        </div>
      </footer>
    </div>
  );
}
