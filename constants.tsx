import React, { useState, useEffect } from 'react';
import { Calendar, X, Search, ChevronRight } from 'lucide-react';

interface SeasonalRecommendationProps {
  onSearch: (term: string) => void;
}

interface Recommendation {
  title: string;
  dish: string;
  reason: string;
  color: string;
}

export const SeasonalRecommendation: React.FC<SeasonalRecommendationProps> = ({ onSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rec, setRec] = useState<Recommendation | null>(null);

  useEffect(() => {
    const today = new Date();
    const month = today.getMonth() + 1; // 1-12
    const day = today.getDate();

    let recommendation: Recommendation = {
      title: '今日推荐',
      dish: '红烧肉',
      reason: '经典美味，百吃不厌',
      color: 'bg-orange-500'
    };

    // Special Dates
    if (month === 12 && day === 24) {
      recommendation = { title: '平安夜', dish: '拔丝地瓜', reason: '虽然不是苹果，但甜甜蜜蜜过平安夜', color: 'bg-red-500' };
    } else if (month === 1 && day < 20) { 
      // Simplified Laba approximation
      recommendation = { title: '腊八时节', dish: '杂粮粥', reason: '过了腊八就是年，喝碗热粥暖暖胃', color: 'bg-red-600' };
    } else if ((month === 11 && day === 7) || (month === 11 && day === 8)) {
       recommendation = { title: '立冬', dish: '猪肉白菜饺子', reason: '立冬不端饺子碗，冻掉耳朵没人管', color: 'bg-blue-500' };
    } 
    // Seasons
    else if (month >= 3 && month <= 5) {
      recommendation = { title: '春季时令', dish: '清炒时蔬', reason: '春日尝鲜，清脆爽口', color: 'bg-green-500' };
    } else if (month >= 6 && month <= 8) {
      recommendation = { title: '炎炎夏日', dish: '西瓜汁', reason: '消暑解渴，清凉一夏', color: 'bg-red-400' };
    } else if (month >= 9 && month <= 11) {
      recommendation = { title: '秋季进补', dish: '红烧肉', reason: '秋风起，贴秋膘', color: 'bg-amber-600' };
    } else {
      // Winter
      recommendation = { title: '冬日暖身', dish: '酸辣汤', reason: '寒冬腊月，暖心暖胃', color: 'bg-orange-600' };
    }

    setRec(recommendation);
  }, []);

  if (!rec) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 bg-white rounded-xl shadow-xl border border-gray-100 p-4 w-64 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex justify-between items-start mb-2">
            <span className={`text-xs font-bold text-white px-2 py-0.5 rounded-full ${rec.color}`}>
              {rec.title}
            </span>
            <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">{rec.dish}</h3>
          <p className="text-sm text-gray-500 mb-3">{rec.reason}</p>
          <button 
            onClick={() => { onSearch(rec.dish); setIsOpen(false); }}
            className="w-full flex items-center justify-center px-3 py-2 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors"
          >
            <Search className="w-3.5 h-3.5 mr-1.5" />
            去看看做法
          </button>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg text-white transition-transform hover:scale-105 active:scale-95 ${isOpen ? 'bg-gray-600 rotate-90' : 'bg-orange-600'}`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Calendar className="w-6 h-6" />}
      </button>
    </div>
  );
};
