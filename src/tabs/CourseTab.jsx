import React from 'react';
import { Lock } from 'lucide-react';

export default function CourseTab({ units, userProgress, onStartLesson }) {
  const isUnitCompleted = (uid) => {
    const unitLessons = units.find(u => u.id === uid)?.lessons || [];
    if (unitLessons.length === 0) return false;
    return unitLessons.every(l => userProgress.some(p => p.lessonId === l.id && p.isCompleted));
  };

  return (
    <div className="max-w-md mx-auto py-4">
      <div className="space-y-12">
        {units.map((unit, uIdx) => {
          let isUnitUnlocked = uIdx === 0;
          if (uIdx > 0) {
            isUnitUnlocked = isUnitCompleted(units[uIdx - 1].id);
          }

          return (
            <div key={unit.id} className={isUnitUnlocked ? '' : 'opacity-50'}>
              {/* Unit banner header */}
              <div className="bg-[#58cc02] text-white p-5 rounded-3xl mb-8 shadow-[0_4px_0_0_#46a302] border-2 border-[#46a302] font-nunito">
                <div className="text-xs uppercase font-extrabold tracking-wider opacity-80">Chương {unit.orderIndex}</div>
                <h3 className="text-xl font-black font-outfit mt-0.5">{unit.title}</h3>
                <p className="text-sm mt-1 opacity-90">{unit.description}</p>
              </div>

              {/* Lesson path node link */}
              <div className="flex flex-col items-center gap-4 relative">
                {unit.lessons.length === 0 && (
                  <div className="text-sm text-[#888] font-bold bg-[#f7f7f7] border border-[#e5e5e5] px-4 py-3 rounded-2xl w-full text-center">
                    (Chưa có bài học nào được cấu hình)
                  </div>
                )}
                
                {unit.lessons.map((lesson, lIdx) => {
                  const isCompleted = userProgress.some(p => p.lessonId === lesson.id && p.isCompleted);
                  
                  let isUnlocked = isUnitUnlocked;
                  if (isUnitUnlocked && lIdx > 0) {
                    const prevLesson = unit.lessons[lIdx - 1];
                    isUnlocked = userProgress.some(p => p.lessonId === prevLesson.id && p.isCompleted);
                  }

                  let nodeClass = 'bg-[#e5e5e5] border-[#ccc] text-[#aaa] cursor-not-allowed';
                  let onClick = null;

                  if (isUnlocked) {
                    if (isCompleted) {
                      nodeClass = 'bg-green border-green-dark text-white hover:bg-green-dark shadow-[0_6px_0_0_#46a302]';
                    } else {
                      const colors = [
                        'bg-blue border-blue-dark text-white shadow-[0_6px_0_0_#1899d6]', 
                        'bg-purple border-purple-dark text-white shadow-[0_6px_0_0_#aa60eb]', 
                        'bg-yellow border-yellow-dark text-white shadow-[0_6px_0_0_#e6b400]'
                      ];
                      nodeClass = colors[lIdx % colors.length];
                    }
                    onClick = () => onStartLesson(lesson.id);
                  }

                  return (
                    <div key={lesson.id} className="flex flex-col items-center w-full">
                      <button
                        onClick={onClick}
                        disabled={!isUnlocked}
                        className={`w-20 h-20 rounded-full border-2 flex items-center justify-center font-black text-2xl transition-all btn-3d ${nodeClass}`}
                        title={lesson.title}
                      >
                        {!isUnlocked ? <Lock className="w-7 h-7" /> : (isCompleted ? '⭐' : '📖')}
                      </button>
                      <span className="text-xs font-black text-[#888] mt-2 max-w-[150px] text-center truncate">
                        {lesson.title}
                      </span>
                      
                      {lIdx < unit.lessons.length - 1 && (
                        <div className="w-1.5 h-10 bg-[#e5e5e5] my-2 rounded-full"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
