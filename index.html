import React, { useState } from 'react';
import { User, UserPreferences } from '../types';
import { X, Save, User as UserIcon, LogOut } from 'lucide-react';

interface UserProfileProps {
  user: User;
  onSave: (name: string, prefs: UserPreferences) => void;
  onLogout: () => void;
  onClose: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onSave, onLogout, onClose }) => {
  const [name, setName] = useState(user.name);
  const [spiciness, setSpiciness] = useState(user.preferences.spiciness);
  const [dietary, setDietary] = useState(user.preferences.dietaryRestrictions);
  const [flavors, setFlavors] = useState(user.preferences.favoriteFlavors);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name, {
      spiciness,
      dietaryRestrictions: dietary,
      favoriteFlavors: flavors
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <UserIcon className="w-5 h-5 mr-2 text-orange-500" />
            个人中心
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm text-gray-500">手机账号</p>
              <p className="text-xl font-bold text-gray-800 font-mono">{user.phoneNumber}</p>
            </div>
          </div>

          <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 p-2 border"
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="text-md font-bold text-gray-800 mb-3">口味偏好 (AI生成时会参考)</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">辣度接受度</label>
                <div className="grid grid-cols-5 gap-2">
                  {(['No Spicy', 'Mild', 'Medium', 'Hot', 'Crazy'] as const).map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSpiciness(level)}
                      className={`py-1 px-2 rounded-md text-xs font-medium border ${
                        spiciness === level 
                          ? 'bg-red-50 border-red-500 text-red-600' 
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {level === 'No Spicy' ? '不辣' : 
                       level === 'Mild' ? '微辣' : 
                       level === 'Medium' ? '中辣' : 
                       level === 'Hot' ? '特辣' : '变态辣'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">忌口 / 饮食限制</label>
                <input 
                  type="text" 
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 p-2 border"
                  placeholder="例如：不要香菜，花生过敏"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">喜欢的风味</label>
                <input 
                  type="text" 
                  value={flavors}
                  onChange={(e) => setFlavors(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 p-2 border"
                  placeholder="例如：糖醋，蒜香，麻辣"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-between gap-4">
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            退出登录
          </button>
          <button
            type="submit"
            form="profile-form"
            className="flex items-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <Save className="w-4 h-4 mr-2" />
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
};
