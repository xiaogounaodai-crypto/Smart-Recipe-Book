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
    <div className="max-w-3xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-lg my-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {initialData ? '编辑食谱' : '添加新食谱'}
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Input with AI Button */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">菜品名称</label>
          <div className="flex gap-2">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2"
              placeholder="例如：红烧肉"
            />
            <button
              type="button"
              onClick={handleAISuggest}
              disabled={isGenerating || !name.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              AI 自动填充
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">输入菜名后点击 "AI 自动填充" 可自动生成食谱内容。</p>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">菜品照片</label>
          <div className="flex items-start space-x-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative w-32 h-32 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-orange-500 transition-colors overflow-hidden group ${image ? 'border-orange-500' : 'border-gray-300 bg-gray-50'}`}
            >
              {image ? (
                <>
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-medium">更换图片</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-2">
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                  <span className="text-xs text-gray-500 block">点击上传</span>
                </div>
              )}
            </div>
            <div className="flex-1 pt-2">
               <button 
                 type="button"
                 onClick={() => fileInputRef.current?.click()}
                 className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
               >
                 <Upload className="w-3 h-3 mr-1.5" />
                 选择图片
               </button>
               {image && (
                 <button 
                    type="button"
                    onClick={() => setImage('')}
                    className="ml-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-600 hover:bg-red-50 focus:outline-none"
                 >
                   删除图片
                 </button>
               )}
               <p className="text-xs text-gray-500 mt-2">支持 JPG, PNG 格式。图片会自动压缩。</p>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">简介</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2"
            placeholder="简要描述这道菜..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Ingredients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">食材清单 (每行一项)</label>
            <textarea
              rows={8}
              required
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2 font-mono"
              placeholder="500g 五花肉&#10;2片 姜&#10;2勺 酱油"
            />
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">制作步骤 (每行一步)</label>
            <textarea
              rows={8}
              required
              value={instructionsText}
              onChange={(e) => setInstructionsText(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2 font-mono"
              placeholder="1. 洗净猪肉...&#10;2. 冷水下锅焯水...&#10;3. 炒糖色..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cooking Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">烹饪时间</label>
            <input
              type="text"
              value={cookingTime}
              onChange={(e) => setCookingTime(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2"
              placeholder="例如：45分钟"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">难度</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2 bg-white"
            >
              <option value="Easy">简单</option>
              <option value="Medium">中等</option>
              <option value="Hard">困难</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            取消
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-md"
          >
            <Save className="w-4 h-4 mr-2" />
            保存食谱
          </button>
        </div>
      </form>
    </div>
  );
};
