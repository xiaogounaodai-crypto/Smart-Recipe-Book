import React, { useState } from 'react';
import { Recipe } from '../types';
import { Clock, BarChart, ArrowLeft, Pencil, Trash2, Eye, Star } from 'lucide-react';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleFavorite: () => void;
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onBack, onEdit, onDelete, onToggleFavorite }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleDelete = () => {
    if (onDelete) {
       onDelete();
    }
  };

  const handleFavoriteClick = () => {
    onToggleFavorite();
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className="bg-white min-h-full pb-8 relative">
      {/* Floating Buttons (Fixed) */}
      <div className="fixed top-20 left-4 z-50">
        <button 
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-100 text-gray-700 hover:text-orange-600 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
      
      <div className="fixed top-20 right-4 z-50 flex gap-2">
          {onEdit && (
            <button 
              onClick={onEdit}
              className="flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-100 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all"
              title="编辑食谱"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button 
              onClick={handleDelete}
              className="flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-100 text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all"
              title="删除食谱"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
      </div>

      {/* Header Image Area */}
      <div className="h-48 sm:h-72 w-full bg-gray-100 flex items-center justify-center relative overflow-hidden group">
        {recipe.image ? (
          <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-orange-100 to-yellow-100 flex items-center justify-center">
             <span className="text-6xl opacity-20 select-none">🍲</span>
          </div>
        )}

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent text-white pt-16">
             <h1 className="text-3xl font-bold drop-shadow-lg tracking-wide">{recipe.name}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6 pb-6 border-b items-center">
            <div className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>{recipe.cookingTime || '未知时间'}</span>
            </div>
            <div className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
              <BarChart className="w-4 h-4 text-orange-500" />
              <span>难度: {recipe.difficulty === 'Easy' ? '简单' : recipe.difficulty === 'Medium' ? '中等' : '困难'}</span>
            </div>
            
            <div className="ml-auto flex items-center gap-3">
               <button 
                 onClick={handleFavoriteClick}
                 className={`flex items-center gap-1 px-3 py-1 rounded-full border transition-all ${
                   recipe.isFavorite 
                     ? 'bg-yellow-50 border-yellow-200 text-yellow-600 hover:bg-yellow-100' 
                     : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                 } ${isAnimating ? 'scale-110' : ''}`}
               >
                 <Star className={`w-4 h-4 ${recipe.isFavorite ? 'fill-current text-yellow-500' : 'text-gray-400'}`} />
                 <span className={`${recipe.isFavorite ? 'font-medium' : 'text-gray-500'}`}>
                   {recipe.isFavorite ? '已收藏' : '收藏'}
                 </span>
               </button>
               <div className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                 <Eye className="w-4 h-4 text-gray-400" />
                 <span className="text-gray-400">{recipe.views || 0}</span>
               </div>
            </div>
          </div>

          <div className="mb-8">
             <p className="text-gray-600 leading-relaxed italic border-l-4 border-orange-200 pl-4 bg-orange-50/50 py-2 rounded-r-lg">
               {recipe.description || '暂无简介，快去点击编辑添加吧！'}
             </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-1.5 h-6 bg-orange-500 mr-2 rounded-full"></span>
                食材清单
              </h3>
              <ul className="space-y-3">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx} className="flex items-start text-gray-700 border-b border-dashed border-gray-100 pb-2 last:border-0 hover:bg-gray-50 transition-colors rounded px-2 -mx-2">
                    <span className="w-2 h-2 mt-2 bg-orange-300 rounded-full mr-2 flex-shrink-0"></span>
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-1.5 h-6 bg-orange-500 mr-2 rounded-full"></span>
                制作步骤
              </h3>
              <div className="space-y-6">
                {recipe.instructions.map((step, idx) => (
                  <div key={idx} className="flex gap-4 group">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-sm group-hover:bg-orange-500 group-hover:text-white transition-colors shadow-sm">
                      {idx + 1}
                    </div>
                    <div className="pt-1">
                      <p className="text-gray-700 leading-relaxed">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
