import React, { useState, useEffect, useRef } from 'react';
import { getRecommendedDishes } from '../services/geminiService';
import { X, Sparkles, Plus, Check, Loader2, RefreshCw, Clock } from 'lucide-react';
import { Recipe } from '../types';

interface RecommendationModalProps {
  categoryName: string;
  existingRecipes: Recipe[];
  onClose: () => void;
  onAddRecipe: (name: string) => Promise<void>;
}

type TaskStatus = 'idle' | 'queued' | 'processing' | 'done' | 'error';

export const RecommendationModal: React.FC<RecommendationModalProps> = ({ 
  categoryName, 
  existingRecipes, 
  onClose, 
  onAddRecipe 
}) => {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Queue System
  const [queue, setQueue] = useState<string[]>([]);
  const [processingItem, setProcessingItem] = useState<string | null>(null);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [errorItems, setErrorItems] = useState<Set<string>>(new Set());

  // Use a ref to prevent effects from running stale closures
  const isProcessingRef = useRef(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    setCompletedItems(new Set()); // Reset completed on refresh
    setQueue([]); // Clear queue
    try {
      const dishes = await getRecommendedDishes(categoryName);
      
      // Filter out dishes that are already in the existing recipes
      const existingNames = new Set(existingRecipes.map(r => r.name));
      const filteredDishes = dishes.filter(dish => {
        // Simple fuzzy match: check if dish is contained in existing name or vice versa
        // e.g., "Tomato Egg" vs "Stir-fried Tomato and Egg"
        const isDuplicate = existingRecipes.some(r => 
            r.name.includes(dish) || dish.includes(r.name)
        );
        return !isDuplicate;
      });

      setRecommendations(filteredDishes);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [categoryName]);

  // Queue Processor
  useEffect(() => {
    const processNext = async () => {
        if (queue.length === 0 || isProcessingRef.current) return;

        isProcessingRef.current = true;
        const currentDish = queue[0];
        setProcessingItem(currentDish);

        try {
            await onAddRecipe(currentDish);
            setCompletedItems(prev => new Set(prev).add(currentDish));
        } catch (error) {
            console.error(`Failed to add ${currentDish}`, error);
            setErrorItems(prev => new Set(prev).add(currentDish));
        } finally {
            // Remove from queue and reset processing flag
            setQueue(prev => prev.slice(1));
            setProcessingItem(null);
            isProcessingRef.current = false;
        }
    };

    processNext();
  }, [queue]); // Re-run when queue changes

  const addToQueue = (dishName: string) => {
    if (!queue.includes(dishName) && processingItem !== dishName && !completedItems.has(dishName)) {
        setQueue(prev => [...prev, dishName]);
    }
  };

  const getStatus = (dish: string): TaskStatus => {
    if (completedItems.has(dish)) return 'done';
    if (errorItems.has(dish)) return 'error';
    if (processingItem === dish) return 'processing';
    if (queue.includes(dish)) return 'queued';
    return 'idle';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-orange-50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-gray-800">{categoryName} · 灵感菜单</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-white rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              <p className="text-gray-500 text-sm">正在询问 AI 大厨推荐...</p>
            </div>
          ) : recommendations.length === 0 ? (
             <div className="text-center py-8 text-gray-500">
               <p>太棒了！您似乎已经拥有了所有经典{categoryName}食谱。</p>
               <button onClick={fetchRecommendations} className="text-orange-600 mt-2 underline">试试获取更多灵感</button>
             </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
                为您挑选了经典{categoryName}（已隐藏您食谱中已有的菜品）。<br/>
                <span className="text-orange-600">Tip: 您可以连续点击多个菜品，系统将自动排队生成。</span>
              </p>
              <div className="space-y-3">
                {recommendations.map((dish, idx) => {
                  const status = getStatus(dish);
                  
                  return (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        status === 'done' 
                            ? 'bg-green-50 border-green-100' 
                            : status === 'processing' || status === 'queued'
                                ? 'bg-orange-50 border-orange-200'
                                : 'bg-white border-gray-100 hover:border-orange-200 hover:shadow-sm'
                      }`}
                    >
                      <span className={`font-medium ${status === 'done' ? 'text-green-700' : 'text-gray-700'}`}>
                        {idx + 1}. {dish}
                      </span>
                      
                      {/* Action Button Area */}
                      <div>
                        {status === 'done' && (
                            <div className="flex items-center text-green-600 text-xs font-medium px-2 py-1">
                                <Check className="w-4 h-4 mr-1" />
                                已添加
                            </div>
                        )}
                        {status === 'error' && (
                            <span className="text-red-500 text-xs">添加失败</span>
                        )}
                        {status === 'processing' && (
                             <div className="flex items-center text-orange-600 text-xs font-medium px-2 py-1">
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                生成中...
                            </div>
                        )}
                        {status === 'queued' && (
                             <div className="flex items-center text-orange-500 text-xs font-medium px-2 py-1">
                                <Clock className="w-4 h-4 mr-1 animate-pulse" />
                                等待中
                            </div>
                        )}
                        {status === 'idle' && (
                            <button
                                onClick={() => addToQueue(dish)}
                                className="flex items-center px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                            >
                                <Plus className="w-3 h-3 mr-1.5" />
                                添加
                            </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
           <div className="text-xs text-gray-400">
             {queue.length > 0 && <span>还有 {queue.length} 个任务在队列中...</span>}
           </div>
          <button 
            onClick={fetchRecommendations} 
            disabled={loading || queue.length > 0 || processingItem !== null}
            className="flex items-center text-sm text-gray-500 hover:text-orange-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            换一批推荐
          </button>
        </div>
      </div>
    </div>
  );
};
