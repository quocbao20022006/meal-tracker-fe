import { MealResponse } from "../types";
import { ChevronRight } from "lucide-react";

interface SimilarRecipesProps {
  recipes: MealResponse[];
  onSelect?: (id: string) => void;
}

export default function SimilarRecipes({ recipes, onSelect }: SimilarRecipesProps) {
  return (
    <div className="p-6 mt-10 bg-white dark:bg-gray-800 rounded-2xl border border-emerald-400 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Similar Recipes
      </h2>

      <div className="space-y-4">
        {recipes.map((meal) => (
          <div
            key={meal.id}
            onClick={() => onSelect?.(meal.id.toString())}
            className="flex items-center gap-5 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer p-4 border border-transparent hover:border-emerald-400"
          >
            {/* Image  */}
            <img
              src={meal.image_url}
              alt={meal.meal_name}
              className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
            />

            {/* Info */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {meal.meal_name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {meal.meal_description}
              </p>
            </div>

            {/* Optional arrow icon */}
            <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-600" />
          </div>
        ))}

        {recipes.length === 0 && (
          <p className="text-gray-500 dark:text-gray-600 text-center py-6">
            No similar recipes found 👩‍🍳
          </p>
        )}
      </div>
    </div>
  );
}
