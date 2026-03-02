import React, { useState, useEffect } from 'react';
import { Recipe } from '../types';
import { Clock, BarChart, ArrowLeft, Pencil, Trash2, Eye, Star, Users, Flame, Timer, Play, Pause, X, Sparkles, ChefHat, PlusCircle } from 'lucide-react';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleFavorite: () => void;
  onToggleTry: () => void;
}

interface ActiveTimer {
  id: string;
  label: string;
  duration: number; // in seconds
  remaining: number; // in seconds
  isRunning: boolean;
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onBack, onEdit, onDelete, onToggleFavorite, onToggleTry }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isTryAnimating, setIsTryAnimating] = useState(false);
  
  // Portion Calculator State
  const [servingCount, setServingCount] = useState<number>(2); // Default to 2 servings
  const [customServing, setCustomServing] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Timer State
  const [timers, setTimers] = useState<ActiveTimer[]>([]);
  const [manualTimerMinutes, setManualTimerMinutes] = useState('');
  const [isAddingTimer, setIsAddingTimer] = useState(false);

  // Timer Tick Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prevTimers => {
        return prevTimers.map(timer => {
          if (timer.isRunning && timer.remaining > 0) {
            return { ...timer, remaining: timer.remaining - 1 };
          }
          return timer;
        });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Cleanup completed timers or handle alarms (simplified here)
  useEffect(() => {
    timers.forEach(timer => {
      if (timer.remaining === 0 && timer.isRunning) {
        // In a real app, play a sound here
        alert(`${timer.label} 计时结束！`);
        setTimers(prev => prev.map(t => t.id === timer.id ? { ...t, isRunning: false } : t));
      }
    });
  }, [timers]);


  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault(); 
    if (onDelete) {
       onDelete();
    }
  };

  const handleFavoriteClick = () => {
    onToggleFavorite();
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleTryClick = () => {
    onToggleTry();
    setIsTryAnimating(true);
    setTimeout(() => setIsTryAnimating(false), 300);
  };

  // --- Portion Logic ---
  const handleServingChange = (count: number) => {
    setServingCount(count);
    setIsCustomMode(false);
    setCustomServing(''); // clear custom input when using presets
  };

  const handleCustomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomServing(val);
    const num = parseInt(val);
    if (!isNaN(num) && num > 0) {
        setServingCount(num);
    }
  };

  const scaleIngredient = (ingredient: string): string => {
    const defaultServing = 2; // Assuming original recipes are roughly for 2 people
    const ratio = servingCount / defaultServing;
    
    if (ratio === 1) return ingredient;

    // Regex to find numbers at start of string or following a space
    // Handles integers and decimals. e.g. "500g" "1.5勺" "1/2个"(simplified to decimals for AI gen)
    return ingredient.replace(/(\d+(\.\d+)?)/g, (match) => {
        const val = parseFloat(match);
        if (isNaN(val)) return match;
        const newVal = val * ratio;
        // Format: remove trailing zeros if integer, otherwise 1 decimal place
        return newVal % 1 === 0 ? newVal.toFixed(0) : newVal.toFixed(1);
    });
  };

  // --- Timer Logic ---
  const startTimer = (durationSec: number, label: string) => {
    const newTimer: ActiveTimer = {
        id: crypto.randomUUID(),
        label,
        duration: durationSec,
        remaining: durationSec,
        isRunning: true
    };
    setTimers(prev => [...prev, newTimer]);
  };

  const toggleTimer = (id: string) => {
    setTimers(prev => prev.map(t => t.id === id ? { ...t, isRunning: !t.isRunning } : t));
  };

  const removeTimer = (id: string) => {
    setTimers(prev => prev.filter(t => t.id !== id));
  };

  const handleAddManualTimer = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseFloat(manualTimerMinutes);
    if (!isNaN(mins) && mins > 0) {
      startTimer(mins * 60, `自定义计时 (${mins}分钟)`);
      setManualTimerMinutes('');
      setIsAddingTimer(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Parsing instructions to add clickable timers
  const renderInstructionWithTimers = (text: string, stepIndex: number) => {
    // Regex to capture Chinese time durations: e.g. "30分钟", "1.5小时", "45秒"
    // Capturing groups: 1: number, 2: unit
    const timeRegex = /(\d+(?:\.\d+)?)\s*(分钟|小时|秒)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = timeRegex.exec(text)) !== null) {
        // Push text before match
        if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index));
        }

        const num = parseFloat(match[1]);
        const unit = match[2];
        let seconds = 0;
        if (unit === '分钟') seconds = num * 60;
        else if (unit === '小时') seconds = num * 3600;
        else if (unit === '秒') seconds = num;

        parts.push(
            <button
                key={`${stepIndex}-${match.index}`}
                onClick={() => startTimer(seconds, `步骤 ${stepIndex + 1}`)}
                className="inline-flex items-center mx-1 px-1.5 py-0.5 rounded-md bg-orange-100 text-orange-700 font-bold border border-orange-200 hover:bg-orange-200 hover:scale-105 transition-all text-sm align-baseline cursor-pointer"
                title="点击开始计时"
            >
                <Timer className="w-3 h-3 mr-1" />
                {match[0]}
            </button>
        );

        lastIndex = timeRegex.lastIndex;
    }

    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
    }

    return <>{parts}</>;
  };

  return (
    <div className="bg-white min-h-full pb-24 relative">
      {/* Floating Buttons (Fixed) - Increased Z-Index to z-[60] to stay above header */}
      <div className="fixed top-24 left-6 z-[60]">
        <button 
          onClick={onBack}
          className="flex items-center justify-center w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-2xl border border-white/50 text-gray-700 hover:text-orange-600 hover:scale-110 transition-all duration-300"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>
      
      <div className="fixed top-24 right-6 z-[60] flex gap-3">
          {onEdit && (
            <button 
              onClick={onEdit}
              className="flex items-center justify-center w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-2xl border border-white/50 text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:scale-110 transition-all duration-300"
              title="编辑食谱"
            >
              <Pencil className="w-5 h-5" />
            </button>
          )}
          {onDelete && (
            <button 
              onClick={handleDelete}
              className="flex items-center justify-center w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-2xl border border-white/50 text-gray-700 hover:text-red-600 hover:bg-red-50 hover:scale-110 transition-all duration-300"
              title="删除食谱"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
      </div>

      {/* Header Image Area - Expanded Height & Saturation */}
      <div className="h-[400px] sm:h-[500px] w-full bg-gray-100 flex items-center justify-center relative overflow-hidden group">
        {recipe.image ? (
          <img 
            src={recipe.image} 
            alt={recipe.name} 
            className="w-full h-full object-cover saturate-[1.15] transition-transform duration-700 hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-100 via-yellow-100 to-orange-50 flex items-center justify-center">
             <span className="text-8xl opacity-20 select-none animate-bounce">🍲</span>
          </div>
        )}

        {/* Title Overlay with Glassmorphism */}
        <div className="absolute bottom-0 left-0 right-0 p-8 pt-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
             <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl sm:text-5xl font-extrabold drop-shadow-xl tracking-tight mb-2">{recipe.name}</h1>
                {/* Health Tags */}
                {recipe.tags && recipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {recipe.tags.map((tag, idx) => (
                      <span key={idx} className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center">
                        {['低卡', '减脂'].some(k => tag.includes(k)) && <Flame className="w-3 h-3 mr-1 text-yellow-300" />}
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
             </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 ring-1 ring-black/5">
          
          <div className="flex flex-wrap gap-4 mb-8 items-center border-b border-gray-100 pb-6">
            <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-2xl border border-orange-100 text-orange-700">
              <Clock className="w-5 h-5" />
              <span className="font-bold">{recipe.cookingTime || '未知时间'}</span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border font-bold ${
                recipe.difficulty === 'Easy' ? 'bg-green-50 border-green-100 text-green-700' : 
                recipe.difficulty === 'Medium' ? 'bg-yellow-50 border-yellow-100 text-yellow-700' :
                'bg-red-50 border-red-100 text-red-700'
            }`}>
              <BarChart className="w-5 h-5" />
              <span>{recipe.difficulty === 'Easy' ? '简单难度' : recipe.difficulty === 'Medium' ? '中等难度' : '高难度'}</span>
            </div>
            
            <div className="ml-auto flex items-center gap-3">
               <button 
                 onClick={handleTryClick}
                 className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 shadow-sm ${
                   recipe.isTry 
                     ? 'bg-indigo-50 border-indigo-300 text-indigo-600 shadow-indigo-100' 
                     : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                 } ${isTryAnimating ? 'scale-110' : ''}`}
                 title="先存着，以后学着做"
               >
                 <Sparkles className={`w-5 h-5 ${recipe.isTry ? 'text-indigo-500' : 'text-gray-300'}`} />
                 <span className={`font-bold ${recipe.isTry ? 'text-indigo-700' : ''}`}>
                   {recipe.isTry ? '挑战中' : 'try 一 try'}
                 </span>
               </button>

               <button 
                 onClick={handleFavoriteClick}
                 className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 shadow-sm ${
                   recipe.isFavorite 
                     ? 'bg-yellow-50 border-yellow-300 text-yellow-600 shadow-yellow-100' 
                     : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                 } ${isAnimating ? 'scale-110' : ''}`}
               >
                 <Star className={`w-5 h-5 ${recipe.isFavorite ? 'fill-current text-yellow-500' : 'text-gray-300'}`} />
                 <span className={`font-bold ${recipe.isFavorite ? 'text-yellow-700' : ''}`}>
                   {recipe.isFavorite ? '已收藏' : '收藏'}
                 </span>
               </button>
               <div className="flex items-center gap-1.5 text-gray-400 font-medium px-2">
                 <Eye className="w-5 h-5" />
                 <span>{recipe.views || 0} 热度</span>
               </div>
            </div>
          </div>

          <div className="mb-10">
             <p className="text-gray-600 text-lg leading-relaxed bg-gradient-to-r from-orange-50 to-transparent p-6 rounded-r-2xl border-l-4 border-orange-400 italic">
               "{recipe.description || '暂无简介，快去点击编辑添加吧！'}"
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Section 1: Portion Calculator */}
            <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-lg font-extrabold text-blue-900 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    智能份量换算
                </h3>
                <div className="flex flex-wrap gap-2 items-center">
                    {[1, 2, 3, 4].map(num => (
                        <button
                            key={num}
                            onClick={() => handleServingChange(num)}
                            className={`flex-1 min-w-[60px] py-2 rounded-xl text-sm font-bold transition-all ${
                                !isCustomMode && servingCount === num
                                    ? 'bg-blue-600 text-white shadow-md scale-105'
                                    : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-100'
                            }`}
                        >
                            {num}人
                        </button>
                    ))}
                    
                    <div className={`flex-[1.5] min-w-[100px] flex items-center bg-white rounded-xl border transition-colors ${isCustomMode ? 'border-blue-600 ring-2 ring-blue-100' : 'border-blue-200'}`}>
                        <input 
                            type="number"
                            min="5"
                            placeholder="5+"
                            value={customServing}
                            onClick={() => setIsCustomMode(true)}
                            onChange={handleCustomInput}
                            className="w-full px-3 py-2 rounded-l-xl text-sm outline-none bg-transparent"
                        />
                        <span className="pr-3 text-xs text-blue-400 font-bold whitespace-nowrap">自定义</span>
                    </div>
                </div>
                {servingCount !== 2 && (
                    <p className="text-xs text-blue-500 mt-3 font-medium flex items-center animate-in fade-in">
                        <Sparkles className="w-3 h-3 mr-1" />
                        食材已按 {servingCount} 人份自动调整
                    </p>
                )}
            </div>

            {/* Section 2: Start Cooking & Tools */}
            <div className="bg-orange-50/50 rounded-2xl p-6 border border-orange-100">
                <h3 className="text-lg font-extrabold text-orange-900 mb-4 flex items-center">
                    <ChefHat className="w-5 h-5 mr-2" />
                    开始烹饪
                </h3>
                <div className="flex flex-col gap-3">
                   <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-orange-100 shadow-sm">
                       <span className="text-sm font-bold text-gray-600">烹饪助手</span>
                       {isAddingTimer ? (
                         <form onSubmit={handleAddManualTimer} className="flex items-center gap-2">
                            <input 
                              autoFocus
                              type="number"
                              placeholder="分钟"
                              value={manualTimerMinutes}
                              onChange={e => setManualTimerMinutes(e.target.value)}
                              className="w-16 py-1 px-2 border border-orange-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-orange-400"
                            />
                            <button type="submit" className="text-xs bg-orange-500 text-white px-2 py-1.5 rounded-lg font-bold">开始</button>
                            <button type="button" onClick={() => setIsAddingTimer(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4"/></button>
                         </form>
                       ) : (
                         <button 
                           onClick={() => setIsAddingTimer(true)}
                           className="flex items-center text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors"
                         >
                            <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                            添加计时器
                         </button>
                       )}
                   </div>
                   <div className="text-xs text-gray-500 leading-relaxed px-1">
                      <span className="font-bold text-orange-400">Tips:</span> 点击下方步骤中的时间数字（如“30分钟”），也可快速启动倒计时。
                   </div>
                </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="md:col-span-1">
              <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center">
                <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mr-3">
                    🥗
                </span>
                食材清单
              </h3>
              <ul className="space-y-4">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx} className="flex items-center p-3 rounded-xl hover:bg-orange-50/50 transition-colors border border-transparent hover:border-orange-100 group">
                    <div className="w-2 h-2 rounded-full bg-orange-300 group-hover:bg-orange-500 mr-3 flex-shrink-0 transition-colors"></div>
                    <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-all">
                        {scaleIngredient(ing)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center">
                <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mr-3">
                    🍳
                </span>
                制作步骤
              </h3>
              <div className="space-y-8">
                {recipe.instructions.map((step, idx) => (
                  <div key={idx} className="flex gap-5 group relative">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center font-bold text-lg group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm group-hover:shadow-orange-200">
                      {idx + 1}
                    </div>
                    {/* Vertical line connector */}
                    {idx !== recipe.instructions.length - 1 && (
                        <div className="absolute left-5 top-10 bottom-[-32px] w-0.5 bg-orange-100 group-hover:bg-orange-200 transition-colors"></div>
                    )}
                    <div className="pt-1.5 pb-2">
                      <p className="text-gray-700 text-lg leading-relaxed font-medium group-hover:text-gray-900 transition-colors">
                        {renderInstructionWithTimers(step, idx)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timer Overlay */}
      {timers.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border-t border-gray-100 z-[70] p-4 animate-in slide-in-from-bottom-full duration-300">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-gray-500 flex items-center">
                        <Timer className="w-4 h-4 mr-1" /> 烹饪计时中
                    </h4>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {timers.map(timer => (
                        <div key={timer.id} className={`flex-shrink-0 flex items-center gap-3 px-4 py-2 rounded-xl border shadow-sm ${timer.remaining === 0 ? 'bg-red-50 border-red-200' : 'bg-white border-orange-200'}`}>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">{timer.label}</p>
                                <p className={`text-xl font-mono font-bold ${timer.remaining < 10 ? 'text-red-600' : 'text-gray-800'}`}>
                                    {formatTime(timer.remaining)}
                                </p>
                            </div>
                            <div className="flex items-center gap-1">
                                {timer.remaining > 0 && (
                                    <button onClick={() => toggleTimer(timer.id)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600">
                                        {timer.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                    </button>
                                )}
                                <button onClick={() => removeTimer(timer.id)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};