import { useState, useCallback } from 'react';
import * as chatbotService from '../services/chatbot.service';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  recommendations?: chatbotService.MealRecommendation[];
  nutritionalSummary?: string;
  responseType?: 'CHAT' | 'MEAL_RECOMMENDATION';
}

interface UserHealthInfo {
  age: number;
  weight: number;
  height: number;
  gender: string;
  activityLevel: string;
  fitnessGoal: string;
}

export function useChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (userMessage: string, userHealthInfo?: UserHealthInfo | null) => {
    if (!userMessage.trim()) return;

    // Add user message to chat
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      content: userMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    try {
      // Check if message contains "5 món ăn" or similar keywords
      const hasFoodRecommendationKeyword = /5\s*món\s*ăn|năm\s*món\s*ăn|gợi\s*ý\s*5|recommendation.*5.*meal/i.test(
        userMessage
      );

      let request: chatbotService.ChatbotRequest;

      if (hasFoodRecommendationKeyword && userHealthInfo) {
        // Call with user health info
        request = {
          message: userMessage,
          userHealthInfo: {
            age: userHealthInfo.age,
            weight: userHealthInfo.weight,
            height: userHealthInfo.height,
            gender: userHealthInfo.gender,
            activityLevel: userHealthInfo.activityLevel,
            fitnessGoal: userHealthInfo.fitnessGoal,
          },
        };
      } else {
        // Call without user health info
        request = {
          message: userMessage,
        };
      }

      const response = await chatbotService.sendChatMessage(request);

      if (response.data) {
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: response.data.response,
          sender: 'bot',
          timestamp: new Date(),
          responseType: response.data.responseType,
          recommendations: response.data.recommendations,
          nutritionalSummary: response.data.nutritionalSummary,
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('Chatbot error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearMessages,
  };
}
