import React from 'react';
import * as Icons from 'lucide-react';
import { Category } from './types';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const Icon = (Icons as any)[category.icon] || Icons.Utensils;
  
  return (
    <div className={`${category.color} p-6 rounded-2xl cursor-pointer transition-all hover:scale-105 shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-3 text-center`}>
      <div className="p-3 bg-white/50 rounded-full">
        <Icon size={32} />
      </div>
      <span className="font-bold text-lg">{category.name}</span>
    </div>
  );
};

export default CategoryCard;
