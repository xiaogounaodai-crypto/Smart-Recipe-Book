import React, { useState } from 'react';
import { recommendFromIngredients } from '../services/geminiService';
import { Recipe, UserPreferences } from '../types';
import { X, Sparkles, Loader2, Plus, Refrigerator, ChefHat } from 'lucide-react';

interface FridgeModalProps {
  onClose: () => void;
  onAddRecipe: (recipe: Partial<Recipe>) => void;
  userPrefs?: UserPreferences;
}

export const FridgeModal: React.FC<FridgeModalProps> = ({ onClose, onAddRecipe, userPrefs }) => {
  const [ingredients, setIngredients] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<Partial<Recipe>[]>([]);

  const handleGenerate = async () => {
    if (!ingredients.trim()) {
        alert('请先输入冰箱里的食材');
        return;
    }

    setIsGenerating(true);
    setResults([]);
    try {
      const inputs = ingredients.split(/[,，\s]+/).filter(i => i.trim());
      const recipes = await recommendFromIngredients(inputs, userPrefs);
      setResults(recipes);
    } catch (e) {
      alert('AI 思考失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-sm">
                <Refrigerator className="w-6 h-6 text-blue-600" />
            </div>
            <div>
                <h2 className="text-xl font-extrabold text-gray-800">冰箱大搜救</h2>
                <p className="text-xs text-gray-500">输入食材，AI 为您定制食谱</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-white rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
            {/* Input Section */}
            <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">冰箱里有哪些食材？</label>
                <div className="relative">
                    <textarea
                        rows={3}
                        value={ingredients}
                        onChange={(e) => setIngredients(e.target.value)}
                        className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg p-4 border bg-gray-50 focus:bg-white transition-colors"
                        placeholder="例如：两个鸡蛋、半个洋葱、一根火腿肠..."
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !ingredients.trim()}
                        className="absolute bottom-3 right-3 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md disabled:opacity-50 transition-all font-bold text-sm hover:scale-105 active:scale-95"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        开始推荐
                    </button>
                </div>
            </div>

            {/* Results Section */}
            {isGenerating ? (
                <div className="text-center py-12">
                     <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <ChefHat className="w-8 h-8 text-blue-500" />
                     </div>
                     <h3 className="text-lg font-bold text-gray-700">AI 正在根据您的食材构思食谱...</h3>
                     <p className="text-gray-500 mt-2">正在计算最佳搭配组合</p>
                </div>
            ) : results.length > 0 ? (
                <div className="space-y-6">
                    <h3 className="font-bold text-gray-800 flex items-center">
                        <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
                        为您推荐以下 {results.length} 道美味：
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        {results.map((recipe, idx) => (
                            <div key={idx} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-lg transition-all flex flex-col sm:flex-row gap-4 group">
                                <div className="flex-1">
                                    <h4 className="text-lg font-extrabold text-gray-900 mb-1">{recipe.name}</h4>
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {recipe.ingredients?.slice(0, 4).map((ing, i) => (
                                            <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">
                                                {ing}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{recipe.cookingTime}</span>
                                        <span>{recipe.difficulty === 'Easy' ? '简单' : recipe.difficulty === 'Medium' ? '中等' : '困难'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <button 
                                        onClick={() => onAddRecipe(recipe)}
                                        className="w-full sm:w-auto px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg font-bold text-sm transition-all flex items-center justify-center"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        加入食谱
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
      </div>
    </div>
  );
};
