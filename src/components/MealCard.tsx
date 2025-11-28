import { Clock, Eye } from "lucide-react";
import { MealResponse } from "../types";

interface MealCardProps {
  meal: MealResponse;
  onViewMeal: (mealId: string) => void;
}

export default function MealCard({ meal, onViewMeal }: MealCardProps) {
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer"
      onClick={() => onViewMeal(meal.id.toString())}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={
            meal.image_url ||
            "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400"
          }
          alt={meal.meal_name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300">
          {meal.calories} cal
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {meal.category_name.map((cat) => (
            <span
              key={cat}
              className="text-xs px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 capitalize"
            >
              {cat}
            </span>
          ))}
        </div>

        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 line-clamp-1">
          {meal.meal_name}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 h-10 line-clamp-2">
          {meal.meal_description || "Delicious and nutritious meal"}
        </p>

        <div className="flex gap-2 items-center text-sm font-bold text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          <Clock className="w-4 h-4" />
          {meal.cooking_time}
        </div>

        <div className="flex gap-2 items-center text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          <span>Nutrition: {meal.nutrition.join(", ")}</span>
        </div>

        <button className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2">
          <Eye className="w-4 h-4" />
          See recipe
        </button>
      </div>
    </div>
  );
}
