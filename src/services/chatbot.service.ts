import * as httpClient from '../lib/http-client';

export interface UserHealthInfo {
  age: number;
  weight: number;
  height: number;
  gender: string;
  activityLevel: string;
  fitnessGoal: string;
}

export interface ChatbotRequest {
  message: string;
  userHealthInfo?: UserHealthInfo;
}

export interface MealRecommendation {
  mealId: number;
  mealName: string;
  description: string;
  imageUrl: string;
  calories: number;
  cookingTime: string;
  servings: number;
  category: string | null;
  matchScore: number;
  recommendationReason: string;
  nutritionalBenefits: string;
  mealLink: string;
}

export interface ChatbotResponse {
  response: string;
  responseType: 'CHAT' | 'MEAL_RECOMMENDATION';
  recommendations?: MealRecommendation[];
  totalRecommendations?: number;
  estimatedTotalCalories?: number;
  nutritionalSummary?: string;
  timestamp: number;
}

/**
 * Send message to chatbot API
 * API: POST /api/chatbot/chat
 */
export const sendChatMessage = async (request: ChatbotRequest) => {
  return httpClient.post<ChatbotResponse>('/chatbot/chat', request);
};
