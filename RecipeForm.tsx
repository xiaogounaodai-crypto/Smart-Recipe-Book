import React from 'react';
import { ChefHat, UserCircle, Sparkles, Star } from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  onHomeClick: () => void;
  onTryClick: () => void;
  onSignatureClick: () => void;
  user: User | null;
  onLoginClick: () => void;
  onProfileClick: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  onHomeClick, 
  onTryClick,
  onSignatureClick,
  user,
  onLoginClick,
  onProfileClick
}) => {
  return (
    <div className="min-h-screen flex flex-col max-w-5xl mx-auto bg-white shadow-xl overflow-hidden">
      <header className="bg-orange-500 text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={onHomeClick}
              className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
            >
              <ChefHat className="w-8 h-8" />
              <h1 className="text-xl font-bold tracking-wide">智能食谱</h1>
            </button>
            
            {/* Mobile Account Button */}
            <div className="sm:hidden">
              {user ? (
                <button onClick={onProfileClick} className="w-8 h-8 rounded-full bg-white text-orange-600 flex items-center justify-center text-xs font-bold">
                  {user.name.charAt(0)}
                </button>
              ) : (
                <button onClick={onLoginClick} className="text-white">
                  <UserCircle className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>

          <nav className="flex items-center justify-center sm:justify-start gap-6 text-sm font-medium">
            <button 
              onClick={onHomeClick}
              className="hover:text-orange-100 transition-colors py-1 border-b-2 border-transparent hover:border-orange-200"
            >
              首页
            </button>
            <button 
              onClick={onTryClick}
              className="hover:text-orange-100 transition-colors py-1 border-b-2 border-transparent hover:border-orange-200 flex items-center gap-1"
            >
              <Sparkles className="w-4 h-4" />
              try 一 try
            </button>
            <button 
              onClick={onSignatureClick}
              className="hover:text-orange-100 transition-colors py-1 border-b-2 border-transparent hover:border-orange-200 flex items-center gap-1"
            >
              <Star className="w-4 h-4" />
              拿手好菜
            </button>
            <button 
              onClick={user ? onProfileClick : onLoginClick}
              className="hover:text-orange-100 transition-colors py-1 border-b-2 border-transparent hover:border-orange-200 flex items-center gap-1"
            >
              <UserCircle className="w-4 h-4" />
              账号
            </button>
          </nav>
          
          <div className="hidden sm:flex items-center gap-4">
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
        © 2026 Smart Recipe Book. Powered by Gemini.
      </footer>
    </div>
  );
};
