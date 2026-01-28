import React from 'react';
import { ChefHat, UserCircle } from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  onHomeClick: () => void;
  user: User | null;
  onLoginClick: () => void;
  onProfileClick: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  onHomeClick, 
  user,
  onLoginClick,
  onProfileClick
}) => {
  return (
    <div className="min-h-screen flex flex-col max-w-5xl mx-auto bg-white shadow-xl overflow-hidden">
      <header className="bg-orange-500 text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between">
          <button 
            onClick={onHomeClick}
            className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
          >
            <ChefHat className="w-8 h-8" />
            <h1 className="text-xl font-bold tracking-wide">智能食谱</h1>
          </button>
          
          <div className="flex items-center gap-4">
             <div className="text-sm opacity-90 hidden sm:block">
               你的私人厨房助手
             </div>
             
             {user ? (
               <button 
                 onClick={onProfileClick}
                 className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 py-1.5 px-3 rounded-full transition-colors border border-orange-400"
               >
                 <div className="w-6 h-6 rounded-full bg-white text-orange-600 flex items-center justify-center text-xs font-bold">
                   {user.name.charAt(0)}
                 </div>
                 <span className="text-sm font-medium truncate max-w-[80px]">{user.name}</span>
               </button>
             ) : (
               <button 
                 onClick={onLoginClick}
                 className="flex items-center gap-1.5 bg-white text-orange-600 hover:bg-orange-50 py-1.5 px-3 rounded-full text-sm font-bold transition-colors shadow-sm"
               >
                 <UserCircle className="w-4 h-4" />
                 登录
               </button>
             )}
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto bg-[#fdfbf7]">
        {children}
      </main>
      <footer className="p-4 bg-gray-50 text-center text-gray-400 text-xs border-t">
        © 2024 Smart Recipe Book. Powered by Gemini.
      </footer>
    </div>
  );
};
