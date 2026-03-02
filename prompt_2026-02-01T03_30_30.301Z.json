import React, { useMemo, useState } from 'react';
import { Recipe, CategoryIdEnum } from '../types';
import { Sun, Moon, Sunset, Sunrise, Utensils, ChefHat, Coffee, RefreshCw } from 'lucide-react';

interface DailyMealRecommendationProps {
  recipes: Recipe[];
  onRecipeClick: (recipe: Recipe) => void;
  onSearchClick: (term: string) => void;
}

type MealPeriod = 'breakfast' | 'lunch' | 'dinner' | 'latenight';
type BreakfastStyle = 'chinese' | 'western';

interface RecommendationSlot {
  label: string;
  categoryIds: string[]; // Valid categories for this slot
  fallbackDish: string;  // What to show if no local recipe exists
}

export const DailyMealRecommendation: React.FC<DailyMealRecommendationProps> = ({ 
  recipes, 
  onRecipeClick, 
  onSearchClick 
}) => {
  const [breakfastStyle, setBreakfastStyle] = useState<BreakfastStyle>('chinese');
  const [seed, setSeed] = useState(0); // Used to trigger re-randomization

  const timeData = useMemo(() => {
    const hour = new Date().getHours();
    let period: MealPeriod;
    let title = '';
    let subtitle = '';
    let icon: React.ReactNode;
    let bgGradient = '';

    if (hour >= 6 && hour < 10) {
      period = 'breakfast';
      title = '元气早餐';
      subtitle = '一日之计在于晨';
      icon = <Sunrise className="w-6 h-6 text-orange-500" />;
      bgGradient = 'from-orange-50 to-yellow-50 border-orange-100';
    } else if (hour >= 10 && hour < 15) {
      period = 'lunch';
      title = '丰盛午餐';
      subtitle = '荤素搭配，营养均衡';
      icon = <Sun className="w-6 h-6 text-red-500" />;
      bgGradient = 'from-red-50 to-orange-50 border-red-100';
    } else if (hour >= 15 && hour < 21) {
      period = 'dinner';
      title = '温馨晚餐';
      subtitle = '四菜一汤，抚慰人心';
      icon = <Sunset className="w-6 h-6 text-indigo-500" />;
      bgGradient = 'from-indigo-50 to-purple-50 border-indigo-100';
    } else {
      period = 'latenight';
      title = '深夜食堂';
      subtitle = '快乐夜宵，灵魂伴侣';
      icon = <Moon className="w-6 h-6 text-blue-500" />;
      bgGradient = 'from-slate-50 to-blue-50 border-slate-200';
    }

    return { period, title, subtitle, icon, bgGradient };
  }, []);

  // Define the structure of the meal based on the period
  const mealSlots = useMemo((): RecommendationSlot[] => {
    switch (timeData.period) {
      case 'breakfast':
        if (breakfastStyle === 'chinese') {
          return [
            { label: '主食', categoryIds: [CategoryIdEnum.STAPLE], fallbackDish: '肉包子' },
            { label: '汤粥', categoryIds: [CategoryIdEnum.SOUP, CategoryIdEnum.DRINK], fallbackDish: '小米粥' },
            { label: '搭配', categoryIds: [CategoryIdEnum.SNACK, CategoryIdEnum.STAPLE], fallbackDish: '油条' },
            { label: '佐餐', categoryIds: [CategoryIdEnum.SNACK, CategoryIdEnum.VEGETABLE], fallbackDish: '豆腐脑' },
          ];
        } else {
          return [
            { label: '主食', categoryIds: [CategoryIdEnum.STAPLE], fallbackDish: '培根三明治' },
            { label: '饮品', categoryIds: [CategoryIdEnum.DRINK], fallbackDish: '热牛奶' },
            { label: '烘焙', categoryIds: [CategoryIdEnum.SNACK, CategoryIdEnum.DESSERT], fallbackDish: '恰巴塔' },
            { label: '搭配', categoryIds: [CategoryIdEnum.SNACK, CategoryIdEnum.MEAT], fallbackDish: '煎蛋香肠' },
          ];
        }
      
      case 'lunch':
      case 'dinner':
        return [
          { label: '荤菜', categoryIds: [CategoryIdEnum.MEAT], fallbackDish: timeData.period === 'lunch' ? '宫保鸡丁' : '清蒸鲈鱼' },
          { label: '素菜', categoryIds: [CategoryIdEnum.VEGETABLE], fallbackDish: '清炒时蔬' },
          { label: '汤类', categoryIds: [CategoryIdEnum.SOUP], fallbackDish: timeData.period === 'lunch' ? '番茄蛋汤' : '玉米排骨汤' },
          { label: '主食', categoryIds: [CategoryIdEnum.STAPLE], fallbackDish: '米饭' },
        ];

      case 'latenight':
        return [
          { label: '快乐水', categoryIds: [CategoryIdEnum.DRINK], fallbackDish: '冰可乐' },
          { label: '炸物', categoryIds: [CategoryIdEnum.SNACK], fallbackDish: '韩式炸鸡' },
          { label: '速食', categoryIds: [CategoryIdEnum.SNACK, CategoryIdEnum.STAPLE], fallbackDish: '火鸡面' },
          { label: '解馋', categoryIds: [CategoryIdEnum.SNACK], fallbackDish: '烤冷面' },
        ];
        
      default:
        return [];
    }
  }, [timeData.period, breakfastStyle]);

  // Fill the slots with actual recipes or fallback placeholders
  const displayItems = useMemo(() => {
    // Helper to pick a random item from array based on seed
    function pickRandom<T>(arr: T[]): T | null {
      if (arr.length === 0) return null;
      // Simple pseudo-random using seed + array length
      const index = (seed + Math.floor(Math.random() * 100)) % arr.length;
      return arr[index];
    }

    // Keep track of used recipes to avoid duplicates in one meal
    const usedRecipeIds = new Set<string>();

    return mealSlots.map(slot => {
      // Find local recipes that match this slot's allowed categories
      const candidates: Recipe[] = recipes.filter(r => 
        slot.categoryIds.includes(r.categoryId) && !usedRecipeIds.has(r.id)
      );

      const picked: Recipe | null = pickRandom(candidates);
      
      if (picked) {
        usedRecipeIds.add(picked.id);
        return { type: 'local', data: picked, label: slot.label };
      } else {
        return { type: 'fallback', name: slot.fallbackDish, label: slot.label };
      }
    });
  }, [mealSlots, recipes, seed]);

  const handleRefresh = () => {
    setSeed(prev => prev + 1);
  };

  return (
    <div className={`mb-8 rounded-3xl border p-6 shadow-sm bg-gradient-to-br ${timeData.bgGradient} relative overflow-hidden transition-all duration-300 hover:shadow-lg`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white rounded-2xl shadow-sm">
            {timeData.icon}
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900 text-xl flex items-center gap-2">
              {timeData.title}
              <span className="text-xs font-bold text-gray-500 bg-white/60 px-2 py-0.5 rounded-full border border-white/20">
                {new Date().getHours()}:00 - {(new Date().getHours() + 1) % 24}:00
              </span>
            </h3>
            <p className="text-sm font-medium text-gray-600 opacity-80">{timeData.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {timeData.period === 'breakfast' && (
            <div className="flex bg-white/60 p-1 rounded-xl border border-gray-100 mr-2 shadow-sm">
              <button
                onClick={() => setBreakfastStyle('chinese')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  breakfastStyle === 'chinese' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-500 hover:bg-white'
                }`}
              >
                中式
              </button>
              <button
                onClick={() => setBreakfastStyle('western')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  breakfastStyle === 'western' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-500 hover:bg-white'
                }`}
              >
                西式
              </button>
            </div>
          )}
          
          <button 
            onClick={handleRefresh}
            className="p-2 bg-white/80 hover:bg-white text-gray-500 hover:text-orange-600 rounded-full transition-all shadow-sm hover:rotate-180 duration-500"
            title="换一换"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {displayItems.map((item, idx) => {
           if (item.type === 'local' && item.data) {
             const recipe = item.data as Recipe;
             return (
               <div 
                 key={`rec-${idx}`}
                 onClick={() => onRecipeClick(recipe)}
                 className="bg-white p-3 rounded-2xl shadow-sm border border-white/50 hover:border-orange-200 cursor-pointer transition-all hover:shadow-xl hover:scale-[1.03] flex flex-col h-full group duration-300"
               >
                 <div className="text-[10px] font-extrabold text-orange-600 mb-2 flex items-center bg-orange-50 w-fit px-2 py-0.5 rounded-full">
                    {item.label}
                 </div>
                 {recipe.image ? (
                   <div className="w-full aspect-[4/3] rounded-xl bg-gray-100 overflow-hidden mb-3 shadow-inner">
                      <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 saturate-[1.1]" />
                   </div>
                 ) : (
                   <div className="w-full aspect-[4/3] rounded-xl bg-orange-50/50 flex items-center justify-center mb-3 text-3xl">
                      🥘
                   </div>
                 )}
                 <div className="mt-auto">
                   <h4 className="font-bold text-gray-800 text-sm truncate mb-1">{recipe.name}</h4>
                   <div className="flex items-center gap-1.5">
                      <Utensils className="w-3 h-3 text-gray-400" />
                      <span className="text-xs font-medium text-gray-500 truncate">{recipe.cookingTime}</span>
                   </div>
                 </div>
               </div>
             );
           } else {
             return (
               <div 
                 key={`fallback-${idx}`}
                 onClick={() => onSearchClick(item.name || '')}
                 className="bg-white/40 p-3 rounded-2xl border-2 border-dashed border-gray-300/60 hover:border-orange-400 hover:bg-white cursor-pointer transition-all hover:shadow-lg hover:scale-[1.03] flex flex-col h-full min-h-[140px] relative group duration-300"
               >
                  <div className="text-[10px] font-bold text-gray-400 mb-2 flex items-center w-fit px-2 py-0.5 rounded-full">
                    {item.label}
                 </div>
                 <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-2 text-orange-400 group-hover:text-orange-500 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                        {timeData.period === 'latenight' ? <Utensils className="w-6 h-6" /> : 
                         timeData.period === 'breakfast' && breakfastStyle === 'western' ? <Coffee className="w-6 h-6" /> :
                         <ChefHat className="w-6 h-6" />}
                    </div>
                    <h4 className="font-bold text-gray-700 text-sm">{item.name}</h4>
                    <p className="text-[10px] font-bold text-orange-500 mt-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        点击生成食谱
                    </p>
                 </div>
               </div>
             );
           }
        })}
      </div>
    </div>
  );
};