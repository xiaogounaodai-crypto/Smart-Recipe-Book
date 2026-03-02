import React, { useState } from 'react';
import { Category } from '../types';
import { Save, X } from 'lucide-react';

interface CategoryFormProps {
  onSave: (categoryData: Omit<Category, 'id'>) => void;
  onCancel: () => void;
}

const COLORS = [
  { label: '红色', value: 'bg-red-100 text-red-600' },
  { label: '绿色', value: 'bg-green-100 text-green-600' },
  { label: '蓝色', value: 'bg-blue-100 text-blue-600' },
  { label: '黄色', value: 'bg-yellow-100 text-yellow-600' },
  { label: '橙色', value: 'bg-orange-100 text-orange-600' },
  { label: '粉色', value: 'bg-pink-100 text-pink-600' },
  { label: '青色', value: 'bg-cyan-100 text-cyan-600' },
  { label: '紫色', value: 'bg-purple-100 text-purple-600' },
  { label: '翠绿', value: 'bg-emerald-100 text-emerald-600' },
];

export const CategoryForm: React.FC<CategoryFormProps> = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[4].value); // Default orange

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name,
      description,
      color: selectedColor,
      icon: 'Utensils' // Default icon
    });
  };

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-lg my-4">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          添加新分类
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">分类名称</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2"
            placeholder="例如：海鲜"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2"
            placeholder="例如：各种美味的海鲜料理"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">主题颜色</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setSelectedColor(color.value)}
                className={`h-10 rounded-lg border-2 flex items-center justify-center text-xs font-bold ${
                  color.value.split(' ')[0]
                } ${
                  selectedColor === color.value 
                    ? 'border-gray-600 scale-105 shadow-md' 
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                {selectedColor === color.value && '✓'}
              </button>
            ))}
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
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <Save className="w-4 h-4 mr-2" />
            保存分类
          </button>
        </div>
      </form>
    </div>
  );
};
