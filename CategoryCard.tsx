import React, { useState, useRef } from 'react';
import { CategoryId, Recipe } from '../types';
import { generateRecipeWithAI } from '../services/geminiService';
import { Sparkles, Loader2, Save, X, Image as ImageIcon, Upload } from 'lucide-react';

interface RecipeFormProps {
  categoryId: CategoryId;
  categoryName: string;
  initialData?: Recipe;
  onSave: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export const RecipeForm: React.FC<RecipeFormProps> = ({ 
  categoryId, 
  categoryName,
  initialData, 
  onSave, 
  onCancel 
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [ingredientsText, setIngredientsText] = useState(initialData?.ingredients.join('\n') || '');
  const [instructionsText, setInstructionsText] = useState(initialData?.instructions.join('\n') || '');
  const [cookingTime, setCookingTime] = useState(initialData?.cookingTime || '');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>(initialData?.difficulty || 'Medium');
  const [image, setImage] = useState<string>(initialData?.image || '');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAISuggest = async () => {
    if (!name.trim()) {
      alert("请输入菜名以便AI为您生成食谱");
      return;
    }

    setIsGenerating(true);
    try {
      const generated = await generateRecipeWithAI(name, categoryName);
      if (generated) {
        if (generated.description) setDescription(generated.description);
        if (generated.ingredients) setIngredientsText(generated.ingredients.join('\n'));
        if (generated.instructions) setInstructionsText(generated.instructions.join('\n'));
        if (generated.cookingTime) setCookingTime(generated.cookingTime);
        if (generated.difficulty) setDifficulty(generated.difficulty as any);
      }
    } catch (e) {
      alert("AI 生成失败，请稍后重试。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Basic client-side compression using Canvas
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 800; // Resize to max 800px to save storage

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress to JPEG 0.7 quality
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            setImage(dataUrl);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      categoryId,
      name,
      description,
      ingredients: ingredientsText.split('\n').filter(line => line.trim() !== ''),
      instructions: instructionsText.split('\n').filter(line => line.trim() !== ''),
      cookingTime,
      difficulty,
      image
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 bg-white rounded-2xl shadow-xl my-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          {initialData ? '编辑食谱' : '添加新食谱'}
        </h2>
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Name Input with AI Button */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">菜品名称</label>
          <div className="flex gap-3">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 block w-full rounded-xl border-gray-200 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-lg py-3 px-4 border transition-all"
              placeholder="例如：红烧肉"
            />
            <button
              type="button"
              onClick={handleAISuggest}
              disabled={isGenerating || !name.trim()}
              className={`relative overflow-hidden inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 ${
                isGenerating 
                  ? 'text-white' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-indigo-500/30'
              }`}
            >
              {isGenerating && (
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-[pulse_1.5s_ease-in-out_infinite]" />
              )}
              <span className="relative flex items-center">
                 {isGenerating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                 {isGenerating ? 'AI 思考中...' : 'AI 自动填充'}
              </span>
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500 flex items-center">
            <Sparkles className="w-3 h-3 mr-1 text-purple-500" />
            输入菜名后点击右侧按钮，让 AI 为您自动生成食材和步骤
          </p>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">菜品照片</label>
          <div className="flex items-start space-x-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative w-40 h-40 rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all overflow-hidden group shadow-sm hover:shadow-md ${image ? 'border-orange-500 ring-2 ring-orange-100' : 'border-gray-300 bg-gray-50 hover:bg-orange-50 hover:border-orange-400'}`}
            >
              {image ? (
                <>
                  <img src={image} alt="Preview" className="w-full h-full object-cover saturate-[1.1]" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                    <span className="text-white text-xs font-bold px-3 py-1 bg-white/20 rounded-full border border-white/50">更换图片</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm group-hover:scale-110 transition-transform">
                     <ImageIcon className="w-6 h-6 text-gray-400 group-hover:text-orange-500" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 group-hover:text-orange-600">点击上传美图</span>
                </div>
              )}
            </div>
            <div className="flex-1 pt-4 space-y-3">
               <button 
                 type="button"
                 onClick={() => fileInputRef.current?.click()}
                 className="inline-flex items-center px-4 py-2 border border-gray-200 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors"
               >
                 <Upload className="w-4 h-4 mr-2" />
                 选择图片
               </button>
               {image && (
                 <button 
                    type="button"
                    onClick={() => setImage('')}
                    className="ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                 >
                   删除
                 </button>
               )}
               <p className="text-xs text-gray-400 leading-relaxed">
                 建议上传高饱和度的美食照片（支持 JPG/PNG），图片将自动压缩优化。
               </p>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">简介</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm py-3 px-4 border transition-colors bg-gray-50 focus:bg-white"
            placeholder="简要描述这道菜的风味和特点..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Ingredients */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              食材清单
            </label>
            <textarea
              rows={10}
              required
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm border p-4 font-mono leading-relaxed bg-gray-50 focus:bg-white transition-colors"
              placeholder={'500g 五花肉\n2片 姜\n2勺 酱油\n...'}
            />
            <p className="text-xs text-gray-400 mt-2 text-right">每行一项</p>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
              <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
              制作步骤
            </label>
            <textarea
              rows={10}
              required
              value={instructionsText}
              onChange={(e) => setInstructionsText(e.target.value)}
              className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm border p-4 font-mono leading-relaxed bg-gray-50 focus:bg-white transition-colors"
              placeholder={'1. 洗净猪肉...\n2. 冷水下锅焯水...\n3. 炒糖色...\n...'}
            />
            <p className="text-xs text-gray-400 mt-2 text-right">每行一步</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
          {/* Cooking Time */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">烹饪时间</label>
            <input
              type="text"
              value={cookingTime}
              onChange={(e) => setCookingTime(e.target.value)}
              className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm py-2 px-3 border"
              placeholder="例如：45分钟"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">难度</label>
            <div className="relative">
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm py-2 px-3 border bg-white appearance-none"
              >
                <option value="Easy">简单</option>
                <option value="Medium">中等</option>
                <option value="Hard">困难</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-8 py-2.5 border border-transparent text-sm font-bold rounded-xl shadow-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 hover:shadow-orange-500/30 transform hover:-translate-y-0.5 transition-all"
          >
            <Save className="w-4 h-4 mr-2" />
            保存食谱
          </button>
        </div>
      </form>
    </div>
  );
};
