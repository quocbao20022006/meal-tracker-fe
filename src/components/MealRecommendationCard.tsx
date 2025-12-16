import { Star, Flame } from 'lucide-react';
import { MealRecommendation } from '../services/chatbot.service';

interface MealRecommendationCardProps {
  meal: MealRecommendation;
}

export default function MealRecommendationCard({ meal }: MealRecommendationCardProps) {
  const handleClick = () => {
    window.location.href = `/meal/${meal.mealId}`;
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer overflow-hidden border border-gray-200 hover:border-blue-500 hover:bg-blue-50 flex gap-3 p-2"
    >
      {/* Image */}
      <div className="relative h-20 w-20 overflow-hidden bg-gray-200 rounded flex-shrink-0">
        <img
          src={meal.imageUrl}
          alt={meal.mealName}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x80?text=Meal';
          }}
        />
        <div className="absolute -top-1 -right-1 bg-blue-500 text-white px-1 py-0 rounded-full text-xs font-bold flex items-center justify-center w-6 h-6">
          <Star className="w-2.5 h-2.5 fill-white" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <h3 className="font-semibold text-gray-800 line-clamp-1 text-sm">
          {meal.mealName}
        </h3>

        {/* Calories & Score */}
        <div className="flex items-center gap-2 text-xs mt-1">
          <div className="flex items-center gap-1 text-orange-600 font-semibold">
            <Flame className="w-3 h-3" />
            {meal.calories.toFixed(0)}cal
          </div>
          <span className="text-blue-600 font-semibold">{(meal.matchScore * 100).toFixed(0)}%</span>
        </div>

        {/* Reason */}
        <p className="text-xs text-gray-600 line-clamp-2 mt-1 leading-tight">
          {meal.recommendationReason}
        </p>
      </div>
    </div>
  );
}
