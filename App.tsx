import React, { useState } from 'react';
import { INITIAL_RECIPES, CategoryIdEnum } from './types';
import CategoryCard from './CategoryCard';
import RecipeDetail from './RecipeDetail';

// 这里的 DEFAULT_CATEGORIES 对应你 index.tsx 里的定义
const CATEGORIES = [
  { id: CategoryIdEnum.MEAT, name: '荤菜', icon: 'Beef', color: 'bg-red-100 text-red-600' },
  { id: CategoryIdEnum.VEGETABLE, name: '素菜', icon: 'Salad', color: 'bg-green-100 text-green-600' },
  { id: CategoryIdEnum.SOUP, name: '汤品', icon: 'Soup', color: 'bg-blue-100 text-blue-600' },
  { id: CategoryIdEnum.STAPLE, name: '主食', icon: 'Utensils', color: 'bg-orange-100 text-orange-600' },
  { id: CategoryIdEnum.SNACK, name: '小吃', icon: 'Cookie', color: 'bg-yellow-100 text-yellow-600' },
  { id: CategoryIdEnum.DESSERT, name: '甜点', icon: 'IceCream', color: 'bg-pink-100 text-pink-600' },
  { id: CategoryIdEnum.DRINK, name: '饮品', icon: 'Coffee', color: 'bg-cyan-100 text-cyan-600' },
  { id: CategoryIdEnum.HEALTH, name: '养生', icon: 'Heart', color: 'bg-emerald-100 text-emerald-600' }
];

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryIdEnum | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

  const filteredRecipes = selectedCategory 
    ? INITIAL_RECIPES.filter(r => r.categoryId === selectedCategory)
    : [];

  return (
    <div className="min-h-screen bg-[#fdfbf7] p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">智能食谱</h1>
          <p className="text-gray-600">点击分类查看我的拿手好菜</p>
        </header>

        {!selectedCategory ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {CATEGORIES.map(cat => (
              <div key={cat.id} onClick={() => setSelectedCategory(cat.id)}>
                <CategoryCard category={cat} />
              </div>
            ))}
          </div>
        ) : (
          <div>
            <button 
              onClick={() => setSelectedCategory(null)}
              className="mb-6 text-gray-500 hover:text-gray-800"
            >
              ← 返回全部分类
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map(recipe => (
                <div 
                  key={recipe.id} 
                  className="bg-white p-4 rounded-xl shadow-sm border border-orange-50 cursor-pointer"
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  <h3 className="text-xl font-bold text-gray-800">{recipe.name}</h3>
                  <p className="text-gray-500 text-sm mt-2">{recipe.description}</p>
                  <div className="mt-4 flex gap-2">
                    {recipe.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-orange-50 text-orange-600 text-xs rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedRecipe && (
          <RecipeDetail 
            recipe={selectedRecipe} 
            onClose={() => setSelectedRecipe(null)} 
          />
        )}
      </div>
    </div>
  );
}
