import React from 'react';
import { Category } from '../types';
import { getIconComponent } from '../constants';
import { ChevronRight, Pencil, Trash2 } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
  count: number;
  onClick: () => void;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, count, onClick, onEdit, onDelete }) => {
  return (
    <button 
      onClick={onClick}
      className="group relative flex flex-col items-start p-6 rounded-2xl bg-white shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 transform hover:-translate-y-1 text-left w-full overflow-hidden"
    >
      {(onEdit || onDelete) && (
        <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {onEdit && (
            <div 
              onClick={onEdit}
              className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
              title="编辑分类"
            >
              <Pencil className="w-4 h-4" />
            </div>
          )}
          {onDelete && (
            <div 
              onClick={onDelete}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="删除分类"
            >
              <Trash2 className="w-4 h-4" />
            </div>
          )}
        </div>
      )}

      <div className={`p-3 rounded-full mb-4 ${category.color} bg-opacity-20`}>
        {getIconComponent(category.icon, "w-8 h-8")}
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-orange-600 transition-colors">
        {category.name}
      </h3>
      <p className="text-sm text-gray-500 line-clamp-2 mb-4">
        {category.description}
      </p>
      <div className="mt-auto w-full flex items-center justify-between border-t pt-3">
        <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
          {count} 道菜谱
        </span>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 transform group-hover:translate-x-1 transition-all" />
      </div>
    </button>
  );
};
