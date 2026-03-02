export enum CategoryIdEnum {
  MEAT = 'meat',
  VEGETABLE = 'vegetable',
  SOUP = 'soup',
  STAPLE = 'staple',
  SNACK = 'snack',
  DESSERT = 'dessert',
  DRINK = 'drink',
  HEALTH = 'health'
}

export type CategoryId = string;

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface UserPreferences {
  spiciness: 'No Spicy' | 'Mild' | 'Medium' | 'Hot' | 'Crazy';
  dietaryRestrictions: string; // e.g. "No Cilantro, No Peanuts"
  favoriteFlavors: string; // e.g. "Sweet and Sour, Garlic"
}

export interface User {
  phoneNumber: string;
  password?: string; // Encrypted or plain text for this demo
  name: string;
  avatar?: string;
  preferences: UserPreferences;
  createdAt: number;
}

export interface Recipe {
  id: string;
  categoryId: CategoryId;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags?: string[]; // Health tags like "Low Calorie", "High Protein"
  image?: string; // Base64 Data URL for the dish photo
  createdAt: number;
  views?: number; // Track popularity
  isFavorite?: boolean; // Track if favorited/collected
  isTry?: boolean; // "try 一 try" flag
}

export type ViewState = 
  | { type: 'HOME' }
  | { type: 'CATEGORY'; categoryId: CategoryId }
  | { type: 'RECIPE_DETAIL'; recipeId: string }
  | { type: 'ADD_RECIPE'; categoryId: CategoryId }
  | { type: 'EDIT_RECIPE'; recipeId: string }
  | { type: 'ADD_CATEGORY' }
  | { type: 'SIGNATURE_DISHES' }
  | { type: 'TRY_LIST' };
