import React from 'react';

const RecipeDetail = ({ recipe, onClose }: { recipe: any; onClose: () => void }) => {
  if (!recipe) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">{recipe.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">简介</h3>
            <p className="text-gray-600">{recipe.description}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">配料</h3>
            <ul className="list-disc list-inside text-gray-600">
              {recipe.ingredients.map((ing: string, i: number) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">烹饪步骤</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              {recipe.instructions.map((ins: string, i: number) => (
                <li key={i}>{ins}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail; // 👈 这一行是解决本次报错的关键开关！
