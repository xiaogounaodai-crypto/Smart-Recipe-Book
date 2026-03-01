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
    <div 
      onClick={onClick}
      className="group relative flex flex-col items-start p-6 rounded-2xl bg-white shadow-sm hover:shadow-2xl hover:scale-[1.02] border border-gray-100 transition-all duration-300 text-left w-full overflow-hidden cursor-pointer"
    >
      {(onEdit || onDelete) && (
        <div className="absolute top-3 right-3 flex space-x-1 z-20 pointer-events-auto">
          {onEdit && (
            <button 
              type="button"
              onClick={(e) => {
                  e.stopPropagation();
                  onEdit(e);
              }}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors bg-white/50 backdrop-blur-sm border border-transparent hover:border-gray-200"
              title="编辑分类"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button 
              type="button"
              onClick={(e) => {
                  e.stopPropagation();
                  onDelete(e);
              }}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors bg-white/50 backdrop-blur-sm border border-transparent hover:border-gray-200"
              title="删除分类"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <div className={`p-4 rounded-full mb-4 ${category.color} bg-opacity-20 group-hover:scale-110 transition-transform duration-300`}>
        {getIconComponent(category.icon, "w-8 h-8")}
      </div>
      <h3 className="text-xl font-extrabold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors tracking-tight">
        {category.name}
      </h3>
      <p className="text-sm text-gray-500 line-clamp-2 mb-5 font-medium leading-relaxed">
        {category.description}
      </p>
      <div className="mt-auto w-full flex items-center justify-between border-t border-gray-50 pt-4 group-hover:border-orange-50 transition-colors">
        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
          {count} 道菜谱
        </span>
        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transform group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
};