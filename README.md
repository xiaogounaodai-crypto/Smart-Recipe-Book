import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { CategoryCard } from './components/CategoryCard';
import { RecipeForm } from './components/RecipeForm';
import { RecipeDetail } from './components/RecipeDetail';
import { CategoryForm } from './components/CategoryForm';
import { LoginModal } from './components/LoginModal';
import { UserProfile } from './components/UserProfile';
import { DailyMealRecommendation } from './components/DailyMealRecommendation';
import { FridgeModal } from './components/FridgeModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Category, CategoryId, Recipe, ViewState, User, UserPreferences } from './types';
import { DEFAULT_CATEGORIES, getIconComponent } from './constants';
import { Plus, ArrowLeft, Loader2, Search, Pencil, Trash2, Sparkles, ChefHat, BookOpen, Eye, Star, Clock, Refrigerator } from 'lucide-react';
import { suggestRandomRecipe, generateRecipeWithAI, searchRecipesWithAI } from './services/geminiService';
import { INITIAL_RECIPES } from './seedData';
import { SeasonalRecommendation } from './components/SeasonalRecommendation';
import { RecommendationModal } from './components/RecommendationModal';

export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [viewState, setViewState] = useState<ViewState>({ type: 'HOME' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState<Partial<Recipe>[]>([]);
  const [isRecModalOpen, setIsRecModalOpen] = useState(false);
  const [isFridgeModalOpen, setIsFridgeModalOpen] = useState(false);

  // Confirmation State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
    isDangerous?: boolean;
  }>({ isOpen: false, title: '', message: '', action: () => {} });


  // User State
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // --- Data Loading Logic ---
  
  // Helper to get storage keys based on user
  const getStorageKeys = (currentUser: User | null) => {
    const suffix = currentUser ? `_${currentUser.phoneNumber}` : '_guest';
    return {
      recipes: `smart-recipe-book-data${suffix}`,
      categories: `smart-recipe-book-categories${suffix}`,
    };
  };

  const loadDataForUser = useCallback((currentUser: User | null) => {
    const keys = getStorageKeys(currentUser);

    // Load Recipes
    const savedRecipes = localStorage.getItem(keys.recipes);
    if (savedRecipes) {
      try {
        const parsed = JSON.parse(savedRecipes);
        const migrated = parsed.map((r: any) => ({ 
          ...r, 
          views: r.views || 0,
          isFavorite: r.isFavorite || (r.likes > 0) || false 
        }));
        setRecipes(migrated);
      } catch (e) {
        console.error("Failed to load recipes", e);
        setRecipes(INITIAL_RECIPES);
      }
    } else {
      // Always initialize with seed data for new users or guests
      setRecipes(INITIAL_RECIPES);
    }

    // Load Categories
    const savedCategories = localStorage.getItem(keys.categories);
    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories));
      } catch (e) {
        setCategories(DEFAULT_CATEGORIES);
      }
    } else {
      setCategories(DEFAULT_CATEGORIES);
    }
  }, []);

  // Initial Load (Check for active session)
  useEffect(() => {
    const activeUserJson = localStorage.getItem('active_user_session');
    let activeUser: User | null = null;
    if (activeUserJson) {
      try {
        activeUser = JSON.parse(activeUserJson);
        setUser(activeUser);
      } catch (e) {
        localStorage.removeItem('active_user_session');
      }
    }
    loadDataForUser(activeUser);
  }, [loadDataForUser]);

  // Persistence (Whenever data or user changes)
  useEffect(() => {
    const keys = getStorageKeys(user);
    if (recipes.length > 0 || user) { // Only save if data exists or user is logged in (to save empty state)
        localStorage.setItem(keys.recipes, JSON.stringify(recipes));
    }
  }, [recipes, user]);

  useEffect(() => {
    const keys = getStorageKeys(user);
    if (categories.length > 0) {
        localStorage.setItem(keys.categories, JSON.stringify(categories));
    }
  }, [categories, user]);

  // --- User Actions ---

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    localStorage.setItem('active_user_session', JSON.stringify(userData));
    setShowLogin(false);
    
    // Switch data context
    loadDataForUser(userData);
    setViewState({ type: 'HOME' });
    setSearchTerm('');
  };

  const handleLogout = () => {
    localStorage.removeItem('active_user_session');
    setUser(null);
    setShowProfile(false);
    // Revert to guest data
    loadDataForUser(null);
    setViewState({ type: 'HOME' });
    setSearchTerm('');
  };

  const handleUpdateProfile = (name: string, prefs: UserPreferences) => {
    if (!user) return;
    const updatedUser = { ...user, name, preferences: prefs };
    setUser(updatedUser);
    localStorage.setItem('active_user_session', JSON.stringify(updatedUser));
    localStorage.setItem(`user_profile_${user.phoneNumber}`, JSON.stringify(updatedUser));
    setShowProfile(false);
  };

  // --- Navigation Helpers ---
  const navigateToHome = () => {
    setSearchTerm('');
    setAiSearchResults([]);
    setViewState({ type: 'HOME' });
    setIsRecModalOpen(false);
  };

  const navigateToCategory = (categoryId: CategoryId) => {
    setSearchTerm('');
    setAiSearchResults([]);
    setViewState({ type: 'CATEGORY', categoryId });
    setIsRecModalOpen(false);
  };

  const navigateToRecipe = (recipe: Recipe) => {
    // Increment view count
    const updatedRecipes = recipes.map(r => 
      r.id === recipe.id ? { ...r, views: (r.views || 0) + 1 } : r
    );
    setRecipes(updatedRecipes);
    setViewState({ type: 'RECIPE_DETAIL', recipeId: recipe.id });
  };

  // --- Dynamic Descriptions ---
  const getCategoryDescription = (category: Category) => {
    const catRecipes = recipes.filter(r => r.categoryId === category.id);
    if (catRecipes.length === 0) return category.description;

    // Sort by views desc
    const sorted = [...catRecipes].sort((a, b) => (b.views || 0) - (a.views || 0));
    const topNames = sorted.slice(0, 3).map(r => r.name).join('、');
    return `${topNames}${sorted.length > 3 ? '等...' : ''}`;
  };

  // --- Helper: Sort Recipes (Favorites First, Then Views) ---
  const sortRecipes = (list: Recipe[]) => {
    return [...list].sort((a, b) => {
      // 1. Favorites First
      const favA = a.isFavorite ? 1 : 0;
      const favB = b.isFavorite ? 1 : 0;
      if (favA !== favB) return favB - favA;
      
      // 2. Then by Views (High to Low)
      return (b.views || 0) - (a.views || 0);
    });
  };

  // --- Recipe Actions ---

  const handleSaveRecipe = (newRecipeData: Omit<Recipe, 'id' | 'createdAt'>) => {
    if (viewState.type === 'EDIT_RECIPE') {
      const updatedRecipes = recipes.map(r => 
        r.id === viewState.recipeId ? { ...r, ...newRecipeData } : r
      );
      setRecipes(updatedRecipes);
      setViewState({ type: 'RECIPE_DETAIL', recipeId: viewState.recipeId });
    } else {
      const newRecipe: Recipe = {
        ...newRecipeData,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        views: 0,
        isFavorite: false
      };
      setRecipes(prev => [...prev, newRecipe]);
      navigateToCategory(newRecipeData.categoryId);
    }
  };

  const handleToggleFavorite = (recipeId: string) => {
    setRecipes(prev => prev.map(r => {
      if (r.id === recipeId) {
        return { ...r, isFavorite: !r.isFavorite };
      }
      return r;
    }));
  };

  const handleToggleTry = (recipeId: string) => {
    setRecipes(prev => prev.map(r => {
      if (r.id === recipeId) {
        return { ...r, isTry: !r.isTry };
      }
      return r;
    }));
  };

  const handleAddAiRecipe = (aiRecipe: Partial<Recipe>) => {
    if (!aiRecipe.name) return;
    
    // Auto-detect category or default to 'Meat' if unknown
    // Ensure we have at least one category to assign
    let targetCatId = categories[0]?.id || DEFAULT_CATEGORIES[0].id;
    
    const newRecipe: Recipe = {
      id: crypto.randomUUID(),
      categoryId: targetCatId,
      name: aiRecipe.name,
      description: aiRecipe.description || '',
      ingredients: aiRecipe.ingredients || [],
      instructions: aiRecipe.instructions || [],
      cookingTime: aiRecipe.cookingTime || '30 mins',
      difficulty: (aiRecipe.difficulty as any) || 'Medium',
      createdAt: Date.now(),
      views: 1, // Start with 1 view
      isFavorite: false
    };
    
    setRecipes(prev => [...prev, newRecipe]);
    setIsFridgeModalOpen(false); 
    // Directly set view state to avoid race condition in navigateToRecipe
    setViewState({ type: 'RECIPE_DETAIL', recipeId: newRecipe.id });
  };

  // --- Deletion Logic with Custom Dialog ---

  const handleDeleteRecipe = (recipeId: string, categoryId: CategoryId) => {
    setConfirmDialog({
      isOpen: true,
      title: '删除食谱',
      message: '确定要删除这道菜谱吗？此操作无法撤销。',
      isDangerous: true,
      action: () => {
        setRecipes(prev => prev.filter(r => r.id !== recipeId));
        if (viewState.type === 'RECIPE_DETAIL') {
           setViewState({ type: 'CATEGORY', categoryId });
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: '删除分类',
      message: '确定要删除这个分类吗？该分类下的所有食谱也会被一并删除，且无法恢复。',
      isDangerous: true,
      action: () => {
        setRecipes(prev => prev.filter(r => r.categoryId !== categoryId));
        setCategories(prev => prev.filter(c => c.id !== categoryId));
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };


  const handleGlobalAiSearch = async (initialTerm?: string) => {
    const term = initialTerm || searchTerm;
    if (!term.trim()) return;
    
    // If called with a specific term (like from daily rec), update search input
    if (initialTerm) {
        setSearchTerm(initialTerm);
    }

    setIsSuggesting(true);
    try {
      const results = await searchRecipesWithAI(term, user?.preferences);
      setAiSearchResults(results);
    } catch (e) {
      alert("AI 搜索失败，请重试");
    } finally {
      setIsSuggesting(false);
    }
  };

  // Handle Quick Add from Recommendation Modal
  const handleQuickAddRecipe = async (dishName: string, categoryId: CategoryId, categoryName: string) => {
    const aiRecipe = await generateRecipeWithAI(dishName, categoryName, user?.preferences);
    if (!aiRecipe.name) throw new Error("Failed to generate");

    const newRecipe: Recipe = {
      id: crypto.randomUUID(),
      categoryId,
      name: aiRecipe.name,
      description: aiRecipe.description || '',
      ingredients: aiRecipe.ingredients || [],
      instructions: aiRecipe.instructions || [],
      cookingTime: aiRecipe.cookingTime || '30 mins',
      difficulty: (aiRecipe.difficulty as any) || 'Medium',
      createdAt: Date.now(),
      views: 0,
      isFavorite: false
    };
    setRecipes(prev => [...prev, newRecipe]);
  };

  // --- Category Actions ---

  const handleSaveCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: `custom-${crypto.randomUUID()}`,
    };
    setCategories(prev => [...prev, newCategory]);
    navigateToHome();
  };


  const renderContent = () => {
    switch (viewState.type) {
      case 'HOME':
        const isSearching = searchTerm.trim().length > 0;
        
        const filteredCategories = categories.filter(c => 
          c.name.includes(searchTerm) || c.description.includes(searchTerm)
        );

        let localSearchResults = isSearching ? recipes.filter(r => {
           const term = searchTerm.toLowerCase();
           return (
             r.name.toLowerCase().includes(term) ||
             r.ingredients.some(ing => ing.toLowerCase().includes(term))
           );
        }) : [];

        if (isSearching && localSearchResults.length > 0) {
            localSearchResults = sortRecipes(localSearchResults);
        }

        return (
          <div className="p-4 sm:p-6 pb-24">
            {/* Persistent Search Bar */}
            <div className="mb-6 flex gap-2">
               <div className="relative flex-1">
                 <input 
                   type="text" 
                   placeholder="输入菜名或食材（如：油菜、鸡翅）..." 
                   value={searchTerm}
                   onChange={e => {
                     setSearchTerm(e.target.value);
                     if (e.target.value === '') {
                       setAiSearchResults([]); 
                     }
                   }}
                   className="w-full pl-10 pr-4 py-3 rounded-2xl border-gray-200 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                 />
                 <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
               </div>
               {isSearching && (
                 <button onClick={navigateToHome} className="text-gray-500 px-2 hover:text-gray-800 font-medium">取消</button>
               )}
            </div>
            
            {!isSearching && (
                <div className="mb-6">
                    <button 
                        onClick={() => setIsFridgeModalOpen(true)}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-xl">
                                <Refrigerator className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-lg">冰箱大搜救</h3>
                                <p className="text-xs text-blue-100 opacity-90">不知道吃什么？输入食材让 AI 帮您搭配！</p>
                            </div>
                        </div>
                        <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            )}

            {!isSearching ? (
              <>
                {/* Daily Meal Recommendation (Only visible on Home when not searching) */}
                <DailyMealRecommendation 
                   recipes={recipes}
                   onRecipeClick={navigateToRecipe}
                   onSearchClick={(term) => handleGlobalAiSearch(term)}
                />

                {/* Categories View */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredCategories.map(category => (
                    <CategoryCard
                        key={category.id}
                        category={{...category, description: getCategoryDescription(category)}}
                        count={recipes.filter(r => r.categoryId === category.id).length}
                        onClick={() => navigateToCategory(category.id)}
                        // Only allow deleting custom categories to prevent accidents with defaults
                        onDelete={category.id.startsWith('custom-') ? (e) => handleDeleteCategory(category.id) : undefined}
                    />
                    ))}
                    
                    <button 
                    onClick={() => setViewState({ type: 'ADD_CATEGORY' })}
                    className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white border-2 border-dashed border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition-all min-h-[160px] group hover:scale-[1.02] duration-300"
                    >
                    <div className="p-3 rounded-full bg-gray-100 group-hover:bg-orange-100 mb-3 transition-colors">
                        <Plus className="w-8 h-8 text-gray-400 group-hover:text-orange-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-600 group-hover:text-orange-600">更多</h3>
                    <p className="text-sm text-gray-400">添加自定义分类</p>
                    </button>
                </div>
              </>
            ) : (
              // Search Results View
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Search className="w-5 h-5 mr-2 text-orange-500" />
                  本地搜索结果 ({localSearchResults.length})
                </h2>

                {localSearchResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                    {localSearchResults.map(recipe => (
                      <div 
                        key={recipe.id}
                        onClick={() => navigateToRecipe(recipe)}
                        className={`group bg-white p-4 rounded-2xl shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border relative overflow-hidden ${recipe.isFavorite ? 'border-yellow-200 bg-yellow-50/20' : 'border-gray-100'}`}
                      >
                         <div className="flex gap-5">
                           <div className="flex-1 min-w-0 flex flex-col justify-center">
                             <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-extrabold text-xl text-gray-900 line-clamp-1">{recipe.name}</h3>
                                {recipe.isFavorite && <Star className="w-5 h-5 text-yellow-400 fill-current" />}
                                {recipe.isTry && <Sparkles className="w-5 h-5 text-indigo-500" />}
                             </div>
                             <p className="text-sm text-gray-600 line-clamp-1 mb-2">{recipe.description}</p>
                             <div className="flex items-center gap-3 text-xs">
                                 <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md font-medium">{recipe.cookingTime}</span>
                                 <div className="flex items-center gap-1 text-gray-400">
                                    <Eye className="w-3.5 h-3.5"/> <span>{recipe.views || 0}</span>
                                 </div>
                             </div>
                           </div>
                           {recipe.image && (
                             <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden shadow-sm">
                               <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 saturate-[1.1]" />
                             </div>
                           )}
                         </div>

                         {/* Action Buttons for Search Results - Fixed z-index and event handling */}
                         <div className="absolute top-3 right-3 flex space-x-2 z-30 pointer-events-auto">
                            <button
                                type="button"
                                onClick={(e) => { 
                                    e.preventDefault();
                                    e.stopPropagation(); 
                                    setViewState({ type: 'EDIT_RECIPE', recipeId: recipe.id }); 
                                }}
                                className="p-2 bg-white/90 backdrop-blur-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors shadow-sm border border-gray-100"
                                title="编辑"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => { 
                                    e.preventDefault();
                                    e.stopPropagation(); 
                                    handleDeleteRecipe(recipe.id, recipe.categoryId); 
                                }}
                                className="p-2 bg-white/90 backdrop-blur-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors shadow-sm border border-gray-100"
                                title="删除"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border-2 border-dashed border-gray-100 mb-8">
                     <p className="font-medium">本地暂无 "{searchTerm}" 的食谱</p>
                  </div>
                )}

                {/* AI Search Section */}
                <div className="border-t pt-8">
                  <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
                    AI 智能推荐
                  </h2>
                  
                  {aiSearchResults.length === 0 ? (
                    <div className="bg-indigo-50/80 rounded-2xl p-8 text-center border border-indigo-100">
                      <p className="text-indigo-900 mb-4 font-bold text-lg">
                        {localSearchResults.length === 0 
                          ? `没找到"${searchTerm}"？让 AI 帮您生成菜谱。`
                          : `想看看更多关于"${searchTerm}"的做法？`
                        }
                      </p>
                      <button
                        onClick={() => handleGlobalAiSearch()}
                        disabled={isSuggesting}
                        className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:scale-105 transition-all shadow-md disabled:opacity-50 font-bold"
                      >
                        {isSuggesting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <ChefHat className="w-5 h-5 mr-2" />}
                        AI 搜索 / 生成 "{searchTerm}"
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-500">点击下方卡片即可查看详情并添加到食谱本：</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {aiSearchResults.map((aiRecipe, idx) => (
                          <div 
                            key={idx}
                            onClick={() => handleAddAiRecipe(aiRecipe)}
                            className="group bg-white p-5 rounded-2xl shadow-sm hover:shadow-xl hover:scale-[1.02] border border-indigo-50 transition-all duration-300 cursor-pointer relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-bl-xl shadow-sm z-10">AI 推荐</div>
                            <h3 className="font-extrabold text-gray-900 text-lg mb-1 group-hover:text-indigo-700 transition-colors">{aiRecipe.name}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2 mt-1 leading-relaxed">{aiRecipe.description}</p>
                            
                            <div className="mt-4 flex items-center text-indigo-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                              <Plus className="w-4 h-4 mr-1" />
                              点击添加到我的食谱
                            </div>
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={() => setAiSearchResults([])}
                        className="text-sm text-gray-400 hover:text-gray-600 mt-4 underline block mx-auto"
                      >
                        清空 AI 推荐结果
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Floating Action Button */}
            <SeasonalRecommendation onSearch={(term) => setSearchTerm(term)} />
          </div>
        );

      case 'ADD_CATEGORY':
        return (
          <CategoryForm 
            onSave={handleSaveCategory}
            onCancel={() => navigateToHome()}
          />
        );

      case 'CATEGORY':
        const category = categories.find(c => c.id === viewState.categoryId);
        if (!category) return <div>Category not found</div>;

        const filteredRecipes = recipes.filter(r => {
           if (r.categoryId !== category.id) return false;
           const term = searchTerm.toLowerCase();
           return (
             r.name.toLowerCase().includes(term) ||
             r.description.toLowerCase().includes(term) ||
             r.ingredients.some(ing => ing.toLowerCase().includes(term))
           );
        });

        // SORTING: Favorites first, then by views desc
        const sortedRecipes = sortRecipes(filteredRecipes);

        return (
          <div className="p-4 sm:p-6 min-h-screen">
            {/* Floating Back Button using Fixed Positioning */}
            <div className="fixed top-24 left-6 z-50">
              <button 
                onClick={() => navigateToHome()}
                className="flex items-center justify-center w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-2xl border border-white/50 text-gray-700 hover:text-orange-600 hover:scale-110 transition-all duration-300"
                title="返回首页"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            </div>

            {/* Top Action Bar (Non-floating part) */}
            <div className="flex justify-end gap-3 mb-6">
                <button 
                  onClick={() => setIsRecModalOpen(true)}
                  className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 hover:scale-105 transition-all shadow-sm text-sm font-bold"
                >
                   <BookOpen className="w-4 h-4 mr-2" />
                   灵感菜单
                </button>
                <button
                  onClick={() => setViewState({ type: 'ADD_RECIPE', categoryId: category.id })}
                  className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 hover:scale-105 transition-all shadow-lg text-sm font-bold hover:shadow-orange-500/30"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  添加食谱
                </button>
            </div>

            <div className="flex items-center gap-4 mb-8">
               <div className={`p-4 rounded-3xl ${category.color} bg-opacity-20 shadow-sm`}>
                 {getIconComponent(category.icon, "w-10 h-10")}
               </div>
               <div>
                 <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{category.name}</h2>
                 <p className="text-gray-500 font-medium mt-1">{getCategoryDescription(category)}</p>
               </div>
            </div>

            {/* Recipe Search Bar */}
            <div className="mb-8 relative">
               <input 
                 type="text" 
                 placeholder={`在 ${category.name} 中搜索食谱...`}
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
                 className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-gray-200 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none text-lg"
               />
               <Search className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
            </div>

            {sortedRecipes.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                {searchTerm ? (
                  <>
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">未找到相关食谱</h3>
                    <p className="mt-2 text-gray-500">换个关键词试试？</p>
                  </>
                ) : (
                  <>
                    <div className="mx-auto w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                      <Plus className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">暂无食谱</h3>
                    <p className="mt-2 text-gray-500 mb-6">您可以手动添加，或使用“灵感菜单”获取推荐。</p>
                    <button 
                      onClick={() => setIsRecModalOpen(true)}
                      className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:scale-105 transition-all shadow-md font-bold"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      打开灵感菜单
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {sortedRecipes.map(recipe => (
                  <div 
                    key={recipe.id}
                    onClick={() => navigateToRecipe(recipe)}
                    className={`group bg-white p-5 rounded-2xl shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border relative overflow-hidden ${recipe.isFavorite ? 'border-yellow-200 bg-yellow-50/20' : 'border-gray-100'}`}
                  >
                    <div className="flex gap-5">
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2">
                            {/* Difficulty Dot */}
                           <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                             recipe.difficulty === 'Easy' ? 'bg-green-500' :
                             recipe.difficulty === 'Medium' ? 'bg-yellow-500' :
                             'bg-red-500'
                           }`}></span>
                           <h3 className="font-extrabold text-xl text-gray-900 truncate">{recipe.name}</h3>
                           {recipe.isFavorite && (
                             <Star className="w-5 h-5 text-yellow-400 fill-current flex-shrink-0" />
                           )}
                           {recipe.isTry && (
                             <Sparkles className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                           )}
                        </div>
                        
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3 leading-relaxed">
                          {recipe.description || recipe.instructions[0]}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                           <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md">
                             <Clock className="w-3.5 h-3.5"/> 
                             <span>{recipe.cookingTime}</span>
                           </div>
                           <div className="flex items-center gap-1.5">
                             <Eye className="w-3.5 h-3.5"/> 
                             <span>{recipe.views || 0}</span>
                           </div>
                        </div>
                      </div>
                      
                      {recipe.image && (
                         <div className="w-28 h-28 flex-shrink-0 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                           <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 saturate-[1.1]" />
                         </div>
                      )}
                    </div>
                    
                    {/* Recipe Action Buttons on List View - Fixed z-index and event handling */}
                    <div className="absolute top-3 right-3 flex space-x-2 z-30 pointer-events-auto">
                      <button
                        type="button"
                        onClick={(e) => { 
                            e.preventDefault();
                            e.stopPropagation(); 
                            setViewState({ type: 'EDIT_RECIPE', recipeId: recipe.id }); 
                        }}
                        className="p-2 bg-white/90 backdrop-blur-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors shadow-sm border border-gray-100"
                        title="编辑"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { 
                            e.preventDefault();
                            e.stopPropagation(); 
                            handleDeleteRecipe(recipe.id, category.id); 
                        }}
                        className="p-2 bg-white/90 backdrop-blur-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors shadow-sm border border-gray-100"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Recommendation Modal */}
            {isRecModalOpen && (
              <RecommendationModal 
                categoryName={category.name}
                existingRecipes={recipes.filter(r => r.categoryId === category.id)}
                onClose={() => setIsRecModalOpen(false)}
                onAddRecipe={(name) => handleQuickAddRecipe(name, category.id, category.name)}
              />
            )}
          </div>
        );

      case 'ADD_RECIPE':
        const addCategory = categories.find(c => c.id === viewState.categoryId);
        return (
          <RecipeForm
            categoryId={viewState.categoryId}
            categoryName={addCategory?.name || ''}
            onSave={handleSaveRecipe}
            onCancel={() => setViewState({ type: 'CATEGORY', categoryId: viewState.categoryId })}
          />
        );
      
      case 'EDIT_RECIPE':
        const editRecipe = recipes.find(r => r.id === viewState.recipeId);
        if (!editRecipe) return <div>Recipe not found</div>;
        const editCategory = categories.find(c => c.id === editRecipe.categoryId);
        
        return (
          <RecipeForm
            categoryId={editRecipe.categoryId}
            categoryName={editCategory?.name || ''}
            initialData={editRecipe}
            onSave={handleSaveRecipe}
            onCancel={() => setViewState({ type: 'RECIPE_DETAIL', recipeId: editRecipe.id })}
          />
        );

      case 'RECIPE_DETAIL':
        const recipe = recipes.find(r => r.id === viewState.recipeId);
        if (!recipe) return <div>Recipe not found</div>;
        return (
          <RecipeDetail
            recipe={recipe}
            onBack={() => setViewState({ type: 'CATEGORY', categoryId: recipe.categoryId })}
            onEdit={() => setViewState({ type: 'EDIT_RECIPE', recipeId: recipe.id })}
            onDelete={() => handleDeleteRecipe(recipe.id, recipe.categoryId)}
            onToggleFavorite={() => handleToggleFavorite(recipe.id)}
            onToggleTry={() => handleToggleTry(recipe.id)}
          />
        );

      case 'TRY_LIST':
        const tryRecipes = recipes.filter(r => r.isTry);
        return (
          <div className="p-4 sm:p-6 pb-24">
            <div className="flex items-center gap-3 mb-8">
               <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-600 shadow-sm">
                 <Sparkles className="w-8 h-8" />
               </div>
               <div>
                 <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">try 一 try</h2>
                 <p className="text-gray-500 font-medium mt-1">先存着，以后学着做，挑战一下自己</p>
               </div>
            </div>

            {tryRecipes.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <div className="mx-auto w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <Sparkles className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">暂无挑战</h3>
                <p className="mt-2 text-gray-500 mb-6">在食谱详情页点击“try 一 try”，即可将其加入此列表。</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => navigateToHome()}
                    className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 hover:shadow-lg hover:scale-105 transition-all shadow-md font-bold"
                  >
                    去发现美味
                  </button>
                  <button 
                    onClick={() => setIsFridgeModalOpen(true)}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg hover:scale-105 transition-all shadow-md font-bold"
                  >
                    <Refrigerator className="w-5 h-5 mr-2" />
                    冰箱大搜救
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {tryRecipes.map(recipe => (
                  <div 
                    key={recipe.id}
                    onClick={() => navigateToRecipe(recipe)}
                    className="group bg-white p-5 rounded-2xl shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border border-indigo-200 bg-indigo-50/20 relative overflow-hidden"
                  >
                    <div className="flex gap-5">
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2">
                           <h3 className="font-extrabold text-xl text-gray-900 truncate">{recipe.name}</h3>
                           <Sparkles className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                        </div>
                        
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3 leading-relaxed">
                          {recipe.description || recipe.instructions[0]}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                           <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md">
                             <Clock className="w-3.5 h-3.5"/> 
                             <span>{recipe.cookingTime}</span>
                           </div>
                           <div className="flex items-center gap-1.5">
                             <Eye className="w-3.5 h-3.5"/> 
                             <span>{recipe.views || 0}</span>
                           </div>
                        </div>
                      </div>
                      
                      {recipe.image && (
                         <div className="w-28 h-28 flex-shrink-0 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                           <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 saturate-[1.1]" />
                         </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'SIGNATURE_DISHES':
        const favoriteRecipes = recipes.filter(r => r.isFavorite);
        return (
          <div className="p-4 sm:p-6 pb-24">
            <div className="flex items-center gap-3 mb-8">
               <div className="p-3 rounded-2xl bg-yellow-100 text-yellow-600 shadow-sm">
                 <Star className="w-8 h-8 fill-current" />
               </div>
               <div>
                 <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">拿手好菜</h2>
                 <p className="text-gray-500 font-medium mt-1">您收藏的美味佳肴都在这里</p>
               </div>
            </div>

            {favoriteRecipes.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <div className="mx-auto w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <Star className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">暂无收藏</h3>
                <p className="mt-2 text-gray-500 mb-6">点击食谱详情页的星星图标，即可将其加入“拿手好菜”。</p>
                <button 
                  onClick={() => navigateToHome()}
                  className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 hover:shadow-lg hover:scale-105 transition-all shadow-md font-bold"
                >
                  去发现美味
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {favoriteRecipes.map(recipe => (
                  <div 
                    key={recipe.id}
                    onClick={() => navigateToRecipe(recipe)}
                    className="group bg-white p-5 rounded-2xl shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border border-yellow-200 bg-yellow-50/20 relative overflow-hidden"
                  >
                    <div className="flex gap-5">
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2">
                           <h3 className="font-extrabold text-xl text-gray-900 truncate">{recipe.name}</h3>
                           <Star className="w-5 h-5 text-yellow-400 fill-current flex-shrink-0" />
                        </div>
                        
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3 leading-relaxed">
                          {recipe.description || recipe.instructions[0]}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                           <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md">
                             <Clock className="w-3.5 h-3.5"/> 
                             <span>{recipe.cookingTime}</span>
                           </div>
                           <div className="flex items-center gap-1.5">
                             <Eye className="w-3.5 h-3.5"/> 
                             <span>{recipe.views || 0}</span>
                           </div>
                        </div>
                      </div>
                      
                      {recipe.image && (
                         <div className="w-28 h-28 flex-shrink-0 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                           <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 saturate-[1.1]" />
                         </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
      default:
        return <div>Unknown view</div>;
    }
  };

  return (
    <Layout 
      onHomeClick={() => navigateToHome()}
      onTryClick={() => setViewState({ type: 'TRY_LIST' })}
      onSignatureClick={() => setViewState({ type: 'SIGNATURE_DISHES' })}
      user={user}
      onLoginClick={() => setShowLogin(true)}
      onProfileClick={() => setShowProfile(true)}
    >
      {renderContent()}
      
      {showLogin && (
        <LoginModal 
          onLogin={handleLoginSuccess}
          onClose={() => setShowLogin(false)}
        />
      )}

      {showProfile && user && (
        <UserProfile 
          user={user}
          onSave={handleUpdateProfile}
          onLogout={handleLogout}
          onClose={() => setShowProfile(false)}
        />
      )}

      {isFridgeModalOpen && (
        <FridgeModal 
            onClose={() => setIsFridgeModalOpen(false)}
            onAddRecipe={handleAddAiRecipe}
            userPrefs={user?.preferences}
        />
      )}

      {/* Global Confirmation Dialog */}
      <ConfirmDialog 
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDangerous={confirmDialog.isDangerous}
        onConfirm={confirmDialog.action}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </Layout>
  );
}