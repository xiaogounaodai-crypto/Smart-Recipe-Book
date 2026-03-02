import React, { useState } from 'react';
import { X, Smartphone, ArrowRight, Lock, UserPlus, LogIn } from 'lucide-react';
import { User } from '../types';

interface LoginModalProps {
  onLogin: (user: User) => void;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onClose }) => {
  const [step, setStep] = useState<'phone' | 'password_login' | 'password_register'>('phone');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [tempUser, setTempUser] = useState<User | null>(null);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (phone.length < 11) {
      setError('请输入有效的11位手机号');
      return;
    }

    // Check if user exists in localStorage
    const userKey = `user_profile_${phone}`;
    const storedUser = localStorage.getItem(userKey);

    if (storedUser) {
      // User exists, go to login
      setTempUser(JSON.parse(storedUser));
      setStep('password_login');
    } else {
      // New user, go to register
      setStep('password_register');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError('密码至少需要6位');
      return;
    }

    // Create new user
    const newUser: User = {
      phoneNumber: phone,
      password: password, // In a real app, hash this!
      name: `用户${phone.slice(-4)}`,
      createdAt: Date.now(),
      preferences: {
        spiciness: 'Medium',
        dietaryRestrictions: '',
        favoriteFlavors: ''
      }
    };

    // Save profile immediately
    localStorage.setItem(`user_profile_${phone}`, JSON.stringify(newUser));
    onLogin(newUser);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUser) return;

    if (tempUser.password === password) {
      onLogin(tempUser);
    } else {
      setError('密码错误，请重试');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">
            {step === 'phone' ? '登录 / 注册' : step === 'password_login' ? '欢迎回来' : '创建新账号'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
           <div className="flex justify-center mb-6">
             <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
               step === 'password_register' ? 'bg-green-100' : 'bg-orange-100'
             }`}>
               {step === 'phone' && <Smartphone className="w-8 h-8 text-orange-500" />}
               {step === 'password_login' && <LogIn className="w-8 h-8 text-orange-500" />}
               {step === 'password_register' && <UserPlus className="w-8 h-8 text-green-600" />}
             </div>
           </div>
           
           {step === 'phone' && (
             <form onSubmit={handlePhoneSubmit} className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">手机号码</label>
                 <input 
                   type="tel" 
                   value={phone}
                   onChange={(e) => setPhone(e.target.value)}
                   className="block w-full rounded-xl border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 p-3 border"
                   placeholder="请输入手机号"
                   autoFocus
                 />
               </div>
               {error && <p className="text-xs text-red-500">{error}</p>}
               <button 
                 type="submit"
                 className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
               >
                 下一步 <ArrowRight className="ml-2 w-4 h-4" />
               </button>
             </form>
           )}

           {step === 'password_login' && (
             <form onSubmit={handleLogin} className="space-y-4">
               <div className="text-center mb-2">
                 <p className="text-gray-800 font-medium">{phone}</p>
                 <button type="button" onClick={() => setStep('phone')} className="text-xs text-orange-600">切换账号</button>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                 <input 
                   type="password" 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="block w-full rounded-xl border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 p-3 border"
                   placeholder="请输入登录密码"
                   autoFocus
                 />
               </div>
               {error && <p className="text-xs text-red-500">{error}</p>}
               <button 
                 type="submit"
                 className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
               >
                 <LogIn className="mr-2 w-4 h-4" />
                 登录
               </button>
             </form>
           )}

           {step === 'password_register' && (
             <form onSubmit={handleRegister} className="space-y-4">
               <div className="text-center mb-2">
                 <p className="text-sm text-gray-500">该手机号尚未注册</p>
                 <p className="text-gray-800 font-medium">{phone}</p>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">设置密码</label>
                 <input 
                   type="password" 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="block w-full rounded-xl border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 p-3 border"
                   placeholder="请设置6位以上密码"
                   autoFocus
                 />
               </div>
               {error && <p className="text-xs text-red-500">{error}</p>}
               <button 
                 type="submit"
                 className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
               >
                 <UserPlus className="mr-2 w-4 h-4" />
                 注册并登录
               </button>
               <button type="button" onClick={() => setStep('phone')} className="w-full text-xs text-gray-400 mt-2">返回修改手机号</button>
             </form>
           )}
        </div>
      </div>
    </div>
  );
};
