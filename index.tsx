import { Category, CategoryIdEnum } from './types';
import { 
  Beef, 
  Salad, 
  Soup, 
  Utensils, 
  Cookie, 
  IceCream, 
  Coffee, 
  Heart 
} from 'lucide-react';
import React from 'react';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: CategoryIdEnum.MEAT,
    name: '荤菜',
    icon: 'Beef',
    color: 'bg-red-100 text-red-600',
    description: '红烧肉、回锅肉、清蒸鱼等肉类佳肴'
  },
  {
    id: CategoryIdEnum.VEGETABLE,
    name: '素菜',
    icon: 'Salad',
    color: 'bg-green-100 text-green-600',
    description: '清炒时蔬、地三鲜、麻婆豆腐等素食'
  },
  {
    id: CategoryIdEnum.SOUP,
    name: '汤类',
    icon: 'Soup',
    color: 'bg-blue-100 text-blue-600',
    description: '老火靓汤、快手蛋花汤、羹类'
  },
  {
    id: CategoryIdEnum.STAPLE,
    name: '主食类',
    icon: 'Utensils',
    color: 'bg-yellow-100 text-yellow-600',
    description: '米饭、面条、饺子、包子'
  },
  {
    id: CategoryIdEnum.SNACK,
    name: '小吃',
    icon: 'Cookie',
    color: 'bg-orange-100 text-orange-600',
    description: '炸鸡、烤串、春卷等休闲小食'
  },
  {
    id: CategoryIdEnum.DESSERT,
    name: '甜品',
    icon: 'IceCream',
    color: 'bg-pink-100 text-pink-600',
    description: '蛋糕、糖水、冰淇淋'
  },
  {
    id: CategoryIdEnum.DRINK,
    name: '饮品',
    icon: 'Coffee',
    color: 'bg-cyan-100 text-cyan-600',
    description: '果汁、奶茶、养生茶'
  },
  {
    id: CategoryIdEnum.HEALTH,
    name: '养生',
    icon: 'Heart',
    color: 'bg-emerald-100 text-emerald-600',
    description: '药膳、滋补炖品、低卡餐'
  }
];

export const getIconComponent = (iconName: string, className?: string) => {
  const props = { className: className || "w-6 h-6" };
  switch (iconName) {
    case 'Beef': return <Beef {...props} />;
    case 'Salad': return <Salad {...props} />;
    case 'Soup': return <Soup {...props} />;
    case 'Utensils': return <Utensils {...props} />;
    case 'Cookie': return <Cookie {...props} />;
    case 'IceCream': return <IceCream {...props} />;
    case 'Coffee': return <Coffee {...props} />;
    case 'Heart': return <Heart {...props} />;
    default: return <Utensils {...props} />;
  }
};
