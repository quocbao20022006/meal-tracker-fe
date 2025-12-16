import React, { useState, useRef, useEffect } from 'react';
import { useChatbot } from '../hooks/useChatbot';
import { UserProfile } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send, Loader, MessageCircle, X } from 'lucide-react';
import MealRecommendationCard from './MealRecommendationCard';

interface ChatbotProps {
  userProfile?: UserProfile;
}

interface UserHealthInfo {
  age: number;
  weight: number;
  height: number;
  gender: string;
  activityLevel: string;
  fitnessGoal: string;
}

export default function Chatbot({ userProfile }: ChatbotProps) {
  const { messages, loading, error, sendMessage, clearMessages } = useChatbot();
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [userHealthInfo, setUserHealthInfo] = useState<UserHealthInfo | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-populate from profile if exists (only once)
  useEffect(() => {
    if (userProfile && !userHealthInfo && isOpen) {
      const age = userProfile.age || Math.floor(
        (new Date().getFullYear() - new Date(userProfile.birthDate).getFullYear())
      );
      setUserHealthInfo({
        age,
        weight: userProfile.weight,
        height: userProfile.height,
        gender: userProfile.gender.toUpperCase(),
        activityLevel: userProfile.activityLevel || 'MODERATELY_ACTIVE',
        fitnessGoal: userProfile.goal?.toUpperCase() || 'WEIGHT_LOSS',
      });
    }
  }, [userProfile, isOpen]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Check if user is asking for meal recommendation without health info
    const hasFoodRecommendationKeyword = /5\s*món\s*ăn|năm\s*món\s*ăn|gợi\s*ý\s*5|recommendation.*5.*meal/i.test(
      inputValue
    );

    if (hasFoodRecommendationKeyword && !userHealthInfo) {
      // If we have userProfile, populate from it
      if (userProfile) {
        const age = userProfile.age || Math.floor(
          (new Date().getFullYear() - new Date(userProfile.birthDate).getFullYear())
        );
        const healthInfo: UserHealthInfo = {
          age,
          weight: userProfile.weight,
          height: userProfile.height,
          gender: userProfile.gender.toUpperCase(),
          activityLevel: userProfile.activityLevel || 'MODERATELY_ACTIVE',
          fitnessGoal: userProfile.goal?.toUpperCase() || 'WEIGHT_LOSS',
        };
        setUserHealthInfo(healthInfo);
        // Send message with the populated health info
        await sendMessage(inputValue, healthInfo);
        setInputValue('');
      } else {
        // Show profile form if no profile exists
        setShowProfileForm(true);
      }
      return;
    }

    await sendMessage(inputValue, userHealthInfo);
    setInputValue('');
  };

  const handleClearChat = () => {
    clearMessages();
    setInputValue('');
  };

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const info: UserHealthInfo = {
      age: parseInt(formData.get('age') as string) || 0,
      weight: parseFloat(formData.get('weight') as string) || 0,
      height: parseFloat(formData.get('height') as string) || 0,
      gender: (formData.get('gender') as string) || 'MALE',
      activityLevel: (formData.get('activityLevel') as string) || 'MODERATELY_ACTIVE',
      fitnessGoal: (formData.get('fitnessGoal') as string) || 'WEIGHT_LOSS',
    };

    if (info.age > 0 && info.weight > 0 && info.height > 0) {
      setUserHealthInfo(info);
      setShowProfileForm(false);
      // Send the pending message after profile is set
      if (inputValue.trim()) {
        await sendMessage(inputValue, info);
        setInputValue('');
      }
    }
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      {/* Floating Icon Button */}
      <button
        onClick={toggleChatbot}
        className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 transform ${
          isOpen
            ? 'bg-red-500 hover:bg-red-600 scale-95'
            : 'bg-blue-500 hover:bg-blue-600 scale-100'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6 text-white" />
            <div className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <h2 className="text-lg font-semibold">AI Assistant</h2>
            </div>
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="text-sm hover:bg-blue-700 px-2 py-1 rounded transition text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Profile Form */}
          {showProfileForm ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              <div className="flex flex-col items-center mb-4">
                <div className="text-3xl mb-2">📋</div>
                <p className="text-sm font-semibold text-gray-700">Thông tin sức khỏe của bạn</p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">
                    Tuổi (Age)
                  </label>
                  <Input
                    type="number"
                    name="age"
                    placeholder="Ví dụ: 25"
                    className="w-full text-sm py-2"
                    min="1"
                    max="150"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">
                      Cân nặng (kg)
                    </label>
                    <Input
                      type="number"
                      name="weight"
                      placeholder="Ví dụ: 70"
                      className="w-full text-sm py-2"
                      step="0.1"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">
                      Chiều cao (cm)
                    </label>
                    <Input
                      type="number"
                      name="height"
                      placeholder="Ví dụ: 175"
                      className="w-full text-sm py-2"
                      step="0.1"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">
                    Giới tính
                  </label>
                  <select
                    name="gender"
                    className="w-full text-sm py-2 px-2 border border-gray-300 rounded-md"
                  >
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">
                    Mức hoạt động
                  </label>
                  <select
                    name="activityLevel"
                    className="w-full text-sm py-2 px-2 border border-gray-300 rounded-md"
                  >
                    <option value="SEDENTARY">Ít hoạt động</option>
                    <option value="LIGHTLY_ACTIVE">Hoạt động nhẹ</option>
                    <option value="MODERATELY_ACTIVE">Hoạt động vừa phải</option>
                    <option value="VERY_ACTIVE">Hoạt động nhiều</option>
                    <option value="EXTREMELY_ACTIVE">Hoạt động rất nhiều</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">
                    Mục tiêu fitness
                  </label>
                  <select
                    name="fitnessGoal"
                    className="w-full text-sm py-2 px-2 border border-gray-300 rounded-md"
                  >
                    <option value="WEIGHT_LOSS">Giảm cân</option>
                    <option value="WEIGHT_GAIN">Tăng cân</option>
                    <option value="MAINTENANCE">Duy trì</option>
                    <option value="MUSCLE_GAIN">Tăng cơ bắp</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold text-sm"
                >
                  Bắt đầu chat
                </Button>
              </form>
            </div>
          ) : (
            <>
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <div className="text-4xl mb-3">💬</div>
                    <p className="text-center text-sm">
                      Xin chào! Tôi là trợ lý AI của bạn
                      <br />
                      <span className="text-xs">Hỏi tôi về dinh dưỡng & gợi ý món ăn</span>
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id}>
                      {/* Text Message */}
                      <div
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                            message.sender === 'user'
                              ? 'bg-blue-500 text-white rounded-br-none'
                              : 'bg-gray-300 text-gray-800 rounded-bl-none'
                          }`}
                        >
                          <p className="break-words whitespace-pre-wrap">{message.content}</p>
                          <span className="text-xs opacity-70 mt-1 block">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Meal Recommendations */}
                      {message.responseType === 'MEAL_RECOMMENDATION' && message.recommendations && message.recommendations.length > 0 && (
                        <div className="mt-4 space-y-3">
                          {/* Nutritional Summary */}
                          {message.nutritionalSummary && (
                            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg border-l-4 border-green-500">
                              <p className="text-xs font-semibold text-gray-700">📊 Tóm tắt dinh dưỡng:</p>
                              <p className="text-xs text-gray-600 mt-1">{message.nutritionalSummary}</p>
                            </div>
                          )}

                          {/* Meal Cards Flex */}
                          <div className="flex flex-col gap-2">
                            {message.recommendations.map((meal) => (
                              <div key={meal.mealId} className="w-full">
                                <MealRecommendationCard meal={meal} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg rounded-bl-none flex items-center gap-2 text-sm">
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Đang suy nghĩ...</span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex justify-start">
                    <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm">
                      Lỗi: {error}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <div className="border-t p-3 bg-white rounded-b-lg">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={loading}
                    className="flex-1 text-sm py-2"
                  />
                  <Button
                    type="submit"
                    disabled={loading || !inputValue.trim()}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center justify-center"
                  >
                    {loading ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </form>

                {/* Info Message */}
                <p className="text-xs text-gray-400 mt-2 text-center">
                  💡 Viết "5 món ăn" để nhận gợi ý cá nhân
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
