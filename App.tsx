import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, UserPreferences } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Define the schema for a structured recipe response
const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "The name of the dish in Chinese." },
    description: { type: Type.STRING, description: "A short, appetizing description of the dish." },
    ingredients: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of ingredients with quantities (e.g., '500g 猪肉')."
    },
    instructions: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Step-by-step cooking instructions."
    },
    cookingTime: { type: Type.STRING, description: "Total cooking time (e.g., '45分钟')." },
    difficulty: { 
      type: Type.STRING, 
      enum: ["Easy", "Medium", "Hard"],
      description: "Difficulty level."
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Health and dietary tags, e.g., '低卡' (Low Calorie), '高蛋白' (High Protein), '生酮' (Keto), '快手' (Quick), '素食' (Vegetarian)."
    }
  },
  required: ["name", "description", "ingredients", "instructions", "cookingTime", "difficulty"]
};

// Schema for search results (list of recipes)
const searchResultSchema = {
  type: Type.ARRAY,
  items: recipeSchema
};

// Schema for simple list of dish names
const dishListSchema = {
  type: Type.OBJECT,
  properties: {
    dishes: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of 15 classic or popular dish names."
    }
  }
};

const formatPreferences = (prefs?: UserPreferences) => {
  if (!prefs) return "";
  let context = "User Preferences (Please adapt the recipe if possible): ";
  if (prefs.spiciness) context += `Spiciness Level: ${prefs.spiciness}. `;
  if (prefs.dietaryRestrictions) context += `Dietary Restrictions (Avoid these): ${prefs.dietaryRestrictions}. `;
  if (prefs.favoriteFlavors) context += `Preferred Flavors: ${prefs.favoriteFlavors}. `;
  return context;
};

export const generateRecipeWithAI = async (dishName: string, categoryName: string, prefs?: UserPreferences): Promise<Partial<Recipe>> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure it in your environment.");
  }

  const prefContext = formatPreferences(prefs);
  const prompt = `请为“${categoryName}”类别下的菜品“${dishName}”生成一份详细的食谱。请使用中文回答。
  请根据食材特点添加适当的标签（tags），例如：低卡、高蛋白、减脂、生酮、滋补、快手等。
  ${prefContext}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
        systemInstruction: "You are a professional Chinese chef helper. Generate authentic and detailed recipes. Pay close attention to user dietary restrictions and spiciness preferences. Always include relevant health tags."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);
    return {
      name: data.name,
      description: data.description,
      ingredients: data.ingredients,
      instructions: data.instructions,
      cookingTime: data.cookingTime,
      difficulty: data.difficulty,
      tags: data.tags || [],
    };
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
};

export const suggestRandomRecipe = async (categoryName: string, prefs?: UserPreferences): Promise<Partial<Recipe>> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const prefContext = formatPreferences(prefs);
  const prompt = `请推荐一道经典的“${categoryName}”。直接生成食谱详情，包含健康标签（tags）。${prefContext}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Suggestion Error:", error);
    throw error;
  }
};

export const searchRecipesWithAI = async (searchTerm: string, prefs?: UserPreferences): Promise<Partial<Recipe>[]> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const prefContext = formatPreferences(prefs);
  const prompt = `用户想找"${searchTerm}"相关的菜谱。${prefContext}
  1. 如果"${searchTerm}"是一道具体的菜，请生成这道菜的食谱，并额外推荐2道相似或搭配的菜。
  2. 如果"${searchTerm}"是食材，请推荐3道使用该食材的经典菜谱。
  请直接返回3个食谱的详细JSON数组，确保包含健康标签（tags）。`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: searchResultSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Search Error:", error);
    throw error;
  }
};

export const recommendFromIngredients = async (ingredients: string[], prefs?: UserPreferences): Promise<Partial<Recipe>[]> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const prefContext = formatPreferences(prefs);
  const ingredientStr = ingredients.join('、');
  const prompt = `用户的冰箱里有这些食材：${ingredientStr}。
  请根据这些食材推荐3道合适的菜谱。
  要求：
  1. 尽量利用给定食材。
  2. 如果缺少少量配料（如葱姜蒜调料）可以默认用户家里有。
  3. 菜谱要美味且做法家常。
  4. 请务必添加合适的健康标签（tags）。
  ${prefContext}
  请直接返回3个详细的食谱JSON数组。`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: searchResultSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Ingredient Recommendation Error:", error);
    throw error;
  }
};

export const getRecommendedDishes = async (categoryName: string): Promise<string[]> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const prompt = `请列出15道最经典的“${categoryName}”菜名。只返回菜名列表，不要包含其他内容。例如：['红烧肉', '糖醋排骨', ...]`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: dishListSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const data = JSON.parse(text);
    return data.dishes || [];
  } catch (error) {
    console.error("AI Recommendation List Error:", error);
    // Fallback list if AI fails
    return ["推荐菜品1", "推荐菜品2", "推荐菜品3"];
  }
};
